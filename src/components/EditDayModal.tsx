import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import {
  motion,
  useMotionValue,
  useTransform,
  animate as motionAnimate,
} from 'framer-motion'
import Button from './ui/Button'
import ExerciseIllustration from './illustrations/ExerciseIllustration'
import type {
  Equipment,
  Exercise,
  ExerciseType,
  GripType,
  ProgramId,
  TrainingDay,
} from '../types'
import { INK, SURFACE, SURFACE_ELEVATED, RADIUS, SHADOW } from '../styles/tokens'

type Tone = 'primary' | 'secondary' | 'accent' | 'violet' | 'green' | 'coral'

const TONES: Record<Tone, { soft: string; label: string; ring: string }> = {
  primary:   { soft: '#FDEEE4', label: '#A63E10', ring: '#D4541A' },
  secondary: { soft: '#E2F6F6', label: '#0E7E7E', ring: '#17A8A8' },
  accent:    { soft: '#FBF0CC', label: '#8A6D10', ring: '#E8B820' },
  violet:    { soft: '#F2EAF8', label: '#5A2878', ring: '#7B3A9E' },
  green:     { soft: '#EAF3DB', label: '#3F6E15', ring: '#5A9A1E' },
  coral:     { soft: '#FCE4DF', label: '#A8341E', ring: '#E84830' },
}

const CARD_TONES: Tone[] = ['primary', 'secondary', 'accent', 'violet', 'green', 'coral']
import { dayOverrideKey, useSettingsStore } from '../store/useSettingsStore'
import { getOriginalDay } from '../utils/getProgram'

const EQUIPMENT_OPTIONS: { value: Equipment; label: string }[] = [
  { value: 'hangboard', label: 'Hangboard' },
  { value: 'wooden_balls', label: 'Sfere legno' },
  { value: 'pull_up_bar', label: 'Sbarra' },
  { value: 'dumbbells', label: 'Manubri' },
  { value: 'fitness_band', label: 'Elastico' },
  { value: 'yoga_mat', label: 'Tappetino' },
  { value: 'bodyweight', label: 'Corpo libero' },
]

const TYPE_OPTIONS: { value: ExerciseType; label: string }[] = [
  { value: 'timed_hang', label: 'Hang a tempo' },
  { value: 'timed_hold', label: 'Tenuta a tempo' },
  { value: 'repeaters', label: 'Repeaters' },
  { value: 'reps', label: 'Ripetizioni' },
  { value: 'timed_stretch', label: 'Stretch a tempo' },
]

const GRIP_OPTIONS: { value: GripType | ''; label: string }[] = [
  { value: '', label: '— Nessuna —' },
  { value: 'half_crimp', label: 'Semi-arcuata' },
  { value: 'open_hand', label: 'Mano aperta' },
  { value: 'full_crimp', label: 'Arcuata piena' },
  { value: 'three_finger_drag', label: 'Tre dita' },
  { value: 'pinch', label: 'Pinch' },
  { value: 'sloper', label: 'Sloper' },
  { value: 'mixed', label: 'Mista' },
]

const ILLUSTRATION_OPTIONS = [
  'max-hang', 'max-hang-open', 'dead-hang-balls', 'leg-raises',
  'weighted-pullup', 'lockoff', 'hammer-curl', 'scapular-pull',
  'hollow-body', 'repeaters', 'repeaters-balls', 'negative-pullup',
  'band-shoulder', 'forearm-stretch', 'pigeon-pose', 'frog-stretch',
  'shoulder-dislocates', 'thoracic-rotation', 'cat-cow', 'hamstring-stretch',
  'default',
]

interface Props {
  day: TrainingDay
  weekNumber: number
  programId: ProgramId
  onClose: () => void
}

