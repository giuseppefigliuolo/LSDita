import { useCallback, useState } from 'react'
import type { Exercise } from '../../types'
import ExercisePreview from './ExercisePreview'
import WorkoutComplete from './WorkoutComplete'
import RepsExerciseView from './RepsExerciseView'
import TimedExerciseView from './TimedExerciseView'
import SkipConfirmDialog from './SkipConfirmDialog'
import ExerciseInfoModal from './ExerciseInfoModal'
import { useWorkoutFlow } from './useWorkoutFlow'

interface WorkoutRunnerProps {
  exercises: Exercise[]
  dayTitle: string
  weekNumber: number
  onComplete: (data: {
    exercisesCompleted: number
    exercisesTotal: number
    duration: number
    skippedExercises: string[]
    note: string
    feeling: 1 | 2 | 3 | 4 | 5
  }) => void
  onExit: () => void
}

export default function WorkoutRunner({
  exercises,
  dayTitle,
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
    skippedExercises,
  } = flow

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

  if (phase === 'workout_complete') {
    return (
      <WorkoutComplete
        dayTitle={dayTitle}
        exercisesCompleted={completedExercises}
        exercisesTotal={exercises.length}
        duration={finalDuration}
        skippedExercises={skippedExercises}
        onSave={handleSave}
        onClose={onExit}
      />
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
      />
    )
  }

  if (!exercise) return null

  const isRepsExercise = exercise.type === 'reps'
  const showRepsView = isRepsExercise && phase === 'hanging'

  return (
    <>
      {showRepsView ? (
        <RepsExerciseView
          exercise={exercise}
          exerciseIndex={exerciseIndex}
          currentSet={currentSet}
          onSetDone={repsSetDone}
          onSkipExercise={() => setShowSkipConfirm(true)}
          onOpenInfo={openInfo}
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
        />
      )}

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
    </>
  )
}
