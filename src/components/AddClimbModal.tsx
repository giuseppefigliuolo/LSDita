import { useState } from 'react'
import Button from './ui/Button'
import BottomSheet from './ui/BottomSheet'
import {
  DateInput,
  DigitsInput,
  FieldBlock,
  SelectInput,
  TextArea,
  TextInput,
} from './ui/FormFields'
import type { AscentType, Climb, ClimbStyle } from '../types'
import { RADIUS, SHADOW } from '../styles/tokens'
import { TONES } from '../styles/tones'
import { useLogbookStore } from '../store/useLogbookStore'
import { toLocalISODate } from '../utils/dateUtils'
import {
  ASCENT_OPTIONS,
  FRENCH_GRADES,
  STYLE_OPTIONS,
} from '../utils/climbGrades'

interface Props {
  initial?: Climb
  onClose: () => void
}

export default function AddClimbModal({ initial, onClose }: Props) {
  const addClimb = useLogbookStore((s) => s.addClimb)
  const updateClimb = useLogbookStore((s) => s.updateClimb)
  const deleteClimb = useLogbookStore((s) => s.deleteClimb)

  const today = toLocalISODate()
  const [name, setName] = useState(initial?.name ?? '')
  const [grade, setGrade] = useState<string>(initial?.grade ?? '6a')
  const [style, setStyle] = useState<ClimbStyle>(initial?.style ?? 'sport')
  const [ascentType, setAscentType] = useState<AscentType>(
    initial?.ascentType ?? 'flash',
  )
  const [attempts, setAttempts] = useState<string>(String(initial?.attempts ?? 2))
  const [location, setLocation] = useState(initial?.location ?? '')
  const [date, setDate] = useState(initial?.date ?? today)
  const [rating, setRating] = useState<1 | 2 | 3 | 4 | 5>(initial?.rating ?? 4)
  const [notes, setNotes] = useState(initial?.notes ?? '')

  const canSave = name.trim() !== '' && location.trim() !== ''
  const needsAttempts = ascentType === 'redpoint' || ascentType === 'project'

  const handleSave = (dismiss: () => void) => {
    if (!canSave) return
    const payload: Climb = {
      id: initial?.id ?? crypto.randomUUID(),
      date,
      name: name.trim(),
      grade,
      style,
      ascentType,
      attempts: needsAttempts ? Math.max(1, parseInt(attempts, 10) || 1) : undefined,
      location: location.trim(),
      rating,
      notes: notes.trim() === '' ? undefined : notes.trim(),
    }
    if (initial) updateClimb(initial.id, payload)
    else addClimb(payload)
    dismiss()
  }

  const handleDelete = (dismiss: () => void) => {
    if (!initial) return
    deleteClimb(initial.id)
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
                <DigitsInput
                  tone="coral"
                  value={attempts}
                  onChange={setAttempts}
                  onBlur={() =>
                    setAttempts((a) => String(Math.max(1, parseInt(a, 10) || 1)))
                  }
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
                onClick={() => handleSave(dismiss)}
                disabled={!canSave}
              >
                {initial ? 'Salva modifiche' : 'Aggiungi al logbook'}
              </Button>
              {initial && (
                <Button variant="danger" size="md" fullWidth onClick={() => handleDelete(dismiss)}>
                  Elimina
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