export default function EditDayModal({ day, weekNumber, programId, onClose }: Props) {
  const [edited, setEdited] = useState<TrainingDay>(() => cloneDay(day))
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const setDayOverride = useSettingsStore((s) => s.setDayOverride)
  const clearDayOverride = useSettingsStore((s) => s.clearDayOverride)
  const hasOverride = useSettingsStore(
    (s) => dayOverrideKey(programId, weekNumber, day.dayOfWeek) in s.dayOverrides
  )

  const dragY = useMotionValue(window.innerHeight)
  const sheetScale = useTransform(dragY, [0, 300], [1, 0.95])
  const sheetOpacity = useTransform(dragY, [0, 300], [1, 0.4])
  const backdropOpacity = useTransform(dragY, [0, window.innerHeight], [1, 0])
  const handleRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    motionAnimate(dragY, 0, { type: 'spring', damping: 28, stiffness: 300 })
  }, [dragY])

  const dismiss = useCallback(() => {
    motionAnimate(dragY, window.innerHeight, {
      duration: 0.25,
      ease: 'easeIn',
      onComplete: onClose,
    })
  }, [dragY, onClose])

  useEffect(() => {
    const el = handleRef.current
    if (!el) return

    let startY = 0
    let lastY = 0
    let lastTime = 0
    let velY = 0
    let dragging = false
    let mouseDown = false

    const begin = (y: number) => {
      startY = y
      lastY = y
      lastTime = performance.now()
      velY = 0
      dragging = false
    }

    const move = (y: number, prevent: () => void) => {
      const delta = y - startY
      const now = performance.now()
      const dt = now - lastTime
      if (dt > 0) velY = ((y - lastY) / dt) * 1000
      lastY = y
      lastTime = now

      if (!dragging) {
        if (delta > 4) dragging = true
        else return
      }
      prevent()
      dragY.set(Math.max(0, delta))
    }

    const finish = () => {
      if (!dragging) return
      dragging = false
      const current = dragY.get()
      if (current > 100 || velY > 400) {
        motionAnimate(dragY, window.innerHeight, {
          duration: 0.25,
          ease: 'easeIn',
          onComplete: onClose,
        })
      } else {
        motionAnimate(dragY, 0, { type: 'spring', stiffness: 400, damping: 30 })
      }
    }

    const onTouchStart = (e: TouchEvent) => begin(e.touches[0].clientY)
    const onTouchMove = (e: TouchEvent) =>
      move(e.touches[0].clientY, () => e.preventDefault())
    const onTouchEnd = () => finish()
    const onPtrMove = (e: PointerEvent) => {
      if (!mouseDown) return
      move(e.clientY, () => e.preventDefault())
    }
    const onPtrUp = () => {
      mouseDown = false
      finish()
      document.removeEventListener('pointermove', onPtrMove)
      document.removeEventListener('pointerup', onPtrUp)
    }
    const onPtrDown = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      mouseDown = true
      begin(e.clientY)
      document.addEventListener('pointermove', onPtrMove)
      document.addEventListener('pointerup', onPtrUp)
    }

    el.addEventListener('touchstart', onTouchStart, { passive: true })
    el.addEventListener('touchmove', onTouchMove, { passive: false })
    el.addEventListener('touchend', onTouchEnd)
    el.addEventListener('pointerdown', onPtrDown)
    return () => {
      el.removeEventListener('touchstart', onTouchStart)
      el.removeEventListener('touchmove', onTouchMove)
      el.removeEventListener('touchend', onTouchEnd)
      el.removeEventListener('pointerdown', onPtrDown)
      document.removeEventListener('pointermove', onPtrMove)
      document.removeEventListener('pointerup', onPtrUp)
    }
  }, [dragY, onClose])

  const updateExercise = (index: number, patch: Partial<Exercise>) => {
    setEdited((d) => ({
      ...d,
      exercises: d.exercises.map((ex, i) => (i === index ? { ...ex, ...patch } : ex)),
    }))
  }

  const moveExercise = (index: number, direction: -1 | 1) => {
    setEdited((d) => {
      const next = [...d.exercises]
      const target = index + direction
      if (target < 0 || target >= next.length) return d
      ;[next[index], next[target]] = [next[target], next[index]]
      return { ...d, exercises: next }
    })
  }

  const handleSave = () => {
    setDayOverride(programId, weekNumber, day.dayOfWeek, edited)
    dismiss()
  }

  const handleRestore = () => {
    const original = getOriginalDay(programId, weekNumber, day.dayOfWeek)
    clearDayOverride(programId, weekNumber, day.dayOfWeek)
    if (original) setEdited(cloneDay(original))
    dismiss()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <motion.div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        style={{ opacity: backdropOpacity }}
        onClick={dismiss}
      />
      <motion.div
        className="relative w-full max-w-lg max-h-[90dvh] overflow-hidden border-[3px] border-b-0 border-[#3A1248]"
        style={{
          borderRadius: RADIUS.sheetTop,
          boxShadow: `0 -4px 0px ${INK}, inset 0 2px 0 rgba(255,255,255,0.55)`,
          y: dragY,
          scale: sheetScale,
          opacity: sheetOpacity,
        }}
      >
        <div className="bg-surface overflow-y-auto overscroll-contain max-h-[90dvh]">
          <div
            ref={handleRef}
            className="sticky top-0 z-10 flex justify-center pt-3 pb-3 bg-surface cursor-grab active:cursor-grabbing touch-none"
            style={{ touchAction: 'none' }}
          >
            <div
              className="w-12 h-1.5 border-[1.5px] border-[#3A1248]"
              style={{
                borderRadius: RADIUS.btnSm,
                backgroundColor: SURFACE,
                boxShadow: SHADOW.xxs,
              }}
            />
          </div>

          <div className="px-5 pb-8">
            <h2
              className="text-lg font-bold text-text text-center mb-1"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Modifica giornata
            </h2>
            <p className="text-xs text-text-secondary text-center mb-5">
              Settimana {weekNumber} — {day.dayOfWeek}
            </p>

            <FieldBlock label="Titolo" tone="primary">
              <TextInput
                tone="primary"
                value={edited.title}
                onChange={(v) => setEdited((d) => ({ ...d, title: v }))}
              />
            </FieldBlock>

            <FieldBlock label="Descrizione" tone="violet">
              <TextArea
                tone="violet"
                value={edited.description}
                onChange={(v) => setEdited((d) => ({ ...d, description: v }))}
              />
            </FieldBlock>

            <p className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-2 mt-5">
              Esercizi ({edited.exercises.length})
            </p>

            <div className="space-y-3 mb-6">
              {edited.exercises.map((ex, index) => (
                <ExerciseEditCard
                  key={ex.id}
                  exercise={ex}
                  index={index}
                  total={edited.exercises.length}
                  tone={CARD_TONES[index % CARD_TONES.length]}
                  expanded={expandedId === ex.id}
                  onToggle={() =>
                    setExpandedId((id) => (id === ex.id ? null : ex.id))
                  }
                  onMoveUp={() => moveExercise(index, -1)}
                  onMoveDown={() => moveExercise(index, 1)}
                  onChange={(patch) => updateExercise(index, patch)}
                />
              ))}
            </div>

            <div className="flex flex-col gap-2">
              <Button variant="primary" size="lg" fullWidth onClick={handleSave}>
                Salva modifiche
              </Button>
              {hasOverride && (
                <Button variant="danger" size="md" fullWidth onClick={handleRestore}>
                  Ripristina originale
                </Button>
              )}
              <Button variant="ghost" size="md" fullWidth onClick={dismiss}>
                Annulla
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

function ExerciseEditCard({
  exercise,
  index,
  total,
  tone,
  expanded,
  onToggle,
  onMoveUp,
  onMoveDown,
  onChange,
}: {
  exercise: Exercise
  index: number
  total: number
  tone: Tone
  expanded: boolean
  onToggle: () => void
  onMoveUp: () => void
  onMoveDown: () => void
  onChange: (patch: Partial<Exercise>) => void
}) {
  const gripValue = exercise.grip ?? ''
  const t = TONES[tone]

  return (
    <div
      className="border-[3px] border-[#3A1248] overflow-hidden"
      style={{
        backgroundColor: t.soft,
        borderRadius: RADIUS.card,
        boxShadow: SHADOW.md,
      }}
    >
      <div className="flex items-stretch">
        <div
          className="flex flex-col justify-center gap-1 p-2 border-r-[2px] border-[#3A1248]"
          style={{ backgroundColor: t.ring + '33' }}
        >
          <ArrowButton disabled={index === 0} onClick={onMoveUp} direction="up" />
          <ArrowButton
            disabled={index === total - 1}
            onClick={onMoveDown}
            direction="down"
          />
        </div>
        <button
          onClick={onToggle}
          className="flex-1 flex items-center gap-3 p-3 text-left cursor-pointer"
        >
          <div
            className="shrink-0 flex items-center justify-center w-8 h-8 text-sm font-bold font-timer border-[2px] border-[#3A1248]"
            style={{
              backgroundColor: t.ring,
              color: '#FFFBF0',
              borderRadius: RADIUS.pill,
              boxShadow: SHADOW.xs,
            }}
          >
            {index + 1}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-text truncate">{exercise.name}</p>
            <p className="text-[11px] truncate" style={{ color: t.label }}>
              {exercise.sets} set · {exercise.hangTime}s
            </p>
          </div>
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke={INK}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
      </div>

      {expanded && (
        <div
          className="border-t-[2px] border-[#3A1248] p-4 space-y-3"
          style={{ backgroundColor: SURFACE_ELEVATED }}
        >
          <FieldBlock label="Nome" tone="primary">
            <TextInput
              tone="primary"
              value={exercise.name}
              onChange={(v) => onChange({ name: v })}
            />
          </FieldBlock>

          <FieldBlock label="Descrizione" tone="violet">
            <TextArea
              tone="violet"
              value={exercise.description}
              onChange={(v) => onChange({ description: v })}
            />
          </FieldBlock>

          <div className="grid grid-cols-2 gap-3">
            <FieldBlock label="Attrezzo" tone="secondary">
              <SelectInput
                tone="secondary"
                value={exercise.equipment}
                onChange={(v) => onChange({ equipment: v as Equipment })}
                options={EQUIPMENT_OPTIONS}
              />
            </FieldBlock>
            <FieldBlock label="Tipo" tone="secondary">
              <SelectInput
                tone="secondary"
                value={exercise.type}
                onChange={(v) => onChange({ type: v as ExerciseType })}
                options={TYPE_OPTIONS}
              />
            </FieldBlock>
            <FieldBlock label="Presa" tone="coral">
              <SelectInput
                tone="coral"
                value={gripValue}
                onChange={(v) =>
                  onChange({ grip: v === '' ? undefined : (v as GripType) })
                }
                options={GRIP_OPTIONS}
              />
            </FieldBlock>
            <FieldBlock label="Illustrazione" tone="green">
              <IllustrationPicker
                tone="green"
                value={exercise.illustration}
                onChange={(v) => onChange({ illustration: v })}
              />
            </FieldBlock>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <FieldBlock label="Serie" tone="accent">
              <NumberInput
                tone="accent"
                value={exercise.sets}
                onChange={(v) => onChange({ sets: v })}
              />
            </FieldBlock>
            <FieldBlock label="Ripetizioni" tone="accent">
              <NumberInput
                tone="accent"
                value={exercise.repsPerSet}
                onChange={(v) => onChange({ repsPerSet: v })}
              />
            </FieldBlock>
            <FieldBlock label="Tempo (s)" tone="primary">
              <NumberInput
                tone="primary"
                value={exercise.hangTime}
                onChange={(v) => onChange({ hangTime: v })}
              />
            </FieldBlock>
            <FieldBlock label="Recupero rep (s)" tone="secondary">
              <NumberInput
                tone="secondary"
                value={exercise.restBetweenReps}
                onChange={(v) => onChange({ restBetweenReps: v })}
              />
            </FieldBlock>
            <FieldBlock label="Recupero set (s)" tone="secondary">
              <NumberInput
                tone="secondary"
                value={exercise.restBetweenSets}
                onChange={(v) => onChange({ restBetweenSets: v })}
              />
            </FieldBlock>
            <FieldBlock label="Peso" tone="violet">
              <TextInput
                tone="violet"
                value={exercise.weight ?? ''}
                onChange={(v) =>
                  onChange({ weight: v.trim() === '' ? undefined : v })
                }
                placeholder="es. 8kg, corpo libero"
              />
            </FieldBlock>
          </div>

          <FieldBlock label="Note" tone="accent">
            <TextArea
              tone="accent"
              value={exercise.notes ?? ''}
              onChange={(v) =>
                onChange({ notes: v.trim() === '' ? undefined : v })
              }
            />
          </FieldBlock>
        </div>
      )}
    </div>
  )
}

function ArrowButton({
  direction,
  onClick,
  disabled,
}: {
  direction: 'up' | 'down'
  onClick: () => void
  disabled: boolean
}) {
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      className="flex items-center justify-center w-8 h-8 border-[2px] border-[#3A1248] cursor-pointer"
      style={{
        backgroundColor: SURFACE_ELEVATED,
        borderRadius: RADIUS.btnSm,
        boxShadow: disabled ? 'none' : SHADOW.xs,
        opacity: disabled ? 0.3 : 1,
      }}
      whileTap={disabled ? {} : { x: 1, y: 1, boxShadow: SHADOW.pressed }}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={INK} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        {direction === 'up' ? (
          <polyline points="18 15 12 9 6 15" />
        ) : (
          <polyline points="6 9 12 15 18 9" />
        )}
      </svg>
    </motion.button>
  )
}

