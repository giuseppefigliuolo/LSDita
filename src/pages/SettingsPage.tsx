import { useRef } from 'react'
import { motion } from 'framer-motion'
import { useSettingsStore } from '../store/useSettingsStore'
import { useWorkoutStore } from '../store/useWorkoutStore'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'

export default function SettingsPage() {
  const settings = useSettingsStore()
  const workoutStore = useWorkoutStore()
  const fileInputRef = useRef<HTMLInputElement>(null)

  function handleExport() {
    const data = workoutStore.exportData()
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `cruxtimer-backup-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  function handleImport() {
    fileInputRef.current?.click()
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (ev) => {
      const json = ev.target?.result as string
      workoutStore.importData(json)
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  return (
    <motion.div
      className="px-4 pt-6 pb-6 max-w-lg mx-auto"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      <h1 className="text-2xl font-bold mb-1">Impostazioni</h1>
      <p className="text-text-secondary text-sm mb-6">Personalizza la tua esperienza</p>

      <div className="space-y-6">
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-text-muted mb-3">
            Audio e Feedback
          </h2>
          <div className="space-y-2">
            <ToggleRow
              label="Suoni"
              description="Beep per countdown e transizioni"
              enabled={settings.soundEnabled}
              onToggle={settings.toggleSound}
            />
            <ToggleRow
              label="Voce"
              description="Annunci vocali in italiano"
              enabled={settings.voiceEnabled}
              onToggle={settings.toggleVoice}
            />
            <ToggleRow
              label="Vibrazione"
              description="Feedback tattile alle transizioni"
              enabled={settings.vibrationEnabled}
              onToggle={settings.toggleVibration}
            />
          </div>
        </section>

        <section>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-text-muted mb-3">
            Volume
          </h2>
          <Card>
            <div className="flex items-center gap-3">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8E8EA0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              </svg>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={settings.volume}
                onChange={(e) => settings.setVolume(Number(e.target.value))}
                aria-label="Volume"
                className="flex-1 accent-primary h-1"
              />
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8E8EA0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                <path d="M19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.07" />
              </svg>
            </div>
          </Card>
        </section>

        <section>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-text-muted mb-3">
            Dati
          </h2>
          <div className="space-y-2">
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-text">Esporta Progressi</p>
                  <p className="text-xs text-text-secondary">Salva un backup JSON</p>
                </div>
                <Button variant="ghost" size="sm" onClick={handleExport}>
                  Esporta
                </Button>
              </div>
            </Card>
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-text">Importa Progressi</p>
                  <p className="text-xs text-text-secondary">Ripristina da backup JSON</p>
                </div>
                <Button variant="ghost" size="sm" onClick={handleImport}>
                  Importa
                </Button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                className="hidden"
                onChange={handleFileChange}
              />
            </Card>
          </div>
        </section>

        <section>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-text-muted mb-3">
            Programma
          </h2>
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-text">Reset Programma</p>
                <p className="text-xs text-text-secondary">Cancella tutti i progressi</p>
              </div>
              <Button
                variant="danger"
                size="sm"
                onClick={() => {
                  if (confirm('Sei sicuro? Tutti i progressi verranno cancellati.')) {
                    workoutStore.resetAll()
                  }
                }}
              >
                Reset
              </Button>
            </div>
          </Card>
        </section>

        <div className="text-center pt-4 pb-8">
          <p className="text-xs text-text-muted">
            CruxTimer v1.0 — Fatto con ❤️ per l'arrampicata
          </p>
        </div>
      </div>
    </motion.div>
  )
}

function ToggleRow({
  label,
  description,
  enabled,
  onToggle,
}: {
  label: string
  description: string
  enabled: boolean
  onToggle: () => void
}) {
  return (
    <Card>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-text">{label}</p>
          <p className="text-xs text-text-secondary">{description}</p>
        </div>
        <button
          onClick={onToggle}
          role="switch"
          aria-checked={enabled}
          aria-label={label}
          className={`relative w-11 h-6 rounded-full transition-colors ${
            enabled ? 'bg-primary' : 'bg-border'
          }`}
        >
          <motion.div
            className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow"
            animate={{ left: enabled ? '22px' : '2px' }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          />
        </button>
      </div>
    </Card>
  )
}
