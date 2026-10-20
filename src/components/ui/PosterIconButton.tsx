import type { ReactNode } from 'react'

interface PosterIconButtonProps {
  onClick: () => void
  'aria-label': string
  /** 'round' for the exercise preview nav, 'square' for the session top bar */
  shape?: 'round' | 'square'
  /** sm 44px (info sheet close), md 48px (nav), lg 60px (runner action bar) */
  size?: 'sm' | 'md' | 'lg'
  tone?: 'paper' | 'cream'
  pressed?: boolean
  className?: string
  children: ReactNode
}

const SIZES = { sm: 'size-11', md: 'size-12', lg: 'size-[60px]' } as const

/** Paper button with plum outline and hard shadow (Home visual language). */
export default function PosterIconButton({
  onClick,
  shape = 'square',
  size = 'md',
  tone = 'paper',
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
      className={`poster-press flex shrink-0 cursor-pointer items-center justify-center border-2 border-plum text-plum shadow-[3px_3px_0_#3b1746] [--press:3px] focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-violet ${SIZES[size]} ${
        tone === 'cream' ? 'bg-cream' : 'bg-paper'
      } ${shape === 'round' ? 'rounded-full' : 'rounded-2xl'} ${className}`}
    >
      {children}
    </button>
  )
}
