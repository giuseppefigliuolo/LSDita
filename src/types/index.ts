export type GripType = 'half_crimp' | 'open_hand' | 'full_crimp' | 'three_finger_drag' | 'pinch' | 'sloper' | 'mixed'

export type Equipment = 'hangboard' | 'wooden_balls' | 'pull_up_bar' | 'dumbbells' | 'fitness_band' | 'yoga_mat' | 'bodyweight'

export type ExerciseType = 'timed_hang' | 'timed_hold' | 'repeaters' | 'reps' | 'timed_stretch'

export type DayType =
  | 'finger_strength'
  | 'pull_strength'
  | 'power_endurance'
  | 'general_strength'
  | 'mobility'
  | 'rest'
  | 'climbing_gym'
  | 'lead'
  | 'boulder'
  | 'antagonists'
  | 'test'

export type DayIntensity = 'alta' | 'media' | 'bassa'

export type WorkoutPhase = 'idle' | 'preview' | 'countdown' | 'hanging' | 'resting' | 'set_rest' | 'exercise_complete' | 'workout_complete' | 'paused'

export interface Exercise {
  id: string
  name: string
  description: string
  equipment: Equipment
  type: ExerciseType
  grip?: GripType
  illustration: string
  sets: number
  repsPerSet: number
  hangTime: number
  restBetweenReps: number
  restBetweenSets: number
  weight?: string
  notes?: string
  difficulty?: 'facile' | 'medio' | 'hard'
  /** Load derived from a benchmark (e.g. CR): resolved into `weight` at runtime */
  load?: ExerciseLoad
}

export interface ExerciseLoad {
  /** Id of the benchmark test the percentage refers to */
  test: string
  percent: number
}

/** Read-only block of instructions (parts of a session that aren't timer-driven) */
export interface GuideSection {
  title: string
  /** Short time hint, e.g. "60–80'" */
  duration?: string
  body?: string
  items?: string[]
  /** Rendered after the exercises list instead of before */
  afterExercises?: boolean
}

export interface TrainingDay {
  dayOfWeek: string
  /** Short session name (e.g. "S1"); replaces the positional "Sessione N" */
  label?: string
  /** Not tied to a weekday: `dayOfWeek` is just a route key (e.g. "casa-a") */
  anytime?: boolean
  type: DayType
  title: string
  icon: string
  description: string
  exercises: Exercise[]
  intensity?: DayIntensity
  /** Shown instead of the duration computed from the timed exercises */
  durationLabel?: string
  /** Heading of the exercises list (defaults to "Esercizi") */
  exercisesTitle?: string
  /** Short hint shown under the exercises heading */
  exercisesNote?: string
  /** When set, the day links to the program's warm-up with this hint */
  warmupNote?: string
  guide?: GuideSection[]
  /** The session includes benchmark tests: link to the results page */
  recordsTests?: boolean
}

export interface TrainingWeek {
  weekNumber: number
  theme: string
  description: string
  volumeMultiplier: number
  days: TrainingDay[]
}

export interface TrainingProgram {
  id: string
  name: string
  description: string
  durationWeeks: number
  weeks: TrainingWeek[]
  /** Fixed calendar start (ISO date of week 1's Monday); overrides the user's start date */
  startDate?: string
  warmup?: WarmupProtocol
  benchmarks?: BenchmarkConfig
}

export interface WarmupProtocol {
  title: string
  description: string
  sections: GuideSection[]
  /** Finger ramp as % of the day's load, computed from the week's loaded exercises */
  rampPercents?: number[]
}

export interface BenchmarkPhase {
  id: string
  label: string
  dates: string
  /** Program week in which the phase's tests are done */
  weekNumber: number
}

export interface BenchmarkTest {
  id: string
  label: string
  /** Unit shown next to numeric values; omit for free-text results */
  unit?: string
  howTo: string
  /** Show the value as % of bodyweight (reference loads) */
  percentOfBodyweight?: boolean
  /** Pre-filled results by phase id */
  initial?: Record<string, string>
}

export interface BenchmarkConfig {
  description: string
  bodyweightKg: number
  phases: BenchmarkPhase[]
  tests: BenchmarkTest[]
}

export interface CompletedWorkout {
  id: string
  date: string
  weekNumber: number
  dayType: DayType
  dayTitle: string
  completedAt: string
  durationSeconds: number
  exercisesCompleted: number
  exercisesTotal: number
  skippedExercises: string[]
}

export interface WorkoutNote {
  id: string
  workoutId: string
  date: string
  text: string
  feeling?: 1 | 2 | 3 | 4 | 5
}

export interface ExerciseNote {
  id: string
  exerciseId: string
  date: string
  createdAt: string
  text: string
}

export interface TimerState {
  phase: WorkoutPhase
  currentExerciseIndex: number
  currentSet: number
  currentRep: number
  timeRemaining: number
  totalTime: number
  isPaused: boolean
}

export type ProgramId = 'home' | 'travel' | 'hypertrophy' | 'girl_workout' | 'lead_autumn_2026' | 'custom'

export type ClimbStyle = 'boulder' | 'sport' | 'multipitch' | 'trad' | 'gym'
export type AscentType = 'onsight' | 'flash' | 'redpoint' | 'project'

export interface Climb {
  id: string
  date: string
  name: string
  grade: string
  style: ClimbStyle
  ascentType: AscentType
  attempts?: number
  location: string
  rating: 1 | 2 | 3 | 4 | 5
  notes?: string
}

export interface AppSettings {
  soundEnabled: boolean
  voiceEnabled: boolean
  vibrationEnabled: boolean
  volume: number
  selectedProgram: ProgramId
  countdownDuration: number
  currentWeek: number | null
  customProgram: TrainingProgram | null
  dayOverrides: Record<string, TrainingDay>
  lastBackupAt: string | null
}
