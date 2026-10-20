import { useEffect, useRef } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import type { Exercise } from '../../types'
import ExerciseIllustration from '../illustrations/ExerciseIllustration'
import PosterIconButton from '../ui/PosterIconButton'
import PosterPill from '../ui/PosterPill'
import Sunburst from '../ui/Sunburst'
import { getExerciseColor } from '../../utils/exerciseColors'
import { parseExerciseDescription } from '../../utils/exerciseDescription'
import { getEquipmentLabel, getGripLabel } from '../../utils/exerciseLabels'

interface ExerciseInfoModalProps {
  open: boolean
  exercise: Exercise
  exerciseIndex: number
  onClose: () => void
}

const FOCUSABLE = 'button, a[href], [tabindex]:not([tabindex="-1"])'

export default function ExerciseInfoModal({
  open,
  exercise,
  exerciseIndex,
  onClose
}: ExerciseInfoModalProps) {
  const reduceMotion = useReducedMotion()
  const dialogRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLDivElement>(null)
  const onCloseRef = useRef(onClose)
  useEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])

  // Esc closes, Tab cycles inside the sheet + resume row, focus returns to the title on close.
  useEffect(() => {
    if (!open) return
    const previous = document.activeElement as HTMLElement | null
    const node = dialogRef.current
    closeRef.current?.querySelector<HTMLElement>('button')?.focus()

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onCloseRef.current()
        return
      }
      if (e.key !== 'Tab' || !node) return
      const items = Array.from(node.querySelectorAll<HTMLElement>(FOCUSABLE))
      if (items.length === 0) return
      const first = items[0]
      const last = items[items.length - 1]
      const active = document.activeElement
      if (!node.contains(active)) {
        e.preventDefault()
        first.focus()
      } else if (e.shiftKey && active === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && active === last) {
        e.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      previous?.focus?.()
    }
  }, [open])

  const { body: descBody, refUrl } = parseExerciseDescription(
    exercise.description
  )
  const refHref = refUrl
    ? /^https?:\/\//i.test(refUrl)
      ? refUrl
      : `https://${refUrl.replace(/^\/\//, '')}`
    : null
  const refLabel = refUrl ? refUrl.replace(/^https?:\/\//i, '') : null

  const color = getExerciseColor(exerciseIndex)
  const hasWeight = exercise.weight && exercise.weight !== 'corpo libero'
  const isReps = exercise.type === 'reps'
  const hasRepRest = !isReps && exercise.restBetweenReps > 0

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-label={`Info esercizio: ${exercise.name}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 bg-[rgba(59,23,70,0.6)] text-plum"
          onClick={onClose}
        >
          <motion.div
            initial={
              reduceMotion
                ? { opacity: 0, rotate: -1.5 }
                : { opacity: 0, y: 24, rotate: 0 }
            }
            animate={{ opacity: 1, y: 0, rotate: -1.5 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 24, rotate: 0 }}
            transition={{ duration: 0.26, ease: 'easeOut' }}
            className="absolute inset-x-[22px] top-[calc(96px+env(safe-area-inset-top,0px))] mx-auto flex max-w-md flex-col overflow-hidden rounded-[28px] border-2 border-plum bg-paper shadow-[6px_6px_0_#3b1746]"
            // Leaves room for the resume row (34px offset + 56px button + gap) below the sheet.
            style={{
              maxHeight:
                'calc(100dvh - 96px - 114px - env(safe-area-inset-top, 0px) - env(safe-area-inset-bottom, 0px))'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="relative isolate h-[124px] shrink-0 overflow-hidden border-b-2 border-plum"
              style={{ backgroundColor: color.bg }}
            >
              <Sunburst
                ray={color.ray}
                base={color.bg}
                size={420}
                center={{ left: '50%', top: '50%' }}
              />
              <span
                aria-hidden="true"
                className="absolute top-2.5 left-4 font-poster text-[44px] leading-none text-poster-red"
                style={{
                  WebkitTextStroke: '2px #3b1746',
                  textShadow: '3px 3px 0 #3b1746'
                }}
              >
                {exerciseIndex + 1}
              </span>
              <div className="absolute top-1/2 left-1/2 flex size-[76px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-plum bg-paper shadow-[3px_3px_0_#3b1746]">
                <ExerciseIllustration name={exercise.illustration} size={52} />
              </div>
              <div ref={closeRef} className="absolute top-3 right-3">
                <PosterIconButton
                  shape="round"
                  size="sm"
                  onClick={onClose}
                  aria-label="Chiudi info"
                >
                  <svg width="20" height="20" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
                    <path d="M4.5 4.5l9 9M13.5 4.5l-9 9" />
                  </svg>
                </PosterIconButton>
              </div>
            </div>

            <div className="flex min-h-0 flex-col gap-3.5 overflow-y-auto overscroll-contain px-[18px] pt-4 pb-5">
              <div className="flex flex-col items-start gap-2">
                <PosterPill variant="ink">
                  {getEquipmentLabel(exercise.equipment)}
                  {hasWeight && <> · {exercise.weight}</>}
                </PosterPill>
                <h2
                  className="font-poster text-2xl leading-[1.1]"
                  style={{ overflowWrap: 'anywhere' }}
                >
                  {exercise.name}
                </h2>
              </div>

              <div className="flex flex-wrap gap-2">
                <PosterPill size="md" bg="#E98A5C">
                  {exercise.sets} serie
                </PosterPill>
                <PosterPill size="md" bg="#9FD8D0">
                  {exercise.repsPerSet} rep
                </PosterPill>
                {!isReps && (
                  <PosterPill size="md" bg="#D9C2E0">
                    {exercise.hangTime}s
                  </PosterPill>
                )}
                {hasRepRest && (
                  <PosterPill size="md" bg="#CFE0A8">
                    Rest rep {exercise.restBetweenReps}s
                  </PosterPill>
                )}
                {exercise.restBetweenSets > 0 && (
                  <PosterPill size="md" bg="#CFE0A8">
                    {hasRepRest ? 'Rest serie' : 'Rest'} {exercise.restBetweenSets}s
                  </PosterPill>
                )}
                {exercise.grip && (
                  <PosterPill size="md">{getGripLabel(exercise.grip)}</PosterPill>
                )}
              </div>

              {descBody && (
                <p className="text-[15px] leading-[1.55]">{descBody}</p>
              )}

              {refHref && refLabel && (
                <a
                  href={refHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 max-w-full items-center gap-2 self-start rounded-full border-[1.5px] border-dashed border-plum px-3.5 py-2 text-xs font-bold text-plum"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
                    <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
                  </svg>
                  <span className="truncate min-w-0">{refLabel}</span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0" aria-hidden="true">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </a>
              )}

              {exercise.notes && (
                <p className="rounded-2xl border-2 border-plum bg-pastel-butter px-3 py-2.5 text-[13px] leading-normal">
                  {exercise.notes}
                </p>
              )}
            </div>
          </motion.div>

          <div className="absolute inset-x-[22px] bottom-[calc(34px+env(safe-area-inset-bottom,0px))] mx-auto flex max-w-md items-center justify-between gap-3">
            <p className="flex items-center gap-1.5 font-mono text-xs font-bold uppercase tracking-[0.12em] text-cream">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <rect x="6" y="4" width="4" height="16" rx="1" />
                <rect x="14" y="4" width="4" height="16" rx="1" />
              </svg>
              Timer in pausa
            </p>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onClose()
              }}
              className="poster-press inline-flex h-14 shrink-0 cursor-pointer items-center gap-2 rounded-full border-2 border-plum bg-poster-red px-6 font-poster text-xl text-paper shadow-[4px_4px_0_#3b1746] focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-cream"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <polygon points="5 3 19 12 5 21" />
              </svg>
              Riprendi
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
