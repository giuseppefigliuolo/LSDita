import { useSettingsStore } from '../../store/useSettingsStore'

/** Round header button that quickly silences beeps and voice announcements. */
export default function MuteButton({ className = '' }: { className?: string }) {
  const muted = useSettingsStore((s) => s.muted)
  const toggleMuted = useSettingsStore((s) => s.toggleMuted)

  return (
    <button
      onClick={toggleMuted}
      className={`flex items-center justify-center w-9 h-9 rounded-full bg-surface-elevated/80 active:scale-95 transition-transform ${muted ? 'text-accent' : 'text-text-secondary'} ${className}`}
      aria-label={muted ? 'Riattiva audio' : 'Disattiva audio'}
      aria-pressed={muted}
      title={muted ? 'Riattiva audio' : 'Disattiva audio'}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
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
    </button>
  )
}
