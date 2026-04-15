import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AppSettings, ProgramId } from '../types'

interface SettingsStore extends AppSettings {
  toggleSound: () => void
  toggleVoice: () => void
  toggleVibration: () => void
  setVolume: (volume: number) => void
  setSelectedProgram: (program: ProgramId) => void
  setCountdownDuration: (duration: number) => void
  setCurrentWeek: (week: number | null) => void
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

      toggleSound: () => set((s) => ({ soundEnabled: !s.soundEnabled })),
      toggleVoice: () => set((s) => ({ voiceEnabled: !s.voiceEnabled })),
      toggleVibration: () =>
        set((s) => ({ vibrationEnabled: !s.vibrationEnabled })),
      setVolume: (volume) => set({ volume }),
      setSelectedProgram: (program) => set({ selectedProgram: program }),
      setCountdownDuration: (duration) => set({ countdownDuration: duration }),
      setCurrentWeek: (week) => set({ currentWeek: week })
    }),
    {
      name: 'LSDita-settings'
    }
  )
)
