import { motion } from 'framer-motion'
import type { Equipment, Exercise, ExerciseType, GripType } from '../../types'
import { INK, SURFACE_ELEVATED, RADIUS, SHADOW } from '../../styles/tokens'
import { TONES, type Tone } from '../../styles/tones'
import { equipmentLabels, gripLabels } from '../../utils/exerciseLabels'
import { FieldBlock, NumberInput, SelectInput, TextArea, TextInput } from '../ui/FormFields'
import IllustrationPicker from './IllustrationPicker'

const EQUIPMENT_OPTIONS = Object.entries(equipmentLabels).map(([value, label]) => ({ value, label }))

const TYPE_OPTIONS: { value: ExerciseType; label: string }[] = [
  { value: 'timed_hang', label: 'Hang a tempo' },
  { value: 'timed_hold', label: 'Tenuta a tempo' },
  { value: 'repeaters', label: 'Repeaters' },
  { value: 'reps', label: 'Ripetizioni' },
  { value: 'timed_stretch', label: 'Stretch a tempo' },
]

const GRIP_OPTIONS = [
  { value: '', label: '— Nessuna —' },
  ...Object.entries(gripLabels).map(([value, label]) => ({ value, label })),
]

/** Collapsible editor for one exercise, with up/down reordering */
export default function ExerciseEditCard({
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
                  // A manual weight replaces the one computed from the CR
                  onChange({ weight: v.trim() === '' ? undefined : v, load: undefined })
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
