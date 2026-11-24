import { AnimatePresence, motion } from 'framer-motion'
import type { ReactNode } from 'react'
import { INK, RADIUS, SHADOW } from '../../styles/tokens'

const ERROR = '#CC3020'

export interface Feedback {
  kind: 'success' | 'error'
  title: string
  message: ReactNode
}

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={INK} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

function AlertIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={ERROR} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="8" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12" y2="17" />
    </svg>
  )
}

/** Dismissable success/error message, animated in and out */
export default function FeedbackBanner({
  feedback,
  onDismiss
}: {
  feedback: Feedback | null
  onDismiss: () => void
}) {
  return (
    <AnimatePresence>
      {feedback && (
        <motion.div
          key={feedback.kind + feedback.title + String(feedback.message)}
          initial={{ opacity: 0, y: -6, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -6, scale: 0.96 }}
          transition={{ type: 'spring', stiffness: 400, damping: 28 }}
          className="p-4 border-[3px] flex items-start gap-3"
          style={{
            borderColor: feedback.kind === 'success' ? INK : ERROR,
            backgroundColor: feedback.kind === 'success' ? '#E2F6F6' : '#FDECEA',
            borderRadius: RADIUS.blob,
            boxShadow:
              feedback.kind === 'success'
                ? SHADOW.md
                : `4px 4px 0px ${ERROR}, inset 0 2px 0 rgba(255,255,255,0.5)`
          }}
          role={feedback.kind === 'error' ? 'alert' : 'status'}
        >
          <div
            className="w-8 h-8 shrink-0 flex items-center justify-center border-[2.5px]"
            style={{
              borderColor: feedback.kind === 'success' ? INK : ERROR,
              backgroundColor: feedback.kind === 'success' ? '#FFF8E8' : '#FFFBF0',
              borderRadius: RADIUS.blob,
              boxShadow: SHADOW.xxs
            }}
            aria-hidden
          >
            {feedback.kind === 'success' ? <CheckIcon /> : <AlertIcon />}
          </div>
          <div
            className="flex-1 min-w-0"
            style={{ color: feedback.kind === 'success' ? INK : ERROR }}
          >
            <p className="text-sm font-bold">{feedback.title}</p>
            <p className="text-xs mt-0.5 break-words">{feedback.message}</p>
          </div>
          <button
            onClick={onDismiss}
            aria-label="Chiudi"
            className="shrink-0 w-6 h-6 flex items-center justify-center"
            style={{ color: INK }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
