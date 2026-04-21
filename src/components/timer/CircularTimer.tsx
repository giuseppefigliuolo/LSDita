import { useEffect, useId } from 'react'
import { motion, useMotionValue, animate, AnimatePresence } from 'framer-motion'
import type { WorkoutPhase } from '../../types'

interface BlobTimerProps {
  timeRemaining: number
  totalTime: number
  phase: WorkoutPhase
  label: string
}

// All blobs: same structure M + 4×C + Z — framer-motion interpolates smoothly
const BLOBS = [
  'M 130,30 C 175,28 210,70 210,130 C 210,190 175,232 130,232 C 85,232 50,190 50,130 C 50,70 85,32 130,30 Z',
  'M 134,24 C 183,22 216,68 215,132 C 214,196 178,236 130,236 C 82,236 44,192 45,128 C 46,64 85,26 134,24 Z',
  'M 126,28 C 172,20 215,66 214,130 C 213,196 173,237 126,236 C 79,235 44,194 44,130 C 44,66 80,36 126,28 Z',
  'M 132,22 C 184,18 218,64 217,132 C 216,200 175,238 128,238 C 81,238 42,196 42,130 C 42,64 80,26 132,22 Z',
]

const VIEW = 260

// Psychedelic phase colors — vivid, saturated
const phaseColors: Record<string, {
  fill: string; bg: string; rays: string; textOnFill: string
}> = {
  countdown:         { fill: '#E8B820', bg: '#FDF7E3', rays: '#D4541A',  textOnFill: '#2D0E4A' },
  hanging:           { fill: '#D4541A', bg: '#FDEEE4', rays: '#E8B820',  textOnFill: '#FFFBF0' },
  resting:           { fill: '#17A8A8', bg: '#E2F6F6', rays: '#5A9A1E',  textOnFill: '#2D0E4A' },
  set_rest:          { fill: '#7B3A9E', bg: '#F2EAF8', rays: '#E84830',  textOnFill: '#FFFBF0' },
  exercise_complete: { fill: '#2FA85C', bg: '#E3F5E8', rays: '#0E7A3A',  textOnFill: '#FFFFFF' },
  workout_complete:  { fill: '#5A9A1E', bg: '#EBF5E3', rays: '#17A8A8',  textOnFill: '#FFFBF0' },
  preview:           { fill: '#9C7B5C', bg: '#F4E8C4', rays: '#E8B820',  textOnFill: '#2D0E4A' },
  idle:              { fill: '#9C7B5C', bg: '#F4E8C4', rays: '#E8B820',  textOnFill: '#2D0E4A' },
  paused:            { fill: '#E8B820', bg: '#FDF7E3', rays: '#D4541A',  textOnFill: '#2D0E4A' },
}

const INK = '#3A1248'

// Number of sunburst rays
const RAY_COUNT = 20

