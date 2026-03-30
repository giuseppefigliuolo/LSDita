import { useState, useCallback, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSettingsStore } from '../store/useSettingsStore'
import { SURFACE_ELEVATED, RADIUS, SHADOW, INK } from '../styles/tokens'

type TimerPhase = 'idle' | 'countdown' | 'work' | 'rest' | 'done'

export default function TimerPage() {
  const [reps, setReps] = useState(8)
  const [workTime, setWorkTime] = useState(7)
  const [restTime, setRestTime] = useState(3)
  const [editing, setEditing] = useState<'reps' | 'work' | 'rest' | null>(null)

  const [phase, setPhase] = useState<TimerPhase>('idle')
  const [currentRep, setCurrentRep] = useState(0)
  const [timeRemaining, setTimeRemaining] = useState(0)

  const { soundEnabled, volume, countdownDuration } = useSettingsStore()
  const audioCtxRef = useRef<AudioContext | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval>>(undefined)

  const totalSeconds = reps * workTime + (reps - 1) * restTime

  function formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  const playBeep = useCallback((freq: number = 800, duration: number = 150) => {
    if (!soundEnabled) return
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioContext()
      }
      const ctx = audioCtxRef.current
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.frequency.value = freq
      gain.gain.value = volume * 0.3
      osc.start()
      osc.stop(ctx.currentTime + duration / 1000)
    } catch {
      // silent fail
    }
  }, [soundEnabled, volume])

  const stopTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = undefined
    }
  }, [])

  const startPhase = useCallback((p: TimerPhase, duration: number) => {
    stopTimer()
    setPhase(p)
    setTimeRemaining(duration)

    intervalRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(intervalRef.current)
          intervalRef.current = undefined
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }, [stopTimer])

  // Phase transition logic
  useEffect(() => {
    if (timeRemaining > 0 || phase === 'idle' || phase === 'done') return

    if (phase === 'countdown') {
      playBeep(1000, 300)
      setCurrentRep(1)
      startPhase('work', workTime)
    } else if (phase === 'work') {
      playBeep(600, 200)
      if (currentRep >= reps) {
        setPhase('done')
        playBeep(1000, 500)
      } else {
        startPhase('rest', restTime)
      }
    } else if (phase === 'rest') {
      playBeep(800, 150)
      setCurrentRep(prev => prev + 1)
      startPhase('work', workTime)
    }
  }, [timeRemaining, phase, currentRep, reps, workTime, restTime, startPhase, playBeep])

  // Beep on last 3 seconds of work
  useEffect(() => {
    if (phase === 'work' && timeRemaining > 0 && timeRemaining <= 3) {
      playBeep(900, 100)
    }
  }, [phase, timeRemaining, playBeep])

  function handleStart() {
    setEditing(null)
    if (countdownDuration > 0) {
      setCurrentRep(0)
      startPhase('countdown', countdownDuration)
    } else {
      setCurrentRep(1)
      startPhase('work', workTime)
    }
  }

  function handleStop() {
    stopTimer()
    setPhase('idle')
    setCurrentRep(0)
    setTimeRemaining(0)
  }

  useEffect(() => {
    return () => stopTimer()
  }, [stopTimer])

  const isRunning = phase !== 'idle' && phase !== 'done'

  const phaseLabel = {
    idle: '',
    countdown: 'Preparati…',
    work: 'Lavoro',
    rest: 'Riposo',
    done: 'Completato!',
  }[phase]

  const phaseColor = {
    idle: 'text-text',
    countdown: 'text-accent',
    work: 'text-primary',
    rest: 'text-secondary',
    done: 'text-primary',
  }[phase]

  return (
    <motion.div
      className="px-4 pt-6 pb-6 max-w-lg mx-auto"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      <h1
        className="text-3xl mb-1"
        style={{ fontFamily: 'var(--font-display)' }}
      >
        Timer
      </h1>
      <p className="text-text-secondary text-sm mb-6">
        Timer personalizzato per repeaters
      </p>

      {/* Timer display */}
      <div
        className="flex flex-col items-center py-8 mb-6 border-[3px]"
        style={{
          borderColor: INK,
          backgroundColor: SURFACE_ELEVATED,
          borderRadius: RADIUS.card,
          boxShadow: SHADOW.lg,
        }}
      >
        {phase === 'idle' ? (
          <>
            <p className="text-xs uppercase tracking-widest text-text-muted mb-2">
              Durata totale
            </p>
            <p
              className="text-6xl font-bold font-timer text-text"
              style={{ fontVariantNumeric: 'tabular-nums' }}
            >
              {formatTime(totalSeconds)}
            </p>
          </>
        ) : (
          <>
            <p className={`text-sm font-bold uppercase tracking-widest mb-1 ${phaseColor}`}>
              {phaseLabel}
            </p>
            {phase !== 'done' && (
              <p
                className={`text-7xl font-bold font-timer ${phaseColor}`}
                style={{ fontVariantNumeric: 'tabular-nums' }}
              >
                {timeRemaining}
              </p>
            )}
            {phase === 'done' && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-6xl mb-2"
              >
                ✓
              </motion.div>
            )}
            {phase !== 'done' && (
              <p className="text-sm text-text-muted mt-2">
                Rep {currentRep} / {reps}
              </p>
            )}
          </>
        )}
      </div>

      {/* Play / Stop button */}
      <div className="flex justify-center mb-8">
        {!isRunning ? (
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={phase === 'done' ? handleStop : handleStart}
            className="w-16 h-16 flex items-center justify-center border-[3px]"
            style={{
              borderColor: INK,
              backgroundColor: phase === 'done' ? '#E8B820' : '#22C55E',
              borderRadius: RADIUS.controlLg,
              boxShadow: SHADOW.md,
            }}
          >
            {phase === 'done' ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={INK} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="1 4 1 10 7 10" />
                <path d="M3.51 15a9 9 0 102.13-9.36L1 10" />
              </svg>
            ) : (
              <svg width="28" height="28" viewBox="0 0 24 24" fill={INK}>
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
            )}
          </motion.button>
        ) : (
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleStop}
            className="w-16 h-16 flex items-center justify-center border-[3px]"
            style={{
              borderColor: INK,
              backgroundColor: '#EF4444',
              borderRadius: RADIUS.controlLg,
              boxShadow: SHADOW.md,
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill={INK}>
              <rect x="4" y="4" width="16" height="16" rx="2" />
            </svg>
          </motion.button>
        )}
      </div>

      {/* Parameter boxes - reusing ExercisePreview style */}
      <div className={`grid grid-cols-3 gap-3 max-w-xs mx-auto mb-2 ${isRunning ? 'opacity-40 pointer-events-none' : ''}`}>
        <ParamBox
          value={reps}
          label="Rep"
          color="text-primary"
          ringColor="ring-primary/40"
          active={editing === 'reps'}
          onClick={() => setEditing(editing === 'reps' ? null : 'reps')}
        />
        <ParamBox
          value={workTime}
          suffix="s"
          label="Lavoro"
          color="text-secondary"
          ringColor="ring-secondary/40"
          active={editing === 'work'}
          onClick={() => setEditing(editing === 'work' ? null : 'work')}
        />
        <ParamBox
          value={restTime}
          suffix="s"
          label="Riposo"
          color="text-accent"
          ringColor="ring-accent/40"
          active={editing === 'rest'}
          onClick={() => setEditing(editing === 'rest' ? null : 'rest')}
        />
      </div>

      <AnimatePresence mode="wait">
        {editing === 'reps' && !isRunning && (
          <NumberEditor key="reps" value={reps} onChange={setReps} min={1} max={20} color="primary" />
        )}
        {editing === 'work' && !isRunning && (
          <TimeTickerEditor key="work" value={workTime} onChange={setWorkTime} min={1} max={60} color="secondary" />
        )}
        {editing === 'rest' && !isRunning && (
          <TimeTickerEditor key="rest" value={restTime} onChange={setRestTime} min={1} max={60} color="accent" />
        )}
      </AnimatePresence>

      {/* Presets */}
      {phase === 'idle' && !editing && (
        <div className="mt-6 max-w-xs mx-auto">
          <p className="text-xs uppercase tracking-widest text-text-muted mb-3 text-center">
            Preset
          </p>
          <div className="grid grid-cols-2 gap-2">
            <PresetButton label="7/3 Standard" sub="8 rep · 7s/3s" onClick={() => { setReps(8); setWorkTime(7); setRestTime(3) }} />
            <PresetButton label="7/3 Lungo" sub="10 rep · 7s/3s" onClick={() => { setReps(10); setWorkTime(7); setRestTime(3) }} />
            <PresetButton label="5/5 Densità" sub="6 rep · 5s/5s" onClick={() => { setReps(6); setWorkTime(5); setRestTime(5) }} />
            <PresetButton label="10/5 Max" sub="5 rep · 10s/5s" onClick={() => { setReps(5); setWorkTime(10); setRestTime(5) }} />
          </div>
        </div>
      )}
    </motion.div>
  )
}

