import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import PageHeader from '../components/ui/PageHeader'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import trainingProgram from '../data/training-program.json'
import type { TrainingProgram, Exercise } from '../types'
import { getDayNameIT, formatSeconds } from '../utils/dateUtils'
import { getWorkoutForDay, getDayTypeColor, getDayTypeLabel, getTotalExerciseDuration } from '../utils/programUtils'

const program = trainingProgram as unknown as TrainingProgram

const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
}
const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
}

export default function WorkoutDay() {
  const { weekNumber, dayOfWeek } = useParams<{ weekNumber: string; dayOfWeek: string }>()
  const navigate = useNavigate()

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

  return (
    <div className="min-h-dvh bg-bg">
      <PageHeader
        title={day.title}
        subtitle={`${getDayNameIT(day.dayOfWeek)} — Settimana ${week}`}
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
              <ExerciseCard exercise={exercise} index={index} />
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
    </div>
  )
}

function ExerciseCard({ exercise, index }: { exercise: Exercise; index: number }) {
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
    <Card>
      <div className="flex items-start gap-3">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-surface-elevated text-text-muted text-sm font-bold font-timer shrink-0">
          {index + 1}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-text">{exercise.name}</h3>
          <p className="text-xs text-text-secondary mt-0.5 line-clamp-2">{exercise.description}</p>

          <div className="flex flex-wrap items-center gap-2 mt-2">
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-surface-elevated text-text-muted font-medium">
              {equipmentLabels[exercise.equipment] ?? exercise.equipment}
            </span>
            {exercise.type === 'repeaters' ? (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary-soft text-primary font-medium">
                {exercise.hangTime}s/{exercise.restBetweenReps}s × {exercise.repsPerSet} rep × {exercise.sets} set
              </span>
            ) : exercise.type === 'reps' ? (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary-soft text-secondary font-medium">
                {exercise.repsPerSet} rep × {exercise.sets} set
              </span>
            ) : (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent-soft text-accent font-medium">
                {exercise.hangTime}s × {exercise.sets} set
              </span>
            )}
            {exercise.weight && exercise.weight !== 'corpo libero' && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-soft text-violet font-medium">
                {exercise.weight}
              </span>
            )}
          </div>
        </div>
      </div>
    </Card>
  )
}
