import type { ReactNode } from 'react'

interface PosterPillProps {
  /** paper: outlined chip on a coloured block; ink: solid plum label */
  variant?: 'paper' | 'ink'
  /** sm 11px (default), md 12px with roomier padding (runner + info sheet chips) */
  size?: 'sm' | 'md'
  /** Fill for the paper variant, e.g. a pastel chip */
  bg?: string
  className?: string
  children: ReactNode
}

/** Small Space Mono pill used for chips, volume ("3×10") and equipment labels. */
export default function PosterPill({
  variant = 'paper',
  size = 'sm',
  bg,
  className = '',
  children,
}: PosterPillProps) {
  const look =
    variant === 'ink'
      ? `bg-plum text-cream uppercase ${size === 'md' ? 'tracking-[0.14em]' : 'tracking-[0.12em]'}`
      : 'border-[1.5px] border-plum bg-paper text-plum'
  const scale = size === 'md' ? 'px-3 py-[5px] text-xs' : 'px-2.5 py-1 text-[11px]'
  return (
    <span
      className={`inline-block whitespace-nowrap rounded-full font-mono font-bold ${look} ${scale} ${className}`}
      style={bg ? { backgroundColor: bg } : undefined}
    >
      {children}
    </span>
  )
}
