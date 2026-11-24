import BottomSheet from '../ui/BottomSheet'
import ExerciseDetailBody from './ExerciseDetailBody'
import type { Exercise } from '../../types'

export default function ExerciseDetailSheet({
  exercise,
  sessionTitle,
  onClose
}: {
  exercise: Exercise
  sessionTitle: string
  onClose: () => void
}) {
  return (
    <BottomSheet onClose={onClose} dragFrom="sheet" maxHeight="85dvh" showCloseButton>
      {() => <ExerciseDetailBody exercise={exercise} sessionTitle={sessionTitle} />}
    </BottomSheet>
  )
}
