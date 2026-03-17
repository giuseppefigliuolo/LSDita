import type { ReactNode } from 'react'

interface BadgeProps {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'accent' | 'violet' | 'success' | 'danger'
  className?: string
}

const variants = {
  primary: 'bg-primary-soft text-primary',
  secondary: 'bg-secondary-soft text-secondary',
  accent: 'bg-accent-soft text-accent',
  violet: 'bg-violet-soft text-violet',
  success: 'bg-success/15 text-success',
  danger: 'bg-danger/15 text-danger',
}

export default function Badge({ children, variant = 'primary', className = '' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${variants[variant]} ${className}`}>
      {children}
    </span>
  )
}
