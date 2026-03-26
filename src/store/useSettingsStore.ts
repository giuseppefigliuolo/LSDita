import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AppSettings, ProgramId } from '../types'

interface SettingsStore extends AppSettings {
  toggleSound: () => void
  toggleVoice: () => void
  toggleVibration: () => void
  setVolume: (volume: number) => void
  setSelectedProgram: (program: ProgramId) => void
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      soundEnabled: true,
      voiceEnabled: true,
      vibrationEnabled: true,
      volume: 0.8,
      selectedProgram: 'home',

      toggleSound: () => set((s) => ({ soundEnabled: !s.soundEnabled })),
      toggleVoice: () => set((s) => ({ voiceEnabled: !s.voiceEnabled })),
      toggleVibration: () => set((s) => ({ vibrationEnabled: !s.vibrationEnabled })),
      setVolume: (volume) => set({ volume }),
      setSelectedProgram: (program) => set({ selectedProgram: program }),
    }),
    {
      name: 'cruxtimer-settings',
    },
  ),
)
