import type { TrainingDay, TrainingProgram } from '../types'
import {
  formatDayMonthIT,
  formatSeconds,
  getCurrentDayOfWeek,
  getDayNameIT,
  getWeekNumber,
  parseLocalDate
} from './dateUtils'

/** Week to show: manual override, else computed from the program's fixed start or the user's start date */
export function getActiveWeekNumber(
  program: TrainingProgram,
  userStartDate: string | null,
  overrideWeek: number | null
): number {
  if (overrideWeek != null) {
    return Math.min(Math.max(1, overrideWeek), program.durationWeeks)
  }
  const start = program.startDate ?? userStartDate
  return start ? Math.max(1, getWeekNumber(start, program.durationWeeks)) : 1
}

/** "12–18 ott" / "26 ott – 1 nov" for programs with a fixed calendar */
export function getWeekDateRange(program: TrainingProgram, weekNumber: number): string | null {
  if (!program.startDate) return null
  const monday = parseLocalDate(program.startDate)
  monday.setDate(monday.getDate() + (weekNumber - 1) * 7)
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  if (monday.getMonth() === sunday.getMonth()) {
    return `${monday.getDate()}–${formatDayMonthIT(sunday)}`
  }
  return `${formatDayMonthIT(monday)} – ${formatDayMonthIT(sunday)}`
}

export function getDayDurationLabel(day: TrainingDay): string {
  return day.durationLabel ?? `~${formatSeconds(getTotalExerciseDuration(day))}`
}

export function getTodayWorkout(program: TrainingProgram, startDate: string | null): { day: TrainingDay; weekNumber: number } | null {
  const currentDay = getCurrentDayOfWeek()
  const weekNumber = startDate ? getWeekNumber(startDate) : 1

  const week = program.weeks.find((w) => w.weekNumber === weekNumber)
  if (!week) return null

  const day = week.days.find((d) => d.dayOfWeek === currentDay)
  if (!day) return null

  return { day, weekNumber }
}

export function getWorkoutForDay(program: TrainingProgram, weekNumber: number, dayOfWeek: string): TrainingDay | null {
  const week = program.weeks.find((w) => w.weekNumber === weekNumber)
  if (!week) return null

  return week.days.find((d) => d.dayOfWeek === dayOfWeek) ?? null
}

export function getTotalExerciseDuration(day: TrainingDay): number {
  return day.exercises.reduce((total, ex) => {
    const hangTotal = ex.sets * ex.repsPerSet * ex.hangTime
    const restReps = ex.sets * Math.max(0, ex.repsPerSet - 1) * ex.restBetweenReps
    const restSets = Math.max(0, ex.sets - 1) * ex.restBetweenSets
    return total + hangTotal + restReps + restSets
  }, 0)
}

export function getDayTypeColor(type: string): string {
  switch (type) {
    case 'finger_strength': return 'primary'
    case 'pull_strength': return 'accent'
    case 'power_endurance': return 'secondary'
    case 'general_strength': return 'success'
    case 'mobility': return 'violet'
    case 'climbing_gym': return 'success'
    case 'lead': return 'secondary'
    case 'boulder': return 'accent'
    case 'antagonists': return 'violet'
    case 'test': return 'primary'
    case 'rest': return 'text-secondary'
    default: return 'text-secondary'
  }
}

export function getSessionLabel(days: TrainingDay[], dayOfWeek: string): string {
  const index = days.findIndex((d) => d.dayOfWeek === dayOfWeek)
  if (index < 0) return dayOfWeek
  const { label, anytime, title } = days[index]
  if (anytime) return label ?? title
  return label ? `${label} · ${getDayNameIT(dayOfWeek)}` : `Sessione ${index + 1}`
}

export function getDayTypeLabel(type: string): string {
  switch (type) {
    case 'finger_strength': return 'Forza Dita'
    case 'pull_strength': return 'Trazione + Core'
    case 'power_endurance': return 'Power Endurance'
    case 'general_strength': return 'Forza Generale'
    case 'mobility': return 'Mobilità'
    case 'climbing_gym': return 'Palestra'
    case 'lead': return 'Lead'
    case 'boulder': return 'Boulder'
    case 'antagonists': return 'Antagonisti'
    case 'test': return 'Test'
    case 'rest': return 'Riposo'
    default: return type
  }
}
