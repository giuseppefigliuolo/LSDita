import type { Equipment, GripType } from '../types'

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
