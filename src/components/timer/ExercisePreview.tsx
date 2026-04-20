import { useState, useCallback, useRef, useEffect } from 'react'
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useMotionValueEvent,
  useTransform,
  animate as motionAnimate,
} from 'framer-motion'
import type { Exercise } from '../../types'
import { parseExerciseDescription } from '../ui/ExerciseDescription'
import Badge from '../ui/Badge'
import ExerciseIllustration from '../illustrations/ExerciseIllustration'
import ExerciseNotesModal from './ExerciseNotesModal'
import { useWorkoutStore } from '../../store/useWorkoutStore'
import { INK, SURFACE, SURFACE_ELEVATED, RADIUS, SHADOW } from '../../styles/tokens'

function formatCountdown(seconds: number): string {
  const s = Math.max(0, Math.ceil(seconds))
  const m = Math.floor(s / 60)
  const r = s % 60
  return m > 0 ? `${m}:${r.toString().padStart(2, '0')}` : `${r}s`
}

const equipmentLabels: Record<string, string> = {
  hangboard: 'Hangboard',
  wooden_balls: 'Sfere legno',
  pull_up_bar: 'Sbarra',
  dumbbells: 'Manubri',
  fitness_band: 'Elastico',
  yoga_mat: 'Tappetino',
  bodyweight: 'Corpo libero',
}

interface ExercisePreviewProps {
  exercise: Exercise
  exerciseIndex: number
  totalExercises: number
  upcomingExercises?: Exercise[]
  onStart: (overrides: { sets: number; repsPerSet: number; hangTime: number }) => void
  onSkip: () => void
  autoStartSeconds?: number
}

