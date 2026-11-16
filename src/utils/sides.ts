import type { Exercise, Limb, WorkoutPhase } from '../types'

export type Side = 'left' | 'right'

export const SIDE_LABEL: Record<Side, string> = { left: 'Sinistra', right: 'Destra' }

/** Side worked at a set and rep (both 1-based), or null for a two-sided exercise. */
export function getSideAt(exercise: Pick<Exercise, 'side'>, set: number, rep: number): Side | null {
  switch (exercise.side) {
    case 'left':
    case 'right':
      return exercise.side
    case 'alternate_sets':
      return set % 2 === 1 ? 'left' : 'right'
    case 'alternate_reps':
      return rep % 2 === 1 ? 'left' : 'right'
    default:
      return null
  }
}

/**
 * Side the runner should show: the one working now, or during a rest the one
 * coming next, so you can switch while the rest runs.
 */
export function getRunnerSide(
  exercise: Pick<Exercise, 'side'>,
  phase: WorkoutPhase,
  set: number,
  rep: number
): Side | null {
  switch (phase) {
    case 'countdown':
    case 'hanging':
      return getSideAt(exercise, set, rep)
    case 'resting':
      return getSideAt(exercise, set, rep + 1)
    case 'set_rest':
      return getSideAt(exercise, set + 1, 1)
    default:
      return null
  }
}

/** Spoken when the work starts: "Sinistra, vai!" on one-sided exercises. */
export function getGoCue(exercise: Pick<Exercise, 'side'>, set: number, rep: number): string {
  const side = getSideAt(exercise, set, rep)
  return side ? `${SIDE_LABEL[side]}, vai!` : 'Vai!'
}

/** Spoken at the rest between reps: names the switch when the next rep changes side. */
export function getRepRestCue(exercise: Pick<Exercise, 'side' | 'limb'>, set: number, rep: number): string {
  const now = getSideAt(exercise, set, rep)
  const next = getSideAt(exercise, set, rep + 1)
  if (!now || !next || now === next) return 'Riposa'
  return exercise.limb === 'foot' ? 'Cambia gamba' : 'Cambia mano'
}

export function getLimb(exercise: Pick<Exercise, 'limb'>): Limb {
  return exercise.limb ?? 'hand'
}
