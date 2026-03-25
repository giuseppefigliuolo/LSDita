import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence, useMotionValue, useTransform, animate as motionAnimate } from 'framer-motion'
import PageHeader from '../components/ui/PageHeader'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import ExerciseIllustration from '../components/illustrations/ExerciseIllustration'
import trainingProgram from '../data/training-program.json'
import type { TrainingProgram, Exercise } from '../types'
import { formatSeconds } from '../utils/dateUtils'
import { getWorkoutForDay, getDayTypeColor, getDayTypeLabel, getTotalExerciseDuration, getSessionLabel } from '../utils/programUtils'

const program = trainingProgram as unknown as TrainingProgram

const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.03 } },
}
const fadeUp = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.2 } },
}

export default function WorkoutDay() {
  const { weekNumber, dayOfWeek } = useParams<{ weekNumber: string; dayOfWeek: string }>()
  const navigate = useNavigate()
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null)

  const week = Number(weekNumber)
  const day = getWorkoutForDay(program, week, dayOfWeek ?? '')

  if (!day) {
    return (
      <div className="flex items-center justify-center min-h-dvh">
        <p className="text-text-secondary">Workout non trovato</p>
      </div>
    )
  }

  const weekData = program.weeks.find((w) => w.weekNumber === week)
  const sessionLabel = weekData ? getSessionLabel(weekData.days, day.dayOfWeek) : ''

  return (
    <div className="min-h-dvh bg-bg">
      <PageHeader
        title={day.title}
        subtitle={`${sessionLabel} — Settimana ${week}`}
        backButton
      />

      <motion.div
        className="px-4 pt-4 pb-8 max-w-lg mx-auto"
        variants={stagger}
        initial="hidden"
        animate="show"
      >
        <motion.div variants={fadeUp} className="flex items-center gap-2 mb-2">
          <Badge variant={getDayTypeColor(day.type) as 'primary' | 'secondary' | 'accent' | 'violet'}>
            {getDayTypeLabel(day.type)}
          </Badge>
          {weekData && (
            <Badge variant="violet">
              {weekData.theme}
            </Badge>
          )}
        </motion.div>

        <motion.p variants={fadeUp} className="text-sm text-text-secondary mb-4">
          {day.description}
        </motion.p>

        <motion.div variants={fadeUp} className="flex items-center gap-4 text-xs text-text-muted mb-6">
          <span>{day.exercises.length} esercizi</span>
          <span>~{formatSeconds(getTotalExerciseDuration(day))}</span>
        </motion.div>

        <div className="space-y-3 mb-8">
          {day.exercises.map((exercise, index) => (
            <motion.div key={exercise.id} variants={fadeUp}>
              <ExerciseCard exercise={exercise} index={index} onTap={() => setSelectedExercise(exercise)} />
            </motion.div>
          ))}
        </div>

        <motion.div variants={fadeUp}>
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={() => navigate(`/workout/${weekNumber}/${dayOfWeek}/active`)}
          >
            Inizia Allenamento
          </Button>
        </motion.div>
      </motion.div>

      <AnimatePresence>
        {selectedExercise && (
          <ExerciseDetailModal exercise={selectedExercise} onClose={() => setSelectedExercise(null)} />
        )}
      </AnimatePresence>
    </div>
  )
}

