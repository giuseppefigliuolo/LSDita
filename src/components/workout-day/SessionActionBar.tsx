import type { Ref } from 'react'
import Button from '../ui/Button'

interface Props {
  ref?: Ref<HTMLDivElement>
  hasExercises: boolean
  hasGuide: boolean
  totalMin: number
  exerciseCount: number
  /** Index of the exercise an interrupted run would resume from */
  resumeIndex: number | null
  isDone: boolean
  onStart: () => void
  onRestart: () => void
  onResume: () => void
  onMarkDone: () => void
}

/**
 * Fixed bottom CTA: start, resume/restart an interrupted run, or — for
 * sessions with nothing to time — mark the session done.
 */
export default function SessionActionBar({
  ref,
  hasExercises,
  hasGuide,
  totalMin,
  exerciseCount,
  resumeIndex,
  isDone,
  onStart,
  onRestart,
  onResume,
  onMarkDone
}: Props) {
  return (
    <div
      ref={ref}
      className="fixed inset-x-0 bottom-0 z-40 border-t-2 border-plum bg-cream px-5 pt-3.5 pb-[calc(14px+env(safe-area-inset-bottom,0px))]"
    >
      <div className="mx-auto max-w-lg">
        {hasExercises && resumeIndex != null ? (
          <div className="flex gap-3">
            <Button variant="ghost" size="lg" className="flex-1" onClick={onRestart}>
              Ricomincia
            </Button>
            <Button variant="primary" size="lg" className="flex-[2]" onClick={onResume}>
              ▶ Riprendi · {resumeIndex + 1}/{exerciseCount}
            </Button>
          </div>
        ) : hasExercises ? (
          <Button variant="primary" size="lg" fullWidth onClick={onStart}>
            ▶ {hasGuide ? 'Avvia esercizi' : 'Inizia allenamento'} · {totalMin} min
          </Button>
        ) : (
          <Button variant="primary" size="lg" fullWidth disabled={isDone} onClick={onMarkDone}>
            {isDone ? '✓ Sessione completata' : '✓ Segna come completata'}
          </Button>
        )}
      </div>
    </div>
  )
}
