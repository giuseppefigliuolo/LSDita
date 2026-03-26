import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import type { ReactNode } from 'react'
import { INK, SURFACE, RADIUS, SHADOW } from '../../styles/tokens'

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
      className="sticky top-0 z-40 border-b-[3px] border-[#3A1248]"
      style={{
        backgroundColor: 'color-mix(in srgb, #F4E8C4 92%, transparent)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
      }}
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between h-14 px-4 max-w-lg mx-auto">
        <div className="flex items-center gap-3">
          {backButton && (
            <motion.button
              onClick={() => navigate(-1)}
              className="flex items-center justify-center w-9 h-9 border-[2.5px] border-[#3A1248] cursor-pointer"
              style={{
                backgroundColor: SURFACE,
                borderRadius: RADIUS.backBtn,
                boxShadow: SHADOW.xs,
              }}
              whileTap={{ x: 2, y: 2, boxShadow: `0px 0px 0px ${INK}` }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={INK} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </motion.button>
          )}
          <div>
            <h1
              className="text-base text-text"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {title}
            </h1>
            {subtitle && <p className="text-xs text-text-secondary">{subtitle}</p>}
          </div>
        </div>
        {rightAction && <div>{rightAction}</div>}
      </div>
    </motion.header>
  )
}
