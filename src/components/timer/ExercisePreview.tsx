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
import { parseExerciseDescription } from '../../utils/exerciseDescription'
import ExerciseIllustration from '../illustrations/ExerciseIllustration'
import ExerciseNotesModal from './ExerciseNotesModal'
import ExerciseNotesButton from './ExerciseNotesButton'
import Button from '../ui/Button'
import MuteButton from '../ui/MuteButton'
import IconButton from '../ui/IconButton'
import PosterPill from '../ui/PosterPill'
import Sunburst from '../ui/Sunburst'
import { getExerciseColor } from '../../utils/exerciseColors'
import { getEquipmentLabel, getExerciseVolume } from '../../utils/exerciseLabels'
import { RADIUS, SHADOW } from '../../styles/tokens'

function formatCountdown(seconds: number): string {
  const s = Math.max(0, Math.ceil(seconds))
  const m = Math.floor(s / 60)
  const r = s % 60
  return m > 0 ? `${m}:${r.toString().padStart(2, '0')}` : `${r}s`
}

interface ExercisePreviewProps {
  exercise: Exercise
  exerciseIndex: number
  totalExercises: number
  upcomingExercises?: Exercise[]
  onStart: (overrides: { sets: number; repsPerSet: number; hangTime: number }) => void
  onSkip: () => void
  autoStartSeconds?: number
  weekNumber?: number
  onClose: () => void
}

