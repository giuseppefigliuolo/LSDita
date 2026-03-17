import { useCallback, useRef, useEffect } from 'react'
import { useSettingsStore } from '../store/useSettingsStore'

export function useSpeech() {
  const voiceEnabled = useSettingsStore((s) => s.voiceEnabled)
  const voiceRef = useRef<SpeechSynthesisVoice | null>(null)

  useEffect(() => {
    function loadVoice() {
      const voices = speechSynthesis.getVoices()
      voiceRef.current =
        voices.find((v) => v.lang.startsWith('it') && v.localService) ??
        voices.find((v) => v.lang.startsWith('it')) ??
        null
    }

    loadVoice()
    speechSynthesis.addEventListener('voiceschanged', loadVoice)
    return () => speechSynthesis.removeEventListener('voiceschanged', loadVoice)
  }, [])

  const speak = useCallback(
    (text: string) => {
      if (!voiceEnabled || !('speechSynthesis' in window)) return

      speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = 'it-IT'
      utterance.rate = 1.1
      utterance.pitch = 1.0
      if (voiceRef.current) utterance.voice = voiceRef.current
      speechSynthesis.speak(utterance)
    },
    [voiceEnabled],
  )

  return { speak }
}
