import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import { useWorkoutStore } from '../store/useWorkoutStore'
import trainingProgram from '../data/training-program.json'
import type { TrainingProgram, DayType } from '../types'
import { getCurrentDayOfWeek, getWeekNumber, formatSeconds } from '../utils/dateUtils'
import { getTotalExerciseDuration, getDayTypeColor, getDayTypeLabel, getSessionLabel } from '../utils/programUtils'

const program = trainingProgram as unknown as TrainingProgram

const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
}

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
}

export default function Dashboard() {
  const navigate = useNavigate()
  const { programStartDate, setProgramStartDate, getCompletedCount, getStreak, completedWorkouts } = useWorkoutStore()

  const currentDayOfWeek = getCurrentDayOfWeek()
  const weekNumber = programStartDate ? getWeekNumber(programStartDate) : 1
  const currentWeek = program.weeks.find((w) => w.weekNumber === weekNumber)

  const todayWorkout = currentWeek?.days.find((d) => d.dayOfWeek === currentDayOfWeek)
  const todayDate = new Date().toISOString().split('T')[0]
  const isTodayCompleted = todayWorkout
    ? completedWorkouts.some((w) => w.date === todayDate && w.dayType === todayWorkout.type)
    : false

  function handleStartProgram() {
    setProgramStartDate(new Date().toISOString().split('T')[0])
  }

  return (
    <motion.div
      className="px-4 pt-6 pb-6 max-w-lg mx-auto"
      variants={stagger}
      initial="hidden"
      animate="show"
    >
      <motion.div variants={fadeUp} className="mb-6">
        <h1 className="text-3xl font-black tracking-tight">
          <span className="text-gradient-primary">Crux</span>
          <span className="text-text">Timer</span>
        </h1>
        <p className="text-text-secondary text-sm mt-1">
          {currentWeek
            ? `Settimana ${weekNumber} — ${currentWeek.theme}`
            : 'Il tuo programma di arrampicata'}
        </p>
      </motion.div>

      {!programStartDate && (
        <motion.div variants={fadeUp} className="mb-6">
          <Card variant="primary" className="border-primary/30 bg-primary/5">
            <div className="text-center py-2">
              <p className="text-lg font-bold text-text mb-1">Pronto per iniziare?</p>
              <p className="text-sm text-text-secondary mb-4">
                Piano di 4 settimane per migliorare la tua arrampicata
              </p>
              <Button variant="primary" size="lg" fullWidth onClick={handleStartProgram}>
                Inizia il Programma
              </Button>
            </div>
          </Card>
        </motion.div>
      )}

      <motion.div variants={fadeUp} className="grid grid-cols-3 gap-3 mb-6">
        <StatCard label="Completati" value={String(getCompletedCount())} color="primary" />
        <StatCard label="Streak" value={`${getStreak()}g`} color="accent" />
        <StatCard label="Settimana" value={`${weekNumber}/4`} color="violet" />
      </motion.div>

      {todayWorkout ? (
        <motion.div variants={fadeUp} className="mb-6">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-text-muted mb-3">
            Oggi — {currentWeek ? getSessionLabel(currentWeek.days, currentDayOfWeek) : ''}
          </h2>
          <Card
            variant={getDayTypeColor(todayWorkout.type) as 'primary' | 'secondary' | 'violet'}
            onClick={() => navigate(`/workout/${weekNumber}/${currentDayOfWeek}`)}
            className="overflow-hidden"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <Badge variant={getDayTypeColor(todayWorkout.type) as 'primary' | 'secondary' | 'accent' | 'violet'}>
                  {getDayTypeLabel(todayWorkout.type)}
                </Badge>
                <h3 className="text-lg font-bold mt-2 text-text">{todayWorkout.title}</h3>
                <p className="text-sm text-text-secondary mt-1">{todayWorkout.description}</p>
                <div className="flex items-center gap-4 mt-3 text-xs text-text-muted">
                  <span>{todayWorkout.exercises.length} esercizi</span>
                  <span>~{formatSeconds(getTotalExerciseDuration(todayWorkout))}</span>
                </div>
              </div>
              {isTodayCompleted && (
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-success/20">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4DD474" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
              )}
            </div>
          </Card>
        </motion.div>
      ) : (
        <motion.div variants={fadeUp} className="mb-6">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-text-muted mb-3">
            Oggi
          </h2>
          <Card>
            <div className="text-center py-4">
              <p className="text-2xl mb-2">🧗</p>
              <p className="text-text font-medium">
                {currentDayOfWeek === 'wednesday' ? 'Giorno di palestra!' : 'Giorno di riposo'}
              </p>
              <p className="text-sm text-text-secondary mt-1">
                {currentDayOfWeek === 'wednesday'
                  ? 'Vai in palestra e arrampica!'
                  : 'Il recupero è parte dell\'allenamento'}
              </p>
            </div>
          </Card>
        </motion.div>
      )}

      <motion.div variants={fadeUp}>
        <h2 className="text-xs font-semibold uppercase tracking-widest text-text-muted mb-3">
          Questa settimana
        </h2>
        <div className="space-y-2">
          {currentWeek?.days.map((day) => {
            const isToday = day.dayOfWeek === currentDayOfWeek
            const dayCompleted = completedWorkouts.some(
              (w) => w.weekNumber === weekNumber && w.dayType === day.type && w.date === todayDate,
            )
            return (
              <Card
                key={day.dayOfWeek}
                onClick={() => navigate(`/workout/${weekNumber}/${day.dayOfWeek}`)}
                className={isToday ? 'ring-1 ring-primary/50 bg-primary/5' : 'opacity-60'}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <DayDot type={day.type} completed={dayCompleted} />
                    <div>
                      <p className="text-sm font-semibold text-text">{currentWeek ? getSessionLabel(currentWeek.days, day.dayOfWeek) : ''}</p>
                      <p className="text-xs text-text-secondary">{day.title}</p>
                    </div>
                  </div>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#55556A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </div>
              </Card>
            )
          })}
        </div>
      </motion.div>
    </motion.div>
  )
}

function StatCard({ label, value, color }: { label: string; value: string; color: string }) {
  const colorClasses: Record<string, string> = {
    primary: 'text-primary',
    accent: 'text-accent',
    secondary: 'text-secondary',
    violet: 'text-violet',
  }
  return (
    <div className="bg-surface rounded-xl border border-border p-3 text-center">
      <p className={`text-xl font-bold font-timer ${colorClasses[color] ?? 'text-text'}`}>{value}</p>
      <p className="text-[10px] uppercase tracking-wider text-text-muted mt-0.5">{label}</p>
    </div>
  )
}

function DayDot({ type, completed }: { type: DayType; completed: boolean }) {
  const colors: Record<string, string> = {
    finger_strength: 'bg-primary',
    pull_strength: 'bg-accent',
    power_endurance: 'bg-secondary',
    mobility: 'bg-violet',
  }

  if (completed) {
    return (
      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-success/20">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4DD474" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>
    )
  }

  return (
    <div className={`w-8 h-8 rounded-full ${colors[type] ?? 'bg-text-muted'} opacity-25 flex items-center justify-center`}>
      <div className={`w-3 h-3 rounded-full ${colors[type] ?? 'bg-text-muted'} opacity-100`} />
    </div>
  )
}
