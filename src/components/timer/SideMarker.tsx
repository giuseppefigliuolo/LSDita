import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import type { Limb } from '../../types'
import type { Side } from '../../utils/sides'
import PosterPill from '../ui/PosterPill'

const INK = '#3B1746'
// 80×95, three quarters on short screens where the hourglass shrinks too
const ICON_SIZE = 'h-[95px] w-20 [@media(max-height:740px)]:h-[71px] [@media(max-height:740px)]:w-[60px]'
const GLOVE = '#FDF5E4'
const CUFF = '#E2572B'

/* Right hand seen from the back (thumb towards the body); the left one is its mirror */
const HAND_PARTS = (
  <>
    <rect x="17" y="30" width="33" height="29" rx="11" />
    <rect x="17.5" y="11" width="8.5" height="30" rx="4.25" />
    <rect x="26" y="6" width="8.5" height="34" rx="4.25" />
    <rect x="34.5" y="9" width="8.5" height="31" rx="4.25" />
    <rect x="42.5" y="17" width="7.5" height="24" rx="3.75" transform="rotate(8 46.25 41)" />
    <rect x="-4.75" y="-22" width="9.5" height="24" rx="4.75" transform="translate(20.5 46) rotate(-36)" />
  </>
)

function HandIcon() {
  return (
    <svg viewBox="0 0 64 76" overflow="visible" aria-hidden="true" className={ICON_SIZE}>
      {/* Offset print shadow, then a thick ink pass under the fill: one outline around the whole glove */}
      <g fill={INK} stroke={INK} strokeWidth="5" strokeLinejoin="round" transform="translate(3 3)">
        {HAND_PARTS}
        <rect x="21.5" y="55" width="25" height="13" rx="4" />
      </g>
      <g fill={INK} stroke={INK} strokeWidth="5" strokeLinejoin="round">
        {HAND_PARTS}
      </g>
      <g fill={GLOVE}>{HAND_PARTS}</g>
      <g stroke={INK} strokeWidth="2.2" strokeLinecap="round" fill="none">
        <path d="M26 16V32" />
        <path d="M34.5 14V32" />
        <path d="M42.8 20V33" />
      </g>
      <rect x="21.5" y="55" width="25" height="13" rx="4" fill={CUFF} stroke={INK} strokeWidth="2.5" />
      <path d="M24 61.5H44" stroke={INK} strokeWidth="2" strokeLinecap="round" strokeDasharray="0.1 4" />
    </svg>
  )
}

const SOLE =
  'M34 27C45 26.5 51 33 50 41C49 48 45.5 52 45.5 58C45.5 65 41.5 70 35 70C28.5 70 25.5 65 25.5 58.5C25.5 51 22 46 22 38C22 31 27 27.2 34 27Z'

/* Right footprint (big toe on the inside); the left one is its mirror */
function FootIcon() {
  return (
    <svg viewBox="0 0 64 76" overflow="visible" aria-hidden="true" className={ICON_SIZE}>
      <path d={SOLE} fill={INK} stroke={INK} strokeWidth="2.5" transform="translate(3 3)" />
      <path d={SOLE} fill={GLOVE} stroke={INK} strokeWidth="2.5" />
      <g fill={INK}>
        <ellipse cx="25.5" cy="16" rx="5.4" ry="6.4" />
        <ellipse cx="35.5" cy="11.5" rx="3.4" ry="4" />
        <ellipse cx="43.3" cy="13" rx="3" ry="3.5" />
        <ellipse cx="49.5" cy="17.2" rx="2.7" ry="3.1" />
        <ellipse cx="53.6" cy="23.2" rx="2.4" ry="2.8" />
      </g>
    </svg>
  )
}

const SPOKEN: Record<Limb, Record<Side, string>> = {
  hand: { left: 'Mano sinistra', right: 'Mano destra' },
  foot: { left: 'Gamba sinistra', right: 'Gamba destra' },
}

/**
 * Glove (or footprint) pinned to the left or right edge of the runner: which
 * side works now, or during a rest which side comes next. Slides in from its
 * own edge whenever the side changes. `lift` raises it by half its value, to
 * line it up with the hourglass or the big number instead of the whole block.
 */
export default function SideMarker({ side, limb, lift = 0 }: { side: Side | null; limb: Limb; lift?: number }) {
  const reduceMotion = useReducedMotion()
  const away = side === 'left' ? -36 : 36

  return (
    <div
      className="pointer-events-none absolute inset-x-2 top-0 bottom-0 z-10 flex items-center"
      style={{ paddingBottom: lift }}
    >
      <AnimatePresence mode="wait" initial={false}>
        {side && (
          <motion.div
            key={side}
            className={`flex flex-col items-center gap-2 ${side === 'left' ? 'mr-auto' : 'ml-auto'}`}
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, x: away, rotate: side === 'left' ? -14 : 14 }}
            animate={{ opacity: 1, x: 0, rotate: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, x: away }}
            transition={{ type: 'spring', stiffness: 420, damping: 26 }}
          >
            <p className="sr-only">{SPOKEN[limb][side]}</p>
            <div aria-hidden="true" style={side === 'left' ? { transform: 'scaleX(-1)' } : undefined}>
              {limb === 'foot' ? <FootIcon /> : <HandIcon />}
            </div>
            <span aria-hidden="true">
              <PosterPill variant="ink" size="md">
                {side === 'left' ? 'SX' : 'DX'}
              </PosterPill>
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
