const DAYS_IT: Record<string, string> = {
  monday: 'Lunedì',
  tuesday: 'Martedì',
  wednesday: 'Mercoledì',
  thursday: 'Giovedì',
  friday: 'Venerdì',
  saturday: 'Sabato',
  sunday: 'Domenica',
}

const MONTHS_IT = [
  'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
  'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre',
]

export function getDayNameIT(dayOfWeek: string): string {
  return DAYS_IT[dayOfWeek] ?? dayOfWeek
}

export function getMonthNameIT(monthIndex: number): string {
  return MONTHS_IT[monthIndex] ?? ''
}

export function formatDate(date: Date): string {
  return `${date.getDate()} ${MONTHS_IT[date.getMonth()]} ${date.getFullYear()}`
}

export function formatDateShort(date: Date): string {
  return `${date.getDate()} ${MONTHS_IT[date.getMonth()].slice(0, 3)}`
}

export function getTodayString(): string {
  return new Date().toISOString().split('T')[0]
}

export function getDayOfWeekIndex(dayOfWeek: string): number {
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
  return days.indexOf(dayOfWeek)
}

export function getCurrentDayOfWeek(): string {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
  return days[new Date().getDay()]
}

export function formatSeconds(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  if (mins === 0) return `${secs}s`
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

export function getWeekNumber(startDate: string, maxWeeks: number = 4): number {
  const start = new Date(startDate)
  const now = new Date()
  const diffDays = Math.floor((now.getTime() - start.getTime()) / 86400000)
  return Math.min(Math.floor(diffDays / 7) + 1, maxWeeks)
}