export default function CircularTimer({ timeRemaining, totalTime, phase, label }: BlobTimerProps) {
  const uid = useId().replace(/:/g, '_')
  const blobPath = useMotionValue(BLOBS[0])

  const progress = totalTime > 0 ? timeRemaining / totalTime : 1
  const fillY = VIEW * (1 - progress)
  const colors = phaseColors[phase] ?? phaseColors.idle
  const displayTime = Math.ceil(timeRemaining)
  const hideTime = phase === 'exercise_complete' || phase === 'workout_complete'
  const isComplete = phase === 'exercise_complete'
  const fillPaint = isComplete ? `url(#grad-${uid})` : colors.fill
  const bgPaint = isComplete ? `url(#gradBg-${uid})` : colors.bg

  // Continuous organic blob morphing
  useEffect(() => {
    const controls = animate(blobPath, BLOBS, {
      duration: 10,
      repeat: Infinity,
      repeatType: 'mirror',
      ease: 'easeInOut',
    })
    return () => controls.stop()
  }, [blobPath])

  // Per-element text color: each switches when the rising fill passes its vertical center
  const labelCenterY = 88
  const numberCenterY = 140
  const labelColor = labelCenterY > fillY ? colors.textOnFill : INK
  const numberColor = numberCenterY > fillY ? colors.textOnFill : INK

  return (
    <div className="relative flex items-center justify-center" style={{ width: VIEW, height: VIEW }}>
      <svg
        viewBox={`0 0 ${VIEW} ${VIEW}`}
        width={VIEW}
        height={VIEW}
        style={{ overflow: 'visible' }}
      >
        <defs>
          <linearGradient id={`grad-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#4FD37A" />
            <stop offset="50%" stopColor="#2FA85C" />
            <stop offset="100%" stopColor="#0E7A3A" />
          </linearGradient>
          <linearGradient id={`gradBg-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#EAFBEF" />
            <stop offset="100%" stopColor="#C9EED4" />
          </linearGradient>
          <clipPath id={`fill-${uid}`}>
            <motion.rect
              x={0} y={0} width={VIEW} height={VIEW}
              animate={{ y: fillY }}
              transition={{ duration: 0.25, ease: 'linear' }}
            />
          </clipPath>
        </defs>

        {/* ── Sunburst rays — rotate slowly, behind blob ── */}
        <motion.g
          style={{ transformOrigin: '130px 130px' }}
          animate={{ rotate: 360 }}
          transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
        >
          {Array.from({ length: RAY_COUNT }, (_, i) => {
            const angle = (i / RAY_COUNT) * 360
            const rad = (angle * Math.PI) / 180
            const innerR = 115
            const outerR = 145 + (i % 2 === 0 ? 12 : 0)  // alternating length
            return (
              <line
                key={i}
                x1={130 + innerR * Math.cos(rad - Math.PI / 2)}
                y1={130 + innerR * Math.sin(rad - Math.PI / 2)}
                x2={130 + outerR * Math.cos(rad - Math.PI / 2)}
                y2={130 + outerR * Math.sin(rad - Math.PI / 2)}
                stroke={colors.rays}
                strokeWidth={i % 2 === 0 ? 4 : 2.5}
                strokeLinecap="round"
                opacity={0.7}
              />
            )
          })}
        </motion.g>

        {/* ── Blob body ── */}

        {/* 1. Background tint */}
        <motion.path d={blobPath} fill={bgPaint} />

        {/* 2. Liquid fill — clipped to show "remaining" portion.
            On completion, fill the whole blob with the green gradient. */}
        {isComplete ? (
          <motion.path d={blobPath} fill={fillPaint} />
        ) : (
          <g clipPath={`url(#fill-${uid})`}>
            <motion.path d={blobPath} fill={fillPaint} />
          </g>
        )}

        {/* 3. Bold plum border — retro psychedelic sticker outline */}
        <motion.path
          d={blobPath}
          fill="none"
          stroke={INK}
          strokeWidth={5}
        />

        {/* 4. White inner glow — the "puffy poster" highlight */}
        <motion.path
          d={blobPath}
          fill="none"
          stroke="rgba(255,255,255,0.5)"
          strokeWidth={3}
          strokeDasharray="8 4"
          strokeLinecap="round"
        />
      </svg>

      {/* ── Text overlay ── */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <AnimatePresence mode="wait">
          <motion.div
            key={phase}
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.85, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="flex flex-col items-center"
          >
            <motion.p
              className="text-xs font-bold uppercase tracking-[0.2em] mb-1"
              style={{ fontFamily: 'var(--font-display)' }}
              animate={{ color: labelColor }}
              transition={{ duration: 0.3 }}
            >
              {label}
            </motion.p>
            {!hideTime && (
              <motion.p
                className="font-timer leading-none"
                style={{ fontSize: '5rem' }}
                animate={{ color: numberColor }}
                transition={{ duration: 0.3 }}
              >
                {displayTime}
              </motion.p>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
