import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { INK, RADIUS, SHADOW } from '../../styles/tokens'

interface IconButtonProps {
  onClick: () => void
  'aria-label': string
  /** sm 44px (info sheet close), md 48px (headers), lg 60px (runner action bar) */
  size?: 'sm' | 'md' | 'lg'
  tone?: 'paper' | 'cream'
  pressed?: boolean
  className?: string
  children: ReactNode
}

const SIZES = { sm: 'size-11', md: 'size-12', lg: 'size-[60px]' } as const

/** Small blob button for icons: same border, shadow and press as Button. */
export default function IconButton({
  onClick,
  size = 'md',
  tone = 'paper',
  pressed,
  className = '',
  children,
  ...rest
}: IconButtonProps) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-label={rest['aria-label']}
      aria-pressed={pressed}
      className={`flex shrink-0 cursor-pointer items-center justify-center border-[2.5px] text-plum focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-violet ${SIZES[size]} ${
        tone === 'cream' ? 'bg-cream' : 'bg-paper'
      } ${className}`}
      style={{ borderColor: INK, borderRadius: RADIUS.blob, boxShadow: SHADOW.sm }}
      whileTap={{ x: 3, y: 3, boxShadow: SHADOW.pressed }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
    >
      {children}
    </motion.button>
  )
}
