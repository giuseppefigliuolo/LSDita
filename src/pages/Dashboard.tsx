import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import { useWorkoutStore } from '../store/useWorkoutStore'
import { useSettingsStore } from '../store/useSettingsStore'
import { useBenchmarkStore } from '../store/useBenchmarkStore'
import { getProgram } from '../utils/getProgram'
import type { TrainingDay } from '../types'
import {
  getActiveWeekNumber,
  getDayDurationLabel,
  getWeekDateRange
} from '../utils/programUtils'
import { formatKg, getLatestResult } from '../utils/benchmarks'
import { daysSince, getDayNameIT } from '../utils/dateUtils'
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
  const benchmarkResults = useBenchmarkStore((s) => s.results)
  const program = getProgram(selectedProgram)

  const weekNumber = getActiveWeekNumber(program, programStartDate, overrideWeek)
  const currentWeek = program.weeks.find((w) => w.weekNumber === weekNumber)
  const weekRange = getWeekDateRange(program, weekNumber)
  const crSummary = program.benchmarks
    ? program.benchmarks.tests
        .filter((t) => t.percentOfBodyweight)
        .map((t) => {
          const latest = getLatestResult(
            program.benchmarks!,
            benchmarkResults,
            selectedProgram,
            t.id
          )
          return latest ? `${formatKg(latest.value)} kg` : '—'
        })
        .join(' · ')
    : ''

  const backupDaysAgo = lastBackupAt ? daysSince(lastBackupAt) : null
  const showBackupReminder =
    completedWorkouts.length > 0 &&
    (backupDaysAgo === null || backupDaysAgo >= 10)

  const weekDays = currentWeek?.days ?? []
  const weeklyDays = weekDays.filter((d) => !d.anytime)
  const anytimeDays = weekDays.filter((d) => d.anytime)

  function getDayStatus(day: TrainingDay): DayStatus {
    const dayRuns = completedWorkouts.filter(
      (w) =>
        w.weekNumber === weekNumber &&
        w.id.startsWith(`${weekNumber}-${day.dayOfWeek}-`)
    )
    return dayRuns.some((w) => !w.partial)
      ? 'done'
      : dayRuns.length > 0
        ? 'partial'
        : 'todo'
  }

  function openDay(day: TrainingDay) {
    navigate(`/workout/${weekNumber}/${day.dayOfWeek}`)
  }

  function renderSessionTile(day: TrainingDay, index: number) {
    return (
      <button
        key={day.dayOfWeek}
        type="button"
        onClick={() => openDay(day)}
        className={`poster-card poster-lift flex min-h-[150px] flex-col justify-between rounded-[22px] p-3.5 text-left text-plum ${SESSION_PASTEL[day.type] ?? 'bg-paper'}`}
      >
        <div className="flex items-start justify-between gap-2">
          <span className="font-poster text-[30px] leading-none">
            {day.label ?? `S${index + 1}`}
          </span>
          <span className="shrink-0 whitespace-nowrap rounded-full border-[1.5px] border-plum bg-paper px-2 py-0.5 font-mono text-[11px]">
            {getDayDurationLabel(day)}
          </span>
        </div>
        <div>
          <div className="flex items-center justify-between gap-2">
            <p className="text-base font-extrabold leading-tight">
              {getDayNameIT(day.dayOfWeek)}
            </p>
            <StatusBadge status={getDayStatus(day)} />
          </div>
          <p className="mt-0.5 text-[13px] leading-snug text-plum-soft">
            {day.title}
          </p>
        </div>
      </button>
    )
  }

  function renderAnytimeRow(day: TrainingDay, index: number) {
    const letter = day.label?.split(' ').pop() ?? String.fromCharCode(65 + index)
    return (
      <button
        key={day.dayOfWeek}
        type="button"
        onClick={() => openDay(day)}
        className="flex min-h-[60px] w-full items-center gap-3 rounded-[20px] border-2 border-dashed border-plum bg-paper px-3.5 py-2.5 text-left text-plum transition-colors active:bg-cream focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-violet"
      >
        <span
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-plum bg-pastel-lavender font-poster text-xl leading-none"
          aria-hidden
        >
          {letter}
        </span>
        <p className="min-w-0 flex-1 text-[15px] font-extrabold leading-tight">
          {day.title}
        </p>
        <StatusBadge status={getDayStatus(day)} />
        <span className="shrink-0 whitespace-nowrap font-mono text-[11px] text-brown">
          {getDayDurationLabel(day)}
        </span>
      </button>
    )
  }

  function handleStartProgram(e: React.MouseEvent) {
    fireConfettiFromEvent(e)
    setProgramStartDate(new Date().toISOString().split('T')[0])
  }

  return (
    <motion.div
      className="px-5 pt-6 pb-6 max-w-lg mx-auto"
      variants={stagger}
      initial="hidden"
      animate="show"
    >
      <motion.header
        variants={fadeUp}
        className="relative flex flex-col items-center pt-12 pb-20 text-center"
      >
        {/* Full-bleed band from the page top; rays centred on the logo
            (24px page padding + 48px header padding + 41.75px half logo) */}
        <div
          className="poster-sunburst-frame pointer-events-none absolute -top-6 bottom-0 left-1/2 w-screen -translate-x-1/2"
          aria-hidden
        >
          <div className="poster-sunburst absolute left-1/2 top-[114px] size-[max(720px,160vw)] -translate-x-1/2 -translate-y-1/2" />
        </div>
        <img
          src={`${import.meta.env.BASE_URL}icons/logo-straight.png`}
          alt="LSDita"
          className="relative h-[83.5px] mx-auto"
        />
        <p className="relative mt-3 inline-flex items-center gap-1.5 rounded-full bg-plum px-4 py-1.5 text-[13px] font-bold text-cream">
          {currentWeek ? (
            <>
              Settimana {weekNumber}
              <span className="text-mustard" aria-hidden>
                ✦
              </span>
              {currentWeek.theme}
            </>
          ) : (
            'Il tuo programma di arrampicata'
          )}
        </p>
        {weekRange && (
          <p className="relative mt-4 font-mono text-xs text-brown">
            {weekRange}
          </p>
        )}
      </motion.header>

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

      {!programStartDate && !program.startDate && (
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

      <motion.div
        variants={fadeUp}
        className="poster-card mb-6 grid grid-cols-3 rounded-[20px] bg-paper py-3.5"
      >
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

      {/* Content-sized widths, as in the mockup: the longer title gets more room */}
      {(program.warmup || program.benchmarks) && (
        <motion.div variants={fadeUp} className="mb-7 flex gap-4">
          {program.warmup && (
            <PosterLinkCard
              className="bg-pastel-coral -rotate-2"
              eyebrow="Fisso"
              title="Riscaldamento"
              subtitle="15–25' + rampa dita"
              onClick={() => navigate('/warmup')}
            />
          )}
          {program.benchmarks && (
            <PosterLinkCard
              className="bg-pastel-mint rotate-2"
              eyebrow="Test"
              title="CR e test"
              subtitle={crSummary}
              onClick={() => navigate('/tests')}
            />
          )}
        </motion.div>
      )}

      <motion.section variants={fadeUp}>
        <h2 className={SECTION_TITLE}>Questa settimana</h2>
        <div className="grid grid-cols-2 gap-[14px]">
          {weeklyDays.map(renderSessionTile)}
        </div>
      </motion.section>

      {anytimeDays.length > 0 && (
        <motion.section variants={fadeUp} className="mt-7">
          <h2 className={SECTION_TITLE}>Da casa · quando vuoi</h2>
          <div className="space-y-2.5">
            {anytimeDays.map(renderAnytimeRow)}
          </div>
        </motion.section>
      )}
    </motion.div>
  )
}

const SECTION_TITLE = 'mb-3 font-poster text-[22px] leading-tight text-plum'

// Pastel per session type — same hue families as the previous DayDot mapping
const SESSION_PASTEL: Record<string, string> = {
  finger_strength: 'bg-pastel-peach',
  test: 'bg-pastel-peach',
  lead: 'bg-pastel-mint',
  power_endurance: 'bg-pastel-mint',
  climbing_gym: 'bg-pastel-sage',
  general_strength: 'bg-pastel-sage',
  boulder: 'bg-pastel-butter',
  pull_strength: 'bg-pastel-butter',
  mobility: 'bg-pastel-lavender',
  antagonists: 'bg-pastel-lavender'
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
    <div className="px-2 text-center not-first:border-l-2 not-first:border-dashed not-first:border-sand">
      <p
        className={`font-poster text-[30px] leading-none ${colorClasses[color] ?? 'text-plum'}`}
      >
        {value}
      </p>
      <p className="mt-1.5 text-[11px] font-extrabold uppercase tracking-[0.1em] text-brown">
        {label}
      </p>
    </div>
  )
}