function FieldBlock({
  label,
  tone = 'primary',
  children,
}: {
  label: string
  tone?: Tone
  children: React.ReactNode
}) {
  return (
    <label className="block mb-3 last:mb-0">
      <span
        className="text-[11px] font-bold uppercase tracking-wider mb-1 block"
        style={{ color: TONES[tone].label }}
      >
        {label}
      </span>
      {children}
    </label>
  )
}

const inputBase =
  'w-full border-[2px] border-[#3A1248] px-3 py-2 text-sm text-text outline-none focus:outline-none'

function inputStyle(tone: Tone) {
  return {
    backgroundColor: TONES[tone].soft,
    borderRadius: RADIUS.btnSm,
    boxShadow: SHADOW.xs,
  }
}

function TextInput({
  value,
  onChange,
  placeholder,
  tone = 'primary',
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  tone?: Tone
}) {
  return (
    <input
      type="text"
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className={inputBase}
      style={inputStyle(tone)}
    />
  )
}

function TextArea({
  value,
  onChange,
  tone = 'primary',
}: {
  value: string
  onChange: (v: string) => void
  tone?: Tone
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={3}
      className={`${inputBase} resize-none`}
      style={inputStyle(tone)}
    />
  )
}

function NumberInput({
  value,
  onChange,
  tone = 'accent',
}: {
  value: number
  onChange: (v: number) => void
  tone?: Tone
}) {
  return (
    <input
      type="number"
      inputMode="numeric"
      min={0}
      value={value}
      onChange={(e) => {
        const n = Number(e.target.value)
        onChange(Number.isFinite(n) ? Math.max(0, n) : 0)
      }}
      className={`${inputBase} font-timer font-bold`}
      style={{
        ...inputStyle(tone),
        color: TONES[tone].label,
      }}
    />
  )
}

