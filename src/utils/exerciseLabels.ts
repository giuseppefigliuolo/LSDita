import type { Equipment, Exercise, GripType } from '../types'

export const equipmentLabels: Record<Equipment, string> = {
  hangboard: 'Hangboard',
  wooden_balls: 'Sfere legno',
  pull_up_bar: 'Sbarra',
  dumbbells: 'Manubri',
  fitness_band: 'Elastico',
  yoga_mat: 'Tappetino',
  bodyweight: 'Corpo libero',
}

export const gripLabels: Record<GripType, string> = {
  half_crimp: 'Semi-arcuata',
  open_hand: 'Mano aperta',
  full_crimp: 'Arcuata piena',
  three_finger_drag: 'Tre dita',
  pinch: 'Pinch',
  sloper: 'Sloper',
  mixed: 'Mista',
}

export function getEquipmentLabel(equipment: Equipment | string): string {
  return equipmentLabels[equipment as Equipment] ?? equipment
}

export function getGripLabel(grip: GripType | string): string {
  return gripLabels[grip as GripType] ?? grip
}

/** Compact sets × work label shown in pills: "3×10" or "3×30s" for timed work. */
export function getExerciseVolume(ex: {
  type: string
  sets: number
  repsPerSet: number
  hangTime: number
}): string {
  return ex.type === 'repeaters' || ex.type === 'reps'
    ? `${ex.sets}×${ex.repsPerSet}`
    : `${ex.sets}×${ex.hangTime}s`
}

/** Grip, load and timing in one line: "Semi-arcuata · 60 kg tot · 7s on / 3s off" */
export function getExerciseTechLine(ex: Exercise): string {
  const parts: string[] = []
  if (ex.grip) parts.push(getGripLabel(ex.grip))
  if (ex.weight && ex.weight !== 'corpo libero') parts.push(ex.weight)
  if (ex.type === 'repeaters') {
    parts.push(
      ex.restBetweenReps > 0 ? `${ex.hangTime}s on / ${ex.restBetweenReps}s off` : `${ex.hangTime}s`
    )
  } else if (ex.type === 'timed_hang' || ex.type === 'timed_hold' || ex.type === 'timed_stretch') {
    parts.push(`${ex.hangTime}s`)
  }
  if (parts.length === 0) parts.push(getEquipmentLabel(ex.equipment))
  return parts.join(' · ')
}
