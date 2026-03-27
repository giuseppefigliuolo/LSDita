import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
  animate as motionAnimate
} from 'framer-motion'
import PageHeader from '../components/ui/PageHeader'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import ExerciseIllustration from '../components/illustrations/ExerciseIllustration'
import type { Exercise } from '../types'
import { useSettingsStore } from '../store/useSettingsStore'
import { getProgram } from '../utils/getProgram'
import { formatSeconds } from '../utils/dateUtils'
import {
  getWorkoutForDay,
  getDayTypeColor,
  getDayTypeLabel,
  getTotalExerciseDuration,
  getSessionLabel
} from '../utils/programUtils'
import { INK, SURFACE, RADIUS, SHADOW } from '../styles/tokens'

const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.03 } }
}
const fadeUp = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.2 } }
}

export default function WorkoutDay() {
  const { weekNumber, dayOfWeek } = useParams<{
    weekNumber: string
    dayOfWeek: string
  }>()
  const navigate = useNavigate()
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(
    null
  )
  const { selectedProgram } = useSettingsStore()
  const program = getProgram(selectedProgram)

  const week = Number(weekNumber)
  const day = getWorkoutForDay(program, week, dayOfWeek ?? '')

  if (!day) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-text-secondary">Workout non trovato</p>
      </div>
    )
  }

  const weekData = program.weeks.find((w) => w.weekNumber === week)
  const sessionLabel = weekData
    ? getSessionLabel(weekData.days, day.dayOfWeek)
    : ''

  return (
    <div className="bg-bg">
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
          <Badge
            variant={
              getDayTypeColor(day.type) as
                | 'primary'
                | 'secondary'
                | 'accent'
                | 'violet'
            }
          >
            {getDayTypeLabel(day.type)}
          </Badge>
          {weekData && <Badge variant="violet">{weekData.theme}</Badge>}
        </motion.div>

        <motion.p
          variants={fadeUp}
          className="text-sm text-text-secondary mb-4"
        >
          {day.description}
        </motion.p>

        <motion.div
          variants={fadeUp}
          className="flex items-center gap-4 text-xs text-text-muted mb-6"
        >
          <span>{day.exercises.length} esercizi</span>
          <span>~{formatSeconds(getTotalExerciseDuration(day))}</span>
        </motion.div>

        <div className="space-y-3 mb-24">
          {day.exercises.map((exercise, index) => (
            <motion.div key={exercise.id} variants={fadeUp}>
              <ExerciseCard
                exercise={exercise}
                index={index}
                onTap={() => setSelectedExercise(exercise)}
              />
            </motion.div>
          ))}
        </div>

        {/* Fixed bottom button */}
        <div className="fixed bottom-1 left-0 right-0 z-40 px-4 pb-2 pt-3 max-w-lg mx-auto">
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={() =>
              navigate(`/workout/${weekNumber}/${dayOfWeek}/active`)
            }
          >
            Inizia Allenamento
          </Button>
        </div>
      </motion.div>

      <AnimatePresence>
        {selectedExercise && (
          <ExerciseDetailModal
            exercise={selectedExercise}
            onClose={() => setSelectedExercise(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

const flowerColors = [
  { outer: '#D4541A', inner: '#E8B820', center: '#7B3A9E', ring: '#3A1248' },
  { outer: '#7B3A9E', inner: '#17A8A8', center: '#E8B820', ring: '#3A1248' },
  { outer: '#17A8A8', inner: '#5A9A1E', center: '#D4541A', ring: '#3A1248' },
  { outer: '#E84830', inner: '#D4541A', center: '#E8B820', ring: '#3A1248' },
  { outer: '#5A9A1E', inner: '#E8B820', center: '#17A8A8', ring: '#3A1248' },
  { outer: '#E8B820', inner: '#7B3A9E', center: '#D4541A', ring: '#3A1248' },
  { outer: '#D4541A', inner: '#5A9A1E', center: '#E84830', ring: '#3A1248' },
  { outer: '#7B3A9E', inner: '#E84830', center: '#E8B820', ring: '#3A1248' }
]

function ExerciseFlowerNumber({ index }: { index: number }) {
  const c = flowerColors[index % flowerColors.length]
  // Each flower has a unique rotation offset for variety
  const baseRotation = (index * 13) % 360
  return (
    <div className="relative flex items-center justify-center w-11 h-11 shrink-0">
      <svg
        width="44"
        height="44"
        viewBox="0 0 44 44"
        className="absolute inset-0"
      >
        <g transform={`rotate(${baseRotation} 22 22)`}>
          {/* Outer wavy petals — organic blob shapes */}
          {Array.from({ length: 7 }, (_, i) => {
            const angle = (i * 360) / 7
            const rad = (angle * Math.PI) / 180
            const px = 22 + Math.cos(rad) * 13
            const py = 22 + Math.sin(rad) * 13
            // Vary petal size for organic feel
            const rx = 5.5 + (i % 3) * 0.8
            const ry = 8 + (i % 2) * 2
            return (
              <ellipse
                key={`o-${i}`}
                cx={px}
                cy={py}
                rx={rx}
                ry={ry}
                fill={c.outer}
                opacity={0.85}
                transform={`rotate(${angle + 90} ${px} ${py})`}
              />
            )
          })}
          {/* Inner petals — offset, smaller, different color */}
          {Array.from({ length: 7 }, (_, i) => {
            const angle = (i * 360) / 7 + 25
            const rad = (angle * Math.PI) / 180
            const px = 22 + Math.cos(rad) * 9
            const py = 22 + Math.sin(rad) * 9
            const rx = 3.5 + (i % 2) * 0.6
            const ry = 6 + (i % 3)
            return (
              <ellipse
                key={`in-${i}`}
                cx={px}
                cy={py}
                rx={rx}
                ry={ry}
                fill={c.inner}
                opacity={0.9}
                transform={`rotate(${angle + 90} ${px} ${py})`}
              />
            )
          })}
        </g>
        {/* Center — concentric rings for depth */}
        <circle cx="22" cy="22" r="9" fill={c.center} />
        <circle cx="22" cy="22" r="9" fill="none" stroke={c.ring} strokeWidth="1.5" opacity={0.3} />
        <circle cx="22" cy="22" r="6" fill={c.inner} opacity={0.5} />
        <circle cx="22" cy="22" r="3.5" fill={c.ring} opacity={0.25} />
        {/* Tiny highlight dot */}
        <circle cx="20" cy="20" r="1.5" fill="white" opacity={0.45} />
      </svg>
      <span className="relative text-sm font-bold font-timer text-[#FFFBF0] z-10" style={{ textShadow: '0 1px 2px rgba(58,18,72,0.6)' }}>
        {index + 1}
      </span>
    </div>
  )
}

function ExerciseCard({
  exercise,
  index,
  onTap
}: {
  exercise: Exercise
  index: number
  onTap: () => void
}) {
  const equipmentLabels: Record<string, string> = {
    hangboard: 'Hangboard',
    wooden_balls: 'Sfere legno',
    pull_up_bar: 'Sbarra',
    dumbbells: 'Manubri',
    fitness_band: 'Elastico',
    yoga_mat: 'Tappetino',
    bodyweight: 'Corpo libero'
  }

  return (
    <Card onClick={onTap}>
      <div className="flex items-start gap-3">
        <ExerciseFlowerNumber index={index} />
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-text">{exercise.name}</h3>
          <p className="text-xs text-text-secondary mt-0.5 line-clamp-2">
            {exercise.description}
          </p>

          <div className="flex flex-wrap items-center gap-2 mt-2">
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-surface-elevated text-text-muted font-medium">
              {equipmentLabels[exercise.equipment] ?? exercise.equipment}
            </span>
            {exercise.type === 'repeaters' ? (
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-primary-soft text-primary font-medium">
                {exercise.hangTime}s/{exercise.restBetweenReps}s ×{' '}
                {exercise.repsPerSet} rep × {exercise.sets} set
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
  mixed: 'Mista'
}

const equipmentLabelsModal: Record<string, string> = {
  hangboard: 'Hangboard',
  wooden_balls: 'Sfere legno',
  pull_up_bar: 'Sbarra',
  dumbbells: 'Manubri',
  fitness_band: 'Elastico',
  yoga_mat: 'Tappetino',
  bodyweight: 'Corpo libero'
}

function ExerciseDetailModal({
  exercise,
  onClose
}: {
  exercise: Exercise
  onClose: () => void
}) {
  const dragY = useMotionValue(window.innerHeight)
  const sheetScale = useTransform(dragY, [0, 300], [1, 0.95])
  const sheetOpacity = useTransform(dragY, [0, 300], [1, 0.4])
  const backdropOpacity = useTransform(dragY, [0, window.innerHeight], [1, 0])
  const sheetRef = useRef<HTMLDivElement>(null)

  // Enter animation: slide up from bottom
  useEffect(() => {
    motionAnimate(dragY, 0, { type: 'spring', damping: 28, stiffness: 300 })
  }, [dragY])

  const dismiss = useCallback(() => {
    motionAnimate(dragY, window.innerHeight, {
      duration: 0.25,
      ease: 'easeIn',
      onComplete: onClose
    })
  }, [dragY, onClose])

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
      if (dt > 0) velY = ((y - lastY) / dt) * 1000
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
          onComplete: onClose
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
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <motion.div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        style={{ opacity: backdropOpacity }}
        onClick={dismiss}
      />

      <motion.div
        ref={sheetRef}
        className="relative w-full max-w-lg max-h-[85dvh] overflow-hidden border-[3px] border-b-0 border-[#3A1248]"
        style={{
          borderRadius: RADIUS.sheetTop,
          boxShadow: `0 -4px 0px ${INK}, inset 0 2px 0 rgba(255,255,255,0.55)`,
          y: dragY,
          scale: sheetScale,
          opacity: sheetOpacity,
        }}
      >
        <div className="bg-surface overflow-y-auto overscroll-contain max-h-[85dvh]">
          <div className="sticky top-0 z-10 flex justify-center pt-3 pb-2 bg-surface">
            <div
              className="w-12 h-1.5 border-[1.5px] border-[#3A1248]"
              style={{
                borderRadius: RADIUS.btnSm,
                backgroundColor: SURFACE,
                boxShadow: SHADOW.xxs,
              }}
            />
          </div>

          <div className="px-5 pb-8">
            <div className="flex flex-col items-center text-center mb-5">
              <div
                className="w-28 h-28 bg-surface-elevated flex items-center justify-center mb-4 border-[2.5px] border-[#3A1248]"
                style={{
                  borderRadius: RADIUS.blob,
                  boxShadow: SHADOW.sm,
                }}
              >
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
              <DetailCell
                label="Serie"
                value={String(exercise.sets)}
                color="text-primary"
              />
              <DetailCell
                label="Ripetizioni"
                value={String(exercise.repsPerSet)}
                color="text-secondary"
              />
              <DetailCell
                label="Tempo"
                value={`${exercise.hangTime}s`}
                color="text-accent"
              />
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
              <div className="rounded-xl bg-accent-soft border border-accent/30 px-4 py-3 mb-5">
                <p className="text-xs text-text font-semibold uppercase tracking-wider mb-1">
                  Note
                </p>
                <p className="text-sm text-text">{exercise.notes}</p>
              </div>
            )}

            <Button variant="ghost" size="md" fullWidth onClick={dismiss}>
              Chiudi
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

function DetailCell({
  label,
  value,
  color
}: {
  label: string
  value: string
  color: string
}) {
  return (
    <div className="bg-surface-elevated rounded-xl p-3 text-center">
      <p className={`text-lg font-bold font-timer ${color}`}>{value}</p>
      <p className="text-[11px] uppercase tracking-wider text-text-muted">
        {label}
      </p>
    </div>
  )
}
