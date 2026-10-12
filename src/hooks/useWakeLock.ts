import { useRef, useCallback, useEffect } from 'react'

const WATCHDOG_MS = 5000

/**
 * Keeps the screen on between `request()` and `release()`.
 *
 * The OS can drop a screen wake lock at any moment (app switch, notification
 * shade, battery saver). The sentinel's `release` event clears our reference,
 * and the lock is re-acquired when the page becomes visible again, on the next
 * tap, and by a periodic watchdog as a last resort.
 */
export function useWakeLock() {
  const wakeLockRef = useRef<WakeLockSentinel | null>(null)
  const wantedRef = useRef(false)
  const pendingRef = useRef(false)

  const acquire = useCallback(async () => {
    if (!('wakeLock' in navigator)) return
    if (!wantedRef.current || document.visibilityState !== 'visible') return
    if (pendingRef.current) return
    if (wakeLockRef.current && !wakeLockRef.current.released) return

    pendingRef.current = true
    try {
      const sentinel = await navigator.wakeLock.request('screen')
      sentinel.addEventListener('release', () => {
        if (wakeLockRef.current === sentinel) wakeLockRef.current = null
      })
      if (wantedRef.current) {
        wakeLockRef.current = sentinel
      } else {
        // release() was called while the request was in flight.
        await sentinel.release()
      }
    } catch {
      // Device may refuse (low battery, etc.) — the watchdog retries.
    } finally {
      pendingRef.current = false
    }
  }, [])

  const request = useCallback(async () => {
    wantedRef.current = true
    await acquire()
  }, [acquire])

  const release = useCallback(async () => {
    wantedRef.current = false
    const sentinel = wakeLockRef.current
    wakeLockRef.current = null
    if (sentinel && !sentinel.released) await sentinel.release()
  }, [])

  useEffect(() => {
    const reacquire = () => {
      void acquire()
    }
    document.addEventListener('visibilitychange', reacquire)
    // A user gesture lets browsers that require activation grant the lock.
    window.addEventListener('pointerup', reacquire)
    const watchdog = setInterval(reacquire, WATCHDOG_MS)
    return () => {
      document.removeEventListener('visibilitychange', reacquire)
      window.removeEventListener('pointerup', reacquire)
      clearInterval(watchdog)
      void release()
    }
  }, [acquire, release])

  return { request, release }
}
