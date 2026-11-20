/**
 * Workaround for an iOS WebKit bug in installed (standalone) PWAs.
 *
 * After the on-screen keyboard closes — and sometimes after the app comes
 * back from the background — WebKit keeps the viewport shrunk by ~20–60px:
 * `window.innerHeight` / `visualViewport.height` don't recover, so every
 * `position: fixed; bottom: …` element (BottomNav above all) floats above the
 * screen edge until the app is force-quit.
 *
 * Fix: remember the tallest viewport seen at the current width; when the
 * keyboard is gone but the viewport is still short (or the visual viewport is
 * still offset), take the app out of layout for one synchronous reflow so
 * WebKit re-measures. No frame is painted in between, so nothing flashes —
 * but `display: none` drops scroll offsets, so those are restored by hand.
 */

const TOLERANCE_PX = 4
/** Let the keyboard dismiss animation finish before measuring. */
const SETTLE_MS = 150

const NON_TEXT_INPUTS = new Set([
  'button', 'checkbox', 'color', 'file', 'image', 'radio', 'range', 'reset', 'submit',
])

let installed = false

function isIOS(): boolean {
  const ua = navigator.userAgent
  // iPadOS reports itself as a Mac; touch support gives it away.
  return /iP(hone|ad|od)/.test(ua) || (ua.includes('Macintosh') && navigator.maxTouchPoints > 1)
}

function isStandalone(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  )
}

/** True while an element that raises the keyboard (or picker) has focus. */
function isEditing(el: Element | null = document.activeElement): boolean {
  if (el instanceof HTMLTextAreaElement || el instanceof HTMLSelectElement) return true
  if (el instanceof HTMLInputElement) return !NON_TEXT_INPUTS.has(el.type)
  return el instanceof HTMLElement && el.isContentEditable
}

export function installIOSViewportFix(): void {
  if (installed || !isIOS() || !isStandalone()) return
  installed = true

  /** Tallest `innerHeight` seen per viewport width (i.e. per orientation). */
  const fullHeight = new Map<number, number>()
  let timer: ReturnType<typeof setTimeout> | undefined

  const remember = () => {
    if (isEditing()) return
    const w = window.innerWidth
    fullHeight.set(w, Math.max(fullHeight.get(w) ?? 0, window.innerHeight))
  }

  const isStuck = () => {
    const full = fullHeight.get(window.innerWidth) ?? window.innerHeight
    if (full - window.innerHeight > TOLERANCE_PX) return true
    const vv = window.visualViewport
    if (!vv) return false
    // Zoom is disabled, so with the keyboard closed the visual viewport must
    // match the layout viewport exactly.
    return window.innerHeight - vv.height > TOLERANCE_PX || vv.offsetTop > 1
  }

  const heal = () => {
    if (isEditing() || !isStuck()) return
    const root = document.getElementById('root')
    if (!root) return

    const pageX = window.scrollX
    const pageY = window.scrollY
    const scrolled: Array<[HTMLElement, number, number]> = []
    root.querySelectorAll<HTMLElement>('*').forEach(el => {
      if (el.scrollTop || el.scrollLeft) scrolled.push([el, el.scrollTop, el.scrollLeft])
    })

    root.style.display = 'none'
    void root.offsetHeight // synchronous reflow with an empty document
    root.style.display = ''
    void root.offsetHeight

    for (const [el, top, left] of scrolled) {
      el.scrollTop = top
      el.scrollLeft = left
    }
    window.scrollTo(pageX, pageY)
    remember()
  }

  const scheduleHeal = () => {
    clearTimeout(timer)
    timer = setTimeout(heal, SETTLE_MS)
  }

  remember()

  // Keyboard closed: focus leaves a text field, then the visual viewport grows back.
  document.addEventListener('focusout', e => {
    if (isEditing(e.target as Element)) scheduleHeal()
  })
  window.visualViewport?.addEventListener('resize', () => {
    remember()
    if (!isEditing()) scheduleHeal()
  })
  window.addEventListener('resize', remember)

  // Returning from the background / app switcher.
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') scheduleHeal()
  })
  window.addEventListener('pageshow', scheduleHeal)
}