export default function ExercisePreview({
  exercise,
  exerciseIndex,
  totalExercises,
  upcomingExercises = [],
  onStart,
  onSkip,
  autoStartSeconds,
}: ExercisePreviewProps) {
  const [sets, setSets] = useState(exercise.sets)
  const [reps, setReps] = useState(exercise.repsPerSet)
  const [time, setTime] = useState(exercise.hangTime)
  const [editing, setEditing] = useState<'sets' | 'reps' | 'time' | null>(null)
  const [showSkipConfirm, setShowSkipConfirm] = useState(false)
  const [showNotes, setShowNotes] = useState(false)
  const [autoCancelled, setAutoCancelled] = useState(false)

  const notesCount = useWorkoutStore(
    (state) => state.exerciseNotes.filter((n) => n.exerciseId === exercise.id).length
  )

  const autoActive = !!autoStartSeconds && autoStartSeconds > 0 && !autoCancelled

  const autoProgress = useMotionValue(0)
  const fillWidth = useTransform(autoProgress, (p) => `${p * 100}%`)
  const [remainingSecs, setRemainingSecs] = useState(autoStartSeconds ?? 0)

  useMotionValueEvent(autoProgress, 'change', (v) => {
    if (!autoStartSeconds) return
    const r = Math.max(0, Math.ceil(autoStartSeconds * (1 - v)))
    setRemainingSecs((prev) => (r !== prev ? r : prev))
  })

  const startRef = useRef<() => void>(() => {})

  useEffect(() => {
    if (!autoActive || !autoStartSeconds) return
    autoProgress.set(0)
    setRemainingSecs(autoStartSeconds)
    const controls = motionAnimate(autoProgress, 1, {
      duration: autoStartSeconds,
      ease: 'linear',
      onComplete: () => startRef.current(),
    })
    return () => controls.stop()
  }, [autoActive, autoStartSeconds, autoProgress])

  const cancelAuto = useCallback(() => {
    setAutoCancelled(true)
    autoProgress.stop()
  }, [autoProgress])

  function handleStart() {
    cancelAuto()
    setEditing(null)
    onStart({ sets, repsPerSet: reps, hangTime: time })
  }

  startRef.current = handleStart

  const toggleEditing = (field: 'sets' | 'reps' | 'time') => {
    cancelAuto()
    setEditing((prev) => (prev === field ? null : field))
  }

  const openSkipConfirm = () => {
    cancelAuto()
    setShowSkipConfirm(true)
  }

  const openNotes = () => {
    cancelAuto()
    setShowNotes(true)
  }

  const { body: descBody, refUrl } = parseExerciseDescription(exercise.description)
  const refHref = refUrl
    ? (/^https?:\/\//i.test(refUrl) ? refUrl : `https://${refUrl.replace(/^\/\//, '')}`)
    : null
  const refLabel = refUrl ? refUrl.replace(/^https?:\/\//i, '') : null

  const equipmentLabel = equipmentLabels[exercise.equipment] ?? exercise.equipment
  const hasWeight = exercise.weight && exercise.weight !== 'corpo libero'

  const progressPct = totalExercises > 0 ? ((exerciseIndex + 1) / totalExercises) * 100 : 0

  return (
    <>
      <motion.div
        className="flex flex-col h-[100dvh] w-full overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
      >
        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-5 pt-4 pb-6">
          {/* Top: badge + progress bar */}
          <div className="flex flex-col items-center mb-4">
            <Badge variant="accent" className="mb-3">
              Esercizio {exerciseIndex + 1} di {totalExercises}
            </Badge>
            <div
              className="w-full max-w-md h-1.5 relative overflow-hidden border-[1.5px]"
              style={{
                backgroundColor: SURFACE,
                borderColor: INK,
                borderRadius: RADIUS.pill,
              }}
            >
              <div
                className="absolute inset-y-0 left-0"
                style={{
                  width: `${progressPct}%`,
                  backgroundColor: '#D4541A',
                  transition: 'width 0.3s ease',
                }}
              />
            </div>
          </div>

          {/* Title row: illustration + name */}
          <div className="flex items-start gap-3 mb-4 relative">
            <div
              className="shrink-0 flex items-center justify-center border-[2.5px]"
              style={{
                width: 76,
                height: 76,
                borderColor: INK,
                backgroundColor: SURFACE_ELEVATED,
                borderRadius: RADIUS.blob,
                boxShadow: SHADOW.sm,
              }}
            >
              <ExerciseIllustration name={exercise.illustration} size={56} />
            </div>
            <div className="flex-1 min-w-0 pr-12">
              <h2
                className="font-bold text-text leading-tight mb-1"
                style={{
                  fontSize: 30,
                  fontFamily: 'var(--font-display)',
                  overflowWrap: 'anywhere',
                }}
              >
                {exercise.name}
              </h2>
              <p className="text-xs font-bold uppercase tracking-wider" style={{ color: '#D4541A' }}>
                {equipmentLabel}
                {hasWeight && <> · {exercise.weight}</>}
              </p>
            </div>

            {/* Notes button absolute top-right */}
            <button
              type="button"
              onClick={openNotes}
              aria-label={notesCount > 0 ? `Visualizza ${notesCount} note` : 'Aggiungi nota'}
              className="absolute top-0 right-0 w-10 h-10 flex items-center justify-center border-[2.5px] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all"
              style={{
                borderColor: INK,
                backgroundColor: notesCount > 0 ? '#E8B820' : SURFACE,
                borderRadius: RADIUS.blob,
                boxShadow: SHADOW.sm,
              }}
            >
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke={INK} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 3h8l4 4v10H4z" />
                <path d="M12 3v4h4" />
                <path d="M7 11h6M7 14h4" />
              </svg>
              {notesCount > 0 && (
                <span
                  className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1 flex items-center justify-center text-[10px] font-bold border-[2px]"
                  style={{
                    borderColor: INK,
                    backgroundColor: '#D4541A',
                    color: '#FFFBF0',
                    borderRadius: RADIUS.pill,
                    boxShadow: SHADOW.xxs,
                  }}
                >
                  {notesCount}
                </span>
              )}
            </button>
          </div>

          {/* Stat row — single line with dashed dividers */}
          <div
            className="flex items-stretch mb-4 border-[2.5px]"
            style={{
              borderColor: INK,
              backgroundColor: SURFACE_ELEVATED,
              borderRadius: RADIUS.btnMd,
              boxShadow: SHADOW.sm,
            }}
          >
            <StatCell
              value={sets}
              label="Serie"
              colorClass="text-primary"
              active={editing === 'sets'}
              onClick={() => toggleEditing('sets')}
            />
            <DashedDivider />
            <StatCell
              value={reps}
              label="Rep"
              colorClass="text-secondary"
              active={editing === 'reps'}
              onClick={() => toggleEditing('reps')}
            />
            {exercise.type !== 'reps' && (
              <>
                <DashedDivider />
                <StatCell
                  value={time}
                  suffix="s"
                  label="Tempo"
                  colorClass="text-accent"
                  active={editing === 'time'}
                  onClick={() => toggleEditing('time')}
                />
              </>
            )}
          </div>

          <AnimatePresence mode="wait">
            {editing === 'sets' && (
              <NumberEditor key="sets" value={sets} onChange={setSets} min={1} max={12} color="primary" />
            )}
            {editing === 'reps' && (
              <NumberEditor key="reps" value={reps} onChange={setReps} min={1} max={20} color="secondary" />
            )}
            {editing === 'time' && (
              <TimeTickerEditor key="time" value={time} onChange={setTime} min={3} max={120} />
            )}
          </AnimatePresence>

          {/* Description card */}
          {descBody && (
            <div
              className="mb-4 p-4 border-[2.5px]"
              style={{
                borderColor: INK,
                backgroundColor: SURFACE_ELEVATED,
                borderRadius: RADIUS.card,
                boxShadow: SHADOW.sm,
              }}
            >
              <div className="flex items-center gap-2 mb-2.5">
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

          {/* Ref link as dashed chip */}
          {refHref && refLabel && (
            <a
              href={refHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3.5 py-2 mb-5 text-xs font-medium text-primary max-w-full"
              style={{
                border: `1.5px dashed ${INK}`,
                borderRadius: RADIUS.pill,
                backgroundColor: 'transparent',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
              </svg>
              <span className="truncate min-w-0">{refLabel}</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </a>
          )}

          {exercise.notes && (
            <p className="text-xs text-text-muted italic mb-5 max-w-lg">
              {exercise.notes}
            </p>
          )}

          {/* Dopo questo */}
          {upcomingExercises.length > 0 && (
            <div className="mt-2">
              <p className="text-[11px] font-bold uppercase tracking-widest text-text-muted mb-2.5">
                Dopo questo
              </p>
              <div className="flex flex-col gap-2">
                {upcomingExercises.map((ex, i) => (
                  <UpcomingRow
                    key={ex.id}
                    exercise={ex}
                    number={exerciseIndex + 2 + i}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sticky bottom CTA bar */}
        <div
          className="shrink-0 w-full px-4 pt-3 pb-4 flex gap-3 border-t-[2.5px]"
          style={{
            borderColor: INK,
            backgroundColor: SURFACE,
            boxShadow: '0 -4px 0 rgba(58,18,72,0.06)',
          }}
        >
          <button
            type="button"
            onClick={openSkipConfirm}
            className="shrink-0 h-14 px-5 font-semibold text-sm text-text border-[2.5px] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all"
            style={{
              flexBasis: '38%',
              borderColor: INK,
              backgroundColor: SURFACE_ELEVATED,
              borderRadius: RADIUS.btnMd,
              boxShadow: SHADOW.sm,
            }}
          >
            Salta
          </button>
          {autoActive ? (
            <motion.button
              onClick={handleStart}
              className="relative overflow-hidden flex-1 inline-flex items-center justify-center gap-2 font-bold border-[3px] text-lg cursor-pointer"
              style={{
                height: 56,
                backgroundColor: '#D4541A',
                color: '#FFFBF0',
                borderColor: INK,
                borderRadius: RADIUS.btnLg,
                boxShadow: `4px 4px 0px ${INK}, inset 0 2px 0 rgba(255,255,255,0.4)`,
              }}
              whileTap={{ x: 4, y: 4, boxShadow: SHADOW.pressed }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            >
              <motion.div
                className="absolute inset-y-0 right-0 z-0"
                style={{
                  width: fillWidth,
                  backgroundColor: 'rgba(244, 232, 196, 0.72)',
                }}
              />
              <span className="relative z-10">
                Inizia tra {formatCountdown(remainingSecs)}
              </span>
            </motion.button>
          ) : (
            <motion.button
              onClick={handleStart}
              whileTap={{ x: 4, y: 4, boxShadow: SHADOW.pressed }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              className="flex-1 inline-flex items-center justify-center gap-2 font-bold border-[3px] text-lg cursor-pointer"
              style={{
                height: 56,
                backgroundColor: '#D4541A',
                color: '#FFFBF0',
                borderColor: INK,
                borderRadius: RADIUS.btnLg,
                boxShadow: `4px 4px 0px ${INK}, inset 0 2px 0 rgba(255,255,255,0.4)`,
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5 3 19 12 5 21" />
              </svg>
              Inizia
            </motion.button>
          )}
        </div>
      </motion.div>

      <ExerciseNotesModal
        open={showNotes}
        exerciseId={exercise.id}
        exerciseName={exercise.name}
        onClose={() => setShowNotes(false)}
      />

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
                  onClick={onSkip}
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
    </>
  )
}

function StatCell({ value, suffix, label, colorClass, active, onClick }: {
  value: number
  suffix?: string
  label: string
  colorClass: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 flex flex-col items-center justify-center py-2.5 px-2 transition-colors ${active ? 'bg-surface' : ''}`}
      style={{ borderRadius: 'inherit' }}
    >
      <span className={`text-xl font-bold font-timer leading-none ${colorClass}`}>
        {value}{suffix}
      </span>
      <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted mt-1">
        {label}
      </span>
    </button>
  )
}

function DashedDivider() {
  return (
    <div
      className="self-stretch my-1.5"
      style={{
        width: 0,
        borderLeft: `1.5px dashed ${INK}`,
        opacity: 0.4,
      }}
    />
  )
}

function UpcomingRow({ exercise, number }: { exercise: Exercise; number: number }) {
  const colors = ['#3FB6A8', '#9B6BCE', '#D4541A', '#E8B820']
  const bg = colors[(number - 1) % colors.length]
  const hasWeight = exercise.weight && exercise.weight !== 'corpo libero'
  const isReps = exercise.type === 'reps'

  const metric = isReps
    ? `${exercise.sets} × ${exercise.repsPerSet}`
    : `${exercise.sets} × ${exercise.repsPerSet} · ${exercise.hangTime}s`

  return (
    <div
      className="flex items-center gap-3 px-3 py-2 border-[2px]"
      style={{
        borderColor: INK,
        backgroundColor: SURFACE_ELEVATED,
        borderRadius: RADIUS.btnSm,
        boxShadow: SHADOW.xs,
      }}
    >
      <div
        className="shrink-0 w-9 h-9 flex items-center justify-center border-[2px] text-sm font-bold font-timer"
        style={{
          borderColor: INK,
          backgroundColor: bg,
          color: '#FFFBF0',
          borderRadius: RADIUS.btnSm,
        }}
      >
        {number}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold text-text truncate">{exercise.name}</p>
        <p className="text-[11px] text-text-muted font-timer">
          {metric}{hasWeight && ` · ${exercise.weight}`}
        </p>
      </div>
    </div>
  )
}

function NumberEditor({ value, onChange, min, max, color }: {
  value: number
  onChange: (v: number) => void
  min: number
  max: number
  color: 'primary' | 'secondary'
}) {
  const colorClasses = {
    primary: { bg: 'bg-primary', text: 'text-primary', soft: 'bg-primary-soft' },
    secondary: { bg: 'bg-secondary', text: 'text-secondary', soft: 'bg-secondary-soft' },
  }
  const c = colorClasses[color]

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.2 }}
      className="w-full overflow-hidden mb-4"
    >
      <div className="flex items-center justify-center gap-4 py-3">
        <motion.button
          whileTap={{ scale: 0.85 }}
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          className={`w-11 h-11 rounded-full ${c.soft} ${c.text} flex items-center justify-center text-xl font-bold disabled:opacity-30`}
        >
          −
        </motion.button>

        <span className={`text-3xl font-bold font-timer ${c.text} w-12 text-center`}>{value}</span>

        <motion.button
          whileTap={{ scale: 0.85 }}
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
          className={`w-11 h-11 rounded-full ${c.soft} ${c.text} flex items-center justify-center text-xl font-bold disabled:opacity-30`}
        >
          +
        </motion.button>
      </div>
    </motion.div>
  )
}

function TimeTickerEditor({ value, onChange, min, max }: {
  value: number
  onChange: (v: number) => void
  min: number
  max: number
}) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const isProgrammatic = useRef(false)
  const scrollEndTimer = useRef<ReturnType<typeof setTimeout>>(undefined)
  const TICK_W = 10

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    el.scrollLeft = (value - min) * TICK_W
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    return () => clearTimeout(scrollEndTimer.current)
  }, [])

  const handleScroll = useCallback(() => {
    if (isProgrammatic.current) return
    clearTimeout(scrollEndTimer.current)

    const el = scrollRef.current
    if (!el) return

    const tickIndex = Math.round(el.scrollLeft / TICK_W)
    const newValue = Math.max(min, Math.min(max, min + tickIndex))
    onChange(newValue)

    scrollEndTimer.current = setTimeout(() => {
      const snapped = tickIndex * TICK_W
      if (Math.abs(el.scrollLeft - snapped) > 1) {
        isProgrammatic.current = true
        el.scrollTo({ left: snapped, behavior: 'smooth' })
        setTimeout(() => { isProgrammatic.current = false }, 200)
      }
    }, 80)
  }, [min, max, onChange])

  const nudge = (delta: number) => {
    const newVal = Math.max(min, Math.min(max, value + delta))
    onChange(newVal)
    const el = scrollRef.current
    if (!el) return
    isProgrammatic.current = true
    el.scrollTo({ left: (newVal - min) * TICK_W, behavior: 'smooth' })
    setTimeout(() => { isProgrammatic.current = false }, 300)
  }

  const totalTicks = max - min + 1

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.2 }}
      className="w-full overflow-hidden mb-4"
    >
      <div className="flex flex-col items-center py-3">
        <div className="flex items-baseline gap-1 mb-3">
          <span className="text-3xl font-bold font-timer text-accent">{value}</span>
          <span className="text-sm text-text-muted font-timer">s</span>
        </div>

        <div className="relative w-full">
          <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-[3px] rounded-full bg-accent z-20 opacity-70" />

          <div className="absolute left-0 top-0 bottom-0 w-8 bg-linear-to-r from-bg to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-linear-to-l from-bg to-transparent z-10 pointer-events-none" />

          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="overflow-x-auto"
            style={{
              scrollbarWidth: 'none',
              WebkitOverflowScrolling: 'touch',
            }}
          >
            <div
              className="flex items-end"
              style={{
                height: 52,
                paddingLeft: '50%',
                paddingRight: '50%',
              }}
            >
              {Array.from({ length: totalTicks }, (_, i) => {
                const tickValue = min + i
                const isActive = tickValue <= value
                const isMajor = tickValue % 10 === 0
                const isMid = tickValue % 5 === 0 && !isMajor

                return (
                  <div
                    key={tickValue}
                    className="flex flex-col items-center justify-end shrink-0"
                    style={{ width: TICK_W, height: '100%' }}
                  >
                    {isMajor && (
                      <span
                        className={`text-[8px] font-timer mb-1 select-none ${isActive ? 'text-accent/80' : 'text-text-muted/60'}`}
                      >
                        {tickValue}
                      </span>
                    )}
                    <div
                      className="rounded-full"
                      style={{
                        width: 4,
                        height: isMajor ? 28 : isMid ? 20 : 14,
                        backgroundColor: isActive
                          ? 'var(--color-accent)'
                          : 'var(--color-surface-elevated)',
                        boxShadow: isActive
                          ? '0 0 6px color-mix(in srgb, var(--color-accent) 30%, transparent)'
                          : 'none',
                      }}
                    />
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 mt-2">
          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={() => nudge(-1)}
            disabled={value <= min}
            className="w-9 h-9 rounded-full bg-accent-soft text-accent flex items-center justify-center text-sm font-bold disabled:opacity-30"
          >
            −
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={() => nudge(1)}
            disabled={value >= max}
            className="w-9 h-9 rounded-full bg-accent-soft text-accent flex items-center justify-center text-sm font-bold disabled:opacity-30"
          >
            +
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}
