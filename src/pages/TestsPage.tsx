import { useState } from 'react'
import { motion } from 'framer-motion'
import PageHeader from '../components/ui/PageHeader'
import { BodyweightStepper } from '../components/LoadCard'
import { useSettingsStore } from '../store/useSettingsStore'
import { useWorkoutStore } from '../store/useWorkoutStore'
import { useBenchmarkStore } from '../store/useBenchmarkStore'
import { getProgram } from '../utils/getProgram'
import { getActiveWeekNumber } from '../utils/programUtils'
import {
  describeOffload,
  formatKg,
  getBodyweight,
  getLatestResult,
  getResult,
  parseNumber,
  roundToHalf
} from '../utils/benchmarks'
import type {
  BenchmarkConfig,
  BenchmarkTest,
  Exercise,
  TrainingProgram
} from '../types'
import type { BenchmarkResults } from '../store/useBenchmarkStore'
import { INK, RADIUS, SHADOW } from '../styles/tokens'

const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.03 } }
}
const fadeUp = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.2 } }
}

export default function TestsPage() {
  const { selectedProgram, currentWeek: overrideWeek } = useSettingsStore()
  const programStartDate = useWorkoutStore((s) => s.programStartDate)
  const { results, bodyweightKg, setResult, setBodyweight } = useBenchmarkStore()
  const program = getProgram(selectedProgram)
  const config = program.benchmarks
  const weekNumber = getActiveWeekNumber(program, programStartDate, overrideWeek)

  const currentPhaseIndex = config
    ? Math.max(
        0,
        config.phases.findLastIndex((p) => p.weekNumber <= weekNumber)
      )
    : 0
  const [phaseIndex, setPhaseIndex] = useState(currentPhaseIndex)

  if (!config) {
    return (
      <div className="bg-bg min-h-dvh">
        <PageHeader title="Test" backButton />
        <p className="text-text-secondary text-center mt-12">
          Il programma attivo non ha test
        </p>
      </div>
    )
  }

  const phase = config.phases[phaseIndex]
  const bodyweight = getBodyweight(config, bodyweightKg)

  return (
    <div className="bg-bg min-h-dvh">
      <PageHeader title="Test e CR" subtitle={program.name} backButton />

      <motion.div
        className="px-4 pt-4 pb-12 max-w-lg mx-auto"
        variants={stagger}
        initial="hidden"
        animate="show"
      >
        <motion.p
          variants={fadeUp}
          className="text-sm text-text-secondary leading-relaxed px-1 mb-4"
        >
          {config.description}
        </motion.p>

        <motion.div
          variants={fadeUp}
          className="flex items-center justify-between gap-3 px-4 py-3 mb-6 border-[2.5px] border-[#3A1248]"
          style={{
            borderRadius: RADIUS.card,
            backgroundColor: '#FFF8E8',
            boxShadow: SHADOW.sm
          }}
        >
          <div>
            <p className="text-sm font-bold text-text">Peso corporeo</p>
            <p className="text-xs text-text-secondary">
              Usato per il peso da togliere sulla trave
            </p>
          </div>
          <BodyweightStepper value={bodyweight} onChange={setBodyweight} />
        </motion.div>

        <motion.p
          variants={fadeUp}
          className="text-[11px] font-bold uppercase tracking-[0.25em] text-text-muted mb-2"
        >
          Risultati
        </motion.p>
        <motion.div variants={fadeUp} className="grid grid-cols-3 gap-2 mb-4">
          {config.phases.map((p, i) => {
            const active = i === phaseIndex
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setPhaseIndex(i)}
                className="px-2 py-2 border-[2.5px] border-[#3A1248] text-center cursor-pointer transition-colors"
                style={{
                  borderRadius: RADIUS.btnSm,
                  backgroundColor: active ? '#E8B820' : '#FFF8E8',
                  boxShadow: active ? SHADOW.pressed : SHADOW.xs
                }}
              >
                <p className="text-xs font-bold text-text leading-tight">
                  {p.label}
                </p>
                <p className="text-[10px] text-text-secondary mt-0.5">
                  {p.dates}
                </p>
              </button>
            )
          })}
        </motion.div>

        <div className="space-y-3 mb-8">
          {config.tests.map((test) => (
            <motion.div key={test.id} variants={fadeUp}>
              <TestRow
                test={test}
                config={config}
                results={results}
                programId={selectedProgram}
                phaseId={phase.id}
                bodyweight={bodyweight}
                onChange={(value) =>
                  setResult(selectedProgram, phase.id, test.id, value)
                }
              />
            </motion.div>
          ))}
        </div>

        <LoadTables
          program={program}
          config={config}
          results={results}
          programId={selectedProgram}
          bodyweight={bodyweight}
          currentWeek={weekNumber}
        />
      </motion.div>
    </div>
  )
}

