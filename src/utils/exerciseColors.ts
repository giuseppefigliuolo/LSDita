/** Pastel assigned to an exercise by its position in the session, shared by the list and the preview. */
const EXERCISE_COLORS = [
  { bg: '#F2B8A0', ray: '#EEA58A' }, // salmon
  { bg: '#9FD8D0', ray: '#86C9C0' }, // teal
  { bg: '#CFE0A8', ray: '#BCD28F' }, // green
  { bg: '#F5D77A', ray: '#EFC95C' }, // yellow
  { bg: '#D9C2E0', ray: '#C7A6CF' }, // lavender
] as const

export function getExerciseColor(index: number) {
  return EXERCISE_COLORS[index % EXERCISE_COLORS.length]
}