export default function ExercisePreview({
  exercise,
  exerciseIndex,
  totalExercises,
  upcomingExercises = [],
  onStart,
  onSkip,
  autoStartSeconds,
  weekNumber,
  onClose,
}: ExercisePreviewProps) {
  const [sets, setSets] = useState(exercise.sets)
  const [reps, setReps] = useState(exercise.repsPerSet)
  const [time, setTime] = useState(exercise.hangTime)
  const [editing, setEditing] = useState<'sets' | 'reps' | 'time' | null>(null)
  const [showSkipConfirm, setShowSkipConfirm] = useState(false)
  const [showNotes, setShowNotes] = useState(false)
  const [autoCancelled, setAutoCancelled] = useState(false)

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

  useEffect(() => {
    startRef.current = handleStart
  })

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

  const equipmentLabel = getEquipmentLabel(exercise.equipment)
  const hasWeight = exercise.weight && exercise.weight !== 'corpo libero'
  const color = getExerciseColor(exerciseIndex)

  return (
    <>
      <motion.div
        className="flex flex-col flex-1 min-h-0 self-stretch w-full overflow-hidden bg-cream text-plum"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
      >
        {/* Scrollable content (the coloured header scrolls with it) */}
        <div className="flex-1 overflow-y-auto overscroll-contain">
          <header
            className="relative isolate flex flex-col gap-[18px] overflow-hidden rounded-b-[36px] border-b-2 border-plum px-5 pt-14 pb-6"
            style={{ backgroundColor: color.bg }}
          >
            <div className="relative flex items-center justify-between">
              <IconButton onClick={onClose} aria-label="Chiudi">
                <svg width="20" height="20" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
                  <path d="M4.5 4.5l9 9M13.5 4.5l-9 9" />
                </svg>
              </IconButton>
              {weekNumber != null && (
                <p className="font-mono text-xs font-bold uppercase tracking-[0.14em]">
                  Settimana {weekNumber}
                </p>
              )}
              <MuteButton variant="blob" />
            </div>

            {/* Big number + illustration. Screen readers get one plain sentence. */}
            <p className="sr-only">
              Esercizio {exerciseIndex + 1} di {totalExercises}
            </p>
            <div className="relative flex items-end justify-between gap-3" aria-hidden="true">
              <div className="flex min-w-0 items-end gap-2">
                <span
                  className={`relative font-poster leading-[0.9] text-poster-red ${
                    exerciseIndex + 1 >= 10 ? 'text-[96px]' : 'text-[120px]'
                  }`}
                  style={{
                    WebkitTextStroke: '2.5px #3b1746',
                    textShadow: '5px 5px 0 #3b1746',
                  }}
                >
                  <Sunburst
                    ray={color.ray}
                    base={color.bg}
                    size={700}
                    center={{ left: '50%', top: '50%' }}
                  />
                  {exerciseIndex + 1}
                </span>
                <span className="pb-2 font-mono text-sm font-bold">
                  di {totalExercises}
                </span>
              </div>
              <div className="flex size-24 shrink-0 items-center justify-center rounded-3xl border-2 border-plum bg-paper shadow-[4px_4px_0_#3b1746]">
                <ExerciseIllustration name={exercise.illustration} size={72} />
              </div>
            </div>

            <div className="relative flex flex-col items-start gap-2">
              <PosterPill variant="ink">
                {equipmentLabel}
                {hasWeight && <> · {exercise.weight}</>}
              </PosterPill>
              <h2
                className="font-poster text-[30px] leading-[1.1] [text-wrap:pretty]"
                style={{ overflowWrap: 'anywhere' }}
              >
                {exercise.name}
              </h2>
            </div>
          </header>

          <div className="px-5 py-6">
            {/* Sets / reps (/ time) — tap a tile to edit it */}
            <div className="grid grid-cols-2 gap-3.5">
              <StatTile
                value={sets}
                label="Serie"
                bg="#E98A5C"
                rotate="-rotate-2"
                active={editing === 'sets'}
                onClick={() => toggleEditing('sets')}
              />
              <StatTile
                value={reps}
                label="Rep"
                bg="#9FD8D0"
                rotate="rotate-2"
                active={editing === 'reps'}
                onClick={() => toggleEditing('reps')}
              />
              {exercise.type !== 'reps' && (
                <StatTile
                  value={time}
                  suffix="s"
                  label="Tempo"
                  bg="#F5D77A"
                  className="col-span-2"
                  active={editing === 'time'}
                  onClick={() => toggleEditing('time')}
                />
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

            {/* Execution + notes */}
            <div className="mt-6 flex items-center justify-between">
              <h3 className="font-poster text-[22px] leading-tight">Esecuzione</h3>
              <ExerciseNotesButton exerciseId={exercise.id} onClick={openNotes} />
            </div>
            {descBody && (
              <p className="mt-3 text-base leading-[1.55]">{descBody}</p>
            )}

            {/* Ref link as dashed chip */}
            {refHref && refLabel && (
              <a
                href={refHref}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex min-h-11 max-w-full items-center gap-2 rounded-full border-[1.5px] border-dashed border-plum px-3.5 py-2 text-xs font-bold text-plum"
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
              <p className="mt-4 rounded-[18px] border-2 border-plum bg-pastel-butter px-3.5 py-3 text-sm leading-normal">
                {exercise.notes}
              </p>
            )}

            {/* Dopo questo */}
            {upcomingExercises.length > 0 && (
              <section className="mt-8" aria-label="Dopo questo">
                <h3 className="font-poster text-[22px] leading-tight">Dopo questo</h3>
                <ul className="-mx-5 mt-3 flex gap-3 overflow-x-auto px-5 pb-1.5 [scrollbar-width:none]">
                  {upcomingExercises.map((ex, i) => (
                    <UpcomingCard
                      key={ex.id}
                      exercise={ex}
                      number={exerciseIndex + 2 + i}
                    />
                  ))}
                </ul>
              </section>
            )}
          </div>
        </div>

        {/* Fixed bottom action bar */}
        <div className="flex shrink-0 gap-3 border-t-2 border-plum bg-cream px-5 pt-3.5 pb-[calc(14px+env(safe-area-inset-bottom,0px))]">
          <Button variant="ghost" size="lg" onClick={openSkipConfirm} className="h-[60px] flex-1">
            Salta
          </Button>
          <Button size="lg" onClick={handleStart} className="relative h-[60px] flex-[2] overflow-hidden">
            {autoActive && (
              <motion.div
                aria-hidden="true"
                className="absolute inset-y-0 right-0 z-0 pointer-events-none bg-plum/35"
                style={{ width: fillWidth }}
              />
            )}
            <span className="relative z-10 inline-flex items-center gap-2">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <polygon points="5 3 19 12 5 21" />
              </svg>
              {autoActive ? `Inizia tra ${formatCountdown(remainingSecs)}` : 'Inizia'}
            </span>
          </Button>
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

function StatTile({ value, suffix, label, bg, rotate = '', className = '', active, onClick }: {
  value: number
  suffix?: string
  label: string
  bg: string
  rotate?: string
  className?: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      aria-label={`${label}: ${value}${suffix ?? ''}. Tocca per modificare`}
      className={`flex min-h-11 cursor-pointer items-baseline gap-2 rounded-[20px] border-2 border-plum px-4 py-3 text-left text-plum shadow-[4px_4px_0_#3b1746] focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-violet ${rotate} ${
        active ? 'outline-3 outline-offset-2 outline-plum' : ''
      } ${className}`}
      style={{ backgroundColor: bg }}
    >
      <span className="font-poster text-[44px] leading-none" aria-hidden="true">
        {value}{suffix}
      </span>
      <span className="font-mono text-xs font-bold uppercase" aria-hidden="true">{label}</span>
    </button>
  )
}

function UpcomingCard({ exercise, number }: { exercise: Exercise; number: number }) {
  return (
    <li
      className="flex min-h-[140px] w-[150px] flex-none flex-col justify-between rounded-[20px] border-2 border-plum p-3 text-plum shadow-[3px_3px_0_#3b1746]"
      style={{ backgroundColor: getExerciseColor(number - 1).bg }}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="font-poster text-[28px] leading-none">{number}</span>
        <PosterPill>{getExerciseVolume(exercise)}</PosterPill>
      </div>
      <p className="text-sm font-extrabold leading-tight">{exercise.name}</p>
    </li>
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
