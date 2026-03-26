import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { RADIUS, SHADOW } from '../../styles/tokens'

interface CardProps {
  children: ReactNode
  className?: string
  onClick?: () => void
  variant?: 'default' | 'primary' | 'secondary' | 'violet'
}

// Each variant has a warm tinted background that reads clearly on parchment
const variantStyles: Record<string, string> = {
  default: '#FFF8E8',
  primary: '#FDEEE4',
  secondary: '#E2F6F6',
  violet: '#F2EAF8'
}

export default function Card({
  children,
  className = '',
  onClick,
  variant = 'default'
}: CardProps) {
  const Component = onClick ? motion.button : motion.div
  const bg = variantStyles[variant] ?? variantStyles.default

  return (
    <Component
      onClick={onClick}
      className={`border-[3px] border-[#3A1248] p-4 text-left w-full
        ${onClick ? 'cursor-pointer' : ''}
        ${className}`}
      style={{
        backgroundColor: bg,
        borderRadius: RADIUS.card,
        boxShadow: SHADOW.lg
      }}
      whileTap={
        onClick
          ? {
              x: 5,
              y: 5,
              boxShadow: SHADOW.pressed
            }
          : undefined
      }
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
    >
      {children}
    </Component>
  )
}