function PosterLinkCard({
  eyebrow,
  title,
  subtitle,
  onClick,
  className
}: {
  eyebrow: string
  title: string
  subtitle?: string
  onClick: () => void
  className: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`poster-card poster-lift min-h-[44px] min-w-0 flex-auto rounded-[20px] p-3.5 text-left text-plum ${className}`}
    >
      <p className="font-mono text-[11px] uppercase tracking-[0.08em]">
        {eyebrow}
      </p>
      <p className="mt-1 font-poster text-[19px] leading-tight break-words hyphens-auto">
        {title}
      </p>
      {subtitle && (
        <p className="mt-1 text-[13px] font-semibold leading-snug">{subtitle}</p>
      )}
    </button>
  )
}

type DayStatus = 'done' | 'partial' | 'todo'

function StatusBadge({ status }: { status: DayStatus }) {
  if (status === 'todo') return null

  const label = status === 'done' ? 'Completata' : 'Sessione interrotta'
  return (
    <span
      role="img"
      aria-label={label}
      title={label}
      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-plum bg-paper"
    >
      {status === 'done' ? (
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ) : (
        // Half-filled circle: session started but interrupted before the end.
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="9" stroke="#D4541A" strokeWidth="3" />
          <path d="M12 3a9 9 0 0 1 0 18z" fill="#D4541A" />
        </svg>
      )}
    </span>
  )
}