function SelectInput({
  value,
  onChange,
  options,
  tone = 'secondary',
}: {
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
  tone?: Tone
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={inputBase}
      style={inputStyle(tone)}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  )
}

function IllustrationPicker({
  value,
  onChange,
  tone = 'green',
}: {
  value: string
  onChange: (v: string) => void
  tone?: Tone
}) {
  const [open, setOpen] = useState(false)
  const current = useMemo(
    () => (ILLUSTRATION_OPTIONS.includes(value) ? value : 'default'),
    [value]
  )
  const t = TONES[tone]
  return (
    <div>
      <motion.button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-2 border-[2px] border-[#3A1248] px-2 py-1.5 cursor-pointer"
        style={{
          backgroundColor: t.soft,
          borderRadius: RADIUS.btnSm,
          boxShadow: SHADOW.xs,
        }}
        whileTap={{ x: 1, y: 1, boxShadow: SHADOW.pressed }}
      >
        <ExerciseIllustration name={current} size={32} />
        <span
          className="text-xs flex-1 truncate text-left font-semibold"
          style={{ color: t.label }}
        >
          {current}
        </span>
      </motion.button>
      {open && (
        <div
          className="mt-2 grid grid-cols-4 gap-2 p-2 border-[2px] border-[#3A1248]"
          style={{
            backgroundColor: SURFACE,
            borderRadius: RADIUS.btnSm,
            boxShadow: SHADOW.xs,
          }}
        >
          {ILLUSTRATION_OPTIONS.map((name) => (
            <button
              key={name}
              type="button"
              onClick={() => {
                onChange(name)
                setOpen(false)
              }}
              className="flex items-center justify-center aspect-square border-[1.5px] border-[#3A1248] cursor-pointer"
              style={{
                backgroundColor: name === current ? t.ring : SURFACE_ELEVATED,
                borderRadius: RADIUS.btnSm,
              }}
            >
              <ExerciseIllustration name={name} size={32} />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function cloneDay(day: TrainingDay): TrainingDay {
  return {
    ...day,
    exercises: day.exercises.map((ex) => ({ ...ex })),
  }
}
