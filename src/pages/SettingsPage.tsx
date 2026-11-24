import { motion } from 'framer-motion'
import { useSettingsStore } from '../store/useSettingsStore'
import { useWorkoutStore } from '../store/useWorkoutStore'
import { getProgram } from '../utils/getProgram'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import SettingsSection from '../components/settings/SettingsSection'
import ProgramSection from '../components/settings/ProgramSection'
import ToggleRow from '../components/settings/ToggleRow'
import WeekPicker from '../components/settings/WeekPicker'
import CountdownStepper from '../components/settings/CountdownStepper'
import VolumeSlider from '../components/settings/VolumeSlider'
import DataSection from '../components/settings/DataSection'

export default function SettingsPage() {
  const settings = useSettingsStore()
  const resetAll = useWorkoutStore((s) => s.resetAll)
  const program = getProgram(settings.selectedProgram)

  return (
    <motion.div
      className="px-4 pt-6 pb-6 max-w-lg mx-auto"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      <h1 className="text-3xl mb-1" style={{ fontFamily: 'var(--font-display)' }}>
        Impostazioni
      </h1>
      <p className="text-text-secondary text-sm mb-6">Personalizza la tua esperienza</p>

      <div className="space-y-6">
        <SettingsSection title="Programma Attivo">
          <ProgramSection />
        </SettingsSection>

        <SettingsSection title="Audio e Feedback">
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
        </SettingsSection>

        <SettingsSection title="Settimana Corrente">
          <WeekPicker
            durationWeeks={program.durationWeeks}
            currentWeek={settings.currentWeek}
            onChange={settings.setCurrentWeek}
          />
        </SettingsSection>

        <SettingsSection title="Timer">
          <CountdownStepper
            value={settings.countdownDuration}
            onChange={settings.setCountdownDuration}
          />
        </SettingsSection>

        <SettingsSection title="Volume">
          <VolumeSlider value={settings.volume} onChange={settings.setVolume} />
        </SettingsSection>

        <SettingsSection title="Dati">
          <DataSection />
        </SettingsSection>

        <SettingsSection title="Programma">
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
                    resetAll()
                  }
                }}
              >
                Reset
              </Button>
            </div>
          </Card>
        </SettingsSection>

        <div className="text-center pt-4">
          <p className="text-xs text-text-muted">
            LSDita v{import.meta.env.VITE_APP_VERSION} — Fatto con ❤️ per l'arrampicata
          </p>
          <p className="text-xs text-text-muted mt-2">
            Gruppo <b>Picasass</b>
          </p>
        </div>
      </div>
    </motion.div>
  )
}
