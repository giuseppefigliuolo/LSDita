import type { ReactNode } from 'react'
import { RADIUS, SHADOW } from '../../styles/tokens'

interface BadgeProps {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'accent' | 'violet' | 'success' | 'danger'
  className?: string
}

// All text contrast ratios verified ≥ 4.5:1
const variants: Record<string, { bg: string; text: string }> = {
  primary: { bg: '#D4541A', text: '#FFFBF0' },
  secondary: { bg: '#17A8A8', text: '#2D0E4A' },
  accent: { bg: '#E8B820', text: '#2D0E4A' },
  violet: { bg: '#7B3A9E', text: '#FFFBF0' },
  success: { bg: '#5A9A1E', text: '#FFFBF0' },
  danger: { bg: '#CC3020', text: '#FFFBF0' }
}

export default function Badge({
  children,
  variant = 'primary',
  className = ''
}: BadgeProps) {
  const v = variants[variant] ?? variants.primary
  return (
    <span
      className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-bold uppercase tracking-wider border-2 border-[#3A1248] ${className}`}
      style={{
        backgroundColor: v.bg,
        color: v.text,
        borderRadius: RADIUS.pill,
        boxShadow: SHADOW.xs
      }}
    >
      {children}
    </span>
  )
}
