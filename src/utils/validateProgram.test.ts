import { describe, expect, it } from 'vitest'
import homeProgram from '../data/training-program.json'
import travelProgram from '../data/training-program-travel.json'
import hypertrophyProgram from '../data/training-program-hypertrophy.json'
import girlWorkoutProgram from '../data/training-program-girlfriend.json'
import leadAutumnProgram from '../data/training-program-lead-autumn-2026.json'
import margheritaProgram from '../data/training-program-margherita.json'
import { validateDay, validateProgram, validateProgramJson } from './validateProgram'

const builtIn = {
  home: homeProgram,
  travel: travelProgram,
  hypertrophy: hypertrophyProgram,
  girl_workout: girlWorkoutProgram,
  lead_autumn_2026: leadAutumnProgram,
  margherita: margheritaProgram,
}

const clone = <T>(x: T): T => structuredClone(x)

describe('built-in programs', () => {
  it.each(Object.entries(builtIn))('%s is valid', (_, program) => {
    const result = validateProgram(program)
    expect(result.ok ? null : result.error).toBeNull()
  })

  it.each(Object.entries(builtIn))('%s has unique exercise ids within each day', (_, program) => {
    for (const week of program.weeks) {
      for (const day of week.days) {
        const ids = day.exercises.map((e) => e.id)
        expect(new Set(ids).size, `week ${week.weekNumber} ${day.dayOfWeek}`).toBe(ids.length)
      }
    }
  })

  it.each(Object.entries(builtIn))('%s has unique days within each week', (_, program) => {
    for (const week of program.weeks) {
      const days = week.days.map((d) => d.dayOfWeek)
      expect(new Set(days).size, `week ${week.weekNumber}`).toBe(days.length)
    }
  })

  it('lead program loads only reference existing tests', () => {
    const testIds = new Set(leadAutumnProgram.benchmarks.tests.map((t) => t.id))
    for (const week of leadAutumnProgram.weeks) {
      for (const day of week.days) {
        for (const ex of day.exercises as { load?: { test: string } }[]) {
          if (ex.load) expect(testIds).toContain(ex.load.test)
        }
      }
    }
  })
})

describe('validateProgramJson', () => {
  it('rejects unreadable JSON', () => {
    expect(validateProgramJson('{nope')).toEqual({
      ok: false,
      error: 'JSON non valido: impossibile leggere il file.',
    })
  })

  it('rejects a non-object', () => {
    expect(validateProgramJson('[]').ok).toBe(false)
  })
})

describe('validateProgram errors point at the field', () => {
  it('missing name', () => {
    const p = clone(homeProgram) as Record<string, unknown>
    delete p.name
    expect(validateProgram(p)).toEqual({ ok: false, error: 'name deve essere una stringa non vuota.' })
  })

  it('durationWeeks out of sync with weeks', () => {
    const p = clone(homeProgram)
    p.durationWeeks = p.weeks.length + 1
    const result = validateProgram(p)
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error).toMatch(/^Incoerenza/)
  })

  it('unknown day type', () => {
    const p = clone(homeProgram)
    ;(p.weeks[0].days[0] as { type: string }).type = 'yoga'
    const result = validateProgram(p)
    if (result.ok) throw new Error('expected an error')
    expect(result.error).toMatch(/^weeks\[0\]\.days\[0\]\.type "yoga" non valido/)
  })

  it('non-numeric sets', () => {
    const p = clone(homeProgram)
    const day = p.weeks[1].days.find((d) => d.exercises.length > 0)!
    ;(day.exercises[0] as { sets: unknown }).sets = '3'
    const result = validateProgram(p)
    if (result.ok) throw new Error('expected an error')
    expect(result.error).toMatch(/\.exercises\[0\]\.sets deve essere un numero\.$/)
  })

  it('invalid side', () => {
    const p = clone(homeProgram)
    const day = p.weeks[0].days.find((d) => d.exercises.length > 0)!
    ;(day.exercises[0] as { side?: string }).side = 'both'
    expect(validateProgram(p).ok).toBe(false)
  })
})

describe('validateDay', () => {
  it('accepts a real session', () => {
    expect(validateDay(homeProgram.weeks[0].days[0])).toBeNull()
  })

  it('reports the first error with the default context', () => {
    expect(validateDay({ dayOfWeek: 'monday' })).toBe('day.title deve essere una stringa non vuota.')
  })
})
