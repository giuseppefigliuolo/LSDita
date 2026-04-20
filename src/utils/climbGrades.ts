import type { AscentType, Climb, ClimbStyle } from '../types'

export const FRENCH_GRADES = [
  '4', '4+', '5a', '5a+', '5b', '5b+', '5c', '5c+',
  '6a', '6a+', '6b', '6b+', '6c', '6c+',
  '7a', '7a+', '7b', '7b+', '7c', '7c+',
  '8a', '8a+', '8b', '8b+', '8c', '8c+',
  '9a', '9a+', '9b', '9b+', '9c',
] as const

export function gradeIndex(grade: string): number {
  return FRENCH_GRADES.indexOf(grade as (typeof FRENCH_GRADES)[number])
}

export function maxGrade(climbs: Climb[]): string | null {
  if (climbs.length === 0) return null
  let best = -1
  let bestGrade: string | null = null
  for (const c of climbs) {
    const i = gradeIndex(c.grade)
    if (i > best) {
      best = i
      bestGrade = c.grade
    }
  }
  return bestGrade
}

export interface GradeTone {
  bg: string
  text: string
}

export function gradeTone(grade: string): GradeTone {
  const i = gradeIndex(grade)
  if (i < 0) return { bg: '#EDE0B2', text: '#3A1248' }
  if (i <= 7) return { bg: '#5A9A1E', text: '#FFFBF0' }
  if (i <= 9) return { bg: '#E8B820', text: '#2D0E4A' }
  if (i <= 11) return { bg: '#D4541A', text: '#FFFBF0' }
  if (i <= 13) return { bg: '#E84830', text: '#FFFBF0' }
  if (i <= 17) return { bg: '#7B3A9E', text: '#FFFBF0' }
  return { bg: '#3A1248', text: '#FFFBF0' }
}

export const STYLE_LABELS: Record<ClimbStyle, string> = {
  boulder: 'Boulder',
  sport: 'Sport',
  multipitch: 'Multi',
  trad: 'Trad',
}

export const STYLE_OPTIONS: { value: ClimbStyle; label: string }[] = [
  { value: 'boulder', label: 'Boulder' },
  { value: 'sport', label: 'Sport' },
  { value: 'multipitch', label: 'Multipitch' },
  { value: 'trad', label: 'Trad' },
]

export const ASCENT_LABELS: Record<AscentType, string> = {
  onsight: 'OS',
  flash: 'Flash',
  redpoint: 'RP',
  project: 'Project',
}

export const ASCENT_OPTIONS: { value: AscentType; label: string }[] = [
  { value: 'onsight', label: 'Onsight' },
  { value: 'flash', label: 'Flash' },
  { value: 'redpoint', label: 'Redpoint' },
  { value: 'project', label: 'Project' },
]

export interface AscentTone {
  bg: string
  text: string
  border: string
}

export const ASCENT_TONES: Record<AscentType, AscentTone> = {
  onsight:  { bg: '#EAF3DB', text: '#3F6E15', border: '#5A9A1E' },
  flash:    { bg: '#FBF0CC', text: '#8A6D10', border: '#E8B820' },
  redpoint: { bg: '#FDEEE4', text: '#A63E10', border: '#D4541A' },
  project:  { bg: '#F2EAF8', text: '#5A2878', border: '#7B3A9E' },
}

export function formatAscent(type: AscentType, attempts?: number): string {
  if ((type === 'redpoint' || type === 'project') && attempts && attempts > 0) {
    return `${ASCENT_LABELS[type]} ${attempts}T`
  }
  return ASCENT_LABELS[type]
}
