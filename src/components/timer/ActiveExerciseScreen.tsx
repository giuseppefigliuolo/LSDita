import type { ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { Exercise } from '../../types'
import MuteButton from '../ui/MuteButton'
import PosterIconButton from '../ui/PosterIconButton'
import PosterPill from '../ui/PosterPill'
import Sunburst from '../ui/Sunburst'
import SetProgressDots from './SetProgressDots'
import { getExerciseColor } from '../../utils/exerciseColors'

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
  /** Big number (reps or seconds); null shows a check instead */
  value: number | null
  label: string
  caption?: ReactNode
  /** Contents of the bottom action bar */
  actions: ReactNode
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
  value,
  label,
  caption,
  actions,
}: ActiveExerciseScreenProps) {
  const color = getExerciseColor(exerciseIndex)
  const digits = value == null ? 0 : String(value).length

  return (
    <div
      className="relative isolate flex min-h-0 w-full flex-1 flex-col self-stretch overflow-hidden text-plum"
      style={{ backgroundColor: color.bg }}
    >
      <div className="flex flex-col gap-[22px] px-5 pt-14">
        <div className="flex items-center justify-between">
          <PosterIconButton shape="round" onClick={onClose} aria-label="Chiudi">
            <svg width="20" height="20" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
              <path d="M4.5 4.5l9 9M13.5 4.5l-9 9" />
            </svg>
          </PosterIconButton>
          {weekNumber != null && (
            <p className="font-mono text-xs font-bold uppercase tracking-[0.14em]">
              Settimana {weekNumber}
            </p>
          )}
          <MuteButton variant="poster" />
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
            className="flex flex-col items-center gap-3.5"
          >
            {value == null ? (
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
            <PosterPill variant="ink" size="md">
              {label}
            </PosterPill>
            {caption && (
              <p className="font-mono text-xs font-bold uppercase tracking-[0.14em]">
                {caption}
              </p>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex shrink-0 items-center gap-3 rounded-t-[32px] border-t-2 border-plum bg-paper px-5 pt-[18px] pb-[calc(34px+env(safe-area-inset-bottom,0px))]">
        {actions}
      </div>
    </div>
  )
}

/** Cream 60px "×" circle that opens the skip confirmation. */
export function SkipExerciseButton({ onClick }: { onClick: () => void }) {
  return (
    <PosterIconButton shape="round" size="lg" tone="cream" onClick={onClick} aria-label="Serie non fatta">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    </PosterIconButton>
  )
}

/** Wide red pill: the main action of the bar. */
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
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className="poster-press flex h-[60px] min-w-0 flex-1 cursor-pointer items-center justify-center gap-2 rounded-full border-2 border-plum bg-poster-red font-poster text-xl text-paper shadow-[4px_4px_0_#3b1746] focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-violet"
    >
      {children}
    </button>
  )
}