function ParamBox({ value, suffix, label, color, ringColor, active, onClick }: {
  value: number
  suffix?: string
  label: string
  color: string
  ringColor: string
  active: boolean
  onClick: () => void
}) {
  return (
    <motion.button
      onClick={onClick}
      className={`bg-surface rounded-xl p-3 text-center transition-all ${active ? `ring-2 ${ringColor} bg-surface-elevated` : 'hover:bg-surface-elevated'
        }`}
      whileTap={{ scale: 0.95 }}
    >
      <p className={`text-lg font-bold font-timer ${color}`}>
        {value}{suffix}
      </p>
      <p className="text-[11px] uppercase tracking-wider text-text-muted">{label}</p>
    </motion.button>
  )
}

function NumberEditor({ value, onChange, min, max, color }: {
  value: number
  onChange: (v: number) => void
  min: number
  max: number
  color: 'primary' | 'secondary' | 'accent'
}) {
  const colorClasses = {
    primary: { text: 'text-primary', soft: 'bg-primary-soft' },
    secondary: { text: 'text-secondary', soft: 'bg-secondary-soft' },
    accent: { text: 'text-accent', soft: 'bg-accent-soft' },
  }
  const c = colorClasses[color]

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.2 }}
      className="w-full max-w-xs mx-auto overflow-hidden"
    >
      <div className="flex items-center justify-center gap-4 py-3">
        <motion.button
          whileTap={{ scale: 0.85 }}
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          className={`w-11 h-11 rounded-full ${c.soft} ${c.text} flex items-center justify-center text-xl font-bold disabled:opacity-30`}
        >
          −
        </motion.button>

        <span className={`text-3xl font-bold font-timer ${c.text} w-12 text-center`}>{value}</span>

        <motion.button
          whileTap={{ scale: 0.85 }}
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
          className={`w-11 h-11 rounded-full ${c.soft} ${c.text} flex items-center justify-center text-xl font-bold disabled:opacity-30`}
        >
          +
        </motion.button>
      </div>
    </motion.div>
  )
}

