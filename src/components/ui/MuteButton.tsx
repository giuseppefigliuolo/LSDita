import { useSettingsStore } from '../../store/useSettingsStore'
import IconButton from './IconButton'

/** Round header button that quickly silences beeps and voice announcements. */
export default function MuteButton({
  className = '',
  variant = 'plain',
}: {
  className?: string
  /** 'blob' matches the exercise screens' header (48px IconButton) */
  variant?: 'plain' | 'blob'
}) {
  const muted = useSettingsStore((s) => s.muted)
  const toggleMuted = useSettingsStore((s) => s.toggleMuted)

  const label = muted ? 'Riattiva audio' : 'Disattiva audio'
  const icon = (
    <svg width={variant === 'blob' ? 22 : 18} height={variant === 'blob' ? 22 : 18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor" />
      {muted ? (
        <>
          <line x1="23" y1="9" x2="17" y2="15" />
          <line x1="17" y1="9" x2="23" y2="15" />
        </>
      ) : (
        <>
          <path d="M15.54 8.46a5 5 0 010 7.07" />
          <path d="M19.07 4.93a10 10 0 010 14.14" />
        </>
      )}
    </svg>
  )

  if (variant === 'blob') {
    return (
      <IconButton
        onClick={toggleMuted}
        pressed={muted}
        aria-label={label}
        className={className}
      >
        {icon}
      </IconButton>
    )
  }

  return (
    <button
      onClick={toggleMuted}
      className={`flex items-center justify-center w-9 h-9 rounded-full bg-surface-elevated/80 active:scale-95 transition-transform ${muted ? 'text-accent' : 'text-text-secondary'} ${className}`}
      aria-label={label}
      aria-pressed={muted}
      title={label}
    >
      {icon}
    </button>
  )
}
