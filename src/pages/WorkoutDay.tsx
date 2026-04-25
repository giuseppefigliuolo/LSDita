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
        boxShadow: SHADOW.xs
      }}
      whileTap={{ x: 2, y: 2, boxShadow: `0px 0px 0px ${INK}` }}
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke={INK}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
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
            sessionTitle={day.title}
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
        boxShadow: SHADOW.lg
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
        transition={{
          delay: 0.35,
          type: 'spring',
          stiffness: 220,
          damping: 16
        }}
        style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
      >
        <circle cx={cx} cy={cy} r="11" fill="#5A2878" />
        <circle cx={cx - 1} cy={cy - 2} r="9" fill="#7B3A9E" opacity="0.85" />
        <circle cx={cx - 3} cy={cy - 3} r="1.2" fill="#3A1248" opacity="0.6" />
        <circle cx={cx + 3} cy={cy - 1} r="1.2" fill="#3A1248" opacity="0.6" />
        <circle cx={cx + 1} cy={cy + 3} r="1.2" fill="#3A1248" opacity="0.55" />
        <circle cx={cx - 4} cy={cy + 2} r="1" fill="#3A1248" opacity="0.5" />
        <circle cx={cx + 4} cy={cy + 4} r="1" fill="#3A1248" opacity="0.5" />
        <ellipse
          cx={cx - 3}
          cy={cy - 5}
          rx="3"
          ry="2"
          fill="white"
          opacity="0.35"
        />
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

const difficultyConfig: Record<
  NonNullable<Exercise['difficulty']>,
  { label: string; bg: string; fg: string }
> = {
  facile: { label: 'Facile', bg: '#5A9A1E', fg: '#FFFBF0' },
  medio: { label: 'Medio', bg: '#E8B820', fg: INK },
  hard: { label: 'Hard', bg: '#D4541A', fg: '#FFFBF0' }
}

function ExerciseDetailModal({
  exercise,
  sessionTitle,
  onClose
}: {
  exercise: Exercise
  sessionTitle: string
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
          opacity: sheetOpacity
        }}
      >
        <div className="bg-surface overflow-y-auto overscroll-contain max-h-[85dvh]">
          <div className="sticky top-0 z-10 flex justify-center pt-3 pb-2 bg-surface">
            <div
              className="w-12 h-1.5 border-[1.5px] border-[#3A1248]"
              style={{
                borderRadius: RADIUS.btnSm,
                backgroundColor: SURFACE,
                boxShadow: SHADOW.xxs
              }}
            />
          </div>

          <ExerciseDetailBody
            exercise={exercise}
            sessionTitle={sessionTitle}
          />
        </div>

        <button
          type="button"
          onClick={dismiss}
          aria-label="Chiudi"
          className="absolute top-3 right-3 z-20 w-9 h-9 flex items-center justify-center border-[2.5px] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all"
          style={{
            borderColor: INK,
            backgroundColor: '#FFF8E8',
            borderRadius: RADIUS.backBtn,
            boxShadow: SHADOW.xs
          }}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke={INK}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </motion.div>
    </div>
  )
}