function TestRow({
  test,
  config,
  results,
  programId,
  phaseId,
  bodyweight,
  onChange
}: {
  test: BenchmarkTest
  config: BenchmarkConfig
  results: BenchmarkResults
  programId: string
  phaseId: string
  bodyweight: number
  onChange: (value: string) => void
}) {
  const value = getResult(config, results, programId, phaseId, test.id)
  const numeric = parseNumber(value)
  const isNumeric = Boolean(test.unit)

  return (
    <div
      className="px-4 py-3 border-[2.5px] border-[#3A1248]"
      style={{
        borderRadius: RADIUS.card,
        backgroundColor: '#FFF8E8',
        boxShadow: SHADOW.sm
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-text">{test.label}</p>
          <p className="text-xs text-text-secondary leading-snug mt-0.5">
            {test.howTo}
          </p>
        </div>
        <label
          className="shrink-0 flex items-center gap-1 px-2.5 h-10 border-[2px] border-[#3A1248] bg-bg"
          style={{ borderRadius: RADIUS.btnSm }}
        >
          <input
            type="text"
            inputMode={isNumeric ? 'decimal' : 'text'}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="—"
            aria-label={test.label}
            className={`bg-transparent outline-none font-bold font-timer text-text text-right ${
              isNumeric ? 'w-12' : 'w-28'
            }`}
          />
          {test.unit && (
            <span className="text-xs font-bold text-text-muted">
              {test.unit}
            </span>
          )}
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-[11px] text-text-muted">
        {test.percentOfBodyweight && numeric != null && (
          <span className="font-bold text-primary">
            {Math.round((numeric / bodyweight) * 100)}% del peso
          </span>
        )}
        {config.phases
          .filter((p) => p.id !== phaseId)
          .map((p) => {
            const other = getResult(config, results, programId, p.id, test.id)
            return (
              <span key={p.id}>
                {p.label}:{' '}
                <span className="font-bold text-text-secondary">
                  {other ? `${other}${test.unit ? ` ${test.unit}` : ''}` : '—'}
                </span>
              </span>
            )
          })}
      </div>
    </div>
  )
}

/** Week-by-week hangboard loads (like the table in the plan), from the latest CR */
function LoadTables({
  program,
  config,
  results,
  programId,
  bodyweight,
  currentWeek
}: {
  program: TrainingProgram
  config: BenchmarkConfig
  results: BenchmarkResults
  programId: string
  bodyweight: number
  currentWeek: number
}) {
  const loadedTests = config.tests.filter((t) =>
    program.weeks.some((w) =>
      w.days.some((d) => d.exercises.some((ex) => ex.load?.test === t.id))
    )
  )
  if (loadedTests.length === 0) return null

  return (
    <>
      <motion.p
        variants={fadeUp}
        className="text-[11px] font-bold uppercase tracking-[0.25em] text-text-muted mb-2"
      >
        Carichi trave
      </motion.p>
      <div className="space-y-3">
        {loadedTests.map((test) => {
          const latest = getLatestResult(config, results, programId, test.id)
          const rows = program.weeks.flatMap((w) => {
            const ex = w.days
              .flatMap((d) => d.exercises)
              .find((e): e is Exercise & { load: NonNullable<Exercise['load']> } =>
                e.load?.test === test.id
              )
            return ex ? [{ week: w, ex }] : []
          })
          return (
            <motion.div
              key={test.id}
              variants={fadeUp}
              className="border-[2.5px] border-[#3A1248] overflow-hidden"
              style={{
                borderRadius: RADIUS.card,
                backgroundColor: '#FFF8E8',
                boxShadow: SHADOW.sm
              }}
            >
              <div className="px-4 pt-3 pb-2">
                <p className="text-sm font-bold text-text">{test.label}</p>
                <p className="text-xs text-text-secondary">
                  {latest
                    ? `CR ${formatKg(latest.value)} kg (${latest.phase.label}) · peso ${formatKg(bodyweight)} kg`
                    : 'Inserisci il CR per calcolare i carichi'}
                </p>
              </div>
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-[10px] uppercase tracking-wider text-text-muted">
                    <th className="text-left font-bold px-4 py-1.5">Sett.</th>
                    <th className="text-right font-bold px-2 py-1.5">%</th>
                    <th className="text-right font-bold px-2 py-1.5">Totale</th>
                    <th className="text-right font-bold px-2 py-1.5">Peso</th>
                    <th className="text-right font-bold px-4 py-1.5">Serie</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map(({ week, ex }) => {
                    const total = latest
                      ? roundToHalf((latest.value * ex.load.percent) / 100)
                      : null
                    const isCurrent = week.weekNumber === currentWeek
                    return (
                      <tr
                        key={week.weekNumber}
                        className="border-t border-dashed"
                        style={{
                          borderColor: `${INK}33`,
                          backgroundColor: isCurrent ? '#FBF0CC' : undefined
                        }}
                      >
                        <td className="px-4 py-1.5 font-bold font-timer text-text">
                          {week.weekNumber}
                          {isCurrent && (
                            <span className="ml-1 text-primary">●</span>
                          )}
                        </td>
                        <td className="text-right px-2 py-1.5 font-timer text-text">
                          {ex.load.percent}%
                        </td>
                        <td className="text-right px-2 py-1.5 font-bold font-timer text-text whitespace-nowrap">
                          {total != null ? `${formatKg(total)} kg` : '—'}
                        </td>
                        <td className="text-right px-2 py-1.5 text-text-secondary whitespace-nowrap">
                          {total != null
                            ? describeOffload(roundToHalf(bodyweight - total))
                            : '—'}
                        </td>
                        <td className="text-right px-4 py-1.5 font-timer text-text whitespace-nowrap">
                          {ex.sets}×{ex.hangTime}"
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </motion.div>
          )
        })}
      </div>
    </>
  )
}
