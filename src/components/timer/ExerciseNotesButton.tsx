import type { CSSProperties } from 'react'
import { useWorkoutStore } from '../../store/useWorkoutStore'
import PosterIconButton from '../ui/PosterIconButton'
import { INK, RADIUS, SHADOW, SURFACE } from '../../styles/tokens'

interface ExerciseNotesButtonProps {
  exerciseId: string
  onClick: () => void
  className?: string
  style?: CSSProperties
  /** Paper circle (40px) used in the poster-style exercise preview. */
  round?: boolean
  /** Cream 60px circle with hard shadow, for the runner action bar. */
  bar?: boolean
}

/** Notes shortcut with a counter badge, shared by the preview and the runner views. */
export default function ExerciseNotesButton({
  exerciseId,
  onClick,
  className = '',
  style: styleOverride,
  round = false,
  bar = false,
}: ExerciseNotesButtonProps) {
  const notesCount = useWorkoutStore(
    (state) => state.exerciseNotes.filter((n) => n.exerciseId === exerciseId).length
  )
  const label = notesCount > 0 ? `Note (${notesCount})` : 'Note'

  const iconSize = bar ? 22 : 18
  const icon = (
    <svg aria-hidden="true" width={iconSize} height={iconSize} viewBox="0 0 20 20" fill="none" stroke={INK} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 3h8l4 4v10H4z" />
      <path d="M12 3v4h4" />
      <path d="M7 11h6M7 14h4" />
    </svg>
  )
  const badge = notesCount > 0 && (
    <span
      aria-hidden="true"
      className="absolute -top-1.5 -right-1.5 flex min-w-[20px] h-5 px-1 items-center justify-center text-[10px] font-bold border-[2px]"
      style={{
        borderColor: INK,
        backgroundColor: '#D4541A',
        color: '#FFFBF0',
        borderRadius: RADIUS.pill,
        boxShadow: SHADOW.xxs,
      }}
    >
      {notesCount}
    </span>
  )

  if (bar) {
    return (
      <PosterIconButton
        shape="round"
        size="lg"
        tone="cream"
        onClick={onClick}
        aria-label={label}
        className={`relative ${className}`}
      >
        {icon}
        {badge}
      </PosterIconButton>
    )
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={notesCount > 0 ? `Visualizza ${notesCount} note` : 'Aggiungi nota'}
      className={
        round
          ? `relative size-10 flex items-center justify-center rounded-full border-2 border-plum bg-paper active:translate-x-[2px] active:translate-y-[2px] transition-transform motion-reduce:transition-none ${className}`
          : `relative w-10 h-10 flex items-center justify-center border-[2.5px] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all ${className}`
      }
      style={
        round
          ? styleOverride
          : {
              borderColor: INK,
              backgroundColor: notesCount > 0 ? '#E8B820' : SURFACE,
              borderRadius: RADIUS.blob,
              boxShadow: SHADOW.sm,
              ...styleOverride,
            }
      }
    >
      {icon}
      {badge}
    </button>
  )
}
