import { describe, expect, it } from 'vitest'
import type { TrainingDay, TrainingProgram } from '../types'
import {
  getActiveWeekNumber,
  getSessionLabel,
  getTotalExerciseDuration,
  getWeekDateRange,
  getWorkoutForDay,
} from './programUtils'

const day = (dayOfWeek: string, extra: Partial<TrainingDay> = {}): TrainingDay => ({
  dayOfWeek,
  type: 'finger_strength',
  title: `Titolo ${dayOfWeek}`,
  icon: '',
  description: '',
  exercises: [],
  ...extra,
})

const program = (extra: Partial<TrainingProgram> = {}): TrainingProgram => ({
  id: 'p',
  name: '',
  description: '',
  durationWeeks: 4,
  weeks: [1, 2, 3, 4].map((n) => ({
    weekNumber: n,
    theme: '',
    description: '',
    volumeMultiplier: 1,
    days: [day('monday'), day('thursday')],
  })),
  ...extra,
})

describe('getActiveWeekNumber', () => {
  it('uses the manual override, clamped to the program', () => {
    expect(getActiveWeekNumber(program(), null, 3)).toBe(3)
    expect(getActiveWeekNumber(program(), null, 9)).toBe(4)
    expect(getActiveWeekNumber(program(), null, 0)).toBe(1)
  })

  it('is week 1 without a start date', () => {
    expect(getActiveWeekNumber(program(), null, null)).toBe(1)
  })

  it('is at least week 1 before a future start date', () => {
    expect(getActiveWeekNumber(program(), '2999-01-01', null)).toBe(1)
  })
})

describe('getWeekDateRange', () => {
  it('is null without a fixed calendar', () => {
    expect(getWeekDateRange(program(), 1)).toBeNull()
  })

  it('shows one month once', () => {
    expect(getWeekDateRange(program({ startDate: '2026-10-12' }), 1)).toBe('12–18 ott')
  })

  it('shows both months when the week crosses them', () => {
    expect(getWeekDateRange(program({ startDate: '2026-10-12' }), 3)).toBe('26 ott – 1 nov')
  })
})

describe('getWorkoutForDay', () => {
  it('finds the session of a week', () => {
    expect(getWorkoutForDay(program(), 2, 'thursday')?.dayOfWeek).toBe('thursday')
  })

  it('is null for a rest day or a missing week', () => {
    expect(getWorkoutForDay(program(), 2, 'friday')).toBeNull()
    expect(getWorkoutForDay(program(), 7, 'monday')).toBeNull()
  })
})

describe('getTotalExerciseDuration', () => {
  it('sums hangs and rests, with no rest after the last rep or set', () => {
    const repeaters = day('monday', {
      exercises: [
        {
          id: 'r',
          name: '',
          description: '',
          equipment: 'hangboard',
          type: 'repeaters',
          illustration: '',
          sets: 2,
          repsPerSet: 6,
          hangTime: 7,
          restBetweenReps: 3,
          restBetweenSets: 180,
        },
      ],
    })
    // 2×6×7 hang + 2×5×3 rest between reps + 1×180 between sets
    expect(getTotalExerciseDuration(repeaters)).toBe(84 + 30 + 180)
  })
})

describe('getSessionLabel', () => {
  const days = [
    day('monday'),
    day('thursday', { label: 'S2' }),
    day('casa-a', { anytime: true, label: 'Casa A' }),
    day('casa-b', { anytime: true }),
  ]

  it('falls back to the position', () => {
    expect(getSessionLabel(days, 'monday')).toBe('Sessione 1')
  })

  it('adds the weekday to a label', () => {
    expect(getSessionLabel(days, 'thursday')).toBe('S2 · Giovedì')
  })

  it('uses the label or title for anytime sessions', () => {
    expect(getSessionLabel(days, 'casa-a')).toBe('Casa A')
    expect(getSessionLabel(days, 'casa-b')).toBe('Titolo casa-b')
  })
})
