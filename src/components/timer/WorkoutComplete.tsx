import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Button from '../ui/Button'
import { formatSeconds } from '../../utils/dateUtils'
import { fireConfetti } from '../../utils/confetti'

interface WorkoutCompleteProps {
  dayTitle: string
  exercisesCompleted: number
  exercisesTotal: number
  duration: number
  skippedExercises: string[]
  onSave: (note: string, feeling: 1 | 2 | 3 | 4 | 5) => void
  onClose: () => void
}

const feelings = [
  { value: 1 as const, emoji: '😵', label: 'Distrutto' },
  { value: 2 as const, emoji: '😓', label: 'Duro' },
  { value: 3 as const, emoji: '💪', label: 'Bene' },
  { value: 4 as const, emoji: '🔥', label: 'Forte' },
  { value: 5 as const, emoji: '🚀', label: 'Top' },
]

export default function WorkoutComplete({
  dayTitle,
  exercisesCompleted,
  exercisesTotal,
  duration,
  skippedExercises,
  onSave,
  onClose,
}: WorkoutCompleteProps) {
  const [note, setNote] = useState('')
  const [feeling, setFeeling] = useState<1 | 2 | 3 | 4 | 5>(3)

  useEffect(() => {
    const timeout = setTimeout(() => fireConfetti(), 400)
    return () => clearTimeout(timeout)
  }, [])

  return (
    <motion.div
      className="flex flex-col items-center text-center px-6 py-8"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, type: 'spring' }}
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
        className="w-20 h-20 rounded-full bg-success/20 flex items-center justify-center mb-4"
      >
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#4DD474" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </motion.div>

      <h2 className="text-2xl font-bold text-text mb-1">Allenamento Completato!</h2>
      <p className="text-text-secondary text-sm mb-6">{dayTitle}</p>

      <div className="grid grid-cols-3 gap-3 w-full max-w-xs mb-6">
        <div className="bg-surface rounded-xl p-3 text-center">
          <p className="text-lg font-bold font-timer text-primary">{exercisesCompleted}/{exercisesTotal}</p>
          <p className="text-[11px] uppercase tracking-wider text-text-muted">Esercizi</p>
        </div>
        <div className="bg-surface rounded-xl p-3 text-center">
          <p className="text-lg font-bold font-timer text-secondary">{formatSeconds(duration)}</p>
          <p className="text-[11px] uppercase tracking-wider text-text-muted">Durata</p>
        </div>
        <div className="bg-surface rounded-xl p-3 text-center">
          <p className="text-lg font-bold font-timer text-accent">{skippedExercises.length}</p>
          <p className="text-[11px] uppercase tracking-wider text-text-muted">Saltati</p>
        </div>
      </div>

      <div className="w-full max-w-xs mb-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-text-muted mb-3">Come ti senti?</p>
        <div className="flex justify-center gap-2">
          {feelings.map((f) => (
            <button
              key={f.value}
              onClick={() => setFeeling(f.value)}
              className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
                feeling === f.value
                  ? 'bg-accent/20 scale-110'
                  : 'bg-surface hover:bg-surface-elevated'
              }`}
            >
              <span className="text-xl">{f.emoji}</span>
              <span className="text-[11px] text-text-muted">{f.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="w-full max-w-xs mb-6">
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Note sull'allenamento... (opzionale)"
          className="w-full bg-surface border border-border rounded-xl p-3 text-sm text-text placeholder-text-muted resize-none h-20 focus:outline-none focus:border-primary/50"
        />
      </div>

      <div className="flex gap-3 w-full max-w-xs">
        <Button variant="ghost" onClick={onClose}>
          Chiudi
        </Button>
        <Button variant="accent" fullWidth onClick={() => onSave(note, feeling)}>
          Salva
        </Button>
      </div>
    </motion.div>
  )
}
