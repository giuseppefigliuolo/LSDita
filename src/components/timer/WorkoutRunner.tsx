import { useState, useCallback, useEffect, useRef, useMemo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { Exercise, WorkoutPhase } from '../../types'
import CircularTimer from './CircularTimer'
import ExercisePreview from './ExercisePreview'
import WorkoutComplete from './WorkoutComplete'
import { useTimer } from '../../hooks/useTimer'
import { useAudio } from '../../hooks/useAudio'
import { useSpeech } from '../../hooks/useSpeech'
import { useVibration } from '../../hooks/useVibration'
import { useWakeLock } from '../../hooks/useWakeLock'
import { useSettingsStore } from '../../store/useSettingsStore'
import { INK, RADIUS, SHADOW } from '../../styles/tokens'
import { fireConfetti } from '../../utils/confetti'

const REP_BLOB_RADII = [
  '60% 40% 50% 50% / 50% 60% 40% 50%',
  '50% 60% 40% 50% / 60% 50% 50% 40%',
  '40% 50% 60% 50% / 50% 40% 50% 60%',
  '50% 50% 60% 40% / 40% 50% 60% 50%',
]

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
  onExit
}: WorkoutRunnerProps) {
  const [phase, setPhase] = useState<WorkoutPhase>('preview')
  const [exerciseIndex, setExerciseIndex] = useState(0)
  const [currentSet, setCurrentSet] = useState(1)
  const [currentRep, setCurrentRep] = useState(1)
  const [skippedExercises, setSkippedExercises] = useState<string[]>([])
  const [completedExercises, setCompletedExercises] = useState(0)
  const [wasPausedPhase, setWasPausedPhase] = useState<WorkoutPhase>('hanging')
  const [overrides, setOverrides] = useState<
    Record<number, { sets: number; repsPerSet: number; hangTime: number }>
  >({})
  const [showSkipConfirm, setShowSkipConfirm] = useState(false)
  const [pendingAutoStartSeconds, setPendingAutoStartSeconds] = useState<number | null>(null)

  const startTimeRef = useRef(0)
  const [finalDuration, setFinalDuration] = useState(0)
  const lastCountdownRef = useRef(0)
  const resumingRef = useRef(false)
  const skippedTimerRef = useRef(false)
  const countdownDuration = useSettingsStore((s) => s.countdownDuration)

  useEffect(() => {
    startTimeRef.current = performance.now()
  }, [])

  const { beepStart, beepEnd, beepCountdown, beepComplete } = useAudio()
  const { speak } = useSpeech()
  const { vibrateShort, vibrateMedium, vibrateLong } = useVibration()
  const { request: wakeLockRequest, release: wakeLockRelease } = useWakeLock()

  const baseExercise = exercises[exerciseIndex]
  const exerciseOverride = overrides[exerciseIndex]
  const exercise = useMemo(() => {
    return baseExercise && exerciseOverride
      ? { ...baseExercise, ...exerciseOverride }
      : baseExercise
  }, [baseExercise, exerciseOverride])

  const isRepsExercise = exercise?.type === 'reps'

  const handleTimerComplete = useCallback(() => {
    if (!exercise) return

    if (phase === 'countdown') {
      setPhase('hanging')
      speak('Tieni!')
      beepStart()
      vibrateShort()
      return
    }

    if (phase === 'hanging') {
      beepEnd()
      vibrateShort()

      const isLastRep = currentRep >= exercise.repsPerSet
      const isLastSet = currentSet >= exercise.sets

      if (isLastRep && isLastSet) {
        setCompletedExercises((c) => c + 1)
        speak('Esercizio completato!')
        vibrateMedium()

        if (exerciseIndex < exercises.length - 1) {
          const nextRest = exercises[exerciseIndex + 1]?.restBetweenSets ?? 0
          setPendingAutoStartSeconds(nextRest > 0 ? nextRest : null)
          setPhase('exercise_complete')
          setTimeout(() => {
            setExerciseIndex((i) => i + 1)
            setCurrentSet(1)
            setCurrentRep(1)
            setPhase('preview')
          }, 2000)
        } else {
          setFinalDuration(
            Math.floor((performance.now() - startTimeRef.current) / 1000)
          )
          setPhase('workout_complete')
          beepComplete()
          vibrateLong()
          speak('Allenamento completato! Grande lavoro!')
          wakeLockRelease()
        }
      } else if (isLastRep) {
        speak('Riposo tra le serie')
        setPhase('set_rest')
      } else {
        if (exercise.restBetweenReps > 0) {
          speak('Riposa')
          setPhase('resting')
        } else {
          setCurrentRep((r) => r + 1)
          speak('Tieni!')
          beepStart()
        }
      }
    } else if (phase === 'resting') {
      setCurrentRep((r) => r + 1)
      const wasSkipped = skippedTimerRef.current
      skippedTimerRef.current = false
      if (wasSkipped && countdownDuration > 0 && !isRepsExercise) {
        setPhase('countdown')
        speak('Preparati!')
      } else {
        setPhase('hanging')
        speak('Tieni!')
        beepStart()
        vibrateShort()
      }
    } else if (phase === 'set_rest') {
      setCurrentSet((s) => s + 1)
      setCurrentRep(1)
      const wasSkipped = skippedTimerRef.current
      skippedTimerRef.current = false
      if (wasSkipped && countdownDuration > 0 && !isRepsExercise) {
        setPhase('countdown')
        speak('Preparati!')
      } else {
        setPhase('hanging')
        speak(`Serie ${currentSet + 1}. Tieni!`)
        beepStart()
        vibrateShort()
      }
    }
  }, [
    phase,
    exercise,
    currentRep,
    currentSet,
    exerciseIndex,
    exercises.length,
    isRepsExercise,
    countdownDuration,
    beepStart,
    beepEnd,
    beepComplete,
    speak,
    vibrateShort,
    vibrateMedium,
    vibrateLong,
    wakeLockRelease
  ])

  const timer = useTimer(handleTimerComplete)

  useEffect(() => {
    if (!exercise) return

    // Skip timer.start() when resuming from pause — timer.resume() handles it
    if (resumingRef.current) {
      resumingRef.current = false
      return
    }

    if (phase === 'countdown') {
      timer.start(countdownDuration)
      lastCountdownRef.current = 0
    } else if (phase === 'hanging') {
      if (!isRepsExercise) {
        timer.start(exercise.hangTime)
        lastCountdownRef.current = 0
      }
    } else if (phase === 'resting') {
      timer.start(exercise.restBetweenReps)
      lastCountdownRef.current = 0
    } else if (phase === 'set_rest') {
      timer.start(exercise.restBetweenSets)
      lastCountdownRef.current = 0
    }
  }, [
    phase,
    exercise,
    exerciseIndex,
    currentSet,
    currentRep,
    isRepsExercise,
    countdownDuration
  ]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (
      phase !== 'countdown' &&
      phase !== 'hanging' &&
      phase !== 'resting' &&
      phase !== 'set_rest'
    )
      return
    const remaining = Math.ceil(timer.timeRemaining)
    if (
      remaining <= 3 &&
      remaining > 0 &&
      remaining !== lastCountdownRef.current
    ) {
      lastCountdownRef.current = remaining
      beepCountdown()
    }
  }, [timer.timeRemaining, phase, beepCountdown])

  useEffect(() => {
    if (phase === 'exercise_complete') {
      fireConfetti({ x: 0.5, y: 0.45 })
    }
  }, [phase])

  const handleStartExercise = useCallback(
    (params: { sets: number; repsPerSet: number; hangTime: number }) => {
      setOverrides((prev) => ({ ...prev, [exerciseIndex]: params }))
      setPendingAutoStartSeconds(null)
      wakeLockRequest()

      // Reps exercises don't need a countdown
      const exerciseType = exercises[exerciseIndex]?.type
      if (exerciseType === 'reps' || countdownDuration <= 0) {
        setPhase('hanging')
        speak('Tieni!')
        beepStart()
        vibrateShort()
      } else {
        setPhase('countdown')
        speak('Preparati!')
      }
    },
    [
      exerciseIndex,
      exercises,
      countdownDuration,
      wakeLockRequest,
      speak,
      beepStart,
      vibrateShort
    ]
  )

  const handleSkipExercise = useCallback(() => {
    if (!exercise) return
    setSkippedExercises((s) => [...s, exercise.id])
    setPendingAutoStartSeconds(null)

    if (exerciseIndex < exercises.length - 1) {
      setExerciseIndex((i) => i + 1)
      setCurrentSet(1)
      setCurrentRep(1)
      setPhase('preview')
    } else {
      setFinalDuration(
        Math.floor((performance.now() - startTimeRef.current) / 1000)
      )
      setPhase('workout_complete')
      wakeLockRelease()
    }
  }, [exercise, exerciseIndex, exercises.length, wakeLockRelease])

  const handleRepsSetDone = useCallback(() => {
    if (!exercise) return

    const isLastSet = currentSet >= exercise.sets

    if (isLastSet) {
      setCompletedExercises((c) => c + 1)
      speak('Esercizio completato!')
      vibrateMedium()

      if (exerciseIndex < exercises.length - 1) {
        const nextRest = exercises[exerciseIndex + 1]?.restBetweenSets ?? 0
        setPendingAutoStartSeconds(nextRest > 0 ? nextRest : null)
        setPhase('exercise_complete')
        setTimeout(() => {
          setExerciseIndex((i) => i + 1)
          setCurrentSet(1)
          setCurrentRep(1)
          setPhase('preview')
        }, 2000)
      } else {
        setFinalDuration(
          Math.floor((performance.now() - startTimeRef.current) / 1000)
        )
        setPhase('workout_complete')
        beepComplete()
        vibrateLong()
        speak('Allenamento completato! Grande lavoro!')
        wakeLockRelease()
      }
    } else {
      speak('Riposo tra le serie')
      setPhase('set_rest')
    }
  }, [
    exercise,
    currentSet,
    exerciseIndex,
    exercises.length,
    beepComplete,
    speak,
    vibrateMedium,
    vibrateLong,
    wakeLockRelease
  ])

  const handleSkipTimer = useCallback(() => {
    skippedTimerRef.current = true
    timer.stop()
    handleTimerComplete()
  }, [timer, handleTimerComplete])

  const handlePause = useCallback(() => {
    timer.pause()
    setWasPausedPhase(phase)
    setPhase('paused')
  }, [timer, phase])

  const handleResume = useCallback(() => {
    resumingRef.current = true
    setPhase(wasPausedPhase)
    timer.resume()
  }, [timer, wasPausedPhase])

  const handleSkipExerciseConfirm = useCallback(() => {
    setShowSkipConfirm(false)
    handleSkipExercise()
  }, [handleSkipExercise])

  const handleSave = useCallback(
    (note: string, feeling: 1 | 2 | 3 | 4 | 5) => {
      onComplete({
        exercisesCompleted: completedExercises,
        exercisesTotal: exercises.length,
        duration: finalDuration,
        skippedExercises,
        note,
        feeling
      })
    },
    [
      finalDuration,
      completedExercises,
      exercises.length,
      skippedExercises,
      onComplete
    ]
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
        onStart={handleStartExercise}
        onSkip={handleSkipExercise}
        autoStartSeconds={pendingAutoStartSeconds ?? undefined}
      />
    )
  }

  const phaseLabel =
    phase === 'countdown'
      ? 'PREPARATI'
      : phase === 'hanging'
        ? 'TIENI'
        : phase === 'resting'
          ? 'RIPOSA'
          : phase === 'set_rest'
            ? 'RIPOSO TRA SERIE'
            : phase === 'paused'
              ? 'PAUSA'
              : phase === 'exercise_complete'
                ? 'COMPLETATO'
                : ''

  const activePhaseForTime = phase === 'paused' ? wasPausedPhase : phase
  const currentTotalTime =
    activePhaseForTime === 'countdown'
      ? countdownDuration
      : activePhaseForTime === 'hanging'
        ? (exercise?.hangTime ?? 0)
        : activePhaseForTime === 'resting'
          ? (exercise?.restBetweenReps ?? 0)
          : (exercise?.restBetweenSets ?? 0)

  if (isRepsExercise && phase === 'hanging') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70dvh] px-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${exerciseIndex}-reps`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center"
          >
            <div className="flex items-center gap-3 mb-3">
              {Array.from({ length: exercise?.sets ?? 0 }, (_, i) => (
                <div
                  key={i}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    i < currentSet
                      ? 'w-8 bg-primary shadow-[0_0_8px_rgba(232,98,42,0.4)]'
                      : i === currentSet - 1
                        ? 'w-8 bg-primary'
                        : 'w-5 bg-surface-elevated'
                  }`}
                />
              ))}
            </div>

            <p className="text-xs font-semibold uppercase tracking-widest text-text-muted mb-6">
              {exercise?.name}
            </p>

            <div className="relative flex items-center justify-center mb-2">
              <div
                className="absolute rounded-full blur-3xl opacity-40"
                style={{
                  width: 160,
                  height: 160,
                  backgroundColor: '#E8622A30'
                }}
              />
              <div
                className="w-52 h-52 border-[4px] border-[#3A1248] bg-surface-elevated flex flex-col items-center justify-center"
                style={{ borderRadius: RADIUS.blob, boxShadow: SHADOW.md }}
              >
                <p className="font-timer text-7xl text-primary leading-none">
                  {exercise?.repsPerSet ?? 0}
                </p>
                <p className="text-xs font-semibold uppercase tracking-widest text-text-secondary mt-2">
                  ripetizioni
                </p>
              </div>
            </div>

            <p className="text-xs uppercase tracking-widest text-text-muted">
              Serie {currentSet} di {exercise?.sets ?? 0}
            </p>

            {exercise?.weight && exercise.weight !== 'corpo libero' && (
              <span
                className="text-xs px-3 py-1 bg-violet-soft text-violet font-semibold mt-4 border-[1.5px] border-[#3A1248]"
                style={{ borderRadius: RADIUS.pill, boxShadow: SHADOW.xxs }}
              >
                {exercise.weight}
              </span>
            )}

            <motion.button
              whileTap={{ scale: 0.93 }}
              onClick={handleRepsSetDone}
              className="w-20 h-20 bg-primary border-[3px] border-[#3A1248] flex items-center justify-center mt-8 active:translate-x-[3px] active:translate-y-[3px] active:shadow-none transition-all"
              style={{ borderRadius: RADIUS.controlLg, boxShadow: SHADOW.md }}
            >
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#FFFBF0"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </motion.button>

            <button
              onClick={() => setShowSkipConfirm(true)}
              className="mt-6 w-14 h-14 bg-surface border-[2.5px] border-[#3A1248] flex items-center justify-center active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all"
              style={{ borderRadius: RADIUS.controlSm, boxShadow: SHADOW.sm }}
              title="Salta esercizio"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#9C7B5C"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </motion.div>
        </AnimatePresence>

        <AnimatePresence>
          {showSkipConfirm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-6"
              onClick={() => setShowSkipConfirm(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                className="bg-surface-elevated border-[3px] border-[#3A1248] p-5 w-full max-w-xs text-center"
                style={{ borderRadius: RADIUS.card, boxShadow: SHADOW.lg }}
                onClick={(e) => e.stopPropagation()}
              >
                <p className="text-text font-semibold mb-1">
                  Saltare esercizio?
                </p>
                <p className="text-sm text-text-muted mb-5">
                  L&apos;esercizio verrà segnato come saltato.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowSkipConfirm(false)}
                    className="flex-1 h-11 bg-surface border-[2.5px] border-[#3A1248] text-sm font-medium text-text active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all"
                    style={{ borderRadius: RADIUS.btnSm, boxShadow: SHADOW.sm }}
                  >
                    Annulla
                  </button>
                  <button
                    onClick={handleSkipExerciseConfirm}
                    className="flex-1 h-11 bg-danger/15 border-[2.5px] border-[#3A1248] text-sm font-medium text-danger active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all"
                    style={{ borderRadius: RADIUS.btnSm, boxShadow: SHADOW.sm }}
                  >
                    Salta
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[80dvh] px-4">
      <AnimatePresence mode="wait">
        <motion.div
          key={`${exerciseIndex}-${phase}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="flex flex-col items-center"
        >
          {exercise?.type === 'repeaters' && (
            <div className="flex items-center gap-3 mb-5">
              {Array.from({ length: exercise.repsPerSet }, (_, i) => {
                const activePhase = phase === 'paused' ? wasPausedPhase : phase
                const isDone =
                  i < currentRep - 1 ||
                  (i === currentRep - 1 && activePhase !== 'hanging')
                const isCurrent =
                  i === currentRep - 1 && activePhase === 'hanging'
                return (
                  <motion.div
                    key={i}
                    className={`w-7 h-7 border-[2.5px] flex items-center justify-center ${
                      isDone
                        ? 'bg-primary'
                        : isCurrent
                          ? 'bg-accent'
                          : 'bg-surface-elevated'
                    }`}
                    style={{
                      borderColor: INK,
                      borderRadius: REP_BLOB_RADII[i % REP_BLOB_RADII.length],
                      boxShadow: isDone || isCurrent ? SHADOW.xs : 'none',
                    }}
                    animate={
                      isCurrent
                        ? { scale: [1, 1.18, 1] }
                        : { scale: 1 }
                    }
                    transition={
                      isCurrent
                        ? { duration: 1.5, repeat: Infinity, ease: 'easeInOut' }
                        : { duration: 0.25 }
                    }
                  >
                    {isDone && (
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#FFF8E8"
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </motion.div>
                )
              })}
            </div>
          )}

          <p className="font-semibold uppercase tracking-widest text-text-muted mb-14">
            {exercise?.name}
          </p>

          <div className="mb-4">
            <CircularTimer
              timeRemaining={timer.timeRemaining}
              totalTime={currentTotalTime}
              phase={phase === 'paused' ? wasPausedPhase : phase}
              label={phaseLabel}
            />
          </div>

          <p className="text font-semibold uppercase tracking-widest text-text-muted text-center my-4">
            {phase === 'countdown' ||
            (phase === 'paused' && wasPausedPhase === 'countdown')
              ? 'Posizionati!'
              : `Serie ${currentSet}/${exercise?.sets ?? 0}  •  Rep ${currentRep}/${exercise?.repsPerSet ?? 0}`}
          </p>

          <div className="flex items-center justify-center gap-7 mt-8">
            <button
              onClick={() => setShowSkipConfirm(true)}
              className="w-16 h-16 bg-surface border-[2.5px] border-[#3A1248] flex items-center justify-center active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all"
              style={{
                borderRadius: RADIUS.controlSm,
                boxShadow: SHADOW.sm
              }}
              title="Salta esercizio"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke={INK}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            {phase === 'paused' ? (
              <button
                onClick={handleResume}
                className="w-24 h-24 bg-accent border-[3px] border-[#3A1248] flex items-center justify-center active:translate-x-[3px] active:translate-y-[3px] active:shadow-none transition-all"
                style={{
                  borderRadius: RADIUS.controlLg,
                  boxShadow: SHADOW.md
                }}
              >
                <svg width="32" height="32" viewBox="0 0 24 24" fill={INK}>
                  <polygon points="5 3 19 12 5 21" />
                </svg>
              </button>
            ) : (
              <button
                onClick={handlePause}
                className="w-24 h-24 bg-surface border-[3px] border-[#3A1248] flex items-center justify-center active:translate-x-[3px] active:translate-y-[3px] active:shadow-none transition-all"
                style={{
                  borderRadius: RADIUS.controlLg,
                  boxShadow: SHADOW.md
                }}
              >
                <svg width="28" height="28" viewBox="0 0 24 24" fill={INK}>
                  <rect x="6" y="4" width="4" height="16" rx="1" />
                  <rect x="14" y="4" width="4" height="16" rx="1" />
                </svg>
              </button>
            )}

            <button
              onClick={handleSkipTimer}
              className="w-16 h-16 bg-surface border-[2.5px] border-[#3A1248] flex items-center justify-center active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all"
              style={{
                borderRadius: RADIUS.controlSm,
                boxShadow: SHADOW.sm
              }}
              title="Salta timer"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke={INK}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polygon points="5 4 15 12 5 20" />
                <line x1="19" y1="5" x2="19" y2="19" />
              </svg>
            </button>
          </div>
        </motion.div>
      </AnimatePresence>

      <AnimatePresence>
        {showSkipConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-6"
            onClick={() => setShowSkipConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className="bg-surface-elevated border-[3px] border-[#3A1248] p-5 w-full max-w-xs text-center"
              style={{ borderRadius: RADIUS.card, boxShadow: SHADOW.lg }}
              onClick={(e) => e.stopPropagation()}
            >
              <p className="text-text font-semibold mb-1">Saltare esercizio?</p>
              <p className="text-sm text-text-muted mb-5">
                L&apos;esercizio verrà segnato come saltato.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowSkipConfirm(false)}
                  className="flex-1 h-11 bg-surface border-[2.5px] border-[#3A1248] text-sm font-medium text-text active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all"
                  style={{ borderRadius: RADIUS.btnSm, boxShadow: SHADOW.sm }}
                >
                  Annulla
                </button>
                <button
                  onClick={handleSkipExerciseConfirm}
                  className="flex-1 h-11 bg-danger/15 border-[2.5px] border-[#3A1248] text-sm font-medium text-danger active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all"
                  style={{ borderRadius: RADIUS.btnSm, boxShadow: SHADOW.sm }}
                >
                  Salta
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
