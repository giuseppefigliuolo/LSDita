import Card from '../ui/Card'

const ICON_COLOR = '#8C7355'

function SpeakerIcon({ loud }: { loud?: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke={ICON_COLOR}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="shrink-0"
    >
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      {loud && <path d="M19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.07" />}
    </svg>
  )
}

export default function VolumeSlider({
  value,
  onChange
}: {
  value: number
  onChange: (volume: number) => void
}) {
  return (
    <Card>
      <div className="flex items-center gap-3">
        <SpeakerIcon />
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          aria-label="Volume"
          className="flex-1 accent-primary h-1"
        />
        <SpeakerIcon loud />
      </div>
    </Card>
  )
}
