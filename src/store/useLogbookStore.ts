import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Climb } from '../types'

interface LogbookStore {
  climbs: Climb[]
  addClimb: (climb: Climb) => void
  updateClimb: (id: string, patch: Partial<Climb>) => void
  deleteClimb: (id: string) => void
}

export const useLogbookStore = create<LogbookStore>()(
  persist(
    (set) => ({
      climbs: [],
      addClimb: (climb) => set((s) => ({ climbs: [...s.climbs, climb] })),
      updateClimb: (id, patch) =>
        set((s) => ({
          climbs: s.climbs.map((c) => (c.id === id ? { ...c, ...patch } : c)),
        })),
      deleteClimb: (id) =>
        set((s) => ({ climbs: s.climbs.filter((c) => c.id !== id) })),
    }),
    { name: 'LSDita-logbook' },
  ),
)
