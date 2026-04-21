export type GripType = 'half_crimp' | 'open_hand' | 'full_crimp' | 'three_finger_drag' | 'pinch' | 'sloper' | 'mixed'

export type Equipment = 'hangboard' | 'wooden_balls' | 'pull_up_bar' | 'dumbbells' | 'fitness_band' | 'yoga_mat' | 'bodyweight'

export type ExerciseType = 'timed_hang' | 'timed_hold' | 'repeaters' | 'reps' | 'timed_stretch'

export type DayType = 'finger_strength' | 'pull_strength' | 'power_endurance' | 'general_strength' | 'mobility' | 'rest' | 'climbing_gym'

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
}

export interface TrainingDay {
  dayOfWeek: string
  type: DayType
  title: string
  icon: string
  description: string
  exercises: Exercise[]
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

export type ProgramId = 'home' | 'travel' | 'girl_workout' | 'custom'

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
