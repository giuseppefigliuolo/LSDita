import { useState, useCallback, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Exercise } from '../../types'
import Button from '../ui/Button'
import Badge from '../ui/Badge'
import ExerciseIllustration from '../illustrations/ExerciseIllustration'

interface ExercisePreviewProps {
  exercise: Exercise
  exerciseIndex: number
  totalExercises: number
  onStart: (overrides: { sets: number; repsPerSet: number; hangTime: number }) => void
  onSkip: () => void
}

export default function ExercisePreview({ exercise, exerciseIndex, totalExercises, onStart, onSkip }: ExercisePreviewProps) {
  const [sets, setSets] = useState(exercise.sets)
  const [reps, setReps] = useState(exercise.repsPerSet)
  const [time, setTime] = useState(exercise.hangTime)
  const [editing, setEditing] = useState<'sets' | 'reps' | 'time' | null>(null)

  const equipmentLabels: Record<string, string> = {
    hangboard: '🪨 Hangboard',
    wooden_balls: '⚪ Sfere legno',
    pull_up_bar: '🏋️ Sbarra',
    dumbbells: '💪 Manubri',
    fitness_band: '🔵 Elastico',
    yoga_mat: '🧘 Tappetino',
    bodyweight: '🤸 Corpo libero',
  }

  function handleStart() {
    setEditing(null)
    onStart({ sets, repsPerSet: reps, hangTime: time })
  }

  return (
    <motion.div
      className="flex flex-col items-center text-center px-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <Badge variant="accent" className="mb-4">
        Esercizio {exerciseIndex + 1} di {totalExercises}
      </Badge>

      <div className="w-24 h-24 rounded-2xl bg-surface-elevated flex items-center justify-center mb-4">
        <ExerciseIllustration name={exercise.illustration} size={72} />
      </div>

      <h2 className="text-xl font-bold text-text mb-2">{exercise.name}</h2>
      <p className="text-sm text-text-secondary mb-4 max-w-xs">{exercise.description}</p>

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

      <div className="grid grid-cols-3 gap-3 w-full max-w-xs mb-2">
        <ParamBox
          value={sets}
          label="Serie"
          color="text-primary"
          ringColor="ring-primary/40"
          active={editing === 'sets'}
          onClick={() => setEditing(editing === 'sets' ? null : 'sets')}
        />
        <ParamBox
          value={reps}
          label="Rep"
          color="text-secondary"
          ringColor="ring-secondary/40"
          active={editing === 'reps'}
          onClick={() => setEditing(editing === 'reps' ? null : 'reps')}
        />
        <ParamBox
          value={time}
          suffix="s"
          label="Tempo"
          color="text-accent"
          ringColor="ring-accent/40"
          active={editing === 'time'}
          onClick={() => setEditing(editing === 'time' ? null : 'time')}
        />
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
          💡 {exercise.notes}
        </p>
      )}

      <div className={`flex gap-3 w-full max-w-xs ${editing ? 'mt-2' : 'mt-2'}`}>
        <Button variant="ghost" size="md" onClick={onSkip} className="shrink-0">
          Salta
        </Button>
        <Button variant="primary" size="lg" fullWidth onClick={handleStart}>
          Inizia
        </Button>
      </div>
    </motion.div>
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
      className={`bg-surface rounded-xl p-3 text-center transition-all ${active ? `ring-2 ${ringColor} bg-surface-elevated` : 'hover:bg-surface-elevated'
        }`}
      whileTap={{ scale: 0.95 }}
    >
      <p className={`text-lg font-bold font-timer ${color}`}>
        {value}{suffix}
      </p>
      <p className="text-[10px] uppercase tracking-wider text-text-muted">{label}</p>
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
                        className={`text-[8px] font-timer mb-1 select-none ${
                          isActive ? 'text-accent/80' : 'text-text-muted/60'
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
