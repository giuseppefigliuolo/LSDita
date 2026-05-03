import homeProgram from '../data/training-program.json'
import travelProgram from '../data/training-program-travel.json'
import hypertrophyProgram from '../data/training-program-hypertrophy.json'
import girlWorkoutProgram from '../data/training-program-girlfriend.json'
import { dayOverrideKey, useSettingsStore } from '../store/useSettingsStore'
import type { ProgramId, TrainingDay, TrainingProgram } from '../types'

const builtInPrograms: Record<Exclude<ProgramId, 'custom'>, TrainingProgram> = {
  home: homeProgram as unknown as TrainingProgram,
  travel: travelProgram as unknown as TrainingProgram,
  hypertrophy: hypertrophyProgram as unknown as TrainingProgram,
  girl_workout: girlWorkoutProgram as unknown as TrainingProgram,
}

function getBaseProgram(id: ProgramId): TrainingProgram {
  if (id === 'custom') {
    const custom = useSettingsStore.getState().customProgram
    if (custom) return custom
    return builtInPrograms.home
  }
  return builtInPrograms[id] ?? builtInPrograms.home
}

export function getProgram(id: ProgramId): TrainingProgram {
  const base = getBaseProgram(id)
  const overrides = useSettingsStore.getState().dayOverrides
  if (Object.keys(overrides).length === 0) return base

  return {
    ...base,
    weeks: base.weeks.map((week) => ({
      ...week,
      days: week.days.map((day) => {
        const override = overrides[dayOverrideKey(id, week.weekNumber, day.dayOfWeek)]
        return override ?? day
      }),
    })),
  }
}

export function getOriginalDay(
  id: ProgramId,
  weekNumber: number,
  dayOfWeek: string
): TrainingDay | null {
  const base = getBaseProgram(id)
  const week = base.weeks.find((w) => w.weekNumber === weekNumber)
  if (!week) return null
  return week.days.find((d) => d.dayOfWeek === dayOfWeek) ?? null
}

export const programOptions: { id: ProgramId; label: string; description: string }[] = [
  { id: 'home', label: 'Piano 4 Settimane', description: 'Programma completo con tutta l\'attrezzatura' },
  { id: 'travel', label: 'Trasferta 2 Settimane', description: 'Two Stones hangboard + manubrio 8kg' },
  { id: 'hypertrophy', label: 'Ipertrofia 2 Settimane', description: 'Full body senza dita — recupero puleggia A2' },
  { id: 'girl_workout', label: 'Girl Workout 6 Settimane', description: 'Full body + climbing + atletismo (sbarra, anelli, zaino)' },
]