function ExerciseCard({ exercise, index, onTap }: { exercise: Exercise; index: number; onTap: () => void }) {
  const equipmentLabels: Record<string, string> = {
    hangboard: 'Hangboard',
    wooden_balls: 'Sfere legno',
    pull_up_bar: 'Sbarra',
    dumbbells: 'Manubri',
    fitness_band: 'Elastico',
    yoga_mat: 'Tappetino',
    bodyweight: 'Corpo libero',
  }

  return (
    <Card onClick={onTap}>
      <div className="flex items-start gap-3">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-surface-elevated text-text-muted text-sm font-bold font-timer shrink-0">
          {index + 1}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-text">{exercise.name}</h3>
          <p className="text-xs text-text-secondary mt-0.5 line-clamp-2">{exercise.description}</p>

          <div className="flex flex-wrap items-center gap-2 mt-2">
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-surface-elevated text-text-muted font-medium">
              {equipmentLabels[exercise.equipment] ?? exercise.equipment}
            </span>
            {exercise.type === 'repeaters' ? (
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-primary-soft text-primary font-medium">
                {exercise.hangTime}s/{exercise.restBetweenReps}s × {exercise.repsPerSet} rep × {exercise.sets} set
              </span>
            ) : exercise.type === 'reps' ? (
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-secondary-soft text-secondary font-medium">
                {exercise.repsPerSet} rep × {exercise.sets} set
              </span>
            ) : (
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-accent-soft text-accent font-medium">
                {exercise.hangTime}s × {exercise.sets} set
              </span>
            )}
            {exercise.weight && exercise.weight !== 'corpo libero' && (
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-violet-soft text-violet font-medium">
                {exercise.weight}
              </span>
            )}
          </div>
        </div>
      </div>
    </Card>
  )
}

const gripLabels: Record<string, string> = {
  half_crimp: 'Semi-arcuata',
  open_hand: 'Mano aperta',
  full_crimp: 'Arcuata piena',
  three_finger_drag: 'Tre dita',
  pinch: 'Pinch',
  sloper: 'Sloper',
  mixed: 'Mista',
}

const equipmentLabelsModal: Record<string, string> = {
  hangboard: 'Hangboard',
  wooden_balls: 'Sfere legno',
  pull_up_bar: 'Sbarra',
  dumbbells: 'Manubri',
  fitness_band: 'Elastico',
  yoga_mat: 'Tappetino',
  bodyweight: 'Corpo libero',
}

