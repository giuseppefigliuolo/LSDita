/** Shared design tokens — psychedelic Yosemite theme */

// ── Core ink color (deep plum — borders, shadows, outlines) ──
export const INK = '#3A1248'

// ── Background colors ──
export const BG = '#F4E8C4'
export const SURFACE = '#EDE0B2'
export const SURFACE_ELEVATED = '#FFF8E8'

// ── Organic border-radius presets ──
// Each has a slightly different radius per corner for a hand-drawn wavy feel
export const RADIUS = {
  /** Cards, modals, large containers */
  card: '1.75rem 1.25rem 1.75rem 1.25rem / 1.25rem 1.75rem 1.25rem 1.75rem',
  /** Stat cards, illustration frames */
  blob: '2rem 1.4rem 2rem 1.4rem / 1.4rem 2rem 1.4rem 2rem',
  /** Large buttons (primary CTA) */
  btnLg: '2.5rem 1.75rem 2.5rem 1.75rem / 1.75rem 2.5rem 1.75rem 2.5rem',
  /** Medium buttons, nav elements */
  btnMd: '2rem 1.5rem 2rem 1.5rem / 1.5rem 2rem 1.5rem 2rem',
  /** Small buttons, back button */
  btnSm: '1.5rem 1rem 1.5rem 1rem / 1rem 1.5rem 1rem 1.5rem',
  /** Control buttons (timer pause/play) */
  controlLg: '2.8rem 2rem 2.8rem 2rem / 2rem 2.8rem 2rem 2.8rem',
  /** Control buttons (timer skip/cancel) */
  controlSm: '1.8rem 1.3rem 1.8rem 1.3rem / 1.3rem 1.8rem 1.3rem 1.8rem',
  /** Dashboard stat cards — extra blobby */
  stat: '2.2rem 1.6rem 2rem 1.4rem / 1.5rem 2.2rem 1.6rem 2rem',
  /** Pill-shaped badges */
  pill: '999px 700px 999px 700px / 700px 999px 700px 999px',
  /** Bottom sheet top corners */
  sheetTop: '1.75rem 1.25rem 0 0 / 1.25rem 1.75rem 0 0',
  /** Nav bar */
  nav: '2rem 1.5rem 2rem 1.5rem / 1.5rem 2rem 1.5rem 2rem',
  /** Nav indicator */
  navIndicator: '1.5rem 1rem 1.5rem 1rem / 1rem 1.5rem 1rem 1.5rem',
  /** Back button */
  backBtn: '1rem 0.75rem 1rem 0.75rem / 0.75rem 1rem 0.75rem 1rem',
} as const

// ── Box-shadow presets ──
// All use INK for the offset + an inset white highlight
export const SHADOW = {
  /** Large — cards, modals, nav */
  lg: `5px 5px 0px ${INK}, inset 0 2px 0 rgba(255,255,255,0.55)`,
  /** Medium — buttons, stat cards */
  md: `4px 4px 0px ${INK}, inset 0 2px 0 rgba(255,255,255,0.5)`,
  /** Small — badges, small elements */
  sm: `3px 3px 0px ${INK}, inset 0 1px 0 rgba(255,255,255,0.4)`,
  /** Extra small — back button, drag handles */
  xs: `2px 2px 0px ${INK}, inset 0 1px 0 rgba(255,255,255,0.5)`,
  /** Tiny — drag handle bar */
  xxs: `1px 1px 0px ${INK}`,
  /** Pressed state (no offset) */
  pressed: `0px 0px 0px ${INK}, inset 0 1px 0 rgba(255,255,255,0.2)`,
} as const

// ── Border shorthand helpers (for inline className) ──
export const BORDER_3 = `border-[3px] border-[${INK}]`
export const BORDER_2_5 = `border-[2.5px] border-[${INK}]`
export const BORDER_2 = `border-[2px] border-[${INK}]`
export const BORDER_1_5 = `border-[1.5px] border-[${INK}]`
