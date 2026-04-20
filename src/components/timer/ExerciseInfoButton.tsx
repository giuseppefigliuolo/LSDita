import { INK, RADIUS, SHADOW, SURFACE } from '../../styles/tokens'

interface ExerciseInfoButtonProps {
  onClick: () => void
  className?: string
}

/**
 * Round info button used during a workout to open the exercise info modal.
 * Matches the pill/blob style used by the notes button in the exercise preview.
 */
export default function ExerciseInfoButton({
  onClick,
  className,
}: ExerciseInfoButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Informazioni esercizio"
      className={`w-10 h-10 flex items-center justify-center border-[2.5px] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all ${className ?? ''}`}
      style={{
        borderColor: INK,
        backgroundColor: SURFACE,
        borderRadius: RADIUS.blob,
        boxShadow: SHADOW.sm,
      }}
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 20 20"
        fill="none"
        stroke={INK}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="10" cy="10" r="7.5" />
        <path d="M10 9v5" />
        <circle cx="10" cy="6" r="0.8" fill={INK} stroke="none" />
      </svg>
    </button>
  )
}
