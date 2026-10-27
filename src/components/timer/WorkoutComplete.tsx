import { useRef, useState, type KeyboardEvent } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import Button from '../ui/Button'
import IconButton from '../ui/IconButton'
import MuteButton from '../ui/MuteButton'
import Sunburst from '../ui/Sunburst'
import { ConfettiBurst } from '../ui/Confetti'
import { formatSeconds } from '../../utils/dateUtils'

type Feeling = 1 | 2 | 3 | 4 | 5

interface WorkoutCompleteProps {
  dayTitle: string
  weekNumber?: number
  exercisesCompleted: number
  exercisesTotal: number
  duration: number
  skippedExercises: string[]
  onSave: (note: string, feeling: Feeling) => void
  onClose: () => void
}

const feelings = [
  { value: 1 as const, emoji: '😵', label: 'Distrutto' },
  { value: 2 as const, emoji: '😓', label: 'Duro' },
  { value: 3 as const, emoji: '💪', label: 'Bene' },
  { value: 4 as const, emoji: '🔥', label: 'Forte' },
  { value: 5 as const, emoji: '🚀', label: 'Top' },
]

/** Mustard check stamp, same ink-stamp pop as the Home "Fatto" stamp. */
function CheckStamp() {
  const reduceMotion = useReducedMotion()
  return (
    <motion.span
      aria-hidden="true"
      className="flex size-28 rounded-full border-2 border-plum bg-mustard p-[5px] shadow-[4px_4px_0_var(--color-plum)]"
      initial={
        reduceMotion
          ? { opacity: 0, scale: 1, rotate: -8 }
          : { opacity: 1, scale: 0, rotate: -60 }
      }
      animate={{ opacity: 1, scale: 1, rotate: -8 }}
      transition={
        reduceMotion
          ? { duration: 0.2 }
          : { delay: 0.2, duration: 0.34, ease: [0.3, 1.6, 0.5, 1] }
      }
    >
      <span className="flex size-full items-center justify-center rounded-full border-2 border-dashed border-plum">
        <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </span>
    </motion.span>
  )
}

function StatTile({ value, label, bg, tilt }: { value: string | number; label: string; bg: string; tilt: string }) {
  return (
    <div
      className={`flex min-w-0 flex-col items-center gap-0.5 rounded-[18px] border-2 border-plum px-1.5 py-3 shadow-[3px_3px_0_var(--color-plum)] ${tilt}`}
      style={{ backgroundColor: bg }}
    >
      <p className="whitespace-nowrap font-poster text-[28px] leading-[1.15] tabular-nums">{value}</p>
      <p className="font-mono text-[10px] font-bold uppercase tracking-[0.1em]">{label}</p>
    </div>
  )
}

export default function WorkoutComplete({
  dayTitle,
  weekNumber,
  exercisesCompleted,
  exercisesTotal,
  duration,
  skippedExercises,
  onSave,
  onClose,
}: WorkoutCompleteProps) {
  const [note, setNote] = useState('')
  const [feeling, setFeeling] = useState<Feeling>(3)
  const chipRefs = useRef<(HTMLButtonElement | null)[]>([])

  // Radiogroup keyboard pattern: arrows move both the selection and the focus.
  function handleChipKey(e: KeyboardEvent, index: number) {
    const step = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0
    if (!step) return
    e.preventDefault()
    const next = (index + step + feelings.length) % feelings.length
    setFeeling(feelings[next].value)
    chipRefs.current[next]?.focus()
  }

  return (
    <motion.div
      className="relative isolate flex min-h-0 w-full flex-1 flex-col self-stretch overflow-hidden bg-cream text-plum"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
    >
      {/* Nav and content scroll together, so the sunburst is only clipped by the screen edge */}
      <div className="flex min-h-0 flex-1 flex-col overflow-x-hidden overflow-y-auto overscroll-contain">
        <div className="flex shrink-0 items-center justify-between px-5 pt-14">
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

        <div className="mx-auto flex w-full max-w-[420px] flex-1 flex-col justify-center gap-[22px] px-5 py-6">
          <div className="flex flex-col items-center gap-2.5 text-center">
            <div className="relative">
              <Sunburst ray="#ecd9a8" base="#f4e7c5" size={560} center={{ left: '50%', top: '50%' }} />
              <ConfettiBurst delay={0.4} className="left-1/2 top-1/2 -z-10" />
              <CheckStamp />
            </div>
            <h2 className="mt-2 font-poster text-[32px] leading-[1.1] [text-wrap:balance]">
              Allenamento Completato!
            </h2>
            <p className="text-[15px] font-bold text-plum-muted">{dayTitle}</p>
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            <StatTile value={`${exercisesCompleted}/${exercisesTotal}`} label="Esercizi" bg="#f2b8a0" tilt="-rotate-2" />
            <StatTile value={formatSeconds(duration)} label="Durata" bg="#9fd8d0" tilt="rotate-1" />
            <StatTile value={skippedExercises.length} label="Saltati" bg="#cfe0a8" tilt="rotate-2" />
          </div>

          <div className="flex flex-col gap-3">
            <h3 id="feeling-label" className="text-center font-poster text-[22px] leading-tight">
              Come ti senti?
            </h3>
            <div role="radiogroup" aria-labelledby="feeling-label" className="grid grid-cols-5 gap-1.5">
              {feelings.map((f, i) => {
                const selected = feeling === f.value
                return (
                  <button
                    key={f.value}
                    ref={(el) => {
                      chipRefs.current[i] = el
                    }}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    tabIndex={selected ? 0 : -1}
                    onClick={() => setFeeling(f.value)}
                    onKeyDown={(e) => handleChipKey(e, i)}
                    className={`flex min-w-0 cursor-pointer flex-col items-center gap-1 rounded-2xl border-2 border-plum px-0.5 pt-2.5 pb-2 transition-[translate,box-shadow] duration-[120ms] ease-out motion-reduce:transition-none focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-violet ${
                      selected
                        ? '-translate-x-0.5 -translate-y-0.5 bg-pastel-butter shadow-[3px_3px_0_var(--color-plum)]'
                        : 'bg-paper'
                    }`}
                  >
                    <span aria-hidden="true" className="text-[26px] leading-none">{f.emoji}</span>
                    <span className={`text-xs ${selected ? 'font-extrabold' : 'font-semibold'}`}>{f.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            aria-label="Note sull'allenamento"
            placeholder="Note sull'allenamento... (opzionale)"
            className="min-h-[84px] w-full resize-none rounded-[18px] border-2 border-plum bg-paper px-3.5 py-3 text-[15px] leading-[1.4] text-plum placeholder:text-brown focus:shadow-[3px_3px_0_var(--color-plum)] focus:outline-none"
          />
        </div>
      </div>

      {/* In flow, not fixed: with the keyboard open it never sits on top of the notes field */}
      <div className="flex shrink-0 items-center gap-3 rounded-t-[32px] border-t-2 border-plum bg-paper px-5 pt-[18px] pb-[calc(34px+env(safe-area-inset-bottom,0px))]">
        <Button variant="ghost" size="lg" onClick={onClose} className="h-[60px] min-w-0 flex-1 text-[17px]! font-extrabold!">
          Chiudi
        </Button>
        <Button size="lg" onClick={() => onSave(note, feeling)} className="h-[60px] min-w-0 flex-[2] font-poster text-[22px]! font-normal!">
          Salva
        </Button>
      </div>
    </motion.div>
  )
}
