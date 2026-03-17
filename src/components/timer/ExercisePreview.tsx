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

  useEffect(() => {
    setSets(exercise.sets)
    setReps(exercise.repsPerSet)
    setTime(exercise.hangTime)
    setEditing(null)
  }, [exercise])

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
          <TimeDialEditor key="time" value={time} onChange={setTime} min={3} max={120} />
        )}
      </AnimatePresence>

      {!editing && exercise.notes && (
        <p className="text-xs text-text-muted italic mb-4 max-w-xs mt-2">
          💡 {exercise.notes}
        </p>
      )}

      <div className={`flex gap-3 w-full max-w-xs ${editing ? 'mt-2' : 'mt-2'}`}>
        <Button variant="ghost" size="md" onClick={onSkip} className="flex-shrink-0">
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
      className={`bg-surface rounded-xl p-3 text-center transition-all ${
        active ? `ring-2 ${ringColor} bg-surface-elevated` : 'hover:bg-surface-elevated'
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

function TimeDialEditor({ value, onChange, min, max }: {
  value: number
  onChange: (v: number) => void
  min: number
  max: number
}) {
  const dialRef = useRef<HTMLDivElement>(null)
  const isDragging = useRef(false)

  const angle = ((value - min) / (max - min)) * 270 - 135
  const radius = 56

  const updateFromAngle = useCallback((clientX: number, clientY: number) => {
    const el = dialRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    let a = Math.atan2(clientY - cy, clientX - cx) * (180 / Math.PI)
    a = a + 90
    if (a < -135) a += 360
    const clamped = Math.max(-135, Math.min(135, a))
    const normalized = (clamped + 135) / 270
    const newValue = Math.round(min + normalized * (max - min))
    onChange(Math.max(min, Math.min(max, newValue)))
  }, [min, max, onChange])

  useEffect(() => {
    const handleMove = (e: TouchEvent | MouseEvent) => {
      if (!isDragging.current) return
      e.preventDefault()
      const point = 'touches' in e ? e.touches[0] : e
      updateFromAngle(point.clientX, point.clientY)
    }
    const handleEnd = () => { isDragging.current = false }

    document.addEventListener('mousemove', handleMove)
    document.addEventListener('mouseup', handleEnd)
    document.addEventListener('touchmove', handleMove, { passive: false })
    document.addEventListener('touchend', handleEnd)

    return () => {
      document.removeEventListener('mousemove', handleMove)
      document.removeEventListener('mouseup', handleEnd)
      document.removeEventListener('touchmove', handleMove)
      document.removeEventListener('touchend', handleEnd)
    }
  }, [updateFromAngle])

  const knobX = radius * Math.cos((angle - 90) * (Math.PI / 180))
  const knobY = radius * Math.sin((angle - 90) * (Math.PI / 180))

  const arcPath = describeArc(0, 0, radius, -135 - 90, angle - 90)

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.2 }}
      className="w-full max-w-xs overflow-hidden"
    >
      <div className="flex flex-col items-center py-3">
        <div
          ref={dialRef}
          className="relative"
          style={{ width: 160, height: 160 }}
          onMouseDown={(e) => {
            isDragging.current = true
            updateFromAngle(e.clientX, e.clientY)
          }}
          onTouchStart={(e) => {
            isDragging.current = true
            updateFromAngle(e.touches[0].clientX, e.touches[0].clientY)
          }}
        >
          <svg width="160" height="160" viewBox="-80 -80 160 160" className="select-none">
            <circle r={radius} fill="none" stroke="#201F32" strokeWidth="6" />
            <path d={arcPath} fill="none" stroke="#FFD23F" strokeWidth="6" strokeLinecap="round" />

            {[...Array(13)].map((_, i) => {
              const tickAngle = (-135 + i * (270 / 12) - 90) * (Math.PI / 180)
              const inner = radius - 10
              const outer = radius - 5
              return (
                <line
                  key={i}
                  x1={inner * Math.cos(tickAngle)}
                  y1={inner * Math.sin(tickAngle)}
                  x2={outer * Math.cos(tickAngle)}
                  y2={outer * Math.sin(tickAngle)}
                  stroke="#55556A"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              )
            })}

            <circle
              cx={knobX}
              cy={knobY}
              r="10"
              fill="#FFD23F"
              className="cursor-grab active:cursor-grabbing"
              filter="drop-shadow(0 0 6px #FFD23F80)"
            />
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-3xl font-bold font-timer text-accent">{value}</span>
            <span className="text-[10px] uppercase tracking-wider text-text-muted">secondi</span>
          </div>
        </div>

        <div className="flex items-center gap-3 mt-1">
          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={() => onChange(Math.max(min, value - 1))}
            disabled={value <= min}
            className="w-9 h-9 rounded-full bg-accent-soft text-accent flex items-center justify-center text-sm font-bold disabled:opacity-30"
          >
            −
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={() => onChange(Math.min(max, value + 1))}
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

function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number): string {
  const start = polarToCartesian(cx, cy, r, endAngle)
  const end = polarToCartesian(cx, cy, r, startAngle)
  const largeArc = endAngle - startAngle <= 180 ? '0' : '1'
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 0 ${end.x} ${end.y}`
}

function polarToCartesian(cx: number, cy: number, r: number, angle: number) {
  const rad = angle * (Math.PI / 180)
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}
