import { motion } from 'framer-motion'
import { INK, SHADOW } from '../../styles/tokens'

const REP_BLOB_RADII = [
  '60% 40% 50% 50% / 50% 60% 40% 50%',
  '50% 60% 40% 50% / 60% 50% 50% 40%',
  '40% 50% 60% 50% / 50% 40% 50% 60%',
  '50% 50% 60% 40% / 40% 50% 60% 50%',
]

interface SetProgressDotsProps {
  total: number
  current: number
  activeState: 'active' | 'resting' | 'complete'
}

export default function SetProgressDots({
  total,
  current,
  activeState,
}: SetProgressDotsProps) {
  if (total <= 1) return null

  return (
    <div className="flex items-center gap-3 mb-5">
      {Array.from({ length: total }, (_, i) => {
        const isCurrent = i === current - 1 && activeState === 'active'
        const isDone =
          i < current - 1 ||
          (i === current - 1 && activeState !== 'active')

        return (
          <motion.div
            key={i}
            className={`w-7 h-7 border-[2.5px] flex items-center justify-center ${
              isDone
                ? 'bg-primary'
                : isCurrent
                  ? 'bg-accent'
                  : 'bg-surface-elevated'
            }`}
            style={{
              borderColor: INK,
              borderRadius: REP_BLOB_RADII[i % REP_BLOB_RADII.length],
              boxShadow: isDone || isCurrent ? SHADOW.xs : 'none',
            }}
            animate={isCurrent ? { scale: [1, 1.18, 1] } : { scale: 1 }}
            transition={
              isCurrent
                ? { duration: 1.5, repeat: Infinity, ease: 'easeInOut' }
                : { duration: 0.25 }
            }
          >
            {isDone && (
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#FFF8E8"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )}
          </motion.div>
        )
      })}
    </div>
  )
}
