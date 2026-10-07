import type {
  BenchmarkConfig,
  BenchmarkPhase,
  Exercise,
  ExerciseLoad,
  TrainingProgram,
} from '../types'
import type { BenchmarkResults } from '../store/useBenchmarkStore'

export function parseNumber(raw: string | undefined): number | null {
  if (!raw) return null
  const n = Number(raw.replace(',', '.').trim())
  return Number.isFinite(n) && n > 0 ? n : null
}

/** Italian decimal format, at most one decimal: 57.5 → "57,5", 66 → "66" */
export function formatKg(n: number): string {
  return (Math.round(n * 10) / 10).toString().replace('.', ',')
}

export function roundToHalf(n: number): number {
  return Math.round(n * 2) / 2
}

/** Stored value when the user has touched the field, otherwise the program's pre-filled one */
export function getResult(
  config: BenchmarkConfig,
  results: BenchmarkResults,
  programId: string,
  phaseId: string,
  testId: string,
): string {
  const stored = results[programId]?.[phaseId]
  if (stored && testId in stored) return stored[testId]
  return config.tests.find((t) => t.id === testId)?.initial?.[phaseId] ?? ''
}

/** Most recent phase with a numeric result for the test */
export function getLatestResult(
  config: BenchmarkConfig,
  results: BenchmarkResults,
  programId: string,
  testId: string,
): { value: number; phase: BenchmarkPhase } | null {
  for (let i = config.phases.length - 1; i >= 0; i--) {
    const phase = config.phases[i]
    const value = parseNumber(getResult(config, results, programId, phase.id, testId))
    if (value != null) return { value, phase }
  }
  return null
}

export interface ResolvedLoad {
  testLabel: string
  percent: number
  reference: number | null
  total: number | null
  /** bodyweight − total: positive = weight to take off, negative = weight to add */
  offload: number | null
}

export function resolveLoad(
  load: ExerciseLoad,
  config: BenchmarkConfig,
  results: BenchmarkResults,
  programId: string,
  bodyweight: number,
): ResolvedLoad {
  const test = config.tests.find((t) => t.id === load.test)
  const latest = getLatestResult(config, results, programId, load.test)
  const total = latest ? roundToHalf((latest.value * load.percent) / 100) : null
  return {
    testLabel: test?.label ?? load.test,
    percent: load.percent,
    reference: latest?.value ?? null,
    total,
    offload: total != null ? roundToHalf(bodyweight - total) : null,
  }
}

export function describeOffload(offload: number): string {
  if (offload > 0) return `togli ${formatKg(offload)} kg`
  if (offload < 0) return `zavorra +${formatKg(-offload)} kg`
  return 'peso corporeo'
}

export function formatResolvedLoad(r: ResolvedLoad): string {
  if (r.total == null || r.offload == null) {
    return `${r.percent}% del CR · inserisci il CR nei Test`
  }
  return `${formatKg(r.total)} kg tot · ${describeOffload(r.offload)}`
}

export function getBodyweight(config: BenchmarkConfig, stored: number | null): number {
  return stored ?? config.bodyweightKg
}

/** Fills `weight` of exercises that declare a `load`, using the current benchmark results */
export function resolveProgramLoads(
  programId: string,
  program: TrainingProgram,
  results: BenchmarkResults,
  storedBodyweight: number | null,
): TrainingProgram {
  const config = program.benchmarks
  if (!config) return program
  const bodyweight = getBodyweight(config, storedBodyweight)

  const resolveExercise = (ex: Exercise): Exercise =>
    ex.load
      ? {
          ...ex,
          weight: formatResolvedLoad(
            resolveLoad(ex.load, config, results, programId, bodyweight),
          ),
        }
      : ex

  return {
    ...program,
    weeks: program.weeks.map((week) => ({
      ...week,
      days: week.days.map((day) =>
        day.exercises.some((ex) => ex.load)
          ? { ...day, exercises: day.exercises.map(resolveExercise) }
          : day,
      ),
    })),
  }
}

/** Distinct loads of the exercises in a list, in order of appearance */
export function getDistinctLoads(exercises: Exercise[]): ExerciseLoad[] {
  const seen = new Set<string>()
  const loads: ExerciseLoad[] = []
  for (const ex of exercises) {
    if (!ex.load) continue
    const key = `${ex.load.test}:${ex.load.percent}`
    if (seen.has(key)) continue
    seen.add(key)
    loads.push(ex.load)
  }
  return loads
}
