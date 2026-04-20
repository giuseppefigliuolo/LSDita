import { useRef, useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { INK, SURFACE_ELEVATED, RADIUS, SHADOW } from '../../styles/tokens'

const INACTIVE_COLOR = '#9C7B5C'

const tabs = [
  { path: '/', label: 'Home', icon: HomeIcon },
  { path: '/timer', label: 'Timer', icon: TimerIcon },
  { path: '/logbook', label: 'Logbook', icon: MountainIcon },
  { path: '/progress', label: 'Progressi', icon: ChartIcon },
  { path: '/settings', label: 'Impostazioni', icon: SettingsIcon }
] as const

export default function BottomNav() {
  const location = useLocation()
  const navigate = useNavigate()
  const activeIndex = tabs.findIndex(t => t.path === location.pathname)
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([])
  const [blobLeft, setBlobLeft] = useState<number | null>(null)

  useEffect(() => {
    const btn = buttonRefs.current[activeIndex]
    if (btn) setBlobLeft(btn.offsetLeft)
  }, [activeIndex])

  return (
    <nav className="fixed bottom-3 left-3 right-3 z-50 safe-bottom">
      <div
        className="relative flex items-center justify-around h-16 max-w-lg mx-auto px-2 border-[3px]"
        style={{
          backgroundColor: SURFACE_ELEVATED,
          borderColor: INK,
          borderRadius: RADIUS.nav,
          boxShadow: SHADOW.lg,
        }}
      >
        {blobLeft !== null && (
          <motion.div
            className="absolute inset-y-1 w-16 border-2 pointer-events-none"
            animate={{ left: blobLeft }}
            transition={{ type: 'spring', stiffness: 500, damping: 35 }}
            style={{
              backgroundColor: '#E8B820',
              borderColor: INK,
              borderRadius: RADIUS.navIndicator,
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.5)',
            }}
          />
        )}
        {tabs.map((tab, i) => {
          const isActive = location.pathname === tab.path
          const Icon = tab.icon
          return (
            <button
              key={tab.path}
              ref={el => { buttonRefs.current[i] = el }}
              onClick={() => navigate(tab.path)}
              aria-label={tab.label}
              aria-current={isActive ? 'page' : undefined}
              className="relative flex flex-col items-center justify-center gap-0.5 w-16 h-full cursor-pointer"
            >
              <div className="relative z-10">
                <Icon active={isActive} />
              </div>
              <span
                className="relative z-10 text-[11px] font-bold transition-colors"
                style={{ color: isActive ? INK : INACTIVE_COLOR }}
              >
                {tab.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}

function HomeIcon({ active }: { active: boolean }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke={active ? INK : INACTIVE_COLOR}
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  )
}

function TimerIcon({ active }: { active: boolean }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke={active ? INK : INACTIVE_COLOR}
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="13" r="8" />
      <path d="M12 9v4l2 2" />
      <path d="M9 2h6" />
      <path d="M12 2v2" />
    </svg>
  )
}

function MountainIcon({ active }: { active: boolean }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill={active ? INK : 'none'}
      stroke={active ? INK : INACTIVE_COLOR}
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14 6l-3.75 5 2.85 3.8-1.6 1.2C9.81 13.75 7 10 7 10l-6 8h22L14 6z" />
    </svg>
  )
}

function ChartIcon({ active }: { active: boolean }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke={active ? INK : INACTIVE_COLOR}
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  )
}

function SettingsIcon({ active }: { active: boolean }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke={active ? INK : INACTIVE_COLOR}
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
    </svg>
  )
}
