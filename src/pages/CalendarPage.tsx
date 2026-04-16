import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useWorkoutStore } from '../store/useWorkoutStore'
import { useSettingsStore } from '../store/useSettingsStore'
import { getProgram } from '../utils/getProgram'
import { getMonthNameIT, getWeekNumber } from '../utils/dateUtils'
import { getDayTypeColor } from '../utils/programUtils'
import { RADIUS, SHADOW } from '../styles/tokens'

const WEEKDAY_LABELS = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom']

export default function CalendarPage() {
  const navigate = useNavigate()
  const { programStartDate, completedWorkouts } = useWorkoutStore()
  const { selectedProgram, currentWeek: overrideWeek } = useSettingsStore()
  const program = getProgram(selectedProgram)

  const autoWeek = programStartDate ? getWeekNumber(programStartDate, program.durationWeeks) : 1
  const activeWeek = overrideWeek != null
    ? Math.min(Math.max(1, overrideWeek), program.durationWeeks)
    : autoWeek
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()

  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    let startOffset = firstDay.getDay() - 1
    if (startOffset < 0) startOffset = 6

    const days: Array<{ date: Date; dayNum: number; isCurrentMonth: boolean } | null> = []
    for (let i = 0; i < startOffset; i++) days.push(null)
    for (let d = 1; d <= lastDay.getDate(); d++) {
      days.push({ date: new Date(year, month, d), dayNum: d, isCurrentMonth: true })
    }
    return days
  }, [year, month])

  const today = now.toISOString().split('T')[0]
  const completedDates = new Set(completedWorkouts.map((w) => w.date))

  function getDayInfo(date: Date) {
    const dayOfWeekIndex = date.getDay()
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
    const dayName = dayNames[dayOfWeekIndex]
    const dateStr = date.toISOString().split('T')[0]
    const isCompleted = completedDates.has(dateStr)
    const isToday = dateStr === today

    const weekNum = activeWeek
    const week = program.weeks.find((w) => w.weekNumber === weekNum)
    const trainingDay = week?.days.find((d) => d.dayOfWeek === dayName)

    return { dayName, dateStr, isCompleted, isToday, trainingDay, weekNum }
  }

  return (
    <motion.div
      className="px-4 pt-6 pb-6 max-w-lg mx-auto"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      <h1 className="text-3xl mb-1" style={{ fontFamily: 'var(--font-display)' }}>Calendario</h1>
      <p className="text-text-secondary text-sm mb-6">
        {getMonthNameIT(month)} {year}
      </p>

      <div className="bg-surface border-[3px] border-[#3A1248] p-4" style={{ borderRadius: RADIUS.card, boxShadow: SHADOW.lg }}>
        <div className="grid grid-cols-7 gap-1 mb-2">
          {WEEKDAY_LABELS.map((label) => (
            <div key={label} className="text-center text-[11px] font-semibold uppercase tracking-wider text-text-muted py-1">
              {label}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day, i) => {
            if (!day) return <div key={`empty-${i}`} />

            const info = getDayInfo(day.date)
            const dotColor = info.trainingDay
              ? getDayTypeColor(info.trainingDay.type)
              : null

            const colorMap: Record<string, string> = {
              primary: 'bg-primary',
              secondary: 'bg-secondary',
              accent: 'bg-accent',
              violet: 'bg-violet',
              success: 'bg-success',
            }

            return (
              <button
                key={day.dayNum}
                onClick={() => {
                  if (info.trainingDay) {
                    navigate(`/workout/${info.weekNum}/${info.dayName}`)
                  }
                }}
                className={`relative flex flex-col items-center justify-center h-10 rounded-lg transition-colors
                  ${info.isToday ? 'bg-primary/15 ring-1 ring-primary/30' : 'hover:bg-surface-elevated'}
                  ${info.isCompleted ? 'opacity-100' : 'opacity-70'}
                `}
              >
                <span className={`text-xs font-medium ${info.isToday ? 'text-primary font-bold' : 'text-text'}`}>
                  {day.dayNum}
                </span>
                {dotColor && (
                  <div className={`w-1.5 h-1.5 rounded-full mt-0.5 ${
                    info.isCompleted
                      ? 'bg-success'
                      : colorMap[dotColor] ?? 'bg-text-muted'
                  }`} />
                )}
              </button>
            )
          })}
        </div>
      </div>

      <div className="mt-6">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-text-muted mb-3">Legenda</h2>
        <div className="flex flex-wrap gap-3">
          <LegendItem color="bg-primary" label="Forza Dita" />
          <LegendItem color="bg-accent" label="Trazione" />
          <LegendItem color="bg-secondary" label="Power Endurance" />
          <LegendItem color="bg-success" label="Forza Generale" />
          <LegendItem color="bg-violet" label="Mobilità" />
          <LegendItem color="bg-success" label="Completato" />
        </div>
      </div>
    </motion.div>
  )
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className={`w-2.5 h-2.5 rounded-full ${color}`} />
      <span className="text-xs text-text-secondary">{label}</span>
    </div>
  )
}