function ExerciseDetailModal({ exercise, onClose }: { exercise: Exercise; onClose: () => void }) {
  const dragY = useMotionValue(0)
  const sheetScale = useTransform(dragY, [0, 300], [1, 0.95])
  const sheetOpacity = useTransform(dragY, [0, 300], [1, 0.4])
  const sheetRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = sheetRef.current
    if (!el) return

    let startY = 0
    let lastY = 0
    let lastTime = 0
    let velY = 0
    let dragging = false
    let mouseDown = false

    const begin = (y: number) => {
      startY = y
      lastY = y
      lastTime = performance.now()
      velY = 0
      dragging = false
    }

    const move = (y: number, prevent: () => void) => {
      const delta = y - startY
      const now = performance.now()
      const dt = now - lastTime
      if (dt > 0) velY = (y - lastY) / dt * 1000
      lastY = y
      lastTime = now

      if (!dragging) {
        if (delta > 8 && el.scrollTop <= 1) {
          dragging = true
        } else {
          return
        }
      }

      prevent()
      dragY.set(Math.max(0, delta))
    }

    const finish = () => {
      if (!dragging) return
      dragging = false

      const current = dragY.get()
      if (current > 100 || velY > 400) {
        motionAnimate(dragY, window.innerHeight, {
          duration: 0.25,
          ease: 'easeIn',
          onComplete: onClose,
        })
      } else {
        motionAnimate(dragY, 0, { type: 'spring', stiffness: 400, damping: 30 })
      }
    }

    const onTouchStart = (e: TouchEvent) => begin(e.touches[0].clientY)
    const onTouchMove = (e: TouchEvent) =>
      move(e.touches[0].clientY, () => e.preventDefault())
    const onTouchEnd = () => finish()

    const onPtrMove = (e: PointerEvent) => {
      if (!mouseDown) return
      move(e.clientY, () => e.preventDefault())
    }
    const onPtrUp = () => {
      mouseDown = false
      finish()
      document.removeEventListener('pointermove', onPtrMove)
      document.removeEventListener('pointerup', onPtrUp)
    }
    const onPtrDown = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      mouseDown = true
      begin(e.clientY)
      document.addEventListener('pointermove', onPtrMove)
      document.addEventListener('pointerup', onPtrUp)
    }

    el.addEventListener('touchstart', onTouchStart, { passive: true })
    el.addEventListener('touchmove', onTouchMove, { passive: false })
    el.addEventListener('touchend', onTouchEnd)
    el.addEventListener('pointerdown', onPtrDown)

    return () => {
      el.removeEventListener('touchstart', onTouchStart)
      el.removeEventListener('touchmove', onTouchMove)
      el.removeEventListener('touchend', onTouchEnd)
      el.removeEventListener('pointerdown', onPtrDown)
      document.removeEventListener('pointermove', onPtrMove)
      document.removeEventListener('pointerup', onPtrUp)
    }
  }, [dragY, onClose])

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <motion.div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />

      <motion.div
        className="relative w-full max-w-lg max-h-[85dvh] rounded-t-2xl overflow-hidden"
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
      >
        <motion.div
          ref={sheetRef}
          className="bg-surface rounded-t-2xl overflow-y-auto overscroll-contain max-h-[85dvh]"
          style={{ y: dragY, scale: sheetScale, opacity: sheetOpacity }}
        >
          <div className="sticky top-0 z-10 flex justify-center pt-3 pb-2 bg-surface">
            <div className="w-10 h-1 rounded-full bg-text-muted/30" />
          </div>

          <div className="px-5 pb-8">
            <div className="flex flex-col items-center text-center mb-5">
              <div className="w-28 h-28 rounded-2xl bg-surface-elevated flex items-center justify-center mb-4">
                <ExerciseIllustration name={exercise.illustration} size={96} />
              </div>
              <h2 className="text-lg font-bold text-text">{exercise.name}</h2>
            </div>

            <p className="text-sm text-text-secondary leading-relaxed mb-5">
              {exercise.description}
            </p>

            <div className="flex flex-wrap gap-2 mb-5">
              <span className="text-xs px-3 py-1 rounded-full bg-surface-elevated text-text-muted font-medium">
                {equipmentLabelsModal[exercise.equipment] ?? exercise.equipment}
              </span>
              {exercise.grip && (
                <span className="text-xs px-3 py-1 rounded-full bg-primary-soft text-primary font-medium">
                  {gripLabels[exercise.grip] ?? exercise.grip}
                </span>
              )}
              {exercise.weight && exercise.weight !== 'corpo libero' && (
                <span className="text-xs px-3 py-1 rounded-full bg-violet-soft text-violet font-medium">
                  {exercise.weight}
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 mb-5">
              <DetailCell label="Serie" value={String(exercise.sets)} color="text-primary" />
              <DetailCell label="Ripetizioni" value={String(exercise.repsPerSet)} color="text-secondary" />
              <DetailCell label="Tempo" value={`${exercise.hangTime}s`} color="text-accent" />
              <DetailCell
                label="Recupero set"
                value={`${exercise.restBetweenSets}s`}
                color="text-text-muted"
              />
              {exercise.restBetweenReps > 0 && (
                <DetailCell
                  label="Recupero rep"
                  value={`${exercise.restBetweenReps}s`}
                  color="text-text-muted"
                />
              )}
            </div>

            {exercise.notes && (
              <div className="rounded-xl bg-accent-soft/30 border border-accent/10 px-4 py-3 mb-5">
                <p className="text-xs text-accent font-semibold uppercase tracking-wider mb-1">Note</p>
                <p className="text-sm text-text-secondary">{exercise.notes}</p>
              </div>
            )}

            <Button variant="ghost" size="md" fullWidth onClick={onClose}>
              Chiudi
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}

function DetailCell({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="bg-surface-elevated rounded-xl p-3 text-center">
      <p className={`text-lg font-bold font-timer ${color}`}>{value}</p>
      <p className="text-[11px] uppercase tracking-wider text-text-muted">{label}</p>
    </div>
  )
}
