import type { ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { Exercise } from '../../types'
import Button from '../ui/Button'
import MuteButton from '../ui/MuteButton'
import IconButton from '../ui/IconButton'
import PosterPill from '../ui/PosterPill'
import Sunburst from '../ui/Sunburst'
import HourglassTimer from './HourglassTimer'
import SetProgressDots from './SetProgressDots'
import { getExerciseColor } from '../../utils/exerciseColors'

export interface ActiveTimer {
  /** rest: recovery between reps/sets; prep: lead-in countdown; work: the timed effort */
  kind: 'rest' | 'prep' | 'work'
  /** Seconds left, as reported by the timer */
  remaining: number
  total: number
  running: boolean
}

/** Sand, number and pill colours per timer kind */
const TIMER_LOOK = {
  rest: { label: 'Recupero', color: '#9fd8d0', text: '#3b1746' },
  prep: { label: 'Preparati', color: '#f0901e', text: '#3b1746' },
  work: { label: 'Esecuzione', color: '#e2572b', text: '#fdf5e4' },
} as const

interface ActiveExerciseScreenProps {
  exercise: Exercise
  exerciseIndex: number
  weekNumber?: number
  onClose: () => void
  onOpenInfo: () => void
  progress: {
    total: number
    current: number
    state: 'active' | 'resting' | 'complete'
    unit?: 'Serie' | 'Rep'
  }
  /** Re-keys the centre so it fades in on every set / phase change */
  contentKey: string
  /** Running timer: drawn as an hourglass with the seconds left, in place of `value` and `label` */
  timer?: ActiveTimer
  /** Big number (reps); null shows a check instead */
  value?: number | null
  label?: string
  caption?: ReactNode
  /** Contents of the bottom action bar */
  actions: ReactNode
  /** Hides the bar (keeping its space) while the info sheet's resume row sits on top of it */
  actionsHidden?: boolean
}

/** Full-colour "exercise in progress" screen shared by the reps and the timed views. */
export default function ActiveExerciseScreen({
  exercise,
  exerciseIndex,
  weekNumber,
  onClose,
  onOpenInfo,
  progress,
  contentKey,
  timer,
  value = null,
  label,
  caption,
  actions,
  actionsHidden = false,
}: ActiveExerciseScreenProps) {
  const color = getExerciseColor(exerciseIndex)
  const digits = value == null ? 0 : String(value).length
  const timerLook = timer ? TIMER_LOOK[timer.kind] : null
  const seconds = timer ? Math.ceil(timer.remaining) : 0

  return (
    <div
      className="relative isolate flex min-h-0 w-full flex-1 flex-col self-stretch overflow-hidden text-plum"
      style={{ backgroundColor: color.bg }}
    >
      <div className="flex flex-col gap-[22px] px-5 pt-14">
        <div className="flex items-center justify-between">
          <IconButton onClick={onClose} aria-label="Chiudi">
            <svg width="20" height="20" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
              <path d="M4.5 4.5l9 9M13.5 4.5l-9 9" />
            </svg>
          </IconButton>
          {weekNumber != null && (
            <p className="font-mono text-xs font-bold uppercase tracking-[0.14em]">
              Settimana {weekNumber}
            </p>
          )}
          <MuteButton variant="blob" />
        </div>

        <SetProgressDots
          total={progress.total}
          current={progress.current}
          activeState={progress.state}
          unit={progress.unit}
        />

        <button
          type="button"
          onClick={onOpenInfo}
          aria-label={`Info esercizio: ${exercise.name}`}
          className="mx-auto min-h-11 max-w-[310px] cursor-pointer text-center font-poster text-[26px] leading-[1.3] [text-wrap:balance] underline decoration-plum decoration-dashed decoration-2 underline-offset-[7px] transition-opacity duration-[120ms] active:opacity-70 motion-reduce:transition-none focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-violet"
          style={{ overflowWrap: 'anywhere' }}
        >
          {exercise.name}
        </button>
      </div>

      <div className="relative flex min-h-0 flex-1 flex-col items-center justify-center">
        <Sunburst
          ray={color.ray}
          base={color.bg}
          size={820}
          center={{ left: '50%', top: '50%' }}
        />
        <AnimatePresence mode="wait">
          <motion.div
            key={contentKey}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="flex min-h-0 w-full flex-1 flex-col items-center justify-center gap-3.5"
          >
            {timer && timerLook ? (
              <>
                {/* 180×280, shrinking only when a short screen has no room for it */}
                <div className="relative max-h-[280px] min-h-0 w-full flex-1">
                  <HourglassTimer
                    remaining={timer.remaining}
                    total={timer.total}
                    color={timerLook.color}
                    running={timer.running}
                    className="absolute inset-0 m-auto h-full w-auto"
                  />
                </div>
                <span
                  role="timer"
                  aria-live="off"
                  aria-label={`${timerLook.label}, ${seconds} secondi rimanenti`}
                  className="font-poster text-[96px] leading-[0.9] tabular-nums"
                  style={{
                    color: timerLook.color,
                    WebkitTextStroke: '3px #3b1746',
                    textShadow: '5px 5px 0 #3b1746',
                  }}
                >
                  {seconds}
                </span>
                <PosterPill variant="status" size="md" bg={timerLook.color} color={timerLook.text}>
                  {timerLook.label}
                </PosterPill>
              </>
            ) : value == null ? (
              <span
                aria-hidden="true"
                className="flex size-36 items-center justify-center rounded-full border-2 border-plum bg-poster-red text-paper shadow-[6px_6px_0_#3b1746]"
              >
                <svg width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </span>
            ) : (
              <span
                className={`font-poster leading-[0.9] text-poster-red tabular-nums ${
                  digits <= 2 ? 'text-[210px]' : digits === 3 ? 'text-[150px]' : 'text-[120px]'
                }`}
                style={{
                  WebkitTextStroke: '3px #3b1746',
                  textShadow: '6px 6px 0 #3b1746',
                }}
              >
                {value}
              </span>
            )}
            {!timer && (
              <PosterPill variant="ink" size="md">
                {label}
              </PosterPill>
            )}
            {/* With a timer the line is always reserved, so a caption coming or going doesn't move the hourglass */}
            {(caption || timer) && (
              <p className="min-h-[1lh] font-mono text-xs font-bold uppercase tracking-[0.14em]">
                {caption}
              </p>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <div
        className={`flex shrink-0 items-center gap-3 rounded-t-[32px] border-t-2 border-plum bg-paper px-5 pt-[18px] pb-[calc(34px+env(safe-area-inset-bottom,0px))] ${
          actionsHidden ? 'invisible' : ''
        }`}
      >
        {actions}
      </div>
    </div>
  )
}

/** Cream 60px "×" button that opens the skip confirmation. */
export function SkipExerciseButton({ onClick }: { onClick: () => void }) {
  return (
    <IconButton size="lg" tone="cream" onClick={onClick} aria-label="Serie non fatta">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    </IconButton>
  )
}

/** Wide primary button: the main action of the bar. */
export function PrimaryBarButton({
  onClick,
  'aria-label': ariaLabel,
  children,
}: {
  onClick: () => void
  'aria-label': string
  children: ReactNode
}) {
  return (
    <Button size="lg" onClick={onClick} aria-label={ariaLabel} className="h-[60px] min-w-0 flex-1">
      {children}
    </Button>
  )
}
