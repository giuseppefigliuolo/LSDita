import { beforeEach, describe, expect, it } from 'vitest'
import { useWorkoutStore } from '../store/useWorkoutStore'
import { useBenchmarkStore } from '../store/useBenchmarkStore'
import { useLogbookStore } from '../store/useLogbookStore'
import { useSettingsStore } from '../store/useSettingsStore'
import homeProgram from '../data/training-program.json'
import type { Climb, CompletedWorkout, TrainingDay, TrainingProgram } from '../types'
import { buildBackup, restoreBackup } from './backup'

const workout: CompletedWorkout = {
  id: 'w1',
  date: '2026-11-24',
  weekNumber: 7,
  dayType: 'finger_strength',
  dayTitle: 'Max hangs',
  completedAt: '2026-11-24T18:00:00.000Z',
  durationSeconds: 1800,
  exercisesCompleted: 4,
  exercisesTotal: 4,
  skippedExercises: [],
}

const climb: Climb = {
  id: 'c1',
  date: '2026-11-22',
  name: 'Via del Sole',
  grade: '6b',
  style: 'sport',
  ascentType: 'redpoint',
  location: 'Ferentillo',
  rating: 4,
}

const editedDay = homeProgram.weeks[0].days[0] as unknown as TrainingDay
const customProgram = { ...homeProgram, name: 'Mio' } as unknown as TrainingProgram

function seed() {
  useWorkoutStore.setState({
    programStartDate: '2026-10-12',
    completedWorkouts: [workout],
    notes: [{ id: 'n1', workoutId: 'w1', date: '2026-11-24', text: 'ok', feeling: 4 }],
    exerciseNotes: [],
  })
  useBenchmarkStore.setState({ results: { lead_autumn_2026: { mid: { cr: '84' } } }, bodyweightKg: 67 })
  useLogbookStore.setState({ climbs: [climb] })
  useSettingsStore.setState({
    customProgram,
    dayOverrides: { 'home:1:monday': editedDay },
  })
}

function wipe() {
  useWorkoutStore.getState().resetAll()
  useBenchmarkStore.setState({ results: {}, bodyweightKg: null })
  useLogbookStore.setState({ climbs: [] })
  useSettingsStore.setState({ customProgram: null, dayOverrides: {}, selectedProgram: 'lead_autumn_2026' })
}

beforeEach(() => {
  wipe()
  seed()
})

describe('backup round trip', () => {
  it('restores everything the user created', () => {
    const backup = buildBackup()
    wipe()

    expect(restoreBackup(backup)).toEqual({ ok: true })

    expect(useWorkoutStore.getState()).toMatchObject({
      programStartDate: '2026-10-12',
      completedWorkouts: [workout],
      notes: [{ id: 'n1' }],
    })
    expect(useBenchmarkStore.getState()).toMatchObject({
      results: { lead_autumn_2026: { mid: { cr: '84' } } },
      bodyweightKg: 67,
    })
    expect(useLogbookStore.getState().climbs).toEqual([climb])
    expect(useSettingsStore.getState().dayOverrides).toEqual({ 'home:1:monday': editedDay })
    expect(useSettingsStore.getState().customProgram?.name).toBe('Mio')
  })

  it('writes a version number', () => {
    expect(JSON.parse(buildBackup()).version).toBe(2)
  })
})

describe('restoreBackup refuses files that are not backups', () => {
  it.each([
    ['unreadable JSON', '{oops', 'Il file non è un JSON leggibile.'],
    ['a training program', JSON.stringify(homeProgram), 'Il file non è un backup di LSDita.'],
    ['an array', '[]', 'Il file non è un backup di LSDita.'],
  ])('%s', (_, json, error) => {
    expect(restoreBackup(json)).toEqual({ ok: false, error })
    expect(useWorkoutStore.getState().completedWorkouts).toEqual([workout])
    expect(useLogbookStore.getState().climbs).toEqual([climb])
  })
})

describe('older backups', () => {
  it('keep the sections they do not contain', () => {
    const v1 = JSON.stringify({ programStartDate: null, completedWorkouts: [], notes: [], exerciseNotes: [] })

    expect(restoreBackup(v1).ok).toBe(true)

    expect(useWorkoutStore.getState().completedWorkouts).toEqual([])
    expect(useBenchmarkStore.getState().bodyweightKg).toBe(67)
    expect(useLogbookStore.getState().climbs).toEqual([climb])
    expect(useSettingsStore.getState().customProgram?.name).toBe('Mio')
  })
})

describe('sanitizing', () => {
  it('drops malformed climbs, edited sessions and test values', () => {
    const backup = JSON.parse(buildBackup())
    backup.logbook.climbs.push({ name: 'no id' }, 'junk')
    backup.program.dayOverrides['home:1:tuesday'] = { dayOfWeek: 'tuesday' }
    backup.benchmarks.results.lead_autumn_2026.mid.max = 90
    wipe()

    restoreBackup(JSON.stringify(backup))

    expect(useLogbookStore.getState().climbs).toEqual([climb])
    expect(Object.keys(useSettingsStore.getState().dayOverrides)).toEqual(['home:1:monday'])
    expect(useBenchmarkStore.getState().results).toEqual({ lead_autumn_2026: { mid: { cr: '84' } } })
  })

  it('ignores an invalid custom program', () => {
    const backup = JSON.parse(buildBackup())
    backup.program.customProgram = { name: 'broken' }
    wipe()
    restoreBackup(JSON.stringify(backup))
    expect(useSettingsStore.getState().customProgram).toBeNull()
  })

  it('clears the custom program and leaves "custom" when the backup has none', () => {
    useSettingsStore.setState({ selectedProgram: 'custom' })
    const backup = JSON.parse(buildBackup())
    backup.program.customProgram = null
    restoreBackup(JSON.stringify(backup))
    expect(useSettingsStore.getState()).toMatchObject({
      customProgram: null,
      selectedProgram: 'lead_autumn_2026',
    })
  })
})
