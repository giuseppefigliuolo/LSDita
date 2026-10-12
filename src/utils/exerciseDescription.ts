/** Splits a trailing "Ref: domain/path" (as in program JSON) from the exercise copy. */
export function parseExerciseDescription(text: string): {
  body: string
  refUrl: string | null
} {
  const spaced = text.match(/\sRef:\s+(.+)$/)
  if (spaced) {
    return {
      body: text.slice(0, spaced.index).trimEnd(),
      refUrl: spaced[1].trim()
    }
  }
  const only = text.match(/^Ref:\s+(.+)$/)
  if (only) {
    return { body: '', refUrl: only[1].trim() }
  }
  return { body: text, refUrl: null }
}
