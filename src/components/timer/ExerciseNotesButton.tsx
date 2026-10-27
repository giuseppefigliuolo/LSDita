import { useWorkoutStore } from '../../store/useWorkoutStore'
import IconButton from '../ui/IconButton'
import { INK, RADIUS, SHADOW } from '../../styles/tokens'

interface ExerciseNotesButtonProps {
  exerciseId: string
  onClick: () => void
  /** sm: paper button in the exercise preview; lg: cream button in the runner action bar */
  size?: 'sm' | 'lg'
}

/** Notes shortcut with a counter badge, shared by the preview and the runner views. */
export default function ExerciseNotesButton({ exerciseId, onClick, size = 'sm' }: ExerciseNotesButtonProps) {
  const notesCount = useWorkoutStore(
    (state) => state.exerciseNotes.filter((n) => n.exerciseId === exerciseId).length
  )
  const iconSize = size === 'lg' ? 22 : 18

  return (
    <IconButton
      size={size}
      tone={size === 'lg' ? 'cream' : 'paper'}
      onClick={onClick}
      aria-label={notesCount > 0 ? `Visualizza ${notesCount} note` : 'Aggiungi nota'}
      className="relative"
    >
      <svg aria-hidden="true" width={iconSize} height={iconSize} viewBox="0 0 20 20" fill="none" stroke={INK} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 3h8l4 4v10H4z" />
        <path d="M12 3v4h4" />
        <path d="M7 11h6M7 14h4" />
      </svg>
      {notesCount > 0 && (
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
      )}
    </IconButton>
  )
}
