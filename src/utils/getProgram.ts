import homeProgram from '../data/training-program.json'
import travelProgram from '../data/training-program-travel.json'
import { useSettingsStore } from '../store/useSettingsStore'
import type { TrainingProgram, ProgramId } from '../types'

const builtInPrograms: Record<Exclude<ProgramId, 'custom'>, TrainingProgram> = {
  home: homeProgram as unknown as TrainingProgram,
  travel: travelProgram as unknown as TrainingProgram,
}

export function getProgram(id: ProgramId): TrainingProgram {
  if (id === 'custom') {
    const custom = useSettingsStore.getState().customProgram
    if (custom) return custom
    return builtInPrograms.home
  }
  return builtInPrograms[id] ?? builtInPrograms.home
}

export const programOptions: { id: ProgramId; label: string; description: string }[] = [
  { id: 'home', label: 'Piano 4 Settimane', description: 'Programma completo con tutta l\'attrezzatura' },
  { id: 'travel', label: 'Trasferta 2 Settimane', description: 'Two Stones hangboard + manubrio 8kg' },
]
