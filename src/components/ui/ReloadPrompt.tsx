import { useRegisterSW } from 'virtual:pwa-register/react'
import { motion, AnimatePresence } from 'framer-motion'

export default function ReloadPrompt() {
  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_swUrl, registration) {
      if (!registration) return
      setInterval(() => {
        registration.update()
      }, 60_000)
    },
  })

  return (
    <AnimatePresence>
      {needRefresh && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          className="fixed bottom-20 left-4 right-4 z-100 max-w-lg mx-auto"
        >
          <div className="bg-surface-elevated border border-accent/30 rounded-2xl p-4 shadow-lg shadow-accent/10 flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-text">Nuova versione disponibile</p>
              <p className="text-xs text-text-secondary">Aggiorna per ottenere le ultime modifiche</p>
            </div>
            <button
              onClick={() => updateServiceWorker(true)}
              className="px-4 py-2 bg-accent text-bg text-sm font-bold rounded-xl shrink-0 active:scale-95 transition-transform"
            >
              Aggiorna
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
