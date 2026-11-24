import { useRef, useState } from 'react'
import { useSettingsStore } from '../../store/useSettingsStore'
import { buildBackup, restoreBackup } from '../../utils/backup'
import { daysSince, toLocalISODate } from '../../utils/dateUtils'
import { readFileAsText } from '../../utils/readFile'
import Card from '../ui/Card'
import Button from '../ui/Button'
import FeedbackBanner, { type Feedback } from './FeedbackBanner'

function BackupStatus({ lastBackupAt }: { lastBackupAt: string | null }) {
  if (!lastBackupAt) {
    return (
      <p className="text-xs mt-0.5" style={{ color: '#CC3020' }}>
        Nessun backup effettuato
      </p>
    )
  }
  const days = daysSince(lastBackupAt)
  const color = days < 7 ? '#2E7D32' : days < 30 ? '#B8860B' : '#CC3020'
  const label = days === 0 ? 'oggi' : days === 1 ? '1 giorno fa' : `${days} giorni fa`
  return (
    <p className="text-xs mt-0.5" style={{ color }}>
      Ultimo backup: {label}
    </p>
  )
}

/** Shares the file where the platform allows it (iOS), else downloads it */
async function saveBackupFile(data: string): Promise<'saved' | 'cancelled'> {
  const filename = `LSDita-backup-${toLocalISODate()}.json`
  const blob = new Blob([data], { type: 'application/json' })
  const file = new File([blob], filename, { type: 'application/json' })

  const nav = navigator as Navigator & { canShare?: (data: ShareData) => boolean }
  if (nav.canShare?.({ files: [file] })) {
    try {
      await nav.share({ files: [file], title: 'Backup LSDita', text: 'Backup dei progressi LSDita' })
      return 'saved'
    } catch (err) {
      if ((err as DOMException)?.name === 'AbortError') return 'cancelled'
    }
  }

  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
  return 'saved'
}

export default function DataSection() {
  const lastBackupAt = useSettingsStore((s) => s.lastBackupAt)
  const markBackupDone = useSettingsStore((s) => s.markBackupDone)
  const inputRef = useRef<HTMLInputElement>(null)
  const [feedback, setFeedback] = useState<Feedback | null>(null)

  async function handleExport() {
    if ((await saveBackupFile(buildBackup())) === 'saved') markBackupDone()
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    if (!confirm('Il ripristino sostituisce i dati attuali con quelli del backup. Continuare?')) {
      return
    }

    let result
    try {
      result = restoreBackup(await readFileAsText(file))
    } catch {
      result = { ok: false as const, error: 'Impossibile leggere il file selezionato.' }
    }
    setFeedback(
      result.ok
        ? { kind: 'success', title: 'Backup ripristinato', message: 'Dati recuperati da ' + file.name }
        : { kind: 'error', title: 'Ripristino non riuscito', message: result.error + ' Nessun dato è stato modificato.' }
    )
  }

  return (
    <div className="space-y-2">
      <Card>
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-medium text-text">Esporta Progressi</p>
            <p className="text-xs text-text-secondary">
              Allenamenti, note, test, logbook e sessioni modificate
            </p>
            <BackupStatus lastBackupAt={lastBackupAt} />
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
          <Button variant="ghost" size="sm" onClick={() => inputRef.current?.click()}>
            Importa
          </Button>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept=".json"
          className="hidden"
          onChange={handleFileChange}
        />
      </Card>
      <FeedbackBanner feedback={feedback} onDismiss={() => setFeedback(null)} />
    </div>
  )
}
