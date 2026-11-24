import { describe, expect, it } from 'vitest'
import { computeStreak } from './streak'

const now = new Date(2026, 10, 24, 18, 0) // Tue 24 Nov 2026

describe('computeStreak', () => {
  it('is 0 without workouts', () => {
    expect(computeStreak([], now)).toBe(0)
  })

  it('counts a workout done today', () => {
    expect(computeStreak(['2026-11-24'], now)).toBe(1)
  })

  it('counts a workout done yesterday', () => {
    expect(computeStreak(['2026-11-23'], now)).toBe(1)
  })

  it('is 0 when the last workout is two days old', () => {
    expect(computeStreak(['2026-11-22'], now)).toBe(0)
  })

  it('tolerates one rest day between sessions', () => {
    expect(computeStreak(['2026-11-20', '2026-11-22', '2026-11-24'], now)).toBe(3)
  })

  it('breaks after two rest days', () => {
    expect(computeStreak(['2026-11-19', '2026-11-22', '2026-11-24'], now)).toBe(2)
  })

  it('counts several sessions on the same day once', () => {
    expect(computeStreak(['2026-11-24', '2026-11-24', '2026-11-23'], now)).toBe(2)
  })

  it('ignores input order', () => {
    expect(computeStreak(['2026-11-23', '2026-11-24', '2026-11-22'], now)).toBe(3)
  })

  it('treats yesterday by the local calendar just after midnight', () => {
    expect(computeStreak(['2026-11-23'], new Date(2026, 10, 24, 0, 30))).toBe(1)
  })
})
