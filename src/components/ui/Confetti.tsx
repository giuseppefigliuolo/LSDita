import { useEffect, useMemo, useState, type CSSProperties } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { onConfetti } from '../../utils/confetti'

const COLORS = ['#e2572b', '#9fd8d0', '#f5d77a', '#d9c2e0', '#cfe0a8', '#e98a5c', '#fdf5e4']

/** Longest piece animation (max jitter + max duration), used to unmount a finished burst */
const BURST_MS = 3400

/** Deterministic pseudo-random sequence, so a burst is the same on every render. */
function seeded(seed: number) {
  return () => {
    seed = (seed * 16807) % 2147483647
    return (seed - 1) / 2147483646
  }
}

/** Burst offsets from the origin, in px. */
function makePieces(seed: number, fallMin: number, fallMax: number) {
  const rand = seeded(seed)
  const between = (min: number, max: number) => min + rand() * (max - min)
  return Array.from({ length: 36 }, (_, i) => {
    const round = i % 6 === 0
    return {
      color: COLORS[i % COLORS.length],
      round,
      width: round ? 9 : Math.round(between(8, 15)),
      height: round ? 9 : Math.round(between(5, 8)),
      dx: between(-190, 190),
      dy: between(-210, -60),
      fall: between(fallMin, fallMax),
      drift: between(-40, 40),
      spin: between(-540, 540),
      duration: between(2.2, 3.2),
      delay: between(0, 0.12),
    }
  })
}

interface ConfettiBurstProps {
  seed?: number
  /** Seconds before the pieces leave the origin */
  delay?: number
  /** How far below the origin the pieces end up, in px */
  fall?: readonly [number, number]
  /** Positions the origin (an absolute, zero-size box) */
  className?: string
  style?: CSSProperties
}

/** Ink-outlined poster confetti bursting out of one point. Nothing under reduced motion. */
export function ConfettiBurst({ seed = 11, delay = 0, fall = [260, 380], className = '', style }: ConfettiBurstProps) {
  const reduceMotion = useReducedMotion()
  const [fallMin, fallMax] = fall
  const pieces = useMemo(() => makePieces(seed, fallMin, fallMax), [seed, fallMin, fallMax])
  if (reduceMotion) return null
  return (
    <div aria-hidden="true" className={`pointer-events-none absolute ${className}`} style={style}>
      {pieces.map((p, i) => (
        <motion.span
          key={i}
          className="absolute border-[1.5px] border-plum"
          style={{
            width: p.width,
            height: p.height,
            marginLeft: -p.width / 2,
            marginTop: -p.height / 2,
            backgroundColor: p.color,
            borderRadius: p.round ? '50%' : 2,
          }}
          initial={{ x: 0, y: 0, rotate: 0, opacity: 0 }}
          animate={{
            x: [0, p.dx, p.dx + p.drift],
            y: [0, p.dy, p.fall],
            rotate: [0, p.spin * 0.4, p.spin],
            opacity: [0, 1, 1, 0],
          }}
          transition={{
            duration: p.duration,
            delay: delay + p.delay,
            times: [0, 0.3, 1],
            ease: ['easeOut', 'easeIn'],
            opacity: { duration: p.duration, delay: delay + p.delay, times: [0, 0.04, 0.75, 1] },
          }}
        />
      ))}
    </div>
  )
}

let nextBurstId = 0

/** Full-screen overlay that plays the bursts requested through `fireConfetti`. Mounted once in App. */
export function ConfettiLayer() {
  const [bursts, setBursts] = useState<{ id: number; x: number; y: number }[]>([])

  useEffect(
    () =>
      onConfetti((origin) => {
        const id = nextBurstId++
        setBursts((b) => [...b, { id, ...origin }])
        setTimeout(() => setBursts((b) => b.filter((burst) => burst.id !== id)), BURST_MS)
      }),
    [],
  )

  if (bursts.length === 0) return null
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[100] overflow-hidden">
      {bursts.map((b) => (
        <ConfettiBurst
          key={b.id}
          seed={b.id + 11}
          fall={[420, 640]}
          style={{ left: `${b.x * 100}%`, top: `${b.y * 100}%` }}
        />
      ))}
    </div>
  )
}
