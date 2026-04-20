import { motion, AnimatePresence } from 'framer-motion'
import { RADIUS, SHADOW } from '../../styles/tokens'

interface SkipConfirmDialogProps {
  open: boolean
  onConfirm: () => void
  onCancel: () => void
}

export default function SkipConfirmDialog({
  open,
  onConfirm,
  onCancel,
}: SkipConfirmDialogProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-6"
          onClick={onCancel}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="bg-surface-elevated border-[3px] border-[#3A1248] p-5 w-full max-w-xs text-center"
            style={{ borderRadius: RADIUS.card, boxShadow: SHADOW.lg }}
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-text font-semibold mb-1">Saltare esercizio?</p>
            <p className="text-sm text-text-muted mb-5">
              L&apos;esercizio verrà segnato come saltato.
            </p>
            <div className="flex gap-3">
              <button
                onClick={onCancel}
                className="flex-1 h-11 bg-surface border-[2.5px] border-[#3A1248] text-sm font-medium text-text active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all"
                style={{ borderRadius: RADIUS.btnSm, boxShadow: SHADOW.sm }}
              >
                Annulla
              </button>
              <button
                onClick={onConfirm}
                className="flex-1 h-11 bg-danger/15 border-[2.5px] border-[#3A1248] text-sm font-medium text-danger active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all"
                style={{ borderRadius: RADIUS.btnSm, boxShadow: SHADOW.sm }}
              >
                Salta
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
