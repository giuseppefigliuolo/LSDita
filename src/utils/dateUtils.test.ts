import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  calendarDaysBetween,
  formatSeconds,
  getTodayString,
  getWeekNumber,
  parseLocalDate,
  toLocalISODate,
} from './dateUtils'

afterEach(() => {
  vi.useRealTimers()
})

describe('timezone', () => {
  it('runs in Europe/Rome, where local midnight is not UTC midnight', () => {
    expect(new Date(2026, 10, 24).getTimezoneOffset()).toBe(-60)
  })
})

describe('toLocalISODate', () => {
  it('keeps the local day for a date built at local midnight (calendar cells)', () => {
    expect(toLocalISODate(new Date(2026, 10, 24))).toBe('2026-11-24')
  })

  it('keeps the local day just after midnight', () => {
    expect(toLocalISODate(new Date(2026, 6, 1, 0, 30))).toBe('2026-07-01')
  })

  it('pads month and day', () => {
    expect(toLocalISODate(new Date(2026, 0, 5))).toBe('2026-01-05')
  })

  it('round-trips with parseLocalDate', () => {
    expect(toLocalISODate(parseLocalDate('2026-03-29'))).toBe('2026-03-29')
  })
})

describe('getTodayString', () => {
  it('returns the local day at 00:30, when UTC is still on the previous day', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 10, 24, 0, 30))
    expect(getTodayString()).toBe('2026-11-24')
  })
})

describe('calendarDaysBetween', () => {
  it('counts calendar days across the spring DST change (23-hour day)', () => {
    expect(calendarDaysBetween(new Date(2026, 2, 28), new Date(2026, 2, 30))).toBe(2)
  })

  it('counts calendar days across the autumn DST change (25-hour day)', () => {
    expect(calendarDaysBetween(new Date(2026, 9, 24), new Date(2026, 9, 26))).toBe(2)
  })

  it('ignores the time of day', () => {
    expect(calendarDaysBetween(new Date(2026, 10, 1, 23, 59), new Date(2026, 10, 2, 0, 1))).toBe(1)
  })

  it('is negative when b comes first', () => {
    expect(calendarDaysBetween(new Date(2026, 10, 5), new Date(2026, 10, 1))).toBe(-4)
  })
})

describe('getWeekNumber', () => {
  const start = '2026-10-12' // a Monday

  it('is week 1 on the start day, from local midnight', () => {
    expect(getWeekNumber(start, 11, new Date(2026, 9, 12, 0, 15))).toBe(1)
  })

  it('is still week 1 on the first Sunday', () => {
    expect(getWeekNumber(start, 11, new Date(2026, 9, 18, 23, 0))).toBe(1)
  })

  it('turns to week 2 on the next Monday', () => {
    expect(getWeekNumber(start, 11, new Date(2026, 9, 19, 0, 15))).toBe(2)
  })

  it('stays on the right week after the October DST change', () => {
    expect(getWeekNumber(start, 11, new Date(2026, 10, 2, 0, 15))).toBe(4)
  })

  it('is capped at the program length', () => {
    expect(getWeekNumber(start, 4, new Date(2027, 0, 1))).toBe(4)
  })

  it('is below 1 before the start (callers clamp it)', () => {
    expect(getWeekNumber(start, 11, new Date(2026, 9, 11))).toBeLessThan(1)
  })
})

describe('formatSeconds', () => {
  it.each([
    [0, '0s'],
    [45, '45s'],
    [60, '1:00'],
    [125, '2:05'],
  ])('%i → %s', (secs, label) => {
    expect(formatSeconds(secs)).toBe(label)
  })
})
