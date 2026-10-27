export interface ConfettiOrigin {
  x: number
  y: number
}

type ConfettiListener = (origin: ConfettiOrigin) => void

const listeners = new Set<ConfettiListener>()

function prefersReducedMotion(): boolean {
  return !!(
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

/** Subscribes to bursts (used by ConfettiLayer). Returns the unsubscribe function. */
export function onConfetti(listener: ConfettiListener) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

/**
 * Confetti burst from a normalized origin point, drawn by ConfettiLayer.
 * origin.x and origin.y are 0–1 ratios of viewport width/height.
 */
export function fireConfetti(origin: ConfettiOrigin = { x: 0.5, y: 0.5 }) {
  if (prefersReducedMotion()) return
  listeners.forEach((listener) => listener(origin))
}

/**
 * Fire confetti from the position of a mouse/pointer event.
 */
export function fireConfettiFromEvent(e: React.MouseEvent | MouseEvent) {
  const vw = Math.max(1, window.innerWidth)
  const vh = Math.max(1, window.innerHeight)

  fireConfetti({
    x: Math.min(vw, Math.max(0, e.clientX)) / vw,
    y: Math.min(vh, Math.max(0, e.clientY)) / vh,
  })
}
