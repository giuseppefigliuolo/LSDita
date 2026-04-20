import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  AppSettings,
  ProgramId,
  TrainingDay,
  TrainingProgram,
} from '../types'

export function dayOverrideKey(
  programId: ProgramId,
  weekNumber: number,
  dayOfWeek: string
): string {
  return `${programId}:${weekNumber}:${dayOfWeek}`
}

interface SettingsStore extends AppSettings {
  toggleSound: () => void
  toggleVoice: () => void
  toggleVibration: () => void
  setVolume: (volume: number) => void
  setSelectedProgram: (program: ProgramId) => void
  setCountdownDuration: (duration: number) => void
  setCurrentWeek: (week: number | null) => void
  setCustomProgram: (program: TrainingProgram | null) => void
  setDayOverride: (
    programId: ProgramId,
    weekNumber: number,
    dayOfWeek: string,
    day: TrainingDay
  ) => void
  clearDayOverride: (
    programId: ProgramId,
    weekNumber: number,
    dayOfWeek: string
  ) => void
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      soundEnabled: true,
      voiceEnabled: true,
      vibrationEnabled: true,
      volume: 0.8,
      selectedProgram: 'home',
      countdownDuration: 3,
      currentWeek: null,
      customProgram: null,
      dayOverrides: {},

      toggleSound: () => set((s) => ({ soundEnabled: !s.soundEnabled })),
      toggleVoice: () => set((s) => ({ voiceEnabled: !s.voiceEnabled })),
      toggleVibration: () =>
        set((s) => ({ vibrationEnabled: !s.vibrationEnabled })),
      setVolume: (volume) => set({ volume }),
      setSelectedProgram: (program) => set({ selectedProgram: program }),
      setCountdownDuration: (duration) => set({ countdownDuration: duration }),
      setCurrentWeek: (week) => set({ currentWeek: week }),
      setCustomProgram: (program) =>
        set((s) => ({
          customProgram: program,
          selectedProgram:
            program == null && s.selectedProgram === 'custom'
              ? 'home'
              : s.selectedProgram
        })),
      setDayOverride: (programId, weekNumber, dayOfWeek, day) =>
        set((s) => ({
          dayOverrides: {
            ...s.dayOverrides,
            [dayOverrideKey(programId, weekNumber, dayOfWeek)]: day
          }
        })),
      clearDayOverride: (programId, weekNumber, dayOfWeek) =>
        set((s) => {
          const next = { ...s.dayOverrides }
          delete next[dayOverrideKey(programId, weekNumber, dayOfWeek)]
          return { dayOverrides: next }
        })
    }),
    {
      name: 'LSDita-settings'
    }
  )
)
