import { useState, useEffect, useRef, useCallback } from 'react'
import {
  motion,
  useMotionValue,
  useTransform,
  animate as motionAnimate,
} from 'framer-motion'
import Button from './ui/Button'
import type { AscentType, Climb, ClimbStyle } from '../types'
import { INK, SURFACE, RADIUS, SHADOW } from '../styles/tokens'
import { useLogbookStore } from '../store/useLogbookStore'
import {
  ASCENT_OPTIONS,
  FRENCH_GRADES,
  STYLE_OPTIONS,
} from '../utils/climbGrades'

type Tone = 'primary' | 'secondary' | 'accent' | 'violet' | 'green' | 'coral'

const TONES: Record<Tone, { soft: string; label: string; ring: string }> = {
  primary:   { soft: '#FDEEE4', label: '#A63E10', ring: '#D4541A' },
  secondary: { soft: '#E2F6F6', label: '#0E7E7E', ring: '#17A8A8' },
  accent:    { soft: '#FBF0CC', label: '#8A6D10', ring: '#E8B820' },
  violet:    { soft: '#F2EAF8', label: '#5A2878', ring: '#7B3A9E' },
  green:     { soft: '#EAF3DB', label: '#3F6E15', ring: '#5A9A1E' },
  coral:     { soft: '#FCE4DF', label: '#A8341E', ring: '#E84830' },
}

interface Props {
  initial?: Climb
  onClose: () => void
}

export default function AddClimbModal({ initial, onClose }: Props) {
  const addClimb = useLogbookStore((s) => s.addClimb)
  const updateClimb = useLogbookStore((s) => s.updateClimb)
  const deleteClimb = useLogbookStore((s) => s.deleteClimb)

  const today = new Date().toISOString().slice(0, 10)
  const [name, setName] = useState(initial?.name ?? '')
  const [grade, setGrade] = useState<string>(initial?.grade ?? '6a')
  const [style, setStyle] = useState<ClimbStyle>(initial?.style ?? 'sport')
  const [ascentType, setAscentType] = useState<AscentType>(
    initial?.ascentType ?? 'flash',
  )
  const [attempts, setAttempts] = useState<number>(initial?.attempts ?? 2)
  const [location, setLocation] = useState(initial?.location ?? '')
  const [date, setDate] = useState(initial?.date ?? today)
  const [rating, setRating] = useState<1 | 2 | 3 | 4 | 5>(initial?.rating ?? 4)
  const [notes, setNotes] = useState(initial?.notes ?? '')

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

  const canSave = name.trim() !== '' && location.trim() !== ''
  const needsAttempts = ascentType === 'redpoint' || ascentType === 'project'

  const handleSave = () => {
    if (!canSave) return
    const payload: Climb = {
      id: initial?.id ?? crypto.randomUUID(),
      date,
      name: name.trim(),
      grade,
      style,
      ascentType,
      attempts: needsAttempts ? Math.max(1, attempts) : undefined,
      location: location.trim(),
      rating,
      notes: notes.trim() === '' ? undefined : notes.trim(),
    }
    if (initial) updateClimb(initial.id, payload)
    else addClimb(payload)
    dismiss()
  }

  const handleDelete = () => {
    if (!initial) return
    deleteClimb(initial.id)
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
              {initial ? 'Modifica scalata' : 'Aggiungi scalata'}
            </h2>
            <p className="text-xs text-text-secondary text-center mb-5">
              Segna una via nel logbook
            </p>

            <FieldBlock label="Nome via" tone="primary">
              <TextInput
                tone="primary"
                value={name}
                onChange={setName}
                placeholder="es. Luna Nascente"
              />
            </FieldBlock>

            <div className="grid grid-cols-2 gap-3">
              <FieldBlock label="Grado" tone="accent">
                <SelectInput
                  tone="accent"
                  value={grade}
                  onChange={(v) => setGrade(v)}
                  options={FRENCH_GRADES.map((g) => ({ value: g, label: g }))}
                />
              </FieldBlock>
              <FieldBlock label="Stile" tone="secondary">
                <SelectInput
                  tone="secondary"
                  value={style}
                  onChange={(v) => setStyle(v as ClimbStyle)}
                  options={STYLE_OPTIONS}
                />
              </FieldBlock>
            </div>

            <FieldBlock label="Tipo di salita" tone="violet">
              <div className="grid grid-cols-4 gap-2">
                {ASCENT_OPTIONS.map((opt) => {
                  const active = ascentType === opt.value
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setAscentType(opt.value)}
                      className="border-[2px] border-[#3A1248] px-2 py-2 text-xs font-bold cursor-pointer"
                      style={{
                        backgroundColor: active ? TONES.violet.ring : TONES.violet.soft,
                        color: active ? '#FFFBF0' : TONES.violet.label,
                        borderRadius: RADIUS.btnSm,
                        boxShadow: active ? SHADOW.pressed : SHADOW.xs,
                      }}
                    >
                      {opt.label}
                    </button>
                  )
                })}
              </div>
            </FieldBlock>

            {needsAttempts && (
              <FieldBlock label="Tentativi" tone="coral">
                <NumberInput
                  tone="coral"
                  value={attempts}
                  onChange={(v) => setAttempts(Math.max(1, v))}
                />
              </FieldBlock>
            )}

            <FieldBlock label="Luogo" tone="green">
              <TextInput
                tone="green"
                value={location}
                onChange={setLocation}
                placeholder="es. Finale Ligure · Rocca di Corno"
              />
            </FieldBlock>

            <FieldBlock label="Data" tone="secondary">
              <DateInput
                tone="secondary"
                value={date}
                onChange={setDate}
              />
            </FieldBlock>

            <FieldBlock label="Rating" tone="accent">
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((n) => {
                  const active = n <= rating
                  return (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setRating(n as 1 | 2 | 3 | 4 | 5)}
                      className="w-10 h-10 flex items-center justify-center border-[2px] border-[#3A1248] cursor-pointer"
                      style={{
                        backgroundColor: active ? TONES.accent.ring : TONES.accent.soft,
                        borderRadius: RADIUS.btnSm,
                        boxShadow: SHADOW.xs,
                      }}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill={active ? '#3A1248' : 'none'} stroke="#3A1248" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                    </button>
                  )
                })}
              </div>
            </FieldBlock>

            <FieldBlock label="Note" tone="violet">
              <TextArea
                tone="violet"
                value={notes}
                onChange={setNotes}
              />
            </FieldBlock>

            <div className="flex flex-col gap-2 mt-4">
              <Button
                variant="primary"
                size="lg"
                fullWidth
                onClick={handleSave}
                disabled={!canSave}
              >
                {initial ? 'Salva modifiche' : 'Aggiungi al logbook'}
              </Button>
              {initial && (
                <Button variant="danger" size="md" fullWidth onClick={handleDelete}>
                  Elimina
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

function DateInput({
  value,
  onChange,
  tone = 'secondary',
}: {
  value: string
  onChange: (v: string) => void
  tone?: Tone
}) {
  return (
    <input
      type="date"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={inputBase}
      style={inputStyle(tone)}
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
