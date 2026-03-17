import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AppSettings } from '../types'

interface SettingsStore extends AppSettings {
  toggleSound: () => void
  toggleVoice: () => void
  toggleVibration: () => void
  setVolume: (volume: number) => void
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      soundEnabled: true,
      voiceEnabled: true,
      vibrationEnabled: true,
      volume: 0.8,

      toggleSound: () => set((s) => ({ soundEnabled: !s.soundEnabled })),
      toggleVoice: () => set((s) => ({ voiceEnabled: !s.voiceEnabled })),
      toggleVibration: () => set((s) => ({ vibrationEnabled: !s.vibrationEnabled })),
      setVolume: (volume) => set({ volume }),
    }),
    {
      name: 'cruxtimer-settings',
    },
  ),
)
