import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Exercise } from '../../types'
import ExercisePreview from './ExercisePreview'
import WorkoutComplete from './WorkoutComplete'
import RepsExerciseView from './RepsExerciseView'
import TimedExerciseView from './TimedExerciseView'
import SkipConfirmDialog from './SkipConfirmDialog'
import ExerciseInfoModal from './ExerciseInfoModal'
import ExerciseNotesModal from './ExerciseNotesModal'
import { useWorkoutFlow } from './useWorkoutFlow'

export interface WorkoutProgress {
  exercisesCompleted: number
  exercisesTotal: number
  duration: number
  skippedExercises: string[]
}

interface WorkoutRunnerProps {
  exercises: Exercise[]
  dayTitle: string
  weekNumber?: number
  /**
   * Navigation bar shown above every phase except the exercise preview, which
   * carries its own close/audio buttons in its coloured header.
   */
  header?: ReactNode
  /**
   * Called after every exercise ends (done or skipped) so progress survives a
   * crash. `finished` is true once the final screen is reached.
   */
  onProgress?: (data: WorkoutProgress, finished: boolean) => void
  onComplete: (
    data: WorkoutProgress & {
      note: string
      feeling: 1 | 2 | 3 | 4 | 5
    },
  ) => void
  onExit: () => void
}

export default function WorkoutRunner({
  exercises,
  dayTitle,
  weekNumber,
  header,
  onProgress,
  onComplete,
  onExit,
}: WorkoutRunnerProps) {
  const flow = useWorkoutFlow({ exercises })
  const {
    phase,
    exercise,
    exerciseIndex,
    currentSet,
    currentRep,
    wasPausedPhase,
    pendingAutoStartSeconds,
    timer,
    countdownDuration,
    startExercise,
    skipExercise,
    skipTimer,
    pauseTimer,
    resumeTimer,
    repsSetDone,
    pauseForInfo,
    resumeFromInfo,
    completedExercises,
    finalDuration,
    getElapsedSeconds,
    skippedExercises,
    skipExerciseCompleteWait,
  } = flow

  const onProgressRef = useRef(onProgress)
  useEffect(() => {
    onProgressRef.current = onProgress
  }, [onProgress])

  const isWorkoutComplete = phase === 'workout_complete'
  const processedExercises = completedExercises + skippedExercises.length

  // Checkpoint after each finished/skipped exercise, and once more on the
  // final screen (with the final duration) before the feedback is entered.
  useEffect(() => {
    if (processedExercises === 0) return
    onProgressRef.current?.(
      {
        exercisesCompleted: completedExercises,
        exercisesTotal: exercises.length,
        duration: isWorkoutComplete ? finalDuration : getElapsedSeconds(),
        skippedExercises,
      },
      isWorkoutComplete,
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [processedExercises, isWorkoutComplete])

  const [showSkipConfirm, setShowSkipConfirm] = useState(false)
  const [showInfo, setShowInfo] = useState(false)

  const openInfo = useCallback(() => {
    pauseForInfo()
    setShowInfo(true)
  }, [pauseForInfo])

  const closeInfo = useCallback(() => {
    setShowInfo(false)
    resumeFromInfo()
  }, [resumeFromInfo])

  const [showNotes, setShowNotes] = useState(false)

  // Notes are written mid-set, so the timer keeps running (unlike the info sheet).
  const openNotes = useCallback(() => setShowNotes(true), [])
  const closeNotes = useCallback(() => setShowNotes(false), [])

  const confirmSkip = useCallback(() => {
    setShowSkipConfirm(false)
    skipExercise()
  }, [skipExercise])

  const handleSave = useCallback(
    (note: string, feeling: 1 | 2 | 3 | 4 | 5) => {
      onComplete({
        exercisesCompleted: completedExercises,
        exercisesTotal: exercises.length,
        duration: finalDuration,
        skippedExercises,
        note,
        feeling,
      })
    },
    [
      onComplete,
      completedExercises,
      exercises.length,
      finalDuration,
      skippedExercises,
    ],
  )

  const shell = (content: ReactNode) => (
    <>
      {header}
      <div className="flex-1 min-h-0 flex items-center justify-center">
        {content}
      </div>
    </>
  )

  if (phase === 'workout_complete') {
    return shell(
      <WorkoutComplete
        dayTitle={dayTitle}
        exercisesCompleted={completedExercises}
        exercisesTotal={exercises.length}
        duration={finalDuration}
        skippedExercises={skippedExercises}
        onSave={handleSave}
        onClose={onExit}
      />,
    )
  }

  if (phase === 'preview' && exercise) {
    return (
      <ExercisePreview
        key={exercise.id}
        exercise={exercise}
        exerciseIndex={exerciseIndex}
        totalExercises={exercises.length}
        upcomingExercises={exercises.slice(exerciseIndex + 1, exerciseIndex + 4)}
        onStart={startExercise}
        onSkip={skipExercise}
        autoStartSeconds={pendingAutoStartSeconds ?? undefined}
        weekNumber={weekNumber}
        onClose={onExit}
      />
    )
  }

  if (!exercise) return shell(null)

  const isRepsExercise = exercise.type === 'reps'
  const showRepsView = isRepsExercise && phase === 'hanging'

  return shell(
    <>
      {showRepsView ? (
        <RepsExerciseView
          exercise={exercise}
          exerciseIndex={exerciseIndex}
          currentSet={currentSet}
          onSetDone={repsSetDone}
          onSkipExercise={() => setShowSkipConfirm(true)}
          onOpenInfo={openInfo}
          onOpenNotes={openNotes}
        />
      ) : (
        <TimedExerciseView
          exercise={exercise}
          exerciseIndex={exerciseIndex}
          phase={phase}
          wasPausedPhase={wasPausedPhase}
          currentSet={currentSet}
          currentRep={currentRep}
          timeRemaining={timer.timeRemaining}
          countdownDuration={countdownDuration}
          onPause={pauseTimer}
          onResume={resumeTimer}
          onSkipTimer={skipTimer}
          onSkipExercise={() => setShowSkipConfirm(true)}
          onOpenInfo={openInfo}
          onOpenNotes={openNotes}
        />
      )}

      <AnimatePresence>
        {phase === 'exercise_complete' && (
          <motion.button
            key="complete-overlay"
            type="button"
            onClick={skipExerciseCompleteWait}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 w-full h-full bg-transparent flex items-end justify-center pb-10 outline-none cursor-pointer"
            aria-label="Passa al prossimo esercizio"
          >
            <motion.span
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-xs font-bold uppercase tracking-widest text-text-muted bg-surface-elevated/80 border-[1.5px] border-dashed border-text-muted/60 px-3 py-1.5 rounded-full pointer-events-none"
            >
              Tocca per continuare
            </motion.span>
          </motion.button>
        )}
      </AnimatePresence>

      <SkipConfirmDialog
        open={showSkipConfirm}
        onConfirm={confirmSkip}
        onCancel={() => setShowSkipConfirm(false)}
      />

      <ExerciseInfoModal
        open={showInfo}
        exercise={exercise}
        onClose={closeInfo}
      />

      <ExerciseNotesModal
        open={showNotes}
        exerciseId={exercise.id}
        exerciseName={exercise.name}
        onClose={closeNotes}
      />
    </>,
  )
}
