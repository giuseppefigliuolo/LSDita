import homeProgram from '../data/training-program.json'
import travelProgram from '../data/training-program-travel.json'
import type { TrainingProgram, ProgramId } from '../types'

const programs: Record<ProgramId, TrainingProgram> = {
  home: homeProgram as unknown as TrainingProgram,
  travel: travelProgram as unknown as TrainingProgram,
}

export function getProgram(id: ProgramId): TrainingProgram {
  return programs[id] ?? programs.home
}

export const programOptions: { id: ProgramId; label: string; description: string }[] = [
  { id: 'home', label: 'Piano 4 Settimane', description: 'Programma completo con tutta l\'attrezzatura' },
  { id: 'travel', label: 'Trasferta 2 Settimane', description: 'Metolius Simulator 3D + manubrio 8kg' },
]
