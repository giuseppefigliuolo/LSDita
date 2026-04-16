import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CompletedWorkout, ExerciseNote, WorkoutNote } from '../types'

interface WorkoutStore {
  programStartDate: string | null
  completedWorkouts: CompletedWorkout[]
  notes: WorkoutNote[]
  exerciseNotes: ExerciseNote[]

  setProgramStartDate: (date: string) => void
  markComplete: (workout: CompletedWorkout) => void
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
  exportData: () => string
  importData: (json: string) => void
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

      getCompletedCount: () => get().completedWorkouts.length,

      getStreak: () => {
        const workouts = get().completedWorkouts
        if (workouts.length === 0) return 0

        const dates = [...new Set(workouts.map((w) => w.date))].sort().reverse()
        const today = new Date().toISOString().split('T')[0]
        const yesterday = new Date(Date.now() - 86400000)
          .toISOString()
          .split('T')[0]

        if (dates[0] !== today && dates[0] !== yesterday) return 0

        let streak = 1
        for (let i = 1; i < dates.length; i++) {
          const prev = new Date(dates[i - 1])
          const curr = new Date(dates[i])
          const diff = (prev.getTime() - curr.getTime()) / 86400000
          if (diff <= 2) streak++
          else break
        }
        return streak
      },

      exportData: () => {
        const { programStartDate, completedWorkouts, notes, exerciseNotes } = get()
        return JSON.stringify(
          { programStartDate, completedWorkouts, notes, exerciseNotes },
          null,
          2
        )
      },

      importData: (json) => {
        try {
          const data = JSON.parse(json)
          set({
            programStartDate: data.programStartDate ?? null,
            completedWorkouts: data.completedWorkouts ?? [],
            notes: data.notes ?? [],
            exerciseNotes: data.exerciseNotes ?? []
          })
        } catch {
          console.error('Invalid import data')
        }
      },

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
