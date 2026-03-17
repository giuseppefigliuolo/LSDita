import { useState, useRef, useCallback, useEffect } from 'react'

interface UseTimerReturn {
  timeRemaining: number
  isRunning: boolean
  progress: number
  start: (duration: number) => void
  pause: () => void
  resume: () => void
  stop: () => void
  reset: (duration: number) => void
}

export function useTimer(onComplete: () => void): UseTimerReturn {
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [totalDuration, setTotalDuration] = useState(0)

  const startTimeRef = useRef(0)
  const pausedAtRef = useRef(0)
  const durationRef = useRef(0)
  const rafRef = useRef<number>(0)
  const onCompleteRef = useRef(onComplete)

  onCompleteRef.current = onComplete

  const tick = useCallback(() => {
    const elapsed = (performance.now() - startTimeRef.current) / 1000
    const remaining = Math.max(0, durationRef.current - elapsed)

    setTimeRemaining(remaining)

    if (remaining <= 0) {
      setIsRunning(false)
      setTimeRemaining(0)
      onCompleteRef.current()
      return
    }

    rafRef.current = requestAnimationFrame(tick)
  }, [])

  const start = useCallback((duration: number) => {
    cancelAnimationFrame(rafRef.current)
    durationRef.current = duration
    setTotalDuration(duration)
    setTimeRemaining(duration)
    startTimeRef.current = performance.now()
    setIsRunning(true)
    rafRef.current = requestAnimationFrame(tick)
  }, [tick])

  const pause = useCallback(() => {
    cancelAnimationFrame(rafRef.current)
    pausedAtRef.current = performance.now()
    setIsRunning(false)
  }, [])

  const resume = useCallback(() => {
    const pausedDuration = performance.now() - pausedAtRef.current
    startTimeRef.current += pausedDuration
    setIsRunning(true)
    rafRef.current = requestAnimationFrame(tick)
  }, [tick])

  const stop = useCallback(() => {
    cancelAnimationFrame(rafRef.current)
    setIsRunning(false)
    setTimeRemaining(0)
  }, [])

  const reset = useCallback((duration: number) => {
    cancelAnimationFrame(rafRef.current)
    durationRef.current = duration
    setTotalDuration(duration)
    setTimeRemaining(duration)
    setIsRunning(false)
  }, [])

  useEffect(() => {
    return () => cancelAnimationFrame(rafRef.current)
  }, [])

  const progress = totalDuration > 0 ? timeRemaining / totalDuration : 1

  return { timeRemaining, isRunning, progress, start, pause, resume, stop, reset }
}
