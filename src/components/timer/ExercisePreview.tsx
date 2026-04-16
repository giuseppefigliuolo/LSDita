import { useState, useCallback, useRef, useEffect } from 'react'
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useMotionValueEvent,
  useTransform,
  animate as motionAnimate,
  type PanInfo,
} from 'framer-motion'
import type { Exercise } from '../../types'
import Button from '../ui/Button'
import ExerciseDescription from '../ui/ExerciseDescription'
import Badge from '../ui/Badge'
import ExerciseIllustration from '../illustrations/ExerciseIllustration'
import ExerciseNotesModal from './ExerciseNotesModal'
import { useWorkoutStore } from '../../store/useWorkoutStore'
import { INK, SURFACE, SURFACE_ELEVATED, RADIUS, SHADOW } from '../../styles/tokens'

const DISMISS_THRESHOLD = 100
const VELOCITY_THRESHOLD = 400

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
  onStart: (overrides: { sets: number; repsPerSet: number; hangTime: number }) => void
  onSkip: () => void
  autoStartSeconds?: number
}

export default function ExercisePreview({ exercise, exerciseIndex, totalExercises, onStart, onSkip, autoStartSeconds }: ExercisePreviewProps) {
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

  const dragY = useMotionValue(0)
  const cardOpacity = useTransform(dragY, [0, DISMISS_THRESHOLD * 1.5], [1, 0.2])
  const cardScale = useTransform(dragY, [0, DISMISS_THRESHOLD * 2], [1, 0.9])

  const handleDragStart = useCallback(() => {
    cancelAuto()
  }, [cancelAuto])

  const handleDragEnd = useCallback((_: unknown, info: PanInfo) => {
    const shouldDismiss =
      info.offset.y > DISMISS_THRESHOLD || info.velocity.y > VELOCITY_THRESHOLD

    if (shouldDismiss) {
      motionAnimate(dragY, 0, { type: 'spring', stiffness: 400, damping: 30 })
      setShowSkipConfirm(true)
    } else {
      motionAnimate(dragY, 0, { type: 'spring', stiffness: 400, damping: 30 })
    }
  }, [dragY])

  const equipmentLabels: Record<string, string> = {
    hangboard: 'Hangboard',
    wooden_balls: 'Sfere legno',
    pull_up_bar: 'Sbarra',
    dumbbells: 'Manubri',
    fitness_band: 'Elastico',
    yoga_mat: 'Tappetino',
    bodyweight: 'Corpo libero',
  }

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

  return (
    <>
      <motion.div
        className="relative flex flex-col items-center text-center px-6 py-5 mx-4 border-[3px] border-[#3A1248]"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        style={{
          y: dragY,
          opacity: cardOpacity,
          scale: cardScale,
          backgroundColor: SURFACE_ELEVATED,
          borderRadius: RADIUS.card,
          boxShadow: SHADOW.lg,
        }}
        drag="y"
        dragDirectionLock
        dragConstraints={{ top: 0 }}
        dragElastic={{ top: 0.05, bottom: 0.6 }}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div
          className="w-12 h-1.5 mb-4 shrink-0 cursor-grab active:cursor-grabbing border-[1.5px] border-[#3A1248]"
          style={{
            borderRadius: RADIUS.btnSm,
            backgroundColor: SURFACE,
            boxShadow: SHADOW.xxs,
          }}
        />

        <button
          type="button"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={openNotes}
          aria-label={notesCount > 0 ? `Visualizza ${notesCount} note` : 'Aggiungi nota'}
          className="absolute top-3 right-3 w-10 h-10 flex items-center justify-center border-[2.5px] border-[#3A1248] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all"
          style={{
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
              className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1 flex items-center justify-center text-[10px] font-bold border-[2px] border-[#3A1248]"
              style={{
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

        <Badge variant="accent" className="mb-4">
          Esercizio {exerciseIndex + 1} di {totalExercises}
        </Badge>

        <div
          className="w-24 h-24 bg-surface-elevated flex items-center justify-center mb-4 border-[2.5px] border-[#3A1248]"
          style={{
            borderRadius: RADIUS.blob,
            boxShadow: SHADOW.sm,
          }}
        >
          <ExerciseIllustration name={exercise.illustration} size={72} />
        </div>

        <h2 className="text-xl font-bold text-text mb-2">{exercise.name}</h2>
        <p className="text-sm text-text-secondary mb-4 max-w-xs">
          <ExerciseDescription text={exercise.description} />
        </p>

        <div className="flex flex-wrap justify-center gap-2 mb-4">
          <span className="text-xs px-3 py-1 rounded-full bg-surface-elevated text-text-muted">
            {equipmentLabels[exercise.equipment] ?? exercise.equipment}
          </span>
          {exercise.weight && exercise.weight !== 'corpo libero' && (
            <span className="text-xs px-3 py-1 rounded-full bg-violet-soft text-violet">
              {exercise.weight}
            </span>
          )}
        </div>

        <div className={`grid ${exercise.type === 'reps' ? 'grid-cols-2' : 'grid-cols-3'} gap-3 w-full max-w-xs mb-2`}>
          <ParamBox
            value={sets}
            label="Serie"
            color="text-primary"
            ringColor="ring-primary/40"
            active={editing === 'sets'}
            onClick={() => toggleEditing('sets')}
          />
          <ParamBox
            value={reps}
            label="Rep"
            color="text-secondary"
            ringColor="ring-secondary/40"
            active={editing === 'reps'}
            onClick={() => toggleEditing('reps')}
          />
          {exercise.type !== 'reps' && (
            <ParamBox
              value={time}
              suffix="s"
              label="Tempo"
              color="text-accent"
              ringColor="ring-accent/40"
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

        {!editing && exercise.notes && (
          <p className="text-xs text-text-muted italic mb-4 max-w-xs mt-2">
            {exercise.notes}
          </p>
        )}

        <div className={`flex gap-3 w-full max-w-xs ${editing ? 'mt-2' : 'mt-2'}`}>
          <Button variant="ghost" size="md" onClick={openSkipConfirm} className="shrink-0">
            Salta
          </Button>
          {autoActive ? (
            <motion.button
              onClick={handleStart}
              className="relative overflow-hidden inline-flex items-center justify-center gap-2 font-bold border-[3px] px-6 py-3.5 text-lg w-full cursor-pointer"
              style={{
                backgroundColor: '#D4541A',
                color: '#FFFBF0',
                borderColor: INK,
                borderRadius: RADIUS.btnLg,
                boxShadow: `4px 4px 0px ${INK}, inset 0 2px 0 rgba(255,255,255,0.4)`,
              }}
              whileTap={{
                x: 4,
                y: 4,
                boxShadow: SHADOW.pressed,
              }}
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
            <Button variant="primary" size="lg" fullWidth onClick={handleStart}>
              Inizia
            </Button>
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

function ParamBox({ value, suffix, label, color, ringColor, active, onClick }: {
  value: number
  suffix?: string
  label: string
  color: string
  ringColor: string
  active: boolean
  onClick: () => void
}) {
  return (
    <motion.button
      onClick={onClick}
      className={`bg-surface border-[2px] border-[#3A1248] p-3 text-center transition-all ${active ? `ring-2 ${ringColor} bg-surface-elevated` : 'hover:bg-surface-elevated'
        }`}
      style={{ borderRadius: RADIUS.btnSm, boxShadow: SHADOW.xs }}
      whileTap={{ scale: 0.95 }}
    >
      <p className={`text-lg font-bold font-timer ${color}`}>
        {value}{suffix}
      </p>
      <p className="text-[11px] uppercase tracking-wider text-text-muted">{label}</p>
    </motion.button>
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
      className="w-full max-w-xs overflow-hidden"
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
      className="w-full max-w-xs overflow-hidden"
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
                        className={`text-[8px] font-timer mb-1 select-none ${isActive ? 'text-accent/80' : 'text-text-muted/60'
                          }`}
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
