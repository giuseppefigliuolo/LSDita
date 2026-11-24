import { calendarDaysBetween, parseLocalDate, toLocalISODate } from './dateUtils'

/**
 * Consecutive training run ending today or yesterday: one rest day between
 * sessions doesn't break it, two do.
 */
export function computeStreak(dates: string[], now: Date = new Date()): number {
  const days = [...new Set(dates)].sort().reverse()
  if (days.length === 0) return 0

  const yesterday = new Date(now)
  yesterday.setDate(now.getDate() - 1)
  if (days[0] !== toLocalISODate(now) && days[0] !== toLocalISODate(yesterday)) return 0

  let streak = 1
  for (let i = 1; i < days.length; i++) {
    const gap = calendarDaysBetween(parseLocalDate(days[i]), parseLocalDate(days[i - 1]))
    if (gap <= 2) streak++
    else break
  }
  return streak
}
