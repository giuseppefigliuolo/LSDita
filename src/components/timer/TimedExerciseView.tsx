import type { Exercise, WorkoutPhase } from '../../types'
import ExerciseNotesButton from './ExerciseNotesButton'
import PosterIconButton from '../ui/PosterIconButton'
import ActiveExerciseScreen, { PrimaryBarButton, SkipExerciseButton } from './ActiveExerciseScreen'

interface TimedExerciseViewProps {
  exercise: Exercise
  exerciseIndex: number
  weekNumber?: number
  phase: WorkoutPhase
  wasPausedPhase: WorkoutPhase | null
  currentSet: number
  currentRep: number
  timeRemaining: number
  onPause: () => void
  onResume: () => void
  onSkipTimer: () => void
  onSkipExercise: () => void
  onOpenInfo: () => void
  onOpenNotes: () => void
  onClose: () => void
}

/**
 * View for timer-based exercises (`timed_hang`, `timed_hold`, `repeaters`,
 * `timed_stretch`), also used for the rest between sets of `reps` exercises.
 * Displays the seconds left plus pause/skip controls.
 */
export default function TimedExerciseView({
  exercise,
  exerciseIndex,
  weekNumber,
  phase,
  wasPausedPhase,
  currentSet,
  currentRep,
  timeRemaining,
  onPause,
  onResume,
  onSkipTimer,
  onSkipExercise,
  onOpenInfo,
  onOpenNotes,
  onClose,
}: TimedExerciseViewProps) {
  const activePhase = phase === 'paused' ? (wasPausedPhase ?? 'hanging') : phase
  const isRepeaters = exercise.type === 'repeaters'

  const progressTotal = isRepeaters ? exercise.repsPerSet : exercise.sets
  const progressCurrent = isRepeaters ? currentRep : currentSet
  const progressState: 'active' | 'resting' | 'complete' = isRepeaters
    ? activePhase === 'hanging' || activePhase === 'countdown'
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

  const caption = isCountdownPhase
    ? 'Posizionati!'
    : isRepeaters
      ? `Serie ${currentSet} di ${exercise.sets}`
      : undefined

  return (
    <ActiveExerciseScreen
      exercise={exercise}
      exerciseIndex={exerciseIndex}
      weekNumber={weekNumber}
      onClose={onClose}
      onOpenInfo={onOpenInfo}
      progress={{
        total: progressTotal,
        current: progressCurrent,
        state: progressState,
        unit: isRepeaters ? 'Rep' : 'Serie',
      }}
      contentKey={`${exerciseIndex}-${phase}`}
      value={phase === 'exercise_complete' ? null : Math.ceil(timeRemaining)}
      label={getPhaseLabel(phase)}
      caption={caption}
      actions={
        <>
          <SkipExerciseButton onClick={onSkipExercise} />
          {phase === 'paused' ? (
            <PrimaryBarButton onClick={onResume} aria-label="Riprendi">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <polygon points="5 3 19 12 5 21" />
              </svg>
            </PrimaryBarButton>
          ) : (
            <PrimaryBarButton onClick={onPause} aria-label="Pausa">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <rect x="6" y="4" width="4" height="16" rx="1" />
                <rect x="14" y="4" width="4" height="16" rx="1" />
              </svg>
            </PrimaryBarButton>
          )}
          <PosterIconButton shape="round" size="lg" tone="cream" onClick={onSkipTimer} aria-label="Salta timer">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polygon points="5 4 15 12 5 20" />
              <line x1="19" y1="5" x2="19" y2="19" />
            </svg>
          </PosterIconButton>
          <ExerciseNotesButton bar exerciseId={exercise.id} onClick={onOpenNotes} />
        </>
      }
    />
  )
}

function getPhaseLabel(phase: WorkoutPhase): string {
  switch (phase) {
    case 'countdown':
      return 'Preparati'
    case 'hanging':
      return 'Tieni'
    case 'resting':
      return 'Riposa'
    case 'set_rest':
      return 'Riposo tra serie'
    case 'paused':
      return 'Pausa'
    case 'exercise_complete':
      return 'Completato'
    default:
      return ''
  }
}
