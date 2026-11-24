import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useSettingsStore } from '../../store/useSettingsStore'
import { programOptions } from '../../utils/getProgram'
import { validateProgramJson } from '../../utils/validateProgram'
import { readFileAsText } from '../../utils/readFile'
import Card from '../ui/Card'
import Button from '../ui/Button'
import FeedbackBanner, { type Feedback } from './FeedbackBanner'
import { INK, RADIUS, SHADOW } from '../../styles/tokens'
import type { ReactNode } from 'react'

function RadioCard({
  selected,
  onSelect,
  children
}: {
  selected: boolean
  onSelect: () => void
  children: ReactNode
}) {
  return (
    <Card onClick={onSelect} className={selected ? 'ring-2 ring-primary bg-primary/5' : ''}>
      <div className="flex items-center gap-3">
        <div
          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
            selected ? 'border-primary' : 'border-border'
          }`}
        >
          {selected && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
        </div>
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </Card>
  )
}

function UploadIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={INK} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  )
}

/** Built-in programs, the uploaded custom one, and the JSON upload box */
export default function ProgramSection() {
  const selectedProgram = useSettingsStore((s) => s.selectedProgram)
  const customProgram = useSettingsStore((s) => s.customProgram)
  const setSelectedProgram = useSettingsStore((s) => s.setSelectedProgram)
  const setCustomProgram = useSettingsStore((s) => s.setCustomProgram)
  const setCurrentWeek = useSettingsStore((s) => s.setCurrentWeek)
  const inputRef = useRef<HTMLInputElement>(null)
  const [feedback, setFeedback] = useState<Feedback | null>(null)

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    let json: string
    try {
      json = await readFileAsText(file)
    } catch {
      setFeedback({ kind: 'error', title: 'JSON non valido', message: 'Impossibile leggere il file selezionato.' })
      return
    }
    const result = validateProgramJson(json)
    if (!result.ok) {
      setFeedback({ kind: 'error', title: 'JSON non valido', message: result.error })
      return
    }
    setCustomProgram(result.program)
    setSelectedProgram('custom')
    setCurrentWeek(null)
    setFeedback({
      kind: 'success',
      title: 'Programma caricato!',
      message: (
        <>
          <span className="font-semibold">{result.program.name}</span> ·{' '}
          {result.program.durationWeeks} settimane. Ora è il programma attivo.
        </>
      )
    })
  }

  function handleRemove() {
    setCustomProgram(null)
    setFeedback(null)
  }

  return (
    <div className="space-y-2">
      {programOptions.map((opt) => (
        <RadioCard
          key={opt.id}
          selected={selectedProgram === opt.id}
          onSelect={() => setSelectedProgram(opt.id)}
        >
          <p className="text-sm font-medium text-text">{opt.label}</p>
          <p className="text-xs text-text-secondary">{opt.description}</p>
        </RadioCard>
      ))}

      {customProgram && (
        <RadioCard
          selected={selectedProgram === 'custom'}
          onSelect={() => setSelectedProgram('custom')}
        >
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-medium text-text truncate">{customProgram.name}</p>
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
            {customProgram.durationWeeks} settimane · caricato dal dispositivo
          </p>
        </RadioCard>
      )}

      <motion.div
        className="p-4 border-[3px] border-dashed w-full text-left"
        style={{ borderColor: INK, borderRadius: RADIUS.blob, backgroundColor: '#FFF8E8' }}
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
            <UploadIcon />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-text">Carica un programma</p>
            <p className="text-xs text-text-secondary mb-3">
              Importa un file JSON dal tuo dispositivo. Verrà validato prima dell'uso.
            </p>
            <div className="flex items-center gap-2 flex-wrap">
              <Button variant="secondary" size="sm" onClick={() => inputRef.current?.click()}>
                {customProgram ? 'Sostituisci JSON' : 'Scegli JSON'}
              </Button>
              {customProgram && (
                <Button variant="ghost" size="sm" onClick={handleRemove}>
                  Rimuovi
                </Button>
              )}
            </div>
          </div>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept=".json,application/json"
          className="hidden"
          onChange={handleFileChange}
        />
      </motion.div>

      <FeedbackBanner feedback={feedback} onDismiss={() => setFeedback(null)} />
    </div>
  )
}
