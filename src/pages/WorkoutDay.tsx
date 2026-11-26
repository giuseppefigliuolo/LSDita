import { useState, useLayoutEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import IconButton from '../components/ui/IconButton'
import Button from '../components/ui/Button'
import GuideSectionCard from '../components/ui/GuideSectionCard'
import LinkCard from '../components/ui/LinkCard'
import LoadCard from '../components/LoadCard'
import EditDayModal from '../components/edit-day/EditDayModal'
import HeroCard from '../components/workout-day/HeroCard'
import ExerciseRow from '../components/workout-day/ExerciseRow'
import ExerciseDetailSheet from '../components/workout-day/ExerciseDetailSheet'
import SessionActionBar from '../components/workout-day/SessionActionBar'
import type { Exercise } from '../types'
import { dayOverrideKey, useSettingsStore } from '../store/useSettingsStore'
import {
  resumableSession,
  useSessionProgressStore,
} from '../store/useSessionProgressStore'
import { useWorkoutStore } from '../store/useWorkoutStore'
import { useBenchmarkStore } from '../store/useBenchmarkStore'
import { useElementHeight } from '../hooks/useElementHeight'
import { getProgram } from '../utils/getProgram'
import { getDistinctLoads } from '../utils/benchmarks'
import {
  getWorkoutForDay,
  getDayTypeLabel,
  getTotalExerciseDuration,
  getSessionLabel
} from '../utils/programUtils'
import { getTodayString, toLocalISODate } from '../utils/dateUtils'

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
  // The router keeps the previous page's scroll offset: always open a session from the top
  useLayoutEffect(() => {
    window.scrollTo(0, 0)
  }, [weekNumber, dayOfWeek])
  // The fixed CTA bar must never cover the last exercise: pad the page by its height.
  const [barRef, barHeight] = useElementHeight<HTMLDivElement>(104)
  const { selectedProgram } = useSettingsStore()
  const { completedWorkouts, markComplete } = useWorkoutStore()
  const sessionKey = dayOverrideKey(selectedProgram, Number(weekNumber), dayOfWeek ?? '')
  const savedSession = useSessionProgressStore((s) => s.sessions[sessionKey])
  const clearSession = useSessionProgressStore((s) => s.clearSession)
  // Exercise loads are resolved from the benchmark results: re-render when they change
  useBenchmarkStore((s) => s.results)
  useBenchmarkStore((s) => s.bodyweightKg)
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
  const guideBefore = day.guide?.filter((s) => !s.afterExercises) ?? []
  const guideAfter = day.guide?.filter((s) => s.afterExercises) ?? []
  const hasGuide = guideBefore.length + guideAfter.length > 0
  const hasExercises = day.exercises.length > 0
  const loads = program.benchmarks ? getDistinctLoads(day.exercises) : []
  const resumable = resumableSession(
    savedSession,
    day.exercises.map((e) => e.id)
  )
  const activePath = `/workout/${weekNumber}/${dayOfWeek}/active`
  const isDone = completedWorkouts.some(
    (w) =>
      !w.partial &&
      w.weekNumber === week &&
      w.dayTitle === day.title &&
      w.id.startsWith(`${week}-${day.dayOfWeek}-`) &&
      (!day.daily || w.date === getTodayString())
  )

  function handleMarkDone() {
    if (!day || isDone) return
    const now = new Date()
    const dateStr = toLocalISODate(now)
    markComplete({
      id: `${week}-${day.dayOfWeek}-${dateStr}`,
      date: dateStr,
      weekNumber: week,
      dayType: day.type,
      dayTitle: day.title,
      completedAt: now.toISOString(),
      durationSeconds: 0,
      exercisesCompleted: 0,
      exercisesTotal: 0,
      skippedExercises: []
    })
  }

  return (
    <div className="min-h-dvh bg-cream text-plum">
      <header className="flex items-center gap-3 px-5 pt-4 pb-4">
        <IconButton onClick={() => navigate(-1)} aria-label="Indietro">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </IconButton>
        <div className="min-w-0 flex-1 text-center">
          <h1 className="font-poster text-[22px] leading-[1.1]">{sessionLabel}</h1>
          <p className="text-[13px] font-semibold text-plum-muted">{headerSubtitle}</p>
        </div>
        <IconButton onClick={() => setEditing(true)} aria-label="Modifica sessione">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
          </svg>
        </IconButton>
      </header>

      <motion.div
        className="px-5 pt-2 max-w-lg mx-auto"
        style={{ paddingBottom: barHeight }}
        variants={stagger}
        initial="hidden"
        animate="show"
      >
        <motion.div variants={fadeUp}>
          <HeroCard
            typeLabel={getDayTypeLabel(day.type)}
            title={day.title}
            description={day.description}
            exerciseCount={hasGuide ? null : day.exercises.length}
            durationLabel={day.durationLabel ?? `~${totalMin} min`}
            intensity={day.intensity}
          />
        </motion.div>

        {(program.warmup && day.warmupNote) || (program.benchmarks && day.recordsTests) ? (
          <div className="space-y-3 mt-4">
            {program.warmup && day.warmupNote && (
              <motion.div variants={fadeUp}>
                <LinkCard
                  variant="primary"
                  eyebrow="Prima"
                  title={program.warmup.title}
                  subtitle={day.warmupNote}
                  onClick={() => navigate('/warmup')}
                />
              </motion.div>
            )}
            {program.benchmarks && day.recordsTests && (
              <motion.div variants={fadeUp}>
                <LinkCard
                  variant="secondary"
                  eyebrow="Test"
                  title="Registra i risultati"
                  subtitle={program.benchmarks.summary}
                  onClick={() => navigate('/tests')}
                />
              </motion.div>
            )}
          </div>
        ) : null}

        {guideBefore.length > 0 && (
          <div className="space-y-3 mt-6">
            {guideBefore.map((section) => (
              <motion.div key={section.title} variants={fadeUp}>
                <GuideSectionCard section={section} />
              </motion.div>
            ))}
          </div>
        )}

        {hasExercises && (
          <>
            <motion.div variants={fadeUp} className="mt-8 mb-3">
              <div className="flex items-baseline justify-between gap-3">
                <h2 className="font-poster text-[22px] leading-tight">
                  {day.exercisesTitle ?? 'Esercizi'}
                </h2>
                <span className="shrink-0 font-mono text-[11px] uppercase text-brown">
                  set × rep
                </span>
              </div>
              {day.exercisesNote && (
                <p className="mt-1 text-xs leading-relaxed text-plum-soft">
                  {day.exercisesNote}
                </p>
              )}
            </motion.div>

            {program.benchmarks && loads.length > 0 && (
              <motion.div variants={fadeUp} className="mb-3">
                <LoadCard
                  programId={selectedProgram}
                  config={program.benchmarks}
                  loads={loads}
                />
              </motion.div>
            )}

            <div className="relative">
              <div
                aria-hidden="true"
                className="absolute bottom-[30px] top-[30px] left-[22px] border-l-2 border-dashed border-plum"
              />
              <ul className="relative">
                {day.exercises.map((exercise, index) => (
                  <motion.li key={exercise.id} variants={fadeUp}>
                    <ExerciseRow
                      exercise={exercise}
                      index={index}
                      onTap={() => setSelectedExercise(exercise)}
                    />
                  </motion.li>
                ))}
              </ul>
            </div>
          </>
        )}

        {guideAfter.length > 0 && (
          <div className="space-y-3 mt-6">
            {guideAfter.map((section) => (
              <motion.div key={section.title} variants={fadeUp}>
                <GuideSectionCard section={section} />
              </motion.div>
            ))}
          </div>
        )}

        {hasGuide && hasExercises && (
          <motion.div variants={fadeUp} className="mt-6">
            <Button
              variant="ghost"
              fullWidth
              disabled={isDone}
              onClick={handleMarkDone}
            >
              {isDone ? '✓ Sessione completata' : '✓ Segna la sessione come completata'}
            </Button>
          </motion.div>
        )}

      </motion.div>

      {/* Fixed bottom bar; the list above is padded by its measured height */}
      <SessionActionBar
        ref={barRef}
        hasExercises={hasExercises}
        hasGuide={hasGuide}
        totalMin={totalMin}
        exerciseCount={day.exercises.length}
        resumeIndex={resumable?.exerciseIndex ?? null}
        isDone={isDone}
        onStart={() => navigate(activePath)}
        onRestart={() => {
          clearSession(sessionKey)
          navigate(activePath)
        }}
        onResume={() => navigate(activePath, { state: { resume: true } })}
        onMarkDone={handleMarkDone}
      />

      <AnimatePresence>
        {selectedExercise && (
          <ExerciseDetailSheet
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
