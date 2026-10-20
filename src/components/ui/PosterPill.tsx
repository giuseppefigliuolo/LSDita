import type { ReactNode } from 'react'

interface PosterPillProps {
  /** paper: outlined chip on a coloured block; ink: solid plum label */
  variant?: 'paper' | 'ink'
  className?: string
  children: ReactNode
}

/** Small Space Mono pill used for chips, volume ("3×10") and equipment labels. */
export default function PosterPill({
  variant = 'paper',
  className = '',
  children,
}: PosterPillProps) {
  const look =
    variant === 'ink'
      ? 'bg-plum text-cream text-[11px] uppercase tracking-[0.12em]'
      : 'border-[1.5px] border-plum bg-paper text-plum text-[11px]'
  return (
    <span
      className={`inline-block whitespace-nowrap rounded-full px-2.5 py-1 font-mono font-bold ${look} ${className}`}
    >
      {children}
    </span>
  )
}
