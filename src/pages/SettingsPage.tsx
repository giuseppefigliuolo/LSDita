import { useRef } from 'react'
import { motion } from 'framer-motion'
import { useSettingsStore } from '../store/useSettingsStore'
import { useWorkoutStore } from '../store/useWorkoutStore'
import { getProgram, programOptions } from '../utils/getProgram'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import type { ProgramId } from '../types'

export default function SettingsPage() {
  const settings = useSettingsStore()
  const workoutStore = useWorkoutStore()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const program = getProgram(settings.selectedProgram)

  function handleExport() {
    const data = workoutStore.exportData()
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `LSDita-backup-${new Date().toISOString().split('T')[0]}.json`
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
      <h1
        className="text-3xl mb-1"
        style={{ fontFamily: 'var(--font-display)' }}
      >
        Impostazioni
      </h1>
      <p className="text-text-secondary text-sm mb-6">
        Personalizza la tua esperienza
      </p>

      <div className="space-y-6">
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-text-muted mb-3">
            Programma Attivo
          </h2>
          <div className="space-y-2">
            {programOptions.map((opt) => (
              <Card
                key={opt.id}
                onClick={() => settings.setSelectedProgram(opt.id as ProgramId)}
                className={
                  settings.selectedProgram === opt.id
                    ? 'ring-2 ring-primary bg-primary/5'
                    : ''
                }
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                      settings.selectedProgram === opt.id
                        ? 'border-primary'
                        : 'border-border'
                    }`}
                  >
                    {settings.selectedProgram === opt.id && (
                      <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text">{opt.label}</p>
                    <p className="text-xs text-text-secondary">
                      {opt.description}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>

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
            Settimana Corrente
          </h2>
          <Card>
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm font-medium text-text">
                  Settimana attiva
                </p>
                <p className="text-xs text-text-secondary">
                  {settings.currentWeek == null
                    ? 'Automatica in base alla data di inizio'
                    : 'Manuale — sovrascrive il calcolo automatico'}
                </p>
              </div>
              {settings.currentWeek != null && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => settings.setCurrentWeek(null)}
                >
                  Auto
                </Button>
              )}
            </div>
            <div className="grid grid-cols-4 gap-2">
              {Array.from(
                { length: program.durationWeeks },
                (_, i) => i + 1
              ).map((week) => {
                const isActive = settings.currentWeek === week
                return (
                  <button
                    key={week}
                    onClick={() => settings.setCurrentWeek(week)}
                    className={`h-10 rounded-lg border-2 text-sm font-bold font-timer transition-colors ${
                      isActive
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border bg-surface text-text hover:border-primary/40'
                    }`}
                  >
                    {week}
                  </button>
                )
              })}
            </div>
          </Card>
        </section>

        <section>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-text-muted mb-3">
            Timer
          </h2>
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-text">
                  Countdown iniziale
                </p>
                <p className="text-xs text-text-secondary">
                  Secondi prima che l'esercizio parta
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    settings.setCountdownDuration(
                      Math.max(0, settings.countdownDuration - 1)
                    )
                  }
                  disabled={settings.countdownDuration <= 0}
                  className="w-8 h-8 rounded-full bg-surface border border-border flex items-center justify-center text-sm font-bold text-text disabled:opacity-30"
                >
                  −
                </button>
                <span className="w-8 text-center font-bold font-timer text-primary">
                  {settings.countdownDuration}
                </span>
                <button
                  onClick={() =>
                    settings.setCountdownDuration(
                      Math.min(10, settings.countdownDuration + 1)
                    )
                  }
                  disabled={settings.countdownDuration >= 10}
                  className="w-8 h-8 rounded-full bg-surface border border-border flex items-center justify-center text-sm font-bold text-text disabled:opacity-30"
                >
                  +
                </button>
              </div>
            </div>
          </Card>
        </section>

        <section>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-text-muted mb-3">
            Volume
          </h2>
          <Card>
            <div className="flex items-center gap-3">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#8C7355"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="shrink-0"
              >
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
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#8C7355"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="shrink-0"
              >
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
                  <p className="text-sm font-medium text-text">
                    Esporta Progressi
                  </p>
                  <p className="text-xs text-text-secondary">
                    Salva un backup JSON
                  </p>
                </div>
                <Button variant="ghost" size="sm" onClick={handleExport}>
                  Esporta
                </Button>
              </div>
            </Card>
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-text">
                    Importa Progressi
                  </p>
                  <p className="text-xs text-text-secondary">
                    Ripristina da backup JSON
                  </p>
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
                <p className="text-xs text-text-secondary">
                  Cancella tutti i progressi
                </p>
              </div>
              <Button
                variant="danger"
                size="sm"
                onClick={() => {
                  if (
                    confirm(
                      'Sei sicuro? Tutti i progressi verranno cancellati.'
                    )
                  ) {
                    workoutStore.resetAll()
                  }
                }}
              >
                Reset
              </Button>
            </div>
          </Card>
        </section>

        <div className="text-center pt-4">
          <p className="text-xs text-text-muted">
            LSDita v{import.meta.env.VITE_APP_VERSION} — Fatto con ❤️ per
            l'arrampicata
          </p>
          <p className="text-xs text-text-muted mt-2">
            Gruppo <b>Picasass</b>
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
  onToggle
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
