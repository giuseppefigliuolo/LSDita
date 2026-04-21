import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { Exercise, WorkoutPhase } from '../../types'
import { useTimer } from '../../hooks/useTimer'
import { useAudio } from '../../hooks/useAudio'
import { useSpeech } from '../../hooks/useSpeech'
import { useVibration } from '../../hooks/useVibration'
import { useWakeLock } from '../../hooks/useWakeLock'
import { useSettingsStore } from '../../store/useSettingsStore'
import { fireConfetti } from '../../utils/confetti'

export type ExerciseOverride = {
  sets: number
  repsPerSet: number
  hangTime: number
}

interface UseWorkoutFlowArgs {
  exercises: Exercise[]
}

/**
 * Central state machine for a workout session: owns phases, current exercise,
 * timer integration, audio/speech/vibration side effects, and wake lock.
 *
 * The exposed handlers are the only "actions" the UI should call; all state
 * derivations (labels, totals, etc.) belong to the view components.
 */
export function useWorkoutFlow({ exercises }: UseWorkoutFlowArgs) {
  const [phase, setPhase] = useState<WorkoutPhase>('preview')
  const [exerciseIndex, setExerciseIndex] = useState(0)
  const [currentSet, setCurrentSet] = useState(1)
  const [currentRep, setCurrentRep] = useState(1)
  const [wasPausedPhase, setWasPausedPhase] = useState<WorkoutPhase | null>(
    null,
  )
  const [overrides, setOverrides] = useState<Record<number, ExerciseOverride>>(
    {},
  )
  const [skippedExercises, setSkippedExercises] = useState<string[]>([])
  const [completedExercises, setCompletedExercises] = useState(0)
  const [finalDuration, setFinalDuration] = useState(0)
  const [pendingAutoStartSeconds, setPendingAutoStartSeconds] = useState<
    number | null
  >(null)

  const startTimeRef = useRef(0)
  const lastCountdownRef = useRef(0)
  const resumingRef = useRef(false)
  const skippedTimerRef = useRef(false)
  const pausedForInfoRef = useRef(false)
  const completeWaitTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  )

  const countdownDuration = useSettingsStore((s) => s.countdownDuration)

  const { beepStart, beepEnd, beepCountdown, beepComplete } = useAudio()
  const { speak } = useSpeech()
  const { vibrateShort, vibrateMedium, vibrateLong } = useVibration()
  const { request: wakeLockRequest, release: wakeLockRelease } = useWakeLock()

  useEffect(() => {
    startTimeRef.current = performance.now()
  }, [])

  const baseExercise = exercises[exerciseIndex]
  const exerciseOverride = overrides[exerciseIndex]
  const exercise = useMemo(() => {
    return baseExercise && exerciseOverride
      ? { ...baseExercise, ...exerciseOverride }
      : baseExercise
  }, [baseExercise, exerciseOverride])

  const isRepsExercise = exercise?.type === 'reps'

  /**
   * Enters the next active work phase. Inserts a `countdown` preparation
   * phase when the exercise is timed and the user has a non-zero
   * `countdownDuration`; otherwise jumps straight to `hanging`.
   *
   * Centralized so every transition into active work (start of exercise,
   * skipped rest, resume-from-pause) behaves consistently.
   */
  const enterActivePhase = useCallback(() => {
    if (!isRepsExercise && countdownDuration > 0) {
      setPhase('countdown')
      speak('Preparati!')
    } else {
      setPhase('hanging')
      speak('Tieni!')
      beepStart()
      vibrateShort()
    }
  }, [isRepsExercise, countdownDuration, speak, beepStart, vibrateShort])

  const finishWorkout = useCallback(() => {
    setFinalDuration(
      Math.floor((performance.now() - startTimeRef.current) / 1000),
    )
    setPhase('workout_complete')
    beepComplete()
    vibrateLong()
    speak('Allenamento completato! Grande lavoro!')
    wakeLockRelease()
  }, [beepComplete, vibrateLong, speak, wakeLockRelease])

  const goToNextExerciseOrFinish = useCallback(() => {
    if (completeWaitTimeoutRef.current) {
      clearTimeout(completeWaitTimeoutRef.current)
      completeWaitTimeoutRef.current = null
    }
    setExerciseIndex((i) => i + 1)
    setCurrentSet(1)
    setCurrentRep(1)
    setPhase('preview')
  }, [])

  const advanceToNextExercise = useCallback(() => {
    if (exerciseIndex < exercises.length - 1) {
      const nextRest = exercises[exerciseIndex + 1]?.restBetweenSets ?? 0
      setPendingAutoStartSeconds(nextRest > 0 ? nextRest : null)
      setPhase('exercise_complete')
      completeWaitTimeoutRef.current = setTimeout(() => {
        completeWaitTimeoutRef.current = null
        setExerciseIndex((i) => i + 1)
        setCurrentSet(1)
        setCurrentRep(1)
        setPhase('preview')
      }, 5000)
    } else {
      finishWorkout()
    }
  }, [exercises, exerciseIndex, finishWorkout])

  const skipExerciseCompleteWait = useCallback(() => {
    if (!completeWaitTimeoutRef.current) return
    goToNextExerciseOrFinish()
  }, [goToNextExerciseOrFinish])

  useEffect(() => {
    return () => {
      if (completeWaitTimeoutRef.current) {
        clearTimeout(completeWaitTimeoutRef.current)
        completeWaitTimeoutRef.current = null
      }
    }
  }, [])

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
        advanceToNextExercise()
      } else if (isLastRep) {
        speak('Riposo tra le serie')
        setPhase('set_rest')
      } else if (exercise.restBetweenReps > 0) {
        speak('Riposa')
        setPhase('resting')
      } else {
        setCurrentRep((r) => r + 1)
        speak('Tieni!')
        beepStart()
      }
      return
    }

    if (phase === 'resting' || phase === 'set_rest') {
      if (phase === 'set_rest') {
        setCurrentSet((s) => s + 1)
        setCurrentRep(1)
      } else {
        setCurrentRep((r) => r + 1)
      }
      const wasSkipped = skippedTimerRef.current
      skippedTimerRef.current = false

      if (wasSkipped) {
        enterActivePhase()
      } else {
        setPhase('hanging')
        speak(
          phase === 'set_rest' ? `Serie ${currentSet + 1}. Tieni!` : 'Tieni!',
        )
        beepStart()
        vibrateShort()
      }
    }
  }, [
    phase,
    exercise,
    currentRep,
    currentSet,
    advanceToNextExercise,
    enterActivePhase,
    beepStart,
    beepEnd,
    speak,
    vibrateShort,
    vibrateMedium,
  ])

  const timer = useTimer(handleTimerComplete)
  const { start: timerStart } = timer

  useEffect(() => {
    if (!exercise) return

    // Skip timer.start() when resuming from pause — timer.resume() handles it.
    if (resumingRef.current) {
      resumingRef.current = false
      return
    }

    if (phase === 'countdown') {
      timerStart(countdownDuration)
      lastCountdownRef.current = 0
    } else if (phase === 'hanging' && !isRepsExercise) {
      timerStart(exercise.hangTime)
      lastCountdownRef.current = 0
    } else if (phase === 'resting') {
      timerStart(exercise.restBetweenReps)
      lastCountdownRef.current = 0
    } else if (phase === 'set_rest') {
      timerStart(exercise.restBetweenSets)
      lastCountdownRef.current = 0
    }
  }, [
    phase,
    exercise,
    exerciseIndex,
    currentSet,
    currentRep,
    isRepsExercise,
    countdownDuration,
    timerStart,
  ])

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

  // ── Public actions ──────────────────────────────────────────────────────

  const startExercise = useCallback(
    (params: ExerciseOverride) => {
      setOverrides((prev) => ({ ...prev, [exerciseIndex]: params }))
      setPendingAutoStartSeconds(null)
      wakeLockRequest()
      enterActivePhase()
    },
    [exerciseIndex, wakeLockRequest, enterActivePhase],
  )

  const skipExercise = useCallback(() => {
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
        Math.floor((performance.now() - startTimeRef.current) / 1000),
      )
      setPhase('workout_complete')
      wakeLockRelease()
    }
  }, [exercise, exercises, exerciseIndex, wakeLockRelease])

  const { stop: timerStop, pause: timerPause, resume: timerResume } = timer

  const skipTimer = useCallback(() => {
    skippedTimerRef.current = true
    timerStop()
    handleTimerComplete()
  }, [timerStop, handleTimerComplete])

  const pauseTimer = useCallback(() => {
    timerPause()
    setWasPausedPhase(phase)
    setPhase('paused')
  }, [timerPause, phase])

  /**
   * Resume from pause. When the user paused mid-hang on a timed exercise,
   * re-enter through a fresh `countdown` preparation phase (so the hang
   * restarts clean after a "Preparati!"). Otherwise restore the exact
   * previous phase and resume the running timer from where it left off.
   */
  const resumeTimer = useCallback(() => {
    if (!wasPausedPhase) return

    const shouldReenterWithCountdown =
      wasPausedPhase === 'hanging' && !isRepsExercise && countdownDuration > 0

    setWasPausedPhase(null)

    if (shouldReenterWithCountdown) {
      // Abandon the paused timer; enterActivePhase will trigger a fresh
      // countdown via the phase-change effect.
      timerStop()
      enterActivePhase()
      return
    }

    resumingRef.current = true
    setPhase(wasPausedPhase)
    timerResume()
  }, [
    wasPausedPhase,
    isRepsExercise,
    countdownDuration,
    timerStop,
    enterActivePhase,
    timerResume,
  ])

  /** Mark the current set as done for a reps-counted exercise. */
  const repsSetDone = useCallback(() => {
    if (!exercise) return

    const isLastSet = currentSet >= exercise.sets
    if (isLastSet) {
      setCompletedExercises((c) => c + 1)
      speak('Esercizio completato!')
      vibrateMedium()
      advanceToNextExercise()
    } else {
      speak('Riposo tra le serie')
      setPhase('set_rest')
    }
  }, [exercise, currentSet, speak, vibrateMedium, advanceToNextExercise])

  /**
   * Called when the info modal opens: pauses the timer if it's currently
   * running. We remember whether we were the ones pausing it so the caller
   * can decide whether to auto-resume on close.
   */
  const pauseForInfo = useCallback(() => {
    if (
      phase === 'countdown' ||
      phase === 'hanging' ||
      phase === 'resting' ||
      phase === 'set_rest'
    ) {
      pausedForInfoRef.current = true
      pauseTimer()
    }
  }, [phase, pauseTimer])

  /** Resume from a pause triggered by `pauseForInfo`. No-op otherwise. */
  const resumeFromInfo = useCallback(() => {
    if (pausedForInfoRef.current) {
      pausedForInfoRef.current = false
      resumeTimer()
    }
  }, [resumeTimer])

  return {
    // state
    phase,
    exercise,
    exerciseIndex,
    currentSet,
    currentRep,
    wasPausedPhase,
    pendingAutoStartSeconds,
    timer,
    countdownDuration,
    // actions
    startExercise,
    skipExercise,
    skipTimer,
    pauseTimer,
    resumeTimer,
    repsSetDone,
    pauseForInfo,
    resumeFromInfo,
    skipExerciseCompleteWait,
    // workout summary helpers
    completedExercises,
    finalDuration,
    skippedExercises,
  }
}
