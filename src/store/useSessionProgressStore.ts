import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ExerciseOverride } from '../components/timer/useWorkoutFlow'

/**
 * Where an interrupted session left off. Always points at the start of a set:
 * a set cut short is redone from its first rep on resume.
 */
export interface SessionSnapshot {
  /** Exercise ids at save time; a snapshot for an edited day is discarded. */
  exerciseIds: string[]
  exerciseIndex: number
  currentSet: number
  overrides: Record<number, ExerciseOverride>
  skippedExercises: string[]
  completedExercises: number
  elapsedSeconds: number
  /** Identity of the run, so the resumed session updates the same record. */
  startedAt: number
  dateStr: string
  updatedAt: string
}

interface SessionProgressStore {
  sessions: Record<string, SessionSnapshot>
  saveSession: (key: string, snapshot: SessionSnapshot) => void
  clearSession: (key: string) => void
}

export const useSessionProgressStore = create<SessionProgressStore>()(
  persist(
    (set) => ({
      sessions: {},

      saveSession: (key, snapshot) =>
        set((state) => ({ sessions: { ...state.sessions, [key]: snapshot } })),

      clearSession: (key) =>
        set((state) => {
          if (!(key in state.sessions)) return state
          const sessions = { ...state.sessions }
          delete sessions[key]
          return { sessions }
        })
    }),
    {
      name: 'LSDita-session-progress'
    }
  )
)

/** Returns the snapshot only if it still matches the day's exercises. */
export function resumableSession(
  snapshot: SessionSnapshot | undefined,
  exerciseIds: string[]
): SessionSnapshot | null {
  if (!snapshot) return null
  const matches =
    snapshot.exerciseIds.length === exerciseIds.length &&
    snapshot.exerciseIds.every((id, i) => id === exerciseIds[i]) &&
    snapshot.exerciseIndex < exerciseIds.length
  return matches ? snapshot : null
}