function ExerciseDetailBody({
  exercise,
  sessionTitle
}: {
  exercise: Exercise
  sessionTitle: string
}) {
  const equipmentLabel =
    equipmentLabels[exercise.equipment] ?? exercise.equipment
  const gripLabel = exercise.grip ? gripLabels[exercise.grip] : null
  const isReps = exercise.type === 'reps'
  const showTimeline = !isReps
  const difficulty = exercise.difficulty
    ? difficultyConfig[exercise.difficulty]
    : null
  const hasWeight = exercise.weight && exercise.weight !== 'corpo libero'

  return (
    <div className="px-5 pb-8 pt-1">
      {/* Top row: illustration + meta + close */}
      <div className="flex items-start gap-4 mb-5">
        <div
          className="shrink-0 flex items-center justify-center border-[2.5px] border-[#3A1248]"
          style={{
            width: 84,
            height: 84,
            borderRadius: RADIUS.blob,
            backgroundColor: '#FFF8E8',
            boxShadow: SHADOW.sm
          }}
        >
          <ExerciseIllustration name={exercise.illustration} size={62} />
        </div>
        <div className="flex-1 min-w-0 pr-10">
          <p
            className="text-[10px] font-bold uppercase tracking-[0.2em] mb-1"
            style={{ color: '#D4541A' }}
          >
            {sessionTitle}
          </p>
          <h2
            className="font-bold text-text leading-tight mb-2.5"
            style={{
              fontSize: 24,
              fontFamily: 'var(--font-display)',
              overflowWrap: 'anywhere'
            }}
          >
            {exercise.name}
          </h2>
          <div className="flex flex-wrap gap-1.5">
            <MetaPill variant="muted">{equipmentLabel}</MetaPill>
            {gripLabel && <MetaPill variant="accent">{gripLabel}</MetaPill>}
            {hasWeight && (
              <MetaPill variant="muted">{exercise.weight}</MetaPill>
            )}
          </div>
        </div>
      </div>

      {/* Protocol card */}
      <div
        className="mb-3 border-[2.5px] border-[#3A1248] overflow-hidden"
        style={{
          borderRadius: RADIUS.card,
          backgroundColor: '#FFF8E8',
          boxShadow: SHADOW.sm
        }}
      >
        <div className="px-4 pt-3 pb-1">
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-text-muted">
            Protocollo
          </p>
        </div>
        <div className="flex items-stretch px-2 pb-2">
          <ProtocolStat
            value={`${exercise.sets}×${exercise.repsPerSet}`}
            label={isReps ? 'Set × Rep' : 'Serie × Rep'}
            color="#D4541A"
          />
          {!isReps && (
            <>
              <DashedDivider />
              <ProtocolStat
                value={`${exercise.hangTime}s`}
                label="Tenuta"
                color="#E8B820"
              />
            </>
          )}
          {!isReps && exercise.restBetweenReps > 0 && (
            <>
              <DashedDivider />
              <ProtocolStat
                value={`${exercise.restBetweenReps}s`}
                label="Pausa rep"
                color="#3FB6A8"
              />
            </>
          )}
        </div>
        {showTimeline && (
          <div className="px-4 pb-3 pt-1">
            <RepTimeline
              reps={exercise.repsPerSet}
              hangTime={exercise.hangTime}
              restBetweenReps={exercise.restBetweenReps}
            />
            <div className="flex items-center justify-between mt-2 text-[11px] text-text-muted font-timer">
              <span>
                1 serie = {exercise.repsPerSet} ripetizioni ×{' '}
                {exercise.hangTime}s hang
                {exercise.restBetweenReps > 0
                  ? ` / ${exercise.restBetweenReps}s pausa`
                  : ''}
              </span>
              <span className="flex items-center gap-1">
                <span
                  className="inline-block w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: '#E8B820' }}
                />
                hang
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Side cards: rest set + difficulty */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <SideCard
          icon={
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#FFFBF0"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="13" r="8" />
              <path d="M12 9v4l2.5 2.5M9 2h6M12 5V2" />
            </svg>
          }
          iconBg="#7B3A9E"
          value={`${exercise.restBetweenSets}s`}
          label="Recupero tra serie"
        />
        {difficulty && (
          <SideCard
            icon={
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke={difficulty.fg}
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="9" />
                <circle cx="12" cy="12" r="5" />
                <circle cx="12" cy="12" r="1.5" fill={difficulty.fg} />
              </svg>
            }
            iconBg={difficulty.bg}
            value={difficulty.label}
            label="Difficoltà"
          />
        )}
      </div>

      {/* Description */}
      <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-text-muted mb-2">
        Descrizione
      </p>
      <div
        className="mb-5 px-4 py-3.5 border-[2.5px] border-[#3A1248]"
        style={{
          borderRadius: RADIUS.card,
          backgroundColor: '#FFF8E8',
          boxShadow: SHADOW.sm
        }}
      >
        <p
          className="text-text"
          style={{ fontSize: 14, lineHeight: 1.55 }}
        >
          <ExerciseDescription text={exercise.description} />
        </p>
      </div>

      {/* Note pill */}
      {exercise.notes && (
        <div
          className="inline-flex items-center gap-2 max-w-full px-3.5 py-2 text-xs font-medium text-text"
          style={{
            border: `1.5px dashed ${INK}`,
            borderRadius: RADIUS.pill,
            backgroundColor: 'transparent'
          }}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#E8B820"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="shrink-0"
          >
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
          </svg>
          <span className="font-bold uppercase tracking-wider text-[10px]">
            Nota:
          </span>
          <span className="truncate min-w-0">{exercise.notes}</span>
        </div>
      )}
    </div>
  )
}

function MetaPill({
  children,
  variant
}: {
  children: React.ReactNode
  variant: 'muted' | 'accent'
}) {
  const isAccent = variant === 'accent'
  return (
    <span
      className="inline-flex items-center text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 border-[1.5px] border-[#3A1248]"
      style={{
        borderRadius: RADIUS.pill,
        backgroundColor: isAccent ? '#D4541A' : '#FFF8E8',
        color: isAccent ? '#FFFBF0' : INK
      }}
    >
      {children}
    </span>
  )
}

function ProtocolStat({
  value,
  label,
  color
}: {
  value: string
  label: string
  color: string
}) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center py-2 px-2">
      <span
        className="font-bold font-timer leading-none"
        style={{ color, fontSize: 26 }}
      >
        {value}
      </span>
      <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted mt-1.5">
        {label}
      </span>
    </div>
  )
}

