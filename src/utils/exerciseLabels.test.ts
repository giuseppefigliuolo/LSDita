import { describe, expect, it } from 'vitest'
import type { Exercise } from '../types'
import { getExerciseTechLine, getExerciseVolume, getGripLabel } from './exerciseLabels'

const ex = (extra: Partial<Exercise>): Exercise => ({
  id: 'x',
  name: '',
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

describe('getExerciseTechLine', () => {
  it('joins grip, load and hang time', () => {
    expect(getExerciseTechLine(ex({ grip: 'half_crimp', weight: '60 kg tot · togli 8 kg' }))).toBe(
      'Semi-arcuata · 60 kg tot · togli 8 kg · 10s',
    )
  })

  it('shows on/off for repeaters', () => {
    expect(getExerciseTechLine(ex({ type: 'repeaters', hangTime: 7, restBetweenReps: 3 }))).toBe('7s on / 3s off')
  })

  it('hides "corpo libero" and falls back to the equipment for reps', () => {
    expect(getExerciseTechLine(ex({ type: 'reps', equipment: 'pull_up_bar', weight: 'corpo libero' }))).toBe('Sbarra')
  })
})

describe('getExerciseVolume', () => {
  it('counts reps for rep-based work and seconds for timed work', () => {
    expect(getExerciseVolume(ex({ type: 'reps', repsPerSet: 8 }))).toBe('3×8')
    expect(getExerciseVolume(ex({ type: 'repeaters', repsPerSet: 6 }))).toBe('3×6')
    expect(getExerciseVolume(ex({ hangTime: 30 }))).toBe('3×30s')
  })
})

describe('getGripLabel', () => {
  it('passes unknown values through', () => {
    expect(getGripLabel('crimpy')).toBe('crimpy')
  })
})
