import type { ReactNode } from 'react'

interface PosterIconButtonProps {
  onClick: () => void
  'aria-label': string
  /** 'round' for the exercise preview nav, 'square' for the session top bar */
  shape?: 'round' | 'square'
  pressed?: boolean
  className?: string
  children: ReactNode
}

/** 48×48 paper button with plum outline and hard shadow (Home visual language). */
export default function PosterIconButton({
  onClick,
  shape = 'square',
  pressed,
  className = '',
  children,
  ...rest
}: PosterIconButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={rest['aria-label']}
      aria-pressed={pressed}
      className={`poster-press flex size-12 shrink-0 cursor-pointer items-center justify-center border-2 border-plum bg-paper text-plum shadow-[3px_3px_0_#3b1746] [--press:3px] focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-violet ${
        shape === 'round' ? 'rounded-full' : 'rounded-2xl'
      } ${className}`}
    >
      {children}
    </button>
  )
}
