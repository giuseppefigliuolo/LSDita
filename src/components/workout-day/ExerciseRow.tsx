import PosterPill from '../ui/PosterPill'
import type { Exercise } from '../../types'
import { getExerciseColor } from '../../utils/exerciseColors'
import { getExerciseTechLine, getExerciseVolume } from '../../utils/exerciseLabels'

/** Numbered stop on the session's exercise path */
export default function ExerciseRow({
  exercise,
  index,
  onTap
}: {
  exercise: Exercise
  index: number
  onTap: () => void
}) {
  return (
    <button
      type="button"
      onClick={onTap}
      className="flex w-full min-h-11 cursor-pointer items-center gap-3.5 py-2.5 text-left focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-violet"
    >
      <span
        aria-hidden="true"
        className="relative flex size-[46px] shrink-0 items-center justify-center rounded-full border-2 border-plum font-poster text-xl leading-none"
        style={{ backgroundColor: getExerciseColor(index).bg }}
      >
        {index + 1}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-base font-extrabold leading-tight">
          {exercise.name}
        </span>
        <span className="mt-0.5 block text-[13px] text-plum-muted">
          {getExerciseTechLine(exercise)}
        </span>
      </span>
      <PosterPill className="text-sm">{getExerciseVolume(exercise)}</PosterPill>
    </button>
  )
}
