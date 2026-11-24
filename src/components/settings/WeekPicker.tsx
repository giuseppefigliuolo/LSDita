import Card from '../ui/Card'
import Button from '../ui/Button'

export default function WeekPicker({
  durationWeeks,
  currentWeek,
  onChange
}: {
  durationWeeks: number
  /** null = computed from the start date */
  currentWeek: number | null
  onChange: (week: number | null) => void
}) {
  return (
    <Card>
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-sm font-medium text-text">Settimana attiva</p>
          <p className="text-xs text-text-secondary">
            {currentWeek == null
              ? 'Automatica in base alla data di inizio'
              : 'Manuale — sovrascrive il calcolo automatico'}
          </p>
        </div>
        {currentWeek != null && (
          <Button variant="ghost" size="sm" onClick={() => onChange(null)}>
            Auto
          </Button>
        )}
      </div>
      <div className="grid grid-cols-4 gap-2">
        {Array.from({ length: durationWeeks }, (_, i) => i + 1).map((week) => {
          const isActive = currentWeek === week
          return (
            <button
              key={week}
              onClick={() => onChange(week)}
              className={`h-10 rounded-lg border-2 text-sm font-bold font-timer transition-colors ${
                isActive
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border bg-surface text-text hover:border-primary/40'
              }`}
            >
              {week}
            </button>
          )
        })}
      </div>
    </Card>
  )
}
