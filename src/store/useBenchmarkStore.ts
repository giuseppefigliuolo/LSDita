import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/** programId → phaseId → testId → raw value as typed by the user */
export type BenchmarkResults = Record<string, Record<string, Record<string, string>>>

interface BenchmarkStore {
  results: BenchmarkResults
  /** Bodyweight of the day; null falls back to the program default */
  bodyweightKg: number | null
  setResult: (programId: string, phaseId: string, testId: string, value: string) => void
  setBodyweight: (kg: number | null) => void
}

export const useBenchmarkStore = create<BenchmarkStore>()(
  persist(
    (set) => ({
      results: {},
      bodyweightKg: null,
      setResult: (programId, phaseId, testId, value) =>
        set((s) => ({
          results: {
            ...s.results,
            [programId]: {
              ...s.results[programId],
              [phaseId]: {
                ...s.results[programId]?.[phaseId],
                [testId]: value,
              },
            },
          },
        })),
      setBodyweight: (kg) => set({ bodyweightKg: kg }),
    }),
    { name: 'LSDita-benchmarks' },
  ),
)
