import type { Exercise } from '../../types'
import ExerciseNotesButton from './ExerciseNotesButton'
import ActiveExerciseScreen, { PrimaryBarButton, SkipExerciseButton } from './ActiveExerciseScreen'

interface RepsExerciseViewProps {
  exercise: Exercise
  exerciseIndex: number
  weekNumber?: number
  currentSet: number
  onSetDone: () => void
  onSkipExercise: () => void
  onOpenInfo: () => void
  onOpenNotes: () => void
  onClose: () => void
  actionsHidden?: boolean
}

/** View for `reps`-type exercises (no timer, just a tap-to-complete button). */
export default function RepsExerciseView({
  exercise,
  exerciseIndex,
  weekNumber,
  currentSet,
  onSetDone,
  onSkipExercise,
  onOpenInfo,
  onOpenNotes,
  onClose,
  actionsHidden,
}: RepsExerciseViewProps) {
  const hasWeight = exercise.weight && exercise.weight !== 'corpo libero'

  return (
    <ActiveExerciseScreen
      exercise={exercise}
      exerciseIndex={exerciseIndex}
      weekNumber={weekNumber}
      onClose={onClose}
      onOpenInfo={onOpenInfo}
      actionsHidden={actionsHidden}
      progress={{ total: exercise.sets, current: currentSet, state: 'active' }}
      contentKey={`${exerciseIndex}-reps-${currentSet}`}
      value={exercise.repsPerSet}
      label="Ripetizioni"
      caption={hasWeight ? exercise.weight : undefined}
      actions={
        <>
          <SkipExerciseButton onClick={onSkipExercise} />
          <PrimaryBarButton onClick={onSetDone} aria-label="Serie fatta">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Allez
          </PrimaryBarButton>
          <ExerciseNotesButton bar exerciseId={exercise.id} onClick={onOpenNotes} />
        </>
      }
    />
  )
}
