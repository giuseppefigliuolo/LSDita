import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import type { BenchmarkConfig, ExerciseLoad } from '../types'
import { useBenchmarkStore } from '../store/useBenchmarkStore'
import {
  describeOffload,
  formatKg,
  getBodyweight,
  resolveLoad
} from '../utils/benchmarks'
import { INK, RADIUS, SHADOW } from '../styles/tokens'

/** Today's hangboard loads (CR × %) with the bodyweight of the day */
export default function LoadCard({
  programId,
  config,
  loads
}: {
  programId: string
  config: BenchmarkConfig
  loads: ExerciseLoad[]
}) {
  const navigate = useNavigate()
  const results = useBenchmarkStore((s) => s.results)
  const storedBodyweight = useBenchmarkStore((s) => s.bodyweightKg)
  const setBodyweight = useBenchmarkStore((s) => s.setBodyweight)
  const bodyweight = getBodyweight(config, storedBodyweight)

  return (
    <div
      className="border-[2.5px] border-[#3A1248] overflow-hidden"
      style={{
        borderRadius: RADIUS.card,
        backgroundColor: '#FFF8E8',
        boxShadow: SHADOW.sm
      }}
    >
      <div className="flex items-center justify-between gap-3 px-4 pt-3 pb-2">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-text-muted">
            Carichi di oggi
          </p>
          <p className="text-xs text-text-secondary mt-0.5">
            Pesati prima della sessione
          </p>
        </div>
        <BodyweightStepper
          value={bodyweight}
          onChange={(kg) => setBodyweight(kg)}
        />
      </div>

      <div className="px-2 pb-2 space-y-2">
        {loads.map((load) => {
          const r = resolveLoad(load, config, results, programId, bodyweight)
          return (
            <div
              key={`${load.test}-${load.percent}`}
              className="flex items-center justify-between gap-3 px-3 py-2.5 border-[2px] border-dashed"
              style={{ borderColor: `${INK}55`, borderRadius: RADIUS.btnMd }}
            >
              <div className="min-w-0">
                <p className="text-sm font-bold text-text truncate">
                  {r.testLabel}
                </p>
                <p className="text-[11px] text-text-muted">
                  {r.percent}% del CR
                  {r.reference != null ? ` · CR ${formatKg(r.reference)} kg` : ''}
                </p>
              </div>
              {r.total != null && r.offload != null ? (
                <div className="text-right shrink-0">
                  <p className="text-lg font-bold font-timer text-primary leading-none">
                    {formatKg(r.total)} kg
                  </p>
                  <p className="text-[11px] font-bold text-text mt-1">
                    {describeOffload(r.offload)}
                  </p>
                </div>
              ) : (
                <span className="text-xs font-bold text-danger shrink-0">
                  Manca il CR
                </span>
              )}
            </div>
          )
        })}
      </div>

      <button
        type="button"
        onClick={() => navigate('/tests')}
        className="w-full flex items-center justify-between px-4 py-2.5 border-t-[2px] border-[#3A1248] text-xs font-bold text-text cursor-pointer"
        style={{ backgroundColor: '#FBF0CC' }}
      >
        Aggiorna CR e test
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={INK} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>
    </div>
  )
}

export function BodyweightStepper({
  value,
  onChange
}: {
  value: number
  onChange: (kg: number) => void
}) {
  return (
    <div className="flex items-center gap-1.5 shrink-0">
      <StepButton label="−" onClick={() => onChange(Math.max(30, value - 0.5))} />
      <span className="min-w-[4.5rem] text-center text-sm font-bold font-timer text-text">
        {formatKg(value)} kg
      </span>
      <StepButton label="+" onClick={() => onChange(Math.min(150, value + 0.5))} />
    </div>
  )
}

function StepButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-label={label === '+' ? 'Aumenta peso' : 'Diminuisci peso'}
      className="w-8 h-8 flex items-center justify-center border-[2px] border-[#3A1248] text-base font-bold text-text cursor-pointer"
      style={{
        backgroundColor: '#F4E8C4',
        borderRadius: RADIUS.backBtn,
        boxShadow: SHADOW.xxs
      }}
      whileTap={{ x: 1, y: 1, boxShadow: SHADOW.pressed }}
    >
      {label}
    </motion.button>
  )
}
