import { useCallback, useRef, useEffect } from 'react'
import { useSettingsStore } from '../store/useSettingsStore'

const audioCtxRef = { current: null as AudioContext | null }

function getAudioContext(): AudioContext {
  if (!audioCtxRef.current) {
    audioCtxRef.current = new AudioContext()
  }
  return audioCtxRef.current
}

function playTone(frequency: number, duration: number, volume: number) {
  try {
    const ctx = getAudioContext()
    if (ctx.state === 'suspended') ctx.resume()

    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'sine'
    osc.frequency.value = frequency
    gain.gain.value = volume * 0.5

    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + duration)
  } catch {
    // Audio context may not be available
  }
}

export function useAudio() {
  const soundEnabled = useSettingsStore((s) => s.soundEnabled)
  const volume = useSettingsStore((s) => s.volume)
  const initRef = useRef(false)

  useEffect(() => {
    if (initRef.current) return
    const handleInteraction = () => {
      getAudioContext()
      initRef.current = true
    }
    document.addEventListener('touchstart', handleInteraction, { once: true })
    document.addEventListener('click', handleInteraction, { once: true })
    return () => {
      document.removeEventListener('touchstart', handleInteraction)
      document.removeEventListener('click', handleInteraction)
    }
  }, [])

  const beepStart = useCallback(() => {
    if (!soundEnabled) return
    playTone(880, 0.15, volume)
  }, [soundEnabled, volume])

  const beepEnd = useCallback(() => {
    if (!soundEnabled) return
    playTone(440, 0.3, volume)
  }, [soundEnabled, volume])

  const beepCountdown = useCallback(() => {
    if (!soundEnabled) return
    playTone(660, 0.1, volume)
  }, [soundEnabled, volume])

  const beepComplete = useCallback(() => {
    if (!soundEnabled) return
    playTone(1047, 0.15, volume)
    setTimeout(() => playTone(1319, 0.15, volume), 150)
    setTimeout(() => playTone(1568, 0.3, volume), 300)
  }, [soundEnabled, volume])

  return { beepStart, beepEnd, beepCountdown, beepComplete }
}
