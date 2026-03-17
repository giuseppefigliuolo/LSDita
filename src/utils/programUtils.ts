import type { TrainingDay, TrainingProgram } from '../types'
import { getCurrentDayOfWeek, getWeekNumber } from './dateUtils'

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
    case 'mobility': return 'violet'
    case 'climbing_gym': return 'success'
    case 'rest': return 'text-secondary'
    default: return 'text-secondary'
  }
}

export function getDayTypeLabel(type: string): string {
  switch (type) {
    case 'finger_strength': return 'Forza Dita'
    case 'pull_strength': return 'Trazione + Core'
    case 'power_endurance': return 'Power Endurance'
    case 'mobility': return 'Mobilità'
    case 'climbing_gym': return 'Palestra'
    case 'rest': return 'Riposo'
    default: return type
  }
}
