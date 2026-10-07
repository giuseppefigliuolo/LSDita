import { useWorkoutStore } from '../store/useWorkoutStore'
import { useBenchmarkStore } from '../store/useBenchmarkStore'
import type { BenchmarkResults } from '../store/useBenchmarkStore'

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

/** Workout history + test results/bodyweight in a single JSON */
export function buildBackup(): string {
  const { results, bodyweightKg } = useBenchmarkStore.getState()
  return JSON.stringify(
    {
      ...JSON.parse(useWorkoutStore.getState().exportData()),
      benchmarks: { results, bodyweightKg }
    },
    null,
    2
  )
}

/**
 * Restores a backup. Test results are only replaced when the file contains
 * them, so backups made before the tests existed don't wipe the current CR.
 */
export function restoreBackup(json: string): void {
  useWorkoutStore.getState().importData(json)

  let data: unknown
  try {
    data = JSON.parse(json)
  } catch {
    return
  }
  if (!isObject(data) || !isObject(data.benchmarks)) return

  const { results, bodyweightKg } = data.benchmarks
  useBenchmarkStore.setState({
    results: sanitizeResults(results),
    bodyweightKg:
      typeof bodyweightKg === 'number' && Number.isFinite(bodyweightKg)
        ? bodyweightKg
        : null
  })
}
