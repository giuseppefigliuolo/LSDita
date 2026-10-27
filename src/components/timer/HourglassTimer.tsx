import { useId } from 'react'
import { useReducedMotion } from 'framer-motion'

interface HourglassTimerProps {
  /** Seconds left; fractional values make the sand fall continuously */
  remaining: number
  /** Seconds of the whole timer */
  total: number
  /** Sand colour */
  color: string
  /** Paused timers stop the sand and hide the falling stream */
  running: boolean
  className?: string
}

const INK = '#3b1746'
const GLASS = 'M30 22 C30 90 82 112 84 140 C82 168 30 190 30 258 L150 258 C150 190 98 168 96 140 C98 112 150 90 150 22 Z'
const TOP_BULB = 'M30 22 C30 90 82 112 84 140 L96 140 C98 112 150 90 150 22 Z'
const BOTTOM_BULB = 'M84 140 C82 168 30 190 30 258 L150 258 C150 190 98 168 96 140 Z'
/** Height the sand travels to fill or empty a bulb */
const BULB_HEIGHT = 118

/**
 * Illustrated hourglass for the running timer: the top bulb empties into the
 * bottom one as `remaining` goes from `total` to 0.
 *
 * The sand follows the timer's own per-frame value instead of a CSS
 * transition, so it stays in step with the clock (empty exactly at 0), stops
 * where it is on pause and refills instantly when a timer starts over.
 * With reduced motion it moves once per second, in step with the number.
 */
export default function HourglassTimer({ remaining, total, color, running, className = '' }: HourglassTimerProps) {
  const uid = useId().replace(/[^\w-]/g, '_')
  const reduceMotion = useReducedMotion()

  const shown = reduceMotion ? Math.ceil(remaining) : remaining
  const ratio = total > 0 ? Math.min(1, Math.max(0, shown / total)) : 0

  return (
    <svg
      viewBox="0 0 180 280"
      width={180}
      height={280}
      aria-hidden="true"
      className={className}
      style={{ overflow: 'visible', filter: `drop-shadow(5px 5px 0 ${INK})` }}
    >
      <defs>
        <clipPath id={`hg-top-${uid}`}>
          <path d={TOP_BULB} />
        </clipPath>
        <clipPath id={`hg-bottom-${uid}`}>
          <path d={BOTTOM_BULB} />
        </clipPath>
      </defs>

      <g fill="#e9b425" stroke={INK} strokeWidth={3} strokeLinejoin="round">
        <rect x={8} y={16} width={12} height={248} />
        <rect x={160} y={16} width={12} height={248} />
      </g>

      <path d={GLASS} fill="#fdf5e4" />

      <g clipPath={`url(#hg-top-${uid})`}>
        <rect
          x={0}
          y={22}
          width={180}
          height={BULB_HEIGHT}
          fill={color}
          style={{ transform: `translateY(${BULB_HEIGHT * (1 - ratio)}px)` }}
        />
      </g>
      <g clipPath={`url(#hg-bottom-${uid})`}>
        <path
          d="M0 146 Q90 128 180 146 V270 H0 Z"
          fill={color}
          style={{ transform: `translateY(${BULB_HEIGHT * ratio}px)` }}
        />
      </g>

      {running && remaining > 0 && (
        <line
          x1={90}
          y1={138}
          x2={90}
          y2={256}
          stroke={color}
          strokeWidth={4}
          strokeDasharray="8 4"
          className="hourglass-stream"
        />
      )}

      <path d={GLASS} fill="none" stroke={INK} strokeWidth={3} />
      <path d="M44 40 C46 76 62 96 74 110" fill="none" stroke="#fff" strokeWidth={5} strokeLinecap="round" opacity={0.7} />

      <g fill="#e9b425" stroke={INK} strokeWidth={3}>
        <rect x={0} y={4} width={180} height={20} rx={6} />
        <rect x={0} y={256} width={180} height={20} rx={6} />
      </g>
    </svg>
  )
}
