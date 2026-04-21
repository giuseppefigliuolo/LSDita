import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import { useWorkoutStore } from '../store/useWorkoutStore'
import { useSettingsStore } from '../store/useSettingsStore'
import { getProgram } from '../utils/getProgram'
import type { DayType } from '../types'
import { getWeekNumber, formatSeconds } from '../utils/dateUtils'
import {
  getTotalExerciseDuration,
  getSessionLabel
} from '../utils/programUtils'
import { fireConfettiFromEvent } from '../utils/confetti'
import { INK, RADIUS, SHADOW } from '../styles/tokens'

const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.04 } }
}

const fadeUp = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.25 } }
}

export default function Dashboard() {
  const navigate = useNavigate()
  const {
    programStartDate,
    setProgramStartDate,
    getCompletedCount,
    getStreak,
    completedWorkouts
  } = useWorkoutStore()
  const { selectedProgram, currentWeek: overrideWeek, lastBackupAt } =
    useSettingsStore()
  const program = getProgram(selectedProgram)

  const autoWeek = programStartDate
    ? getWeekNumber(programStartDate, program.durationWeeks)
    : 1
  const weekNumber = overrideWeek != null
    ? Math.min(Math.max(1, overrideWeek), program.durationWeeks)
    : autoWeek
  const currentWeek = program.weeks.find((w) => w.weekNumber === weekNumber)

  const todayDate = new Date().toISOString().split('T')[0]

  const backupDaysAgo = lastBackupAt
    ? Math.floor((Date.now() - new Date(lastBackupAt).getTime()) / 86400000)
    : null
  const showBackupReminder =
    completedWorkouts.length > 0 &&
    (backupDaysAgo === null || backupDaysAgo >= 10)

  function handleStartProgram(e: React.MouseEvent) {
    fireConfettiFromEvent(e)
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
        <img
          src={`${import.meta.env.BASE_URL}icons/logo-straight.png`}
          alt="LSDita"
          className="h-18 mx-auto"
        />
        <p className="text-text-secondary text-sm mt-1 text-center">
          {currentWeek
            ? `Settimana ${weekNumber} — ${currentWeek.theme}`
            : 'Il tuo programma di arrampicata'}
        </p>
      </motion.div>

      {showBackupReminder && (
        <motion.button
          variants={fadeUp}
          onClick={() => navigate('/settings')}
          className="w-full mb-4 p-3 border-[3px] flex items-center gap-3 text-left"
          style={{
            borderColor: INK,
            backgroundColor: '#FFF8E8',
            borderRadius: RADIUS.blob,
            boxShadow: SHADOW.sm
          }}
        >
          <div
            className="w-9 h-9 shrink-0 flex items-center justify-center border-[2.5px]"
            style={{
              borderColor: INK,
              backgroundColor: '#E2F6F6',
              borderRadius: RADIUS.blob,
              boxShadow: SHADOW.xxs
            }}
            aria-hidden
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke={INK}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold" style={{ color: INK }}>
              Fai un backup dei progressi
            </p>
            <p className="text-xs" style={{ color: INK, opacity: 0.75 }}>
              {backupDaysAgo === null
                ? 'Nessun backup effettuato finora'
                : `Ultimo backup: ${backupDaysAgo} giorni fa`}
            </p>
          </div>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke={INK}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </motion.button>
      )}

      {!programStartDate && (
        <motion.div variants={fadeUp} className="mb-6">
          <Card variant="primary" className="border-primary/30 bg-primary/5">
            <div className="text-center py-2">
              <p className="text-lg font-bold text-text mb-1">
                Pronto per iniziare?
              </p>
              <p className="text-sm text-text-secondary mb-4">{program.name}</p>
              <Button
                variant="primary"
                size="lg"
                fullWidth
                onClick={handleStartProgram}
              >
                Inizia il Programma
              </Button>
            </div>
          </Card>
        </motion.div>
      )}

      <motion.div variants={fadeUp} className="grid grid-cols-3 gap-3 mb-6">
        <StatCard
          label="Completati"
          value={String(getCompletedCount())}
          color="primary"
        />
        <StatCard label="Streak" value={`${getStreak()}g`} color="accent" />
        <StatCard
          label="Settimana"
          value={`${weekNumber}/${program.durationWeeks}`}
          color="violet"
        />
      </motion.div>

      <motion.div variants={fadeUp}>
        <h2 className="text-xs font-semibold uppercase tracking-widest text-text-muted mb-3">
          Questa settimana
        </h2>
        <div className="space-y-2">
          {currentWeek?.days.map((day) => {
            const dayCompleted = completedWorkouts.some(
              (w) =>
                w.weekNumber === weekNumber &&
                w.dayType === day.type &&
                w.date === todayDate
            )
            return (
              <Card
                key={day.dayOfWeek}
                onClick={() =>
                  navigate(`/workout/${weekNumber}/${day.dayOfWeek}`)
                }
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <DayDot type={day.type} completed={dayCompleted} />
                    <div>
                      <p className="text-sm font-semibold text-text">
                        {currentWeek
                          ? getSessionLabel(currentWeek.days, day.dayOfWeek)
                          : ''}
                      </p>
                      <p className="text-xs text-text-secondary">{day.title}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-text-muted">
                      ~{formatSeconds(getTotalExerciseDuration(day))}
                    </span>
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#8C7355"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      </motion.div>
    </motion.div>
  )
}

function StatCard({
  label,
  value,
  color
}: {
  label: string
  value: string
  color: string
}) {
  const colorClasses: Record<string, string> = {
    primary: 'text-primary',
    accent: 'text-accent',
    secondary: 'text-secondary',
    violet: 'text-violet'
  }
  return (
    <div
      className="bg-surface border-[2.5px] border-[#3A1248] p-3 text-center"
      style={{
        borderRadius: RADIUS.stat,
        boxShadow: SHADOW.sm
      }}
    >
      <p
        className={`text-xl font-bold font-timer ${colorClasses[color] ?? 'text-text'}`}
      >
        {value}
      </p>
      <p className="text-[11px] uppercase tracking-wider text-text-muted mt-0.5">
        {label}
      </p>
    </div>
  )
}

function DayDot({ type, completed }: { type: DayType; completed: boolean }) {
  const colors: Record<string, string> = {
    finger_strength: 'bg-primary',
    pull_strength: 'bg-accent',
    power_endurance: 'bg-secondary',
    general_strength: 'bg-success',
    mobility: 'bg-violet'
  }

  if (completed) {
    return (
      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-success/20">
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#5CB87A"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>
    )
  }

  return (
    <div
      className={`w-8 h-8 rounded-full ${colors[type] ?? 'bg-text-muted'} opacity-25 flex items-center justify-center`}
    >
      <div
        className={`w-3 h-3 rounded-full ${colors[type] ?? 'bg-text-muted'} opacity-100`}
      />
    </div>
  )
}
