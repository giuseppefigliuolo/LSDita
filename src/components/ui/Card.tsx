import type { ReactNode } from 'react'
import { motion } from 'framer-motion'

interface CardProps {
  children: ReactNode
  className?: string
  onClick?: () => void
  variant?: 'default' | 'primary' | 'secondary' | 'violet'
}

const borderColors = {
  default: 'border-border',
  primary: 'border-primary/20',
  secondary: 'border-secondary/20',
  violet: 'border-violet/20',
}

export default function Card({ children, className = '', onClick, variant = 'default' }: CardProps) {
  const Component = onClick ? motion.button : motion.div

  return (
    <Component
      onClick={onClick}
      className={`bg-surface rounded-xl border ${borderColors[variant]} p-4 text-left w-full ${
        onClick ? 'active:scale-[0.98] cursor-pointer' : ''
      } ${className}`}
      whileTap={onClick ? { scale: 0.98 } : undefined}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >
      {children}
    </Component>
  )
}
