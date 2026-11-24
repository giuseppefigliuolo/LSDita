import { describe, expect, it } from 'vitest'
import type { BenchmarkConfig, Exercise, TrainingProgram } from '../types'
import type { BenchmarkResults } from '../store/useBenchmarkStore'
import {
  describeOffload,
  formatKg,
  formatResolvedLoad,
  getDistinctLoads,
  getLatestResult,
  getResult,
  parseNumber,
  resolveLoad,
  resolveProgramLoads,
  roundToHalf,
} from './benchmarks'

const config: BenchmarkConfig = {
  description: '',
  bodyweightKg: 68,
  phases: [
    { id: 'pre', label: 'Pre', dates: '', weekNumber: 1 },
    { id: 'mid', label: 'Mid', dates: '', weekNumber: 6 },
    { id: 'post', label: 'Post', dates: '', weekNumber: 11 },
  ],
  tests: [
    { id: 'cr', label: 'CR 20 mm', unit: 'kg', howTo: '', initial: { pre: '80' } },
    { id: 'notes', label: 'Note', howTo: '' },
  ],
}

describe('parseNumber', () => {
  it.each([
    ['80', 80],
    ['82,5', 82.5],
    [' 82.5 ', 82.5],
  ])('%j → %d', (raw, n) => {
    expect(parseNumber(raw)).toBe(n)
  })

  it.each([undefined, '', 'abc', '0', '-3'])('%j → null', (raw) => {
    expect(parseNumber(raw)).toBeNull()
  })
})

describe('formatKg / roundToHalf', () => {
  it('uses the Italian decimal comma, one decimal at most', () => {
    expect(formatKg(57.5)).toBe('57,5')
    expect(formatKg(66)).toBe('66')
    expect(formatKg(57.46)).toBe('57,5')
  })

  it('rounds to the nearest half kilo', () => {
    expect(roundToHalf(57.2)).toBe(57)
    expect(roundToHalf(57.3)).toBe(57.5)
    expect(roundToHalf(57.8)).toBe(58)
  })
})

describe('getResult / getLatestResult', () => {
  it('falls back to the pre-filled value', () => {
    expect(getResult(config, {}, 'lead', 'pre', 'cr')).toBe('80')
  })

  it('prefers the stored value, even when emptied by the user', () => {
    const results: BenchmarkResults = { lead: { pre: { cr: '' } } }
    expect(getResult(config, results, 'lead', 'pre', 'cr')).toBe('')
  })

  it('returns the most recent phase with a number', () => {
    const results: BenchmarkResults = { lead: { mid: { cr: '84' }, post: { cr: 'n/d' } } }
    expect(getLatestResult(config, results, 'lead', 'cr')).toMatchObject({
      value: 84,
      phase: { id: 'mid' },
    })
  })

  it('is null without any numeric result', () => {
    expect(getLatestResult(config, {}, 'lead', 'notes')).toBeNull()
  })

  it('keeps programs separate', () => {
    const results: BenchmarkResults = { other: { mid: { cr: '99' } } }
    expect(getLatestResult(config, results, 'lead', 'cr')?.value).toBe(80)
  })
})

describe('resolveLoad', () => {
  it('computes total and offload from the latest CR', () => {
    const r = resolveLoad({ test: 'cr', percent: 75 }, config, {}, 'lead', 68)
    expect(r).toEqual({ testLabel: 'CR 20 mm', percent: 75, reference: 80, total: 60, offload: 8 })
    expect(formatResolvedLoad(r)).toBe('60 kg tot · togli 8 kg')
  })

  it('asks for extra weight when the load exceeds bodyweight', () => {
    const r = resolveLoad({ test: 'cr', percent: 100 }, config, {}, 'lead', 68)
    expect(r.offload).toBe(-12)
    expect(formatResolvedLoad(r)).toBe('80 kg tot · zavorra +12 kg')
  })

  it('explains what is missing without a CR', () => {
    const r = resolveLoad({ test: 'notes', percent: 70 }, config, {}, 'lead', 68)
    expect(r.total).toBeNull()
    expect(formatResolvedLoad(r)).toBe('70% del CR · inserisci il CR nei Test')
  })

  it('describes a bodyweight hang', () => {
    expect(describeOffload(0)).toBe('peso corporeo')
  })
})

const exercise = (id: string, extra: Partial<Exercise> = {}): Exercise => ({
  id,
  name: id,
  description: '',
  equipment: 'hangboard',
  type: 'timed_hang',
  illustration: '',
  sets: 3,
  repsPerSet: 1,
  hangTime: 10,
  restBetweenReps: 0,
  restBetweenSets: 120,
  ...extra,
})

describe('resolveProgramLoads', () => {
  const program: TrainingProgram = {
    id: 'lead',
    name: '',
    description: '',
    durationWeeks: 1,
    benchmarks: config,
    weeks: [
      {
        weekNumber: 1,
        theme: '',
        description: '',
        volumeMultiplier: 1,
        days: [
          {
            dayOfWeek: 'monday',
            type: 'finger_strength',
            title: '',
            icon: '',
            description: '',
            exercises: [exercise('max', { load: { test: 'cr', percent: 75 } }), exercise('plain')],
          },
        ],
      },
    ],
  }

  it('fills weight on loaded exercises only, using the stored bodyweight', () => {
    const resolved = resolveProgramLoads('lead', program, {}, 70)
    const [loaded, plain] = resolved.weeks[0].days[0].exercises
    expect(loaded.weight).toBe('60 kg tot · togli 10 kg')
    expect(plain.weight).toBeUndefined()
  })

  it('does not mutate the source program', () => {
    resolveProgramLoads('lead', program, {}, null)
    expect(program.weeks[0].days[0].exercises[0].weight).toBeUndefined()
  })

  it('returns programs without benchmarks untouched', () => {
    const plain = { ...program, benchmarks: undefined }
    expect(resolveProgramLoads('lead', plain, {}, null)).toBe(plain)
  })
})

describe('getDistinctLoads', () => {
  it('dedupes by test and percent, keeping order', () => {
    const loads = getDistinctLoads([
      exercise('a', { load: { test: 'cr', percent: 80 } }),
      exercise('b'),
      exercise('c', { load: { test: 'cr', percent: 70 } }),
      exercise('d', { load: { test: 'cr', percent: 80 } }),
    ])
    expect(loads).toEqual([
      { test: 'cr', percent: 80 },
      { test: 'cr', percent: 70 },
    ])
  })
})
