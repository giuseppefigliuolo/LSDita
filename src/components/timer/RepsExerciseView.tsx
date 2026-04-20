import { AnimatePresence, motion } from 'framer-motion'
import type { Exercise } from '../../types'
import ExerciseInfoButton from './ExerciseInfoButton'
import SetProgressDots from './SetProgressDots'
import { RADIUS, SHADOW } from '../../styles/tokens'

interface RepsExerciseViewProps {
  exercise: Exercise
  exerciseIndex: number
  currentSet: number
  onSetDone: () => void
  onSkipExercise: () => void
  onOpenInfo: () => void
}

/** View for `reps`-type exercises (no timer, just a tap-to-complete button). */
export default function RepsExerciseView({
  exercise,
  exerciseIndex,
  currentSet,
  onSetDone,
  onSkipExercise,
  onOpenInfo,
}: RepsExerciseViewProps) {
  const hasWeight = exercise.weight && exercise.weight !== 'corpo libero'

  return (
    <div className="relative flex flex-col items-center justify-center min-h-[80dvh] px-4">
      <div className="absolute top-4 right-4 z-10">
        <ExerciseInfoButton onClick={onOpenInfo} />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={`${exerciseIndex}-reps`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="flex flex-col items-center"
        >
          <SetProgressDots
            total={exercise.sets}
            current={currentSet}
            activeState="active"
          />

          <p className="font-semibold uppercase tracking-widest text-text-muted mb-14">
            {exercise.name}
          </p>

          <div className="relative flex items-center justify-center mb-4">
            <div
              className="absolute rounded-full blur-3xl opacity-40"
              style={{
                width: 160,
                height: 160,
                backgroundColor: '#E8622A30',
              }}
            />
            <div
              className="w-52 h-52 border-[4px] border-[#3A1248] bg-surface-elevated flex flex-col items-center justify-center"
              style={{ borderRadius: RADIUS.blob, boxShadow: SHADOW.md }}
            >
              <p className="font-timer text-7xl text-primary leading-none">
                {exercise.repsPerSet}
              </p>
              <p className="text-xs font-semibold uppercase tracking-widest text-text-secondary mt-2">
                ripetizioni
              </p>
            </div>
          </div>

          <p className="font-semibold uppercase tracking-widest text-text-muted text-center my-4">
            Serie {currentSet} di {exercise.sets}
          </p>

          {hasWeight && (
            <span
              className="text-xs px-3 py-1 bg-violet-soft text-violet font-semibold border-[1.5px] border-[#3A1248]"
              style={{ borderRadius: RADIUS.pill, boxShadow: SHADOW.xxs }}
            >
              {exercise.weight}
            </span>
          )}

          <motion.button
            whileTap={{ scale: 0.93 }}
            onClick={onSetDone}
            className="w-20 h-20 bg-primary border-[3px] border-[#3A1248] flex items-center justify-center mt-8 active:translate-x-[3px] active:translate-y-[3px] active:shadow-none transition-all"
            style={{ borderRadius: RADIUS.controlLg, boxShadow: SHADOW.md }}
            aria-label="Serie completata"
          >
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#FFFBF0"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </motion.button>

          <button
            onClick={onSkipExercise}
            className="mt-6 w-14 h-14 bg-surface border-[2.5px] border-[#3A1248] flex items-center justify-center active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all"
            style={{ borderRadius: RADIUS.controlSm, boxShadow: SHADOW.sm }}
            title="Salta esercizio"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#9C7B5C"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
