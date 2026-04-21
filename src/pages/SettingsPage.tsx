import { useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useSettingsStore } from '../store/useSettingsStore'
import { useWorkoutStore } from '../store/useWorkoutStore'
import { getProgram, programOptions } from '../utils/getProgram'
import { validateProgramJson } from '../utils/validateProgram'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import { INK, RADIUS, SHADOW } from '../styles/tokens'
import type { ProgramId } from '../types'

type ProgramFeedback =
  | { kind: 'success'; name: string; weeks: number }
  | { kind: 'error'; message: string }

export default function SettingsPage() {
  const settings = useSettingsStore()
  const workoutStore = useWorkoutStore()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const programInputRef = useRef<HTMLInputElement>(null)
  const [programFeedback, setProgramFeedback] =
    useState<ProgramFeedback | null>(null)
  const program = getProgram(settings.selectedProgram)

  async function handleExport() {
    const data = workoutStore.exportData()
    const filename = `LSDita-backup-${new Date().toISOString().split('T')[0]}.json`
    const blob = new Blob([data], { type: 'application/json' })
    const file = new File([blob], filename, { type: 'application/json' })

    const nav = navigator as Navigator & {
      canShare?: (data: ShareData) => boolean
    }
    if (nav.canShare?.({ files: [file] })) {
      try {
        await nav.share({
          files: [file],
          title: 'Backup LSDita',
          text: 'Backup dei progressi LSDita'
        })
        settings.markBackupDone()
        return
      } catch (err) {
        if ((err as DOMException)?.name === 'AbortError') return
      }
    }

    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
    settings.markBackupDone()
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

  function handleLoadCustomProgram() {
    programInputRef.current?.click()
  }

  function handleCustomProgramChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    const reader = new FileReader()
    reader.onload = (ev) => {
      const json = ev.target?.result as string
      const result = validateProgramJson(json)
      if (result.ok) {
        settings.setCustomProgram(result.program)
        settings.setSelectedProgram('custom')
        settings.setCurrentWeek(null)
        setProgramFeedback({
          kind: 'success',
          name: result.program.name,
          weeks: result.program.durationWeeks
        })
      } else {
        setProgramFeedback({ kind: 'error', message: result.error })
      }
    }
    reader.onerror = () => {
      setProgramFeedback({
        kind: 'error',
        message: 'Impossibile leggere il file selezionato.'
      })
    }
    reader.readAsText(file)
  }

  function handleRemoveCustomProgram() {
    settings.setCustomProgram(null)
    setProgramFeedback(null)
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

            {settings.customProgram && (
              <Card
                onClick={() => settings.setSelectedProgram('custom')}
                className={
                  settings.selectedProgram === 'custom'
                    ? 'ring-2 ring-primary bg-primary/5'
                    : ''
                }
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                      settings.selectedProgram === 'custom'
                        ? 'border-primary'
                        : 'border-border'
                    }`}
                  >
                    {settings.selectedProgram === 'custom' && (
                      <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-medium text-text truncate">
                        {settings.customProgram.name}
                      </p>
                      <span
                        className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 border-[2px]"
                        style={{
                          color: INK,
                          backgroundColor: '#F2EAF8',
                          borderColor: INK,
                          borderRadius: RADIUS.pill,
                          boxShadow: SHADOW.xxs
                        }}
                      >
                        Custom
                      </span>
                    </div>
                    <p className="text-xs text-text-secondary">
                      {settings.customProgram.durationWeeks} settimane · caricato dal dispositivo
                    </p>
                  </div>
                </div>
              </Card>
            )}

            <motion.div
              className="p-4 border-[3px] border-dashed w-full text-left"
              style={{
                borderColor: INK,
                borderRadius: RADIUS.blob,
                backgroundColor: '#FFF8E8'
              }}
              initial={false}
            >
              <div className="flex items-start gap-3">
                <div
                  className="w-10 h-10 flex items-center justify-center shrink-0 border-[2.5px]"
                  style={{
                    borderColor: INK,
                    backgroundColor: '#E2F6F6',
                    borderRadius: RADIUS.blob,
                    boxShadow: SHADOW.xs
                  }}
                  aria-hidden
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke={INK}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text">
                    Carica un programma
                  </p>
                  <p className="text-xs text-text-secondary mb-3">
                    Importa un file JSON dal tuo dispositivo. Verrà validato prima dell'uso.
                  </p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={handleLoadCustomProgram}
                    >
                      {settings.customProgram ? 'Sostituisci JSON' : 'Scegli JSON'}
                    </Button>
                    {settings.customProgram && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleRemoveCustomProgram}
                      >
                        Rimuovi
                      </Button>
                    )}
                  </div>
                </div>
              </div>
              <input
                ref={programInputRef}
                type="file"
                accept=".json,application/json"
                className="hidden"
                onChange={handleCustomProgramChange}
              />
            </motion.div>

            <AnimatePresence>
              {programFeedback && (
                <motion.div
                  key={programFeedback.kind + (programFeedback.kind === 'error' ? programFeedback.message : programFeedback.name)}
                  initial={{ opacity: 0, y: -6, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.96 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                  className="p-4 border-[3px] flex items-start gap-3"
                  style={{
                    borderColor:
                      programFeedback.kind === 'success' ? INK : '#CC3020',
                    backgroundColor:
                      programFeedback.kind === 'success' ? '#E2F6F6' : '#FDECEA',
                    borderRadius: RADIUS.blob,
                    boxShadow:
                      programFeedback.kind === 'success'
                        ? SHADOW.md
                        : `4px 4px 0px #CC3020, inset 0 2px 0 rgba(255,255,255,0.5)`
                  }}
                  role={programFeedback.kind === 'error' ? 'alert' : 'status'}
                >
                  <div
                    className="w-8 h-8 shrink-0 flex items-center justify-center border-[2.5px]"
                    style={{
                      borderColor:
                        programFeedback.kind === 'success' ? INK : '#CC3020',
                      backgroundColor:
                        programFeedback.kind === 'success'
                          ? '#FFF8E8'
                          : '#FFFBF0',
                      borderRadius: RADIUS.blob,
                      boxShadow: SHADOW.xxs
                    }}
                    aria-hidden
                  >
                    {programFeedback.kind === 'success' ? (
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke={INK}
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    ) : (
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#CC3020"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <line x1="12" y1="8" x2="12" y2="13" />
                        <line x1="12" y1="17" x2="12" y2="17" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    {programFeedback.kind === 'success' ? (
                      <>
                        <p
                          className="text-sm font-bold"
                          style={{ color: INK }}
                        >
                          Programma caricato!
                        </p>
                        <p className="text-xs mt-0.5" style={{ color: INK }}>
                          <span className="font-semibold">
                            {programFeedback.name}
                          </span>{' '}
                          · {programFeedback.weeks} settimane. Ora è il programma attivo.
                        </p>
                      </>
                    ) : (
                      <>
                        <p
                          className="text-sm font-bold"
                          style={{ color: '#CC3020' }}
                        >
                          JSON non valido
                        </p>
                        <p
                          className="text-xs mt-0.5 break-words"
                          style={{ color: '#CC3020' }}
                        >
                          {programFeedback.message}
                        </p>
                      </>
                    )}
                  </div>
                  <button
                    onClick={() => setProgramFeedback(null)}
                    aria-label="Chiudi"
                    className="shrink-0 w-6 h-6 flex items-center justify-center"
                    style={{ color: INK }}
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
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
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-text">
                    Esporta Progressi
                  </p>
                  <BackupStatus lastBackupAt={settings.lastBackupAt} />
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

function BackupStatus({ lastBackupAt }: { lastBackupAt: string | null }) {
  if (!lastBackupAt) {
    return (
      <p className="text-xs mt-0.5" style={{ color: '#CC3020' }}>
        Nessun backup effettuato
      </p>
    )
  }
  const days = Math.floor(
    (Date.now() - new Date(lastBackupAt).getTime()) / 86400000
  )
  const color = days < 7 ? '#2E7D32' : days < 30 ? '#B8860B' : '#CC3020'
  const label =
    days === 0 ? 'oggi' : days === 1 ? '1 giorno fa' : `${days} giorni fa`
  return (
    <p className="text-xs mt-0.5" style={{ color }}>
      Ultimo backup: {label}
    </p>
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
