import Card from '../ui/Card'

const MAX_COUNTDOWN = 10

const stepButtonClass =
  'w-8 h-8 rounded-full bg-surface border border-border flex items-center justify-center text-sm font-bold text-text disabled:opacity-30'

export default function CountdownStepper({
  value,
  onChange
}: {
  value: number
  onChange: (seconds: number) => void
}) {
  return (
    <Card>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-text">Countdown iniziale</p>
          <p className="text-xs text-text-secondary">
            Secondi prima che l'esercizio parta
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onChange(Math.max(0, value - 1))}
            disabled={value <= 0}
            aria-label="Diminuisci countdown"
            className={stepButtonClass}
          >
            −
          </button>
          <span className="w-8 text-center font-bold font-timer text-primary">
            {value}
          </span>
          <button
            onClick={() => onChange(Math.min(MAX_COUNTDOWN, value + 1))}
            disabled={value >= MAX_COUNTDOWN}
            aria-label="Aumenta countdown"
            className={stepButtonClass}
          >
            +
          </button>
        </div>
      </div>
    </Card>
  )
}
