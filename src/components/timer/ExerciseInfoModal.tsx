import { motion, AnimatePresence } from 'framer-motion'
import type { Exercise } from '../../types'
import ExerciseIllustration from '../illustrations/ExerciseIllustration'
import { parseExerciseDescription } from '../ui/ExerciseDescription'
import { getEquipmentLabel, getGripLabel } from '../../utils/exerciseLabels'
import {
  INK,
  RADIUS,
  SHADOW,
  SURFACE,
  SURFACE_ELEVATED,
} from '../../styles/tokens'

interface ExerciseInfoModalProps {
  open: boolean
  exercise: Exercise
  onClose: () => void
}

export default function ExerciseInfoModal({
  open,
  exercise,
  onClose,
}: ExerciseInfoModalProps) {
  const { body: descBody, refUrl } = parseExerciseDescription(
    exercise.description,
  )
  const refHref = refUrl
    ? /^https?:\/\//i.test(refUrl)
      ? refUrl
      : `https://${refUrl.replace(/^\/\//, '')}`
    : null
  const refLabel = refUrl ? refUrl.replace(/^https?:\/\//i, '') : null

  const hasWeight = exercise.weight && exercise.weight !== 'corpo libero'
  const isReps = exercise.type === 'reps'

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 px-4 pb-4 pt-10"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 40, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 40, opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 380, damping: 32 }}
            className="w-full max-w-md flex flex-col border-[3px] border-[#3A1248] overflow-hidden"
            style={{
              backgroundColor: SURFACE_ELEVATED,
              borderRadius: RADIUS.card,
              boxShadow: SHADOW.lg,
              maxHeight: '85dvh',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 pt-5 pb-3">
              <div className="flex items-center gap-2 min-w-0">
                <div
                  className="w-9 h-9 flex items-center justify-center border-[2px] border-[#3A1248] shrink-0"
                  style={{
                    backgroundColor: '#E8B820',
                    borderRadius: RADIUS.blob,
                    boxShadow: SHADOW.xs,
                  }}
                >
                  <InfoGlyph size={18} color={INK} />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] uppercase tracking-wider text-text-muted font-medium">
                    Info
                  </p>
                  <p className="text-sm font-bold text-text leading-tight line-clamp-1">
                    {exercise.name}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                aria-label="Chiudi"
                className="w-9 h-9 flex items-center justify-center border-[2px] border-[#3A1248] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all shrink-0"
                style={{
                  backgroundColor: SURFACE,
                  borderRadius: RADIUS.btnSm,
                  boxShadow: SHADOW.xs,
                }}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                  stroke={INK}
                  strokeWidth="2.4"
                  strokeLinecap="round"
                >
                  <path d="M3.5 3.5l7 7M10.5 3.5l-7 7" />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 pb-5">
              <div className="flex items-start gap-3 mb-4">
                <div
                  className="shrink-0 flex items-center justify-center border-[2.5px]"
                  style={{
                    width: 72,
                    height: 72,
                    borderColor: INK,
                    backgroundColor: SURFACE,
                    borderRadius: RADIUS.blob,
                    boxShadow: SHADOW.sm,
                  }}
                >
                  <ExerciseIllustration
                    name={exercise.illustration}
                    size={52}
                  />
                </div>
                <div className="flex-1 min-w-0 pt-1">
                  <h3
                    className="font-bold text-text leading-tight mb-1"
                    style={{
                      fontSize: 20,
                      fontFamily: 'var(--font-display)',
                      overflowWrap: 'anywhere',
                    }}
                  >
                    {exercise.name}
                  </h3>
                  <p
                    className="text-[11px] font-bold uppercase tracking-wider"
                    style={{ color: '#D4541A' }}
                  >
                    {getEquipmentLabel(exercise.equipment)}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5 mb-4">
                {exercise.grip && (
                  <Tag bg="#D4541A20" color="#8A3310">
                    {getGripLabel(exercise.grip)}
                  </Tag>
                )}
                {hasWeight && (
                  <Tag bg="#9B6BCE25" color="#4B2778">
                    {exercise.weight}
                  </Tag>
                )}
                <Tag bg="#3FB6A825" color="#15665D">
                  {isReps
                    ? `${exercise.sets} × ${exercise.repsPerSet} rep`
                    : `${exercise.sets} × ${exercise.repsPerSet} · ${exercise.hangTime}s`}
                </Tag>
                {!isReps && exercise.restBetweenReps > 0 && (
                  <Tag bg="#E8B82025" color="#6B4A00">
                    Rest rep {exercise.restBetweenReps}s
                  </Tag>
                )}
                {exercise.restBetweenSets > 0 && (
                  <Tag bg="#E8B82025" color="#6B4A00">
                    Rest serie {exercise.restBetweenSets}s
                  </Tag>
                )}
              </div>

              {descBody && (
                <div
                  className="mb-4 p-4 border-[2.5px]"
                  style={{
                    borderColor: INK,
                    backgroundColor: SURFACE,
                    borderRadius: RADIUS.card,
                    boxShadow: SHADOW.xs,
                  }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className="inline-flex items-center justify-center w-6 h-6 text-[13px] font-bold border-[2px] italic"
                      style={{
                        borderColor: INK,
                        backgroundColor: '#E8B820',
                        color: INK,
                        borderRadius: RADIUS.btnSm,
                      }}
                    >
                      i
                    </span>
                    <span className="font-bold text-text">Esecuzione</span>
                  </div>
                  <p
                    className="text-text"
                    style={{ fontSize: 14, lineHeight: 1.55 }}
                  >
                    {descBody}
                  </p>
                </div>
              )}

              {refHref && refLabel && (
                <a
                  href={refHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3.5 py-2 mb-4 text-xs font-medium text-primary max-w-full"
                  style={{
                    border: `1.5px dashed ${INK}`,
                    borderRadius: RADIUS.pill,
                    backgroundColor: 'transparent',
                  }}
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
                    <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
                  </svg>
                  <span className="truncate min-w-0">{refLabel}</span>
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="shrink-0"
                  >
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </a>
              )}

              {exercise.notes && (
                <div
                  className="p-3 border-[2px] border-dashed"
                  style={{
                    borderColor: `${INK}66`,
                    borderRadius: RADIUS.btnSm,
                    backgroundColor: 'transparent',
                  }}
                >
                  <p className="text-xs text-text-muted italic leading-snug">
                    {exercise.notes}
                  </p>
                </div>
              )}
            </div>

            <div
              className="px-5 py-3 border-t-[2.5px] border-[#3A1248] flex items-center justify-between gap-3"
              style={{ backgroundColor: SURFACE }}
            >
              <p className="text-[11px] uppercase tracking-wider text-text-muted font-semibold">
                Timer in pausa
              </p>
              <button
                onClick={onClose}
                className="inline-flex items-center gap-1.5 px-4 h-10 text-sm font-bold border-[3px] border-[#3A1248] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all"
                style={{
                  backgroundColor: '#D4541A',
                  color: '#FFFBF0',
                  borderRadius: RADIUS.btnMd,
                  boxShadow: SHADOW.md,
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="5 3 19 12 5 21" />
                </svg>
                Riprendi
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function Tag({
  children,
  bg,
  color,
}: {
  children: React.ReactNode
  bg: string
  color: string
}) {
  return (
    <span
      className="text-[10px] uppercase tracking-wider font-bold px-2.5 py-1 border-[1.5px]"
      style={{
        borderColor: INK,
        backgroundColor: bg,
        color,
        borderRadius: RADIUS.pill,
      }}
    >
      {children}
    </span>
  )
}

function InfoGlyph({ size = 18, color = INK }: { size?: number; color?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="10" cy="10" r="7.5" />
      <path d="M10 9v5" />
      <circle cx="10" cy="6" r="0.8" fill={color} stroke="none" />
    </svg>
  )
}
