import { useCallback } from 'react'
import { useSettingsStore } from '../store/useSettingsStore'

export function useVibration() {
  const vibrationEnabled = useSettingsStore((s) => s.vibrationEnabled)

  const vibrate = useCallback(
    (pattern: number | number[]) => {
      if (!vibrationEnabled || !('vibrate' in navigator)) return
      navigator.vibrate(pattern)
    },
    [vibrationEnabled],
  )

  const vibrateShort = useCallback(() => vibrate(50), [vibrate])
  const vibrateMedium = useCallback(() => vibrate([100, 50, 100]), [vibrate])
  const vibrateLong = useCallback(() => vibrate([200, 100, 200, 100, 200]), [vibrate])

  return { vibrate, vibrateShort, vibrateMedium, vibrateLong }
}
