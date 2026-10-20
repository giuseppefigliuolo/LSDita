import type { CSSProperties } from 'react'

type Offset = number | string

interface SunburstProps {
  /** Ray colour and the gap colour between rays */
  ray: string
  base: string
  /** Diameter in px */
  size: number
  /** Where the burst is centred, from the top and from either the left or the right edge of the parent */
  center: { top: Offset } & ({ left: Offset } | { right: Offset })
}

/**
 * Decorative slow-turning sunburst (same look as the Home header), faded out
 * radially so it can sit behind a colour block without a hard edge.
 * Renders at a negative z-index: give the clipping ancestor `isolate overflow-hidden`
 * so the rays stay above its background and below its content.
 */
export default function Sunburst({ ray, base, size, center }: SunburstProps) {
  const fromRight = 'right' in center
  const mask = 'radial-gradient(circle closest-side, #000 0 30%, transparent 62%)'
  return (
    <div
      aria-hidden="true"
      className="poster-sunburst pointer-events-none absolute -z-10"
      style={
        {
          top: center.top,
          ...(fromRight ? { right: center.right } : { left: center.left }),
          width: size,
          height: size,
          // `translate`, not `transform`: the spin animates `rotate`, which is
          // applied before `transform` and would swing the offset around.
          translate: `${fromRight ? '50%' : '-50%'} -50%`,
          '--sb-ray': ray,
          '--sb-base': base,
          WebkitMaskImage: mask,
          maskImage: mask,
        } as unknown as CSSProperties
      }
    />
  )
}