function DashedDivider() {
  return (
    <div
      className="self-stretch my-2"
      style={{
        width: 0,
        borderLeft: `1.5px dashed ${INK}`,
        opacity: 0.4
      }}
    />
  )
}

function RepTimeline({
  reps,
  hangTime,
  restBetweenReps
}: {
  reps: number
  hangTime: number
  restBetweenReps: number
}) {
  const hangColor = '#E8B820'
  const restColor = '#3FB6A8'
  const hasRest = restBetweenReps > 0
  const segments: { weight: number; color: string }[] = []
  for (let i = 0; i < reps; i++) {
    segments.push({ weight: hangTime, color: hangColor })
    if (hasRest && i < reps - 1) {
      segments.push({ weight: restBetweenReps, color: restColor })
    }
  }
  const total = segments.reduce((sum, s) => sum + s.weight, 0)

  return (
    <div
      className="flex w-full overflow-hidden border-[2px] border-[#3A1248]"
      style={{
        height: 22,
        borderRadius: RADIUS.pill,
        boxShadow: SHADOW.xxs
      }}
    >
      {segments.map((s, i) => (
        <div
          key={i}
          style={{
            width: `${(s.weight / total) * 100}%`,
            backgroundColor: s.color,
            borderRight:
              i < segments.length - 1 ? `1.5px solid ${INK}` : 'none'
          }}
        />
      ))}
    </div>
  )
}

function SideCard({
  icon,
  iconBg,
  value,
  label
}: {
  icon: React.ReactNode
  iconBg: string
  value: string
  label: string
}) {
  return (
    <div
      className="flex items-center gap-3 px-3 py-3 border-[2.5px] border-[#3A1248]"
      style={{
        borderRadius: RADIUS.card,
        backgroundColor: '#FFF8E8',
        boxShadow: SHADOW.sm
      }}
    >
      <div
        className="shrink-0 w-10 h-10 flex items-center justify-center border-[2px] border-[#3A1248]"
        style={{
          backgroundColor: iconBg,
          borderRadius: RADIUS.btnSm,
          boxShadow: SHADOW.xs
        }}
      >
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-base font-bold font-timer text-text leading-tight">
          {value}
        </p>
        <p className="text-[11px] text-text-muted leading-tight mt-0.5">
          {label}
        </p>
      </div>
    </div>
  )
}

