import type { CSSProperties } from 'react'
import { useWorkoutStore } from '../../store/useWorkoutStore'
import { INK, RADIUS, SHADOW, SURFACE } from '../../styles/tokens'

interface ExerciseNotesButtonProps {
  exerciseId: string
  onClick: () => void
  className?: string
  style?: CSSProperties
  /** Smaller, low-contrast variant for the runner views, where it must not compete with the timer. */
  subtle?: boolean
}

/** Notes shortcut with a counter badge, shared by the preview and the runner views. */
export default function ExerciseNotesButton({
  exerciseId,
  onClick,
  className = '',
  style: styleOverride,
  subtle = false,
}: ExerciseNotesButtonProps) {
  const notesCount = useWorkoutStore(
    (state) => state.exerciseNotes.filter((n) => n.exerciseId === exerciseId).length
  )

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={notesCount > 0 ? `Visualizza ${notesCount} note` : 'Aggiungi nota'}
      className={
        subtle
          ? `w-8 h-8 flex items-center justify-center border-[1.5px] opacity-60 active:opacity-100 transition-opacity ${className}`
          : `w-10 h-10 flex items-center justify-center border-[2.5px] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all ${className}`
      }
      style={
        subtle
          ? {
              borderColor: INK,
              backgroundColor: 'transparent',
              borderRadius: RADIUS.blob,
              ...styleOverride,
            }
          : {
              borderColor: INK,
              backgroundColor: notesCount > 0 ? '#E8B820' : SURFACE,
              borderRadius: RADIUS.blob,
              boxShadow: SHADOW.sm,
              ...styleOverride,
            }
      }
    >
      <svg width={subtle ? 15 : 18} height={subtle ? 15 : 18} viewBox="0 0 20 20" fill="none" stroke={INK} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 3h8l4 4v10H4z" />
        <path d="M12 3v4h4" />
        <path d="M7 11h6M7 14h4" />
      </svg>
      {notesCount > 0 && (
        <span
          className={`absolute flex items-center justify-center font-bold border-[2px] ${
            subtle
              ? '-top-1 -right-1 min-w-[16px] h-4 px-0.5 text-[9px]'
              : '-top-1.5 -right-1.5 min-w-[20px] h-5 px-1 text-[10px]'
          }`}
          style={{
            borderColor: INK,
            backgroundColor: '#D4541A',
            color: '#FFFBF0',
            borderRadius: RADIUS.pill,
            boxShadow: subtle ? 'none' : SHADOW.xxs,
          }}
        >
          {notesCount}
        </span>
      )}
    </button>
  )
}
