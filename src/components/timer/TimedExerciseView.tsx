import { AnimatePresence, motion } from 'framer-motion'
import type { Exercise, WorkoutPhase } from '../../types'
import CircularTimer from './CircularTimer'
import SetProgressDots from './SetProgressDots'
import { INK, RADIUS, SHADOW } from '../../styles/tokens'

interface TimedExerciseViewProps {
  exercise: Exercise
  exerciseIndex: number
  phase: WorkoutPhase
  wasPausedPhase: WorkoutPhase | null
  currentSet: number
  currentRep: number
  timeRemaining: number
  countdownDuration: number
  onPause: () => void
  onResume: () => void
  onSkipTimer: () => void
  onSkipExercise: () => void
  onOpenInfo: () => void
}

/**
 * View for timer-based exercises (`timed_hang`, `timed_hold`, `repeaters`,
 * `timed_stretch`). Displays a circular timer plus pause/skip controls.
 */
export default function TimedExerciseView({
  exercise,
  exerciseIndex,
  phase,
  wasPausedPhase,
  currentSet,
  currentRep,
  timeRemaining,
  countdownDuration,
  onPause,
  onResume,
  onSkipTimer,
  onSkipExercise,
  onOpenInfo,
}: TimedExerciseViewProps) {
  const activePhase = phase === 'paused' ? (wasPausedPhase ?? 'hanging') : phase
  const isRepeaters = exercise.type === 'repeaters'

  const phaseLabel = getPhaseLabel(phase)
  const totalTime = getTotalTimeForPhase(
    activePhase,
    exercise,
    countdownDuration,
  )

  const progressTotal = isRepeaters ? exercise.repsPerSet : exercise.sets
  const progressCurrent = isRepeaters ? currentRep : currentSet
  const progressState: 'active' | 'resting' | 'complete' = isRepeaters
    ? activePhase === 'hanging'
      ? 'active'
      : 'resting'
    : activePhase === 'hanging' || activePhase === 'countdown'
      ? 'active'
      : activePhase === 'set_rest' || activePhase === 'exercise_complete'
        ? 'complete'
        : 'resting'

  const isCountdownPhase =
    phase === 'countdown' ||
    (phase === 'paused' && wasPausedPhase === 'countdown')

  return (
    <div className="relative flex flex-col items-center justify-center min-h-[80dvh] px-4">

      <AnimatePresence mode="wait">
        <motion.div
          key={`${exerciseIndex}-${phase}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="flex flex-col items-center"
        >
          <SetProgressDots
            total={progressTotal}
            current={progressCurrent}
            activeState={progressState}
          />

          <button
            onClick={onOpenInfo}
            className="mb-14 outline-none active:opacity-70 transition-opacity"
            aria-label="Informazioni esercizio"
          >
            <span className="font-semibold uppercase tracking-widest text-text-muted border-b-2 border-dashed border-text-muted/60 pb-1">
              {exercise.name}
            </span>
          </button>


          <div className="mb-4">
            <CircularTimer
              timeRemaining={timeRemaining}
              totalTime={totalTime}
              phase={activePhase}
              label={phaseLabel}
            />
          </div>

          <p className="font-semibold uppercase tracking-widest text-text-muted text-center my-4">
            {isCountdownPhase
              ? 'Posizionati!'
              : `Serie ${currentSet}/${exercise.sets}  •  Rep ${currentRep}/${exercise.repsPerSet}`}
          </p>

          <div className="flex items-center justify-center gap-7 mt-8">
            <button
              onClick={onSkipExercise}
              className="w-16 h-16 bg-surface border-[2.5px] border-[#3A1248] flex items-center justify-center active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all"
              style={{
                borderRadius: RADIUS.controlSm,
                boxShadow: SHADOW.sm,
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
                onClick={onResume}
                className="w-24 h-24 bg-accent border-[3px] border-[#3A1248] flex items-center justify-center active:translate-x-[3px] active:translate-y-[3px] active:shadow-none transition-all"
                style={{
                  borderRadius: RADIUS.controlLg,
                  boxShadow: SHADOW.md,
                }}
                aria-label="Riprendi"
              >
                <svg width="32" height="32" viewBox="0 0 24 24" fill={INK}>
                  <polygon points="5 3 19 12 5 21" />
                </svg>
              </button>
            ) : (
              <button
                onClick={onPause}
                className="w-24 h-24 bg-surface border-[3px] border-[#3A1248] flex items-center justify-center active:translate-x-[3px] active:translate-y-[3px] active:shadow-none transition-all"
                style={{
                  borderRadius: RADIUS.controlLg,
                  boxShadow: SHADOW.md,
                }}
                aria-label="Pausa"
              >
                <svg width="28" height="28" viewBox="0 0 24 24" fill={INK}>
                  <rect x="6" y="4" width="4" height="16" rx="1" />
                  <rect x="14" y="4" width="4" height="16" rx="1" />
                </svg>
              </button>
            )}

            <button
              onClick={onSkipTimer}
              className="w-16 h-16 bg-surface border-[2.5px] border-[#3A1248] flex items-center justify-center active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all"
              style={{
                borderRadius: RADIUS.controlSm,
                boxShadow: SHADOW.sm,
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
    </div>
  )
}

function getPhaseLabel(phase: WorkoutPhase): string {
  switch (phase) {
    case 'countdown':
      return 'PREPARATI'
    case 'hanging':
      return 'TIENI'
    case 'resting':
      return 'RIPOSA'
    case 'set_rest':
      return 'RIPOSO TRA SERIE'
    case 'paused':
      return 'PAUSA'
    case 'exercise_complete':
      return 'COMPLETATO'
    default:
      return ''
  }
}

function getTotalTimeForPhase(
  phase: WorkoutPhase,
  exercise: Exercise,
  countdownDuration: number,
): number {
  switch (phase) {
    case 'countdown':
      return countdownDuration
    case 'hanging':
      return exercise.hangTime
    case 'resting':
      return exercise.restBetweenReps
    case 'set_rest':
    default:
      return exercise.restBetweenSets
  }
}
