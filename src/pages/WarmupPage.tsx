import { motion } from 'framer-motion'
import PageHeader from '../components/ui/PageHeader'
import GuideSectionCard from '../components/ui/GuideSectionCard'
import { useSettingsStore } from '../store/useSettingsStore'
import { useWorkoutStore } from '../store/useWorkoutStore'
import { useBenchmarkStore } from '../store/useBenchmarkStore'
import { getProgram } from '../utils/getProgram'
import { getActiveWeekNumber } from '../utils/programUtils'
import {
  describeOffload,
  formatKg,
  getBodyweight,
  getDistinctLoads,
  resolveLoad,
  roundToHalf
} from '../utils/benchmarks'
import { INK, RADIUS, SHADOW } from '../styles/tokens'

const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.04 } }
}
const fadeUp = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.2 } }
}

export default function WarmupPage() {
  const { selectedProgram, currentWeek: overrideWeek } = useSettingsStore()
  const programStartDate = useWorkoutStore((s) => s.programStartDate)
  const results = useBenchmarkStore((s) => s.results)
  const storedBodyweight = useBenchmarkStore((s) => s.bodyweightKg)
  const program = getProgram(selectedProgram)
  const warmup = program.warmup

  if (!warmup) {
    return (
      <div className="bg-bg min-h-dvh">
        <PageHeader title="Riscaldamento" backButton />
        <p className="text-text-secondary text-center mt-12">
          Il programma attivo non ha un riscaldamento standard
        </p>
      </div>
    )
  }

  const weekNumber = getActiveWeekNumber(program, programStartDate, overrideWeek)
  const week = program.weeks.find((w) => w.weekNumber === weekNumber)
  const config = program.benchmarks
  const weekLoads = week ? getDistinctLoads(week.days.flatMap((d) => d.exercises)) : []
  const showRamp = Boolean(warmup.rampPercents && config && weekLoads.length > 0)

  return (
    <div className="bg-bg min-h-dvh">
      <PageHeader title="Riscaldamento" subtitle={warmup.title} backButton />

      <motion.div
        className="px-4 pt-4 pb-12 max-w-lg mx-auto space-y-3"
        variants={stagger}
        initial="hidden"
        animate="show"
      >
        <motion.p variants={fadeUp} className="text-sm text-text-secondary leading-relaxed px-1">
          {warmup.description}
        </motion.p>

        {warmup.sections.map((section, i) => (
          <motion.div key={section.title} variants={fadeUp}>
            <GuideSectionCard section={section} step={i} />
          </motion.div>
        ))}

        {showRamp && config && warmup.rampPercents && (
          <motion.div
            variants={fadeUp}
            className="border-[2.5px] border-[#3A1248] overflow-hidden"
            style={{ borderRadius: RADIUS.card, boxShadow: SHADOW.sm, backgroundColor: '#FBF0CC' }}
          >
            <div className="px-4 pt-3 pb-2">
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-text-muted">
                Rampa dita · settimana {weekNumber}
              </p>
              <p className="text-xs text-text-secondary mt-0.5">
                Calcolata sul carico della trave di questa settimana
              </p>
            </div>
            <div className="px-2 pb-2 space-y-2">
              {weekLoads.map((load) => {
                const bodyweight = getBodyweight(config, storedBodyweight)
                const day = resolveLoad(load, config, results, selectedProgram, bodyweight)
                return (
                  <div
                    key={`${load.test}-${load.percent}`}
                    className="px-3 py-2.5 border-[2px] border-[#3A1248]"
                    style={{ borderRadius: RADIUS.btnMd, backgroundColor: '#FFF8E8' }}
                  >
                    <p className="text-sm font-bold text-text">
                      {day.testLabel}
                      <span className="font-normal text-text-muted">
                        {day.total != null ? ` · giornata ${formatKg(day.total)} kg` : ''}
                      </span>
                    </p>
                    {day.total == null ? (
                      <p className="text-xs text-danger font-bold mt-1">Manca il CR</p>
                    ) : (
                      <div className="grid grid-cols-3 gap-2 mt-2">
                        {warmup.rampPercents!.map((pct) => {
                          const total = roundToHalf((day.total! * pct) / 100)
                          return (
                            <div
                              key={pct}
                              className="text-center py-1.5 border-[1.5px] border-dashed"
                              style={{ borderColor: `${INK}55`, borderRadius: RADIUS.btnSm }}
                            >
                              <p className="text-[10px] font-bold text-text-muted">{pct}%</p>
                              <p className="text-sm font-bold font-timer text-primary leading-tight">
                                {formatKg(total)} kg
                              </p>
                              <p className="text-[10px] text-text">
                                {describeOffload(roundToHalf(bodyweight - total))}
                              </p>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}
