import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

interface PageHeaderProps {
  title: string
  subtitle?: string
  backButton?: boolean
  rightAction?: ReactNode
}

export default function PageHeader({ title, subtitle, backButton, rightAction }: PageHeaderProps) {
  const navigate = useNavigate()

  return (
    <motion.header
      className="sticky top-0 z-40 glass border-b border-border"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between h-14 px-4 max-w-lg mx-auto">
        <div className="flex items-center gap-3">
          {backButton && (
            <button
              onClick={() => navigate(-1)}
              className="flex items-center justify-center w-8 h-8 rounded-lg bg-surface-elevated text-text-secondary"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
          )}
          <div>
            <h1 className="text-base font-bold text-text">{title}</h1>
            {subtitle && <p className="text-xs text-text-secondary">{subtitle}</p>}
          </div>
        </div>
        {rightAction && <div>{rightAction}</div>}
      </div>
    </motion.header>
  )
}
