import { useRef, useCallback, useEffect } from 'react'

export function useWakeLock() {
  const wakeLockRef = useRef<WakeLockSentinel | null>(null)

  const request = useCallback(async () => {
    if (!('wakeLock' in navigator)) return
    try {
      wakeLockRef.current = await navigator.wakeLock.request('screen')
    } catch {
      // Device may refuse (low battery, etc.)
    }
  }, [])

  const release = useCallback(async () => {
    if (wakeLockRef.current) {
      await wakeLockRef.current.release()
      wakeLockRef.current = null
    }
  }, [])

  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible' && wakeLockRef.current === null) {
        request()
      }
    }
    document.addEventListener('visibilitychange', handleVisibility)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility)
      release()
    }
  }, [request, release])

  return { request, release }
}
