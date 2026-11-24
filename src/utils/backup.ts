import { useWorkoutStore } from '../store/useWorkoutStore'
import { useBenchmarkStore } from '../store/useBenchmarkStore'
import { useLogbookStore } from '../store/useLogbookStore'
import { useSettingsStore } from '../store/useSettingsStore'
import type { BenchmarkResults } from '../store/useBenchmarkStore'
import type { Climb, TrainingDay, TrainingProgram } from '../types'
import { validateDay, validateProgram } from './validateProgram'

/** 2: adds logbook, edited sessions and the custom program */
const BACKUP_VERSION = 2

function isObject(x: unknown): x is Record<string, unknown> {
  return typeof x === 'object' && x !== null && !Array.isArray(x)
}

/** programId → phaseId → testId → string; anything else in the file is dropped */
function sanitizeResults(raw: unknown): BenchmarkResults {
  const out: BenchmarkResults = {}
  if (!isObject(raw)) return out
  for (const [programId, phases] of Object.entries(raw)) {
    if (!isObject(phases)) continue
    for (const [phaseId, tests] of Object.entries(phases)) {
      if (!isObject(tests)) continue
      for (const [testId, value] of Object.entries(tests)) {
        if (typeof value !== 'string') continue
        out[programId] ??= {}
        out[programId][phaseId] ??= {}
        out[programId][phaseId][testId] = value
      }
    }
  }
  return out
}

function sanitizeClimbs(raw: unknown[]): Climb[] {
  return raw.filter(
    (c): c is Climb => isObject(c) && typeof c.id === 'string' && typeof c.date === 'string',
  )
}

function sanitizeOverrides(raw: Record<string, unknown>): Record<string, TrainingDay> {
  const out: Record<string, TrainingDay> = {}
  for (const [key, day] of Object.entries(raw)) {
    if (validateDay(day) == null) out[key] = day as TrainingDay
  }
  return out
}

/** Everything the user created, in a single JSON */
export function buildBackup(): string {
  const { programStartDate, completedWorkouts, notes, exerciseNotes } =
    useWorkoutStore.getState()
  const { results, bodyweightKg } = useBenchmarkStore.getState()
  const { climbs } = useLogbookStore.getState()
  const { customProgram, dayOverrides } = useSettingsStore.getState()
  return JSON.stringify(
    {
      version: BACKUP_VERSION,
      programStartDate,
      completedWorkouts,
      notes,
      exerciseNotes,
      benchmarks: { results, bodyweightKg },
      logbook: { climbs },
      program: { customProgram, dayOverrides },
    },
    null,
    2,
  )
}

export type RestoreResult = { ok: true } | { ok: false; error: string }

/**
 * Restores a backup. Nothing is touched unless the file looks like a backup.
 * Sections added in later versions (tests, logbook, edited sessions) are only
 * replaced when the file contains them, so an old backup doesn't wipe them.
 */
export function restoreBackup(json: string): RestoreResult {
  let data: unknown
  try {
    data = JSON.parse(json)
  } catch {
    return { ok: false, error: 'Il file non è un JSON leggibile.' }
  }
  if (!isObject(data) || !Array.isArray(data.completedWorkouts)) {
    return { ok: false, error: 'Il file non è un backup di LSDita.' }
  }

  useWorkoutStore.setState({
    programStartDate: typeof data.programStartDate === 'string' ? data.programStartDate : null,
    completedWorkouts: data.completedWorkouts,
    notes: Array.isArray(data.notes) ? data.notes : [],
    exerciseNotes: Array.isArray(data.exerciseNotes) ? data.exerciseNotes : [],
  })

  if (isObject(data.benchmarks)) {
    const { results, bodyweightKg } = data.benchmarks
    useBenchmarkStore.setState({
      results: sanitizeResults(results),
      bodyweightKg:
        typeof bodyweightKg === 'number' && Number.isFinite(bodyweightKg) ? bodyweightKg : null,
    })
  }

  if (isObject(data.logbook) && Array.isArray(data.logbook.climbs)) {
    useLogbookStore.setState({ climbs: sanitizeClimbs(data.logbook.climbs) })
  }

  if (isObject(data.program)) {
    const { customProgram, dayOverrides } = data.program
    const settings = useSettingsStore.getState()
    if (isObject(dayOverrides)) {
      useSettingsStore.setState({ dayOverrides: sanitizeOverrides(dayOverrides) })
    }
    if (customProgram === null) {
      settings.setCustomProgram(null)
    } else if (customProgram !== undefined) {
      const result = validateProgram(customProgram)
      if (result.ok) settings.setCustomProgram(result.program as TrainingProgram)
    }
  }

  return { ok: true }
}
