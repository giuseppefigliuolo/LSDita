import { motion, AnimatePresence } from 'framer-motion'
import type { WorkoutPhase } from '../../types'

interface CircularTimerProps {
  timeRemaining: number
  totalTime: number
  phase: WorkoutPhase
  label: string
  subLabel?: string
}

const RADIUS = 120
const STROKE = 10
const CIRCUMFERENCE = 2 * Math.PI * RADIUS
const SIZE = (RADIUS + STROKE) * 2

const phaseColors: Record<string, { stroke: string; bg: string; glow: string }> = {
  hanging: { stroke: '#E8175D', bg: '#E8175D15', glow: '#E8175D40' },
  resting: { stroke: '#00B4D8', bg: '#00B4D815', glow: '#00B4D840' },
  set_rest: { stroke: '#8B35A6', bg: '#8B35A615', glow: '#8B35A640' },
  exercise_complete: { stroke: '#FFD23F', bg: '#FFD23F15', glow: '#FFD23F40' },
  workout_complete: { stroke: '#4DD474', bg: '#4DD47415', glow: '#4DD47440' },
  preview: { stroke: '#8E8EA0', bg: '#8E8EA010', glow: 'transparent' },
  idle: { stroke: '#8E8EA0', bg: '#8E8EA010', glow: 'transparent' },
  paused: { stroke: '#FFD23F', bg: '#FFD23F10', glow: '#FFD23F20' },
}

export default function CircularTimer({ timeRemaining, totalTime, phase, label, subLabel }: CircularTimerProps) {
  const progress = totalTime > 0 ? timeRemaining / totalTime : 1
  const offset = CIRCUMFERENCE * (1 - progress)
  const colors = phaseColors[phase] ?? phaseColors.idle
  const displayTime = Math.ceil(timeRemaining)

  return (
    <div className="relative flex items-center justify-center">
      <div
        className="absolute rounded-full blur-3xl opacity-50 transition-all duration-500"
        style={{
          width: SIZE * 0.7,
          height: SIZE * 0.7,
          backgroundColor: colors.glow,
        }}
      />

      <svg width={SIZE} height={SIZE} className="transform -rotate-90">
        <circle
          cx={RADIUS + STROKE}
          cy={RADIUS + STROKE}
          r={RADIUS}
          fill="none"
          stroke="#1C1B2E"
          strokeWidth={STROKE}
        />
        <motion.circle
          cx={RADIUS + STROKE}
          cy={RADIUS + STROKE}
          r={RADIUS}
          fill="none"
          stroke={colors.stroke}
          strokeWidth={STROKE}
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
          initial={false}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.1, ease: 'linear' }}
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={phase}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col items-center"
          >
            <p className="text-xs font-semibold uppercase tracking-widest text-text-secondary mb-1">
              {label}
            </p>
            <p
              className="font-timer text-6xl leading-none"
              style={{ color: colors.stroke }}
            >
              {displayTime}
            </p>
            {subLabel && (
              <p className="text-xs text-text-muted mt-2">{subLabel}</p>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
