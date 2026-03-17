import { motion } from 'framer-motion'
import { useWorkoutStore } from '../store/useWorkoutStore'
import Card from '../components/ui/Card'
import { formatSeconds } from '../utils/dateUtils'

const feelings: Record<number, string> = {
  1: '😵',
  2: '😓',
  3: '💪',
  4: '🔥',
  5: '🚀',
}

export default function ProgressPage() {
  const { completedWorkouts, notes, getCompletedCount, getStreak } = useWorkoutStore()

  const totalDuration = completedWorkouts.reduce((sum, w) => sum + w.durationSeconds, 0)
  const totalExercises = completedWorkouts.reduce((sum, w) => sum + w.exercisesCompleted, 0)

  const sortedWorkouts = [...completedWorkouts].sort(
    (a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime(),
  )

  return (
    <motion.div
      className="px-4 pt-6 pb-6 max-w-lg mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <h1 className="text-2xl font-bold mb-1">Progressi</h1>
      <p className="text-text-secondary text-sm mb-6">Il tuo percorso di allenamento</p>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <StatBlock label="Allenamenti" value={String(getCompletedCount())} color="text-primary" />
        <StatBlock label="Streak" value={`${getStreak()} giorni`} color="text-accent" />
        <StatBlock label="Tempo totale" value={formatSeconds(totalDuration)} color="text-secondary" />
        <StatBlock label="Esercizi" value={String(totalExercises)} color="text-violet" />
      </div>

      {sortedWorkouts.length > 0 && (
        <>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-text-muted mb-3">
            Storico
          </h2>
          <div className="space-y-2">
            {sortedWorkouts.map((workout) => {
              const note = notes.find((n) => n.workoutId === workout.id)
              return (
                <Card key={workout.id}>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-semibold text-text">{workout.dayTitle}</p>
                      <p className="text-xs text-text-secondary">
                        Settimana {workout.weekNumber} — {new Date(workout.completedAt).toLocaleDateString('it-IT')}
                      </p>
                      <div className="flex items-center gap-3 mt-1 text-[10px] text-text-muted">
                        <span>{workout.exercisesCompleted}/{workout.exercisesTotal} esercizi</span>
                        <span>{formatSeconds(workout.durationSeconds)}</span>
                        {workout.skippedExercises.length > 0 && (
                          <span className="text-danger">{workout.skippedExercises.length} saltati</span>
                        )}
                      </div>
                      {note && (
                        <p className="text-xs text-text-secondary mt-2 italic">"{note.text}"</p>
                      )}
                    </div>
                    {note?.feeling && (
                      <span className="text-xl">{feelings[note.feeling]}</span>
                    )}
                  </div>
                </Card>
              )
            })}
          </div>
        </>
      )}

      {sortedWorkouts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-4xl mb-3">🧗</p>
          <p className="text-text-secondary">Completa il tuo primo allenamento!</p>
          <p className="text-xs text-text-muted mt-1">Le statistiche appariranno qui</p>
        </div>
      )}
    </motion.div>
  )
}

function StatBlock({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="bg-surface rounded-xl border border-border p-4">
      <p className={`text-xl font-bold font-timer ${color}`}>{value}</p>
      <p className="text-[10px] uppercase tracking-wider text-text-muted mt-1">{label}</p>
    </div>
  )
}
