import type {
  DayType,
  Equipment,
  Exercise,
  ExerciseType,
  GripType,
  TrainingProgram,
} from '../types'

const EQUIPMENT_VALUES: Equipment[] = [
  'hangboard',
  'wooden_balls',
  'pull_up_bar',
  'dumbbells',
  'fitness_band',
  'yoga_mat',
  'bodyweight',
]

const EXERCISE_TYPE_VALUES: ExerciseType[] = [
  'timed_hang',
  'timed_hold',
  'repeaters',
  'reps',
  'timed_stretch',
]

const DAY_TYPE_VALUES: DayType[] = [
  'finger_strength',
  'pull_strength',
  'power_endurance',
  'mobility',
  'rest',
  'climbing_gym',
]

const GRIP_VALUES: GripType[] = [
  'half_crimp',
  'open_hand',
  'full_crimp',
  'three_finger_drag',
  'pinch',
  'sloper',
  'mixed',
]

export type ValidationResult =
  | { ok: true; program: TrainingProgram }
  | { ok: false; error: string }

export function validateProgramJson(raw: string): ValidationResult {
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return { ok: false, error: 'JSON non valido: impossibile leggere il file.' }
  }
  return validateProgram(parsed)
}

export function validateProgram(data: unknown): ValidationResult {
  if (!isObject(data)) {
    return { ok: false, error: 'Il file non contiene un oggetto JSON.' }
  }

  const stringErr =
    expectString(data, 'id') ||
    expectString(data, 'name') ||
    expectString(data, 'description')
  if (stringErr) return fail(stringErr)

  if (typeof data.durationWeeks !== 'number' || data.durationWeeks <= 0) {
    return fail('Campo "durationWeeks" deve essere un numero positivo.')
  }

  if (!Array.isArray(data.weeks) || data.weeks.length === 0) {
    return fail('Campo "weeks" deve essere un array non vuoto.')
  }

  if (data.weeks.length !== data.durationWeeks) {
    return fail(
      `Incoerenza: "durationWeeks" è ${data.durationWeeks} ma ci sono ${data.weeks.length} settimane.`
    )
  }

  for (let i = 0; i < data.weeks.length; i++) {
    const err = validateWeek(data.weeks[i], i)
    if (err) return fail(err)
  }

  return { ok: true, program: data as unknown as TrainingProgram }
}

function validateWeek(week: unknown, index: number): string | null {
  const ctx = `weeks[${index}]`
  if (!isObject(week)) return `${ctx} non è un oggetto.`

  if (typeof week.weekNumber !== 'number') {
    return `${ctx}.weekNumber deve essere un numero.`
  }
  const s =
    expectString(week, 'theme', ctx) || expectString(week, 'description', ctx)
  if (s) return s
  if (typeof week.volumeMultiplier !== 'number') {
    return `${ctx}.volumeMultiplier deve essere un numero.`
  }
  if (!Array.isArray(week.days)) {
    return `${ctx}.days deve essere un array.`
  }
  for (let i = 0; i < week.days.length; i++) {
    const err = validateDay(week.days[i], `${ctx}.days[${i}]`)
    if (err) return err
  }
  return null
}

function validateDay(day: unknown, ctx: string): string | null {
  if (!isObject(day)) return `${ctx} non è un oggetto.`

  const s =
    expectString(day, 'dayOfWeek', ctx) ||
    expectString(day, 'title', ctx) ||
    expectString(day, 'icon', ctx) ||
    expectString(day, 'description', ctx)
  if (s) return s

  if (!isOneOf(day.type, DAY_TYPE_VALUES)) {
    return `${ctx}.type "${String(day.type)}" non valido. Valori ammessi: ${DAY_TYPE_VALUES.join(', ')}.`
  }

  if (!Array.isArray(day.exercises)) {
    return `${ctx}.exercises deve essere un array.`
  }

  for (let i = 0; i < day.exercises.length; i++) {
    const err = validateExercise(day.exercises[i], `${ctx}.exercises[${i}]`)
    if (err) return err
  }
  return null
}

function validateExercise(ex: unknown, ctx: string): string | null {
  if (!isObject(ex)) return `${ctx} non è un oggetto.`

  const s =
    expectString(ex, 'id', ctx) ||
    expectString(ex, 'name', ctx) ||
    expectString(ex, 'description', ctx) ||
    expectString(ex, 'illustration', ctx)
  if (s) return s

  if (!isOneOf(ex.equipment, EQUIPMENT_VALUES)) {
    return `${ctx}.equipment "${String(ex.equipment)}" non valido. Valori ammessi: ${EQUIPMENT_VALUES.join(', ')}.`
  }

  if (!isOneOf(ex.type, EXERCISE_TYPE_VALUES)) {
    return `${ctx}.type "${String(ex.type)}" non valido. Valori ammessi: ${EXERCISE_TYPE_VALUES.join(', ')}.`
  }

  if (ex.grip !== undefined && !isOneOf(ex.grip, GRIP_VALUES)) {
    return `${ctx}.grip "${String(ex.grip)}" non valido. Valori ammessi: ${GRIP_VALUES.join(', ')}.`
  }

  const numFields: (keyof Exercise)[] = [
    'sets',
    'repsPerSet',
    'hangTime',
    'restBetweenReps',
    'restBetweenSets',
  ]
  for (const key of numFields) {
    if (typeof ex[key] !== 'number') {
      return `${ctx}.${key} deve essere un numero.`
    }
  }

  if (ex.weight !== undefined && typeof ex.weight !== 'string') {
    return `${ctx}.weight deve essere una stringa.`
  }
  if (ex.notes !== undefined && typeof ex.notes !== 'string') {
    return `${ctx}.notes deve essere una stringa.`
  }
  return null
}

function expectString(
  obj: Record<string, unknown>,
  key: string,
  ctx?: string
): string | null {
  if (typeof obj[key] !== 'string' || obj[key] === '') {
    return `${ctx ? ctx + '.' : ''}${key} deve essere una stringa non vuota.`
  }
  return null
}

function isObject(x: unknown): x is Record<string, unknown> {
  return typeof x === 'object' && x !== null && !Array.isArray(x)
}

function isOneOf<T extends string>(value: unknown, allowed: T[]): value is T {
  return typeof value === 'string' && (allowed as string[]).includes(value)
}

function fail(error: string): ValidationResult {
  return { ok: false, error }
}
