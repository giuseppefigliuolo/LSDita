import { useState } from 'react'
import Button from '../ui/Button'
import BottomSheet from '../ui/BottomSheet'
import { FieldBlock, TextArea, TextInput } from '../ui/FormFields'
import ExerciseEditCard from './ExerciseEditCard'
import type { Exercise, ProgramId, TrainingDay } from '../../types'
import type { Tone } from '../../styles/tones'
import { dayOverrideKey, useSettingsStore } from '../../store/useSettingsStore'
import { getOriginalDay } from '../../utils/getProgram'

const CARD_TONES: Tone[] = ['primary', 'secondary', 'accent', 'violet', 'green', 'coral']

interface Props {
  day: TrainingDay
  weekNumber: number
  programId: ProgramId
  onClose: () => void
}

function cloneDay(day: TrainingDay): TrainingDay {
  return {
    ...day,
    exercises: day.exercises.map((ex) => ({ ...ex })),
  }
}

/** Edits a session of the program; saved as an override on top of the original */
export default function EditDayModal({ day, weekNumber, programId, onClose }: Props) {
  const [edited, setEdited] = useState<TrainingDay>(() => cloneDay(day))
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const setDayOverride = useSettingsStore((s) => s.setDayOverride)
  const clearDayOverride = useSettingsStore((s) => s.clearDayOverride)
  const hasOverride = useSettingsStore(
    (s) => dayOverrideKey(programId, weekNumber, day.dayOfWeek) in s.dayOverrides
  )

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

  const handleSave = (dismiss: () => void) => {
    setDayOverride(programId, weekNumber, day.dayOfWeek, edited)
    dismiss()
  }

  const handleRestore = (dismiss: () => void) => {
    const original = getOriginalDay(programId, weekNumber, day.dayOfWeek)
    clearDayOverride(programId, weekNumber, day.dayOfWeek)
    if (original) setEdited(cloneDay(original))
    dismiss()
  }

  return (
    <BottomSheet onClose={onClose}>
      {(dismiss) => (
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
                onToggle={() => setExpandedId((id) => (id === ex.id ? null : ex.id))}
                onMoveUp={() => moveExercise(index, -1)}
                onMoveDown={() => moveExercise(index, 1)}
                onChange={(patch) => updateExercise(index, patch)}
              />
            ))}
          </div>

          <div className="flex flex-col gap-2">
            <Button variant="primary" size="lg" fullWidth onClick={() => handleSave(dismiss)}>
              Salva modifiche
            </Button>
            {hasOverride && (
              <Button variant="danger" size="md" fullWidth onClick={() => handleRestore(dismiss)}>
                Ripristina originale
              </Button>
            )}
            <Button variant="ghost" size="md" fullWidth onClick={dismiss}>
              Annulla
            </Button>
          </div>
        </div>
      )}
    </BottomSheet>
  )
}