function TimeTickerEditor({ value, onChange, min, max, color }: {
  value: number
  onChange: (v: number) => void
  min: number
  max: number
  color: 'secondary' | 'accent'
}) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const isProgrammatic = useRef(false)
  const scrollEndTimer = useRef<ReturnType<typeof setTimeout>>(undefined)
  const TICK_W = 10

  const colorVars = {
    secondary: { css: 'var(--color-secondary)', text: 'text-secondary', soft: 'bg-secondary-soft' },
    accent: { css: 'var(--color-accent)', text: 'text-accent', soft: 'bg-accent-soft' },
  }
  const c = colorVars[color]

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    el.scrollLeft = (value - min) * TICK_W
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    return () => clearTimeout(scrollEndTimer.current)
  }, [])

  const handleScroll = useCallback(() => {
    if (isProgrammatic.current) return
    clearTimeout(scrollEndTimer.current)

    const el = scrollRef.current
    if (!el) return

    const tickIndex = Math.round(el.scrollLeft / TICK_W)
    const newValue = Math.max(min, Math.min(max, min + tickIndex))
    onChange(newValue)

    scrollEndTimer.current = setTimeout(() => {
      const snapped = tickIndex * TICK_W
      if (Math.abs(el.scrollLeft - snapped) > 1) {
        isProgrammatic.current = true
        el.scrollTo({ left: snapped, behavior: 'smooth' })
        setTimeout(() => { isProgrammatic.current = false }, 200)
      }
    }, 80)
  }, [min, max, onChange])

  const nudge = (delta: number) => {
    const newVal = Math.max(min, Math.min(max, value + delta))
    onChange(newVal)
    const el = scrollRef.current
    if (!el) return
    isProgrammatic.current = true
    el.scrollTo({ left: (newVal - min) * TICK_W, behavior: 'smooth' })
    setTimeout(() => { isProgrammatic.current = false }, 300)
  }

  const totalTicks = max - min + 1

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.2 }}
      className="w-full max-w-xs mx-auto overflow-hidden"
    >
      <div className="flex flex-col items-center py-3">
        <div className="flex items-baseline gap-1 mb-3">
          <span className={`text-3xl font-bold font-timer ${c.text}`}>{value}</span>
          <span className="text-sm text-text-muted font-timer">s</span>
        </div>

        <div className="relative w-full">
          <div
            className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-[3px] rounded-full z-20 opacity-70"
            style={{ backgroundColor: c.css }}
          />

          <div className="absolute left-0 top-0 bottom-0 w-8 bg-linear-to-r from-bg to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-linear-to-l from-bg to-transparent z-10 pointer-events-none" />

          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="overflow-x-auto"
            style={{
              scrollbarWidth: 'none',
              WebkitOverflowScrolling: 'touch',
            }}
          >
            <div
              className="flex items-end"
              style={{
                height: 52,
                paddingLeft: '50%',
                paddingRight: '50%',
              }}
            >
              {Array.from({ length: totalTicks }, (_, i) => {
                const tickValue = min + i
                const isActive = tickValue <= value
                const isMajor = tickValue % 10 === 0
                const isMid = tickValue % 5 === 0 && !isMajor

                return (
                  <div
                    key={tickValue}
                    className="flex flex-col items-center justify-end shrink-0"
                    style={{ width: TICK_W, height: '100%' }}
                  >
                    {isMajor && (
                      <span
                        className={`text-[8px] font-timer mb-1 select-none ${isActive ? `${c.text} opacity-80` : 'text-text-muted/60'}`}
                      >
                        {tickValue}
                      </span>
                    )}
                    <div
                      className="rounded-full"
                      style={{
                        width: 4,
                        height: isMajor ? 28 : isMid ? 20 : 14,
                        backgroundColor: isActive
                          ? c.css
                          : 'var(--color-surface-elevated)',
                        boxShadow: isActive
                          ? `0 0 6px color-mix(in srgb, ${c.css} 30%, transparent)`
                          : 'none',
                      }}
                    />
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 mt-2">
          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={() => nudge(-1)}
            disabled={value <= min}
            className={`w-9 h-9 rounded-full ${c.soft} ${c.text} flex items-center justify-center text-sm font-bold disabled:opacity-30`}
          >
            −
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={() => nudge(1)}
            disabled={value >= max}
            className={`w-9 h-9 rounded-full ${c.soft} ${c.text} flex items-center justify-center text-sm font-bold disabled:opacity-30`}
          >
            +
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}

function PresetButton({ label, sub, onClick }: { label: string; sub: string; onClick: () => void }) {
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="bg-surface-elevated rounded-xl p-3 text-center border border-border hover:ring-2 ring-primary/20 transition-all"
    >
      <p className="text-sm font-semibold text-text">{label}</p>
      <p className="text-[11px] text-text-muted">{sub}</p>
    </motion.button>
  )
}
