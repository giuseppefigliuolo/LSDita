import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { computeStreak } from '../utils/streak'
import type { CompletedWorkout, ExerciseNote, WorkoutNote } from '../types'

interface WorkoutStore {
  programStartDate: string | null
  completedWorkouts: CompletedWorkout[]
  notes: WorkoutNote[]
  exerciseNotes: ExerciseNote[]

  setProgramStartDate: (date: string) => void
  markComplete: (workout: CompletedWorkout) => void
  upsertWorkout: (workout: CompletedWorkout) => void
  addNote: (note: WorkoutNote) => void
  addExerciseNote: (note: ExerciseNote) => void
  updateExerciseNote: (id: string, text: string) => void
  deleteExerciseNote: (id: string) => void
  getExerciseNotes: (exerciseId: string) => ExerciseNote[]
  isWorkoutCompleted: (
    weekNumber: number,
    dayOfWeek: string,
    date: string
  ) => boolean
  getCompletedCount: () => number
  getStreak: () => number
  resetAll: () => void
}

export const useWorkoutStore = create<WorkoutStore>()(
  persist(
    (set, get) => ({
      programStartDate: null,
      completedWorkouts: [],
      notes: [],
      exerciseNotes: [],

      setProgramStartDate: (date) => set({ programStartDate: date }),

      markComplete: (workout) =>
        set((state) => ({
          completedWorkouts: [...state.completedWorkouts, workout]
        })),

      upsertWorkout: (workout) =>
        set((state) => {
          const exists = state.completedWorkouts.some((w) => w.id === workout.id)
          return {
            completedWorkouts: exists
              ? state.completedWorkouts.map((w) =>
                  w.id === workout.id ? workout : w
                )
              : [...state.completedWorkouts, workout]
          }
        }),

      addNote: (note) =>
        set((state) => ({
          notes: [...state.notes, note]
        })),

      addExerciseNote: (note) =>
        set((state) => ({
          exerciseNotes: [...state.exerciseNotes, note]
        })),

      updateExerciseNote: (id, text) =>
        set((state) => ({
          exerciseNotes: state.exerciseNotes.map((n) =>
            n.id === id ? { ...n, text } : n
          )
        })),

      deleteExerciseNote: (id) =>
        set((state) => ({
          exerciseNotes: state.exerciseNotes.filter((n) => n.id !== id)
        })),

      getExerciseNotes: (exerciseId) =>
        get()
          .exerciseNotes.filter((n) => n.exerciseId === exerciseId)
          .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),

      isWorkoutCompleted: (weekNumber, dayOfWeek, date) => {
        return get().completedWorkouts.some(
          (w) =>
            w.weekNumber === weekNumber &&
            w.date === date &&
            w.dayType === (dayOfWeek as CompletedWorkout['dayType'])
        )
      },

      getCompletedCount: () =>
        get().completedWorkouts.filter((w) => !w.partial).length,

      getStreak: () => computeStreak(get().completedWorkouts.map((w) => w.date)),

      resetAll: () =>
        set({
          programStartDate: null,
          completedWorkouts: [],
          notes: [],
          exerciseNotes: []
        })
    }),
    {
      name: 'LSDita-workout-store'
    }
  )
)
