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
import ExerciseDescription from '../components/ui/ExerciseDescription'
import Button from '../components/ui/Button'
import ExerciseIllustration from '../components/illustrations/ExerciseIllustration'
import EditDayModal from '../components/EditDayModal'
import type { Exercise } from '../types'
import { useSettingsStore } from '../store/useSettingsStore'
import { getProgram } from '../utils/getProgram'
import {
  getWorkoutForDay,
  getDayTypeLabel,
  getTotalExerciseDuration,
  getSessionLabel
} from '../utils/programUtils'
import { INK, SURFACE, RADIUS, SHADOW } from '../styles/tokens'

function EditPencilButton({ onClick }: { onClick: () => void }) {
  return (
    <motion.button
      onClick={onClick}
      className="flex items-center justify-center w-9 h-9 border-[2.5px] border-[#3A1248] cursor-pointer"
      style={{
        backgroundColor: SURFACE,
        borderRadius: RADIUS.backBtn,
        boxShadow: SHADOW.xs,
      }}
      whileTap={{ x: 2, y: 2, boxShadow: `0px 0px 0px ${INK}` }}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={INK} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
      </svg>
    </motion.button>
  )
}

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
  const [editing, setEditing] = useState(false)
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
  const totalMin = Math.round(getTotalExerciseDuration(day) / 60)
  const headerSubtitle = `Settimana ${week}${weekData ? ` · ${weekData.theme}` : ''}`

  return (
    <div className="bg-bg">
      <PageHeader
        title={sessionLabel}
        subtitle={headerSubtitle}
        backButton
        rightAction={<EditPencilButton onClick={() => setEditing(true)} />}
      />

      <motion.div
        className="px-4 pt-2 pb-8 max-w-lg mx-auto"
        variants={stagger}
        initial="hidden"
        animate="show"
      >
        <motion.div variants={fadeUp}>
          <HeroCard
            typeLabel={getDayTypeLabel(day.type)}
            title={day.title}
            description={day.description}
            exerciseCount={day.exercises.length}
            durationMin={totalMin}
          />
        </motion.div>

        <motion.p
          variants={fadeUp}
          className="text-[11px] font-bold uppercase tracking-[0.25em] text-text-muted mt-6 mb-3"
        >
          Esercizi
        </motion.p>

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
            ▶ Inizia allenamento · {totalMin} min
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
        {editing && (
          <EditDayModal
            day={day}
            weekNumber={week}
            programId={selectedProgram}
            onClose={() => setEditing(false)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

// ──────────────────────────────────────────────────────────────
// Hero card
// ──────────────────────────────────────────────────────────────

function HeroCard({
  typeLabel,
  title,
  description,
  exerciseCount,
  durationMin
}: {
  typeLabel: string
  title: string
  description: string
  exerciseCount: number
  durationMin: number
}) {
  return (
    <div
      className="relative overflow-hidden border-[3px] border-[#3A1248]"
      style={{
        borderRadius: RADIUS.card,
        boxShadow: SHADOW.lg,
      }}
    >
      <div
        className="relative px-5 pt-5 pb-5"
        style={{
          background:
            'linear-gradient(135deg, #17A8A8 0%, #3E6FA8 50%, #7B3A9E 100%)'
        }}
      >
        <HeroFlower />
        <div className="relative">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/85 mb-1">
            {typeLabel}
          </p>
          <h2 className="text-3xl font-bold text-white leading-tight mb-4 pr-16">
            {title}
          </h2>
          <div className="flex flex-wrap gap-2">
            <HeroPill>{exerciseCount} esercizi</HeroPill>
            <HeroPill>~{durationMin} min</HeroPill>
          </div>
        </div>
      </div>
      <div className="bg-surface-elevated px-5 py-3 border-t-[2.5px] border-[#3A1248]">
        <p className="text-sm text-text leading-relaxed">
          <ExerciseDescription text={description} />
        </p>
      </div>
    </div>
  )
}

function HeroPill({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="text-[10px] font-bold uppercase tracking-wider text-white px-3 py-1 border-[1.5px] border-white/50"
      style={{
        borderRadius: RADIUS.pill,
        backgroundColor: 'rgba(255,255,255,0.15)'
      }}
    >
      {children}
    </span>
  )
}

function HeroFlower() {
  // Daisy-style: pointed almond petals radiating from a solid dome center
  const cx = 50
  const cy = 50
  const petals = 11
  return (
    <svg
      className="absolute -top-2 -right-1 pointer-events-none"
      width="120"
      height="120"
      viewBox="0 0 100 100"
    >
      {/* Almond-shaped petals — bloom outward with a slight stagger */}
      {Array.from({ length: petals }, (_, i) => {
        const angle = (i * 360) / petals
        return (
          <g
            key={`hf-p-${i}`}
            transform={`translate(${cx} ${cy}) rotate(${angle})`}
          >
            <motion.path
              d="M 0 -8 C -7 -14, -7 -28, 0 -32 C 7 -28, 7 -14, 0 -8 Z"
              fill="#DCC8EC"
              style={{
                transformBox: 'fill-box',
                transformOrigin: '50% 100%'
              }}
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{
                delay: 0.15 + i * 0.04,
                type: 'spring',
                stiffness: 180,
                damping: 14
              }}
            />
          </g>
        )
      })}
      {/* Dome center — fades in after petals bloom */}
      <motion.g
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.35, type: 'spring', stiffness: 220, damping: 16 }}
        style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
      >
        <circle cx={cx} cy={cy} r="11" fill="#5A2878" />
        <circle cx={cx - 1} cy={cy - 2} r="9" fill="#7B3A9E" opacity="0.85" />
        <circle cx={cx - 3} cy={cy - 3} r="1.2" fill="#3A1248" opacity="0.6" />
        <circle cx={cx + 3} cy={cy - 1} r="1.2" fill="#3A1248" opacity="0.6" />
        <circle cx={cx + 1} cy={cy + 3} r="1.2" fill="#3A1248" opacity="0.55" />
        <circle cx={cx - 4} cy={cy + 2} r="1" fill="#3A1248" opacity="0.5" />
        <circle cx={cx + 4} cy={cy + 4} r="1" fill="#3A1248" opacity="0.5" />
        <ellipse cx={cx - 3} cy={cy - 5} rx="3" ry="2" fill="white" opacity="0.35" />
      </motion.g>
    </svg>
  )
}

// ──────────────────────────────────────────────────────────────
// Exercise card
// ──────────────────────────────────────────────────────────────

const gripLabels: Record<string, string> = {
  half_crimp: 'Half crimp',
  open_hand: 'Mano aperta',
  full_crimp: 'Arcuata',
  three_finger_drag: 'Tre dita',
  pinch: 'Pinch',
  sloper: 'Sloper',
  mixed: 'Mista'
}

const equipmentLabels: Record<string, string> = {
  hangboard: 'Hangboard',
  wooden_balls: 'Sfere legno',
  pull_up_bar: 'Sbarra',
  dumbbells: 'Manubri',
  fitness_band: 'Elastico',
  yoga_mat: 'Tappetino',
  bodyweight: 'Corpo libero'
}

function getTechLine(ex: Exercise): string {
  const parts: string[] = []
  if (ex.grip) parts.push(gripLabels[ex.grip] ?? ex.grip)
  if (ex.weight && ex.weight !== 'corpo libero') parts.push(ex.weight)
  if (ex.type === 'repeaters') {
    parts.push(`${ex.hangTime}s on / ${ex.restBetweenReps}s off`)
  } else if (
    ex.type === 'timed_hang' ||
    ex.type === 'timed_hold' ||
    ex.type === 'timed_stretch'
  ) {
    parts.push(`${ex.hangTime}s`)
  }
  if (parts.length === 0) {
    parts.push(equipmentLabels[ex.equipment] ?? ex.equipment)
  }
  return parts.join(' · ')
}

function getVolume(ex: Exercise): { value: string; unit: string } {
  if (ex.type === 'repeaters' || ex.type === 'reps') {
    return { value: `${ex.sets}×${ex.repsPerSet}`, unit: 'SET × REP' }
  }
  return { value: `${ex.sets}×${ex.hangTime}s`, unit: 'SET × TEMPO' }
}

const tileColors = [
  '#17A8A8',
  '#D4541A',
  '#E8B820',
  '#7B3A9E',
  '#5A9A1E',
  '#E84830'
]

function ExerciseTile({ index }: { index: number }) {
  const color = tileColors[index % tileColors.length]
  return (
    <div
      className="relative flex items-center justify-center w-12 h-12 shrink-0 border-[2.5px] border-[#3A1248]"
      style={{
        backgroundColor: color,
        borderRadius: RADIUS.btnSm,
        boxShadow: SHADOW.xs
      }}
    >
      <span
        className="text-xl font-bold font-timer text-[#FFFBF0]"
        style={{ textShadow: '0 1px 2px rgba(58,18,72,0.6)' }}
      >
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
  const volume = getVolume(exercise)
  return (
    <Card onClick={onTap}>
      <div className="flex items-center gap-3">
        <ExerciseTile index={index} />
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-text truncate">
            {exercise.name}
          </h3>
          <p className="text-xs text-text-secondary mt-0.5 truncate">
            {getTechLine(exercise)}
          </p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-base font-bold font-timer text-text leading-none">
            {volume.value}
          </p>
          <p className="text-[10px] uppercase tracking-wider text-text-muted mt-1">
            {volume.unit}
          </p>
        </div>
      </div>
    </Card>
  )
}

// ──────────────────────────────────────────────────────────────
// Exercise detail modal (unchanged)
// ──────────────────────────────────────────────────────────────

const gripLabelsModal: Record<string, string> = {
  half_crimp: 'Semi-arcuata',
  open_hand: 'Mano aperta',
  full_crimp: 'Arcuata piena',
  three_finger_drag: 'Tre dita',
  pinch: 'Pinch',
  sloper: 'Sloper',
  mixed: 'Mista'
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
              <ExerciseDescription text={exercise.description} />
            </p>

            <div className="flex flex-wrap gap-2 mb-5">
              <span className="text-xs px-3 py-1 rounded-full bg-surface-elevated text-text-muted font-medium">
                {equipmentLabels[exercise.equipment] ?? exercise.equipment}
              </span>
              {exercise.grip && (
                <span className="text-xs px-3 py-1 rounded-full bg-primary-soft text-primary font-medium">
                  {gripLabelsModal[exercise.grip] ?? exercise.grip}
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
              <div className="bg-accent-soft border-[2px] border-[#3A1248] px-4 py-3 mb-5" style={{ borderRadius: RADIUS.btnSm, boxShadow: SHADOW.xs }}>
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
    <div className="bg-surface-elevated border-[2px] border-[#3A1248] p-3 text-center" style={{ borderRadius: RADIUS.stat, boxShadow: SHADOW.xs }}>
      <p className={`text-lg font-bold font-timer ${color}`}>{value}</p>
      <p className="text-[11px] uppercase tracking-wider text-text-muted">
        {label}
      </p>
    </div>
  )
}
