import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import WorkoutRunner from '../components/timer/WorkoutRunner'
import { useWorkoutStore } from '../store/useWorkoutStore'
import { useSettingsStore } from '../store/useSettingsStore'
import { getProgram } from '../utils/getProgram'
import type { CompletedWorkout, WorkoutNote } from '../types'
import { getWorkoutForDay } from '../utils/programUtils'

export default function ActiveWorkout() {
  const { weekNumber, dayOfWeek } = useParams<{ weekNumber: string; dayOfWeek: string }>()
  const navigate = useNavigate()
  const { markComplete, addNote } = useWorkoutStore()
  const { selectedProgram } = useSettingsStore()
  const program = getProgram(selectedProgram)

  const week = Number(weekNumber)
  const day = getWorkoutForDay(program, week, dayOfWeek ?? '')

  if (!day) {
    return (
      <div className="flex items-center justify-center min-h-dvh bg-bg">
        <p className="text-text-secondary">Workout non trovato</p>
      </div>
    )
  }

  function handleComplete(data: {
    exercisesCompleted: number
    exercisesTotal: number
    duration: number
    skippedExercises: string[]
    note: string
    feeling: 1 | 2 | 3 | 4 | 5
  }) {
    const now = new Date()
    const dateStr = now.toISOString().split('T')[0]
    const workoutId = `${week}-${dayOfWeek}-${dateStr}`

    const completed: CompletedWorkout = {
      id: workoutId,
      date: dateStr,
      weekNumber: week,
      dayType: day!.type,
      dayTitle: day!.title,
      completedAt: now.toISOString(),
      durationSeconds: data.duration,
      exercisesCompleted: data.exercisesCompleted,
      exercisesTotal: data.exercisesTotal,
      skippedExercises: data.skippedExercises,
    }
    markComplete(completed)

    if (data.note.trim()) {
      const noteObj: WorkoutNote = {
        id: `note-${workoutId}`,
        workoutId,
        date: dateStr,
        text: data.note,
        feeling: data.feeling,
      }
      addNote(noteObj)
    }

    navigate('/')
  }

  function handleExit() {
    navigate(-1)
  }

  return (
    <motion.div
      className="overflow-hidden overscroll-none bg-bg flex flex-col"
      style={{ height: 'calc(100dvh - env(safe-area-inset-top, 0px))' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <header className="flex items-center justify-between px-4 h-12">
        <button
          onClick={handleExit}
          className="flex items-center justify-center w-9 h-9 rounded-full bg-surface-elevated/80 text-text-secondary active:scale-95 transition-transform"
          aria-label="Chiudi"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <path d="M4.5 4.5l9 9M13.5 4.5l-9 9" />
          </svg>
        </button>
        <p className="text-xs text-text-muted font-medium uppercase tracking-wider">
          Settimana {week}
        </p>
      </header>

      <div className="flex-1 min-h-0 flex items-center justify-center">
        <WorkoutRunner
          exercises={day.exercises}
          dayTitle={day.title}
          weekNumber={week}
          onComplete={handleComplete}
          onExit={handleExit}
        />
      </div>
    </motion.div>
  )
}
