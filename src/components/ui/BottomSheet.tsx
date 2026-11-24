import { useCallback, useEffect, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { motion, useMotionValue, useTransform, animate as motionAnimate } from 'framer-motion'
import { INK, SURFACE, RADIUS, SHADOW } from '../../styles/tokens'

interface Props {
  onClose: () => void
  /**
   * handle: only the grab bar drags the sheet (forms, so inputs keep working).
   * sheet: dragging down anywhere closes it, once the content is scrolled to the top.
   */
  dragFrom?: 'handle' | 'sheet'
  maxHeight?: string
  showCloseButton?: boolean
  /** Receives `dismiss`, which plays the exit animation before calling onClose */
  children: (dismiss: () => void) => ReactNode
}

const DISMISS_DISTANCE = 100
const DISMISS_VELOCITY = 400

/** Slide-up sheet with backdrop, drag-to-dismiss (touch and mouse) and exit animation */
export default function BottomSheet({
  onClose,
  dragFrom = 'handle',
  maxHeight = '90dvh',
  showCloseButton = false,
  children
}: Props) {
  const dragY = useMotionValue(window.innerHeight)
  const sheetScale = useTransform(dragY, [0, 300], [1, 0.95])
  const sheetOpacity = useTransform(dragY, [0, 300], [1, 0.4])
  const backdropOpacity = useTransform(dragY, [0, window.innerHeight], [1, 0])
  const sheetRef = useRef<HTMLDivElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const handleRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    motionAnimate(dragY, 0, { type: 'spring', damping: 28, stiffness: 300 })
  }, [dragY])

  const dismiss = useCallback(() => {
    motionAnimate(dragY, window.innerHeight, {
      duration: 0.25,
      ease: 'easeIn',
      onComplete: onClose
    })
  }, [dragY, onClose])

  useEffect(() => {
    const el = dragFrom === 'handle' ? handleRef.current : sheetRef.current
    if (!el) return
    // On the whole sheet a small downward move may just be a scroll: wait a bit longer
    const threshold = dragFrom === 'handle' ? 4 : 8
    const canStart = () => dragFrom === 'handle' || (scrollRef.current?.scrollTop ?? 0) <= 1

    let startY = 0
    let lastY = 0
    let lastTime = 0
    let velY = 0
    let dragging = false
    let mouseDown = false

    const begin = (y: number) => {
      startY = y
      lastY = y
      lastTime = performance.now()
      velY = 0
      dragging = false
    }

    const move = (y: number, prevent: () => void) => {
      const delta = y - startY
      const now = performance.now()
      const dt = now - lastTime
      if (dt > 0) velY = ((y - lastY) / dt) * 1000
      lastY = y
      lastTime = now

      if (!dragging) {
        if (delta > threshold && canStart()) dragging = true
        else return
      }
      prevent()
      dragY.set(Math.max(0, delta))
    }

    const finish = () => {
      if (!dragging) return
      dragging = false
      if (dragY.get() > DISMISS_DISTANCE || velY > DISMISS_VELOCITY) {
        dismiss()
      } else {
        motionAnimate(dragY, 0, { type: 'spring', stiffness: 400, damping: 30 })
      }
    }

    const onTouchStart = (e: TouchEvent) => begin(e.touches[0].clientY)
    const onTouchMove = (e: TouchEvent) => move(e.touches[0].clientY, () => e.preventDefault())
    const onTouchEnd = () => finish()
    const onPtrMove = (e: PointerEvent) => {
      if (!mouseDown) return
      move(e.clientY, () => e.preventDefault())
    }
    const onPtrUp = () => {
      mouseDown = false
      finish()
      document.removeEventListener('pointermove', onPtrMove)
      document.removeEventListener('pointerup', onPtrUp)
    }
    const onPtrDown = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      mouseDown = true
      begin(e.clientY)
      document.addEventListener('pointermove', onPtrMove)
      document.addEventListener('pointerup', onPtrUp)
    }

    el.addEventListener('touchstart', onTouchStart, { passive: true })
    el.addEventListener('touchmove', onTouchMove, { passive: false })
    el.addEventListener('touchend', onTouchEnd)
    el.addEventListener('pointerdown', onPtrDown)
    return () => {
      el.removeEventListener('touchstart', onTouchStart)
      el.removeEventListener('touchmove', onTouchMove)
      el.removeEventListener('touchend', onTouchEnd)
      el.removeEventListener('pointerdown', onPtrDown)
      document.removeEventListener('pointermove', onPtrMove)
      document.removeEventListener('pointerup', onPtrUp)
    }
  }, [dragY, dismiss, dragFrom])

  // Rendered at the end of #root, outside the page's stacking context, so it
  // covers the bottom nav. Not on <body>: the iOS viewport fix re-lays out
  // #root only, and the sheet's forms are what raise the keyboard.
  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-end justify-center">
      <motion.div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        style={{ opacity: backdropOpacity }}
        onClick={dismiss}
      />
      <motion.div
        ref={sheetRef}
        className="relative w-full max-w-lg overflow-hidden border-[3px] border-b-0 border-[#3A1248]"
        style={{
          maxHeight,
          borderRadius: RADIUS.sheetTop,
          boxShadow: `0 -4px 0px ${INK}, inset 0 2px 0 rgba(255,255,255,0.55)`,
          y: dragY,
          scale: sheetScale,
          opacity: sheetOpacity
        }}
      >
        <div ref={scrollRef} className="bg-surface overflow-y-auto overscroll-contain" style={{ maxHeight }}>
          <div
            ref={handleRef}
            className={
              dragFrom === 'handle'
                ? 'sticky top-0 z-10 flex justify-center pt-3 pb-3 bg-surface cursor-grab active:cursor-grabbing touch-none'
                : 'sticky top-0 z-10 flex justify-center pt-3 pb-2 bg-surface'
            }
            style={dragFrom === 'handle' ? { touchAction: 'none' } : undefined}
          >
            <div
              className="w-12 h-1.5 border-[1.5px] border-[#3A1248]"
              style={{ borderRadius: RADIUS.btnSm, backgroundColor: SURFACE, boxShadow: SHADOW.xxs }}
            />
          </div>
          {children(dismiss)}
        </div>

        {showCloseButton && (
          <button
            type="button"
            onClick={dismiss}
            aria-label="Chiudi"
            className="absolute top-3 right-3 z-20 w-9 h-9 flex items-center justify-center border-[2.5px] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all"
            style={{
              borderColor: INK,
              backgroundColor: '#FFF8E8',
              borderRadius: RADIUS.backBtn,
              boxShadow: SHADOW.xs
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={INK} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        )}
      </motion.div>
    </div>,
    document.getElementById('root') ?? document.body
  )
}
