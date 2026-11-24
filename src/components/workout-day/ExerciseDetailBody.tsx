import type { ReactNode } from 'react'
import ExerciseIllustration from '../illustrations/ExerciseIllustration'
import ExerciseDescription from '../ui/ExerciseDescription'
import type { Exercise } from '../../types'
import { INK, RADIUS, SHADOW } from '../../styles/tokens'
import ProtocolCard from './ProtocolCard'
import { getEquipmentLabel, getGripLabel } from '../../utils/exerciseLabels'

const difficultyConfig: Record<
  NonNullable<Exercise['difficulty']>,
  { label: string; bg: string; fg: string }
> = {
  facile: { label: 'Facile', bg: '#5A9A1E', fg: '#FFFBF0' },
  medio: { label: 'Medio', bg: '#E8B820', fg: INK },
  hard: { label: 'Hard', bg: '#D4541A', fg: '#FFFBF0' }
}

/** Content of the exercise sheet: protocol, rests, difficulty, description and notes */
export default function ExerciseDetailBody({
  exercise,
  sessionTitle
}: {
  exercise: Exercise
  sessionTitle: string
}) {
  const equipmentLabel = getEquipmentLabel(exercise.equipment)
  const gripLabel = exercise.grip ? getGripLabel(exercise.grip) : null
  const difficulty = exercise.difficulty
    ? difficultyConfig[exercise.difficulty]
    : null
  const hasWeight = exercise.weight && exercise.weight !== 'corpo libero'

  return (
    <div className="px-5 pb-8 pt-1">
      {/* Top row: illustration + meta + close */}
      <div className="flex items-start gap-4 mb-5">
        <div
          className="shrink-0 flex items-center justify-center border-[2.5px] border-[#3A1248]"
          style={{
            width: 84,
            height: 84,
            borderRadius: RADIUS.blob,
            backgroundColor: '#FFF8E8',
            boxShadow: SHADOW.sm
          }}
        >
          <ExerciseIllustration name={exercise.illustration} size={62} />
        </div>
        <div className="flex-1 min-w-0 pr-10">
          <p
            className="text-[10px] font-bold uppercase tracking-[0.2em] mb-1"
            style={{ color: '#D4541A' }}
          >
            {sessionTitle}
          </p>
          <h2
            className="font-bold text-text leading-tight mb-2.5"
            style={{
              fontSize: 24,
              fontFamily: 'var(--font-display)',
              overflowWrap: 'anywhere'
            }}
          >
            {exercise.name}
          </h2>
          <div className="flex flex-wrap gap-1.5">
            <MetaPill variant="muted">{equipmentLabel}</MetaPill>
            {gripLabel && <MetaPill variant="accent">{gripLabel}</MetaPill>}
            {hasWeight && (
              <MetaPill variant="muted">{exercise.weight}</MetaPill>
            )}
          </div>
        </div>
      </div>

      <ProtocolCard exercise={exercise} />

      {/* Side cards: rest set + difficulty */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <SideCard
          icon={
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#FFFBF0"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="13" r="8" />
              <path d="M12 9v4l2.5 2.5M9 2h6M12 5V2" />
            </svg>
          }
          iconBg="#7B3A9E"
          value={`${exercise.restBetweenSets}s`}
          label="Recupero tra serie"
        />
        {difficulty && (
          <SideCard
            icon={
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke={difficulty.fg}
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="9" />
                <circle cx="12" cy="12" r="5" />
                <circle cx="12" cy="12" r="1.5" fill={difficulty.fg} />
              </svg>
            }
            iconBg={difficulty.bg}
            value={difficulty.label}
            label="Difficoltà"
          />
        )}
      </div>

      {/* Description */}
      <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-text-muted mb-2">
        Descrizione
      </p>
      <div
        className="mb-5 px-4 py-3.5 border-[2.5px] border-[#3A1248]"
        style={{
          borderRadius: RADIUS.card,
          backgroundColor: '#FFF8E8',
          boxShadow: SHADOW.sm
        }}
      >
        <p
          className="text-text"
          style={{ fontSize: 14, lineHeight: 1.55 }}
        >
          <ExerciseDescription text={exercise.description} />
        </p>
      </div>

      {/* Note pill */}
      {exercise.notes && (
        <div
          className="inline-flex items-center gap-2 max-w-full px-3.5 py-2 text-xs font-medium text-text"
          style={{
            border: `1.5px dashed ${INK}`,
            borderRadius: RADIUS.pill,
            backgroundColor: 'transparent'
          }}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#E8B820"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="shrink-0"
          >
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
          </svg>
          <span className="font-bold uppercase tracking-wider text-[10px]">
            Nota:
          </span>
          <span className="truncate min-w-0">{exercise.notes}</span>
        </div>
      )}
    </div>
  )
}

function MetaPill({
  children,
  variant
}: {
  children: ReactNode
  variant: 'muted' | 'accent'
}) {
  const isAccent = variant === 'accent'
  return (
    <span
      className="inline-flex items-center text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 border-[1.5px] border-[#3A1248]"
      style={{
        borderRadius: RADIUS.pill,
        backgroundColor: isAccent ? '#D4541A' : '#FFF8E8',
        color: isAccent ? '#FFFBF0' : INK
      }}
    >
      {children}
    </span>
  )
}

function SideCard({
  icon,
  iconBg,
  value,
  label
}: {
  icon: ReactNode
  iconBg: string
  value: string
  label: string
}) {
  return (
    <div
      className="flex items-center gap-3 px-3 py-3 border-[2.5px] border-[#3A1248]"
      style={{
        borderRadius: RADIUS.card,
        backgroundColor: '#FFF8E8',
        boxShadow: SHADOW.sm
      }}
    >
      <div
        className="shrink-0 w-10 h-10 flex items-center justify-center border-[2px] border-[#3A1248]"
        style={{
          backgroundColor: iconBg,
          borderRadius: RADIUS.btnSm,
          boxShadow: SHADOW.xs
        }}
      >
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-base font-bold font-timer text-text leading-tight">
          {value}
        </p>
        <p className="text-[11px] text-text-muted leading-tight mt-0.5">
          {label}
        </p>
      </div>
    </div>
  )
}
