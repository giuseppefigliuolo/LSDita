/** Pastel color families for form fields and cards: soft fill, readable label, strong ring */
export type Tone = 'primary' | 'secondary' | 'accent' | 'violet' | 'green' | 'coral'

export const TONES: Record<Tone, { soft: string; label: string; ring: string }> = {
  primary:   { soft: '#FDEEE4', label: '#A63E10', ring: '#D4541A' },
  secondary: { soft: '#E2F6F6', label: '#0E7E7E', ring: '#17A8A8' },
  accent:    { soft: '#FBF0CC', label: '#8A6D10', ring: '#E8B820' },
  violet:    { soft: '#F2EAF8', label: '#5A2878', ring: '#7B3A9E' },
  green:     { soft: '#EAF3DB', label: '#3F6E15', ring: '#5A9A1E' },
  coral:     { soft: '#FCE4DF', label: '#A8341E', ring: '#E84830' },
}
