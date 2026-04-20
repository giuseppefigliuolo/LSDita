import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { useLogbookStore } from '../store/useLogbookStore'
import AddClimbModal from '../components/AddClimbModal'
import type { AscentType, Climb, ClimbStyle } from '../types'
import { INK, RADIUS, SHADOW, SURFACE_ELEVATED } from '../styles/tokens'
import {
  ASCENT_TONES,
  STYLE_LABELS,
  STYLE_OPTIONS,
  formatAscent,
  gradeTone,
  maxGrade,
} from '../utils/climbGrades'

type StyleFilter = 'all' | ClimbStyle
type AscentFilter = 'all' | AscentType

const MONTH_NAMES = [
  'gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno',
  'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre',
]

export default function LogbookPage() {
  const climbs = useLogbookStore((s) => s.climbs)
  const [styleFilter, setStyleFilter] = useState<StyleFilter>('all')
  const [ascentFilter, setAscentFilter] = useState<AscentFilter>('all')
  const [showAdd, setShowAdd] = useState(false)
  const [editing, setEditing] = useState<Climb | null>(null)

  const sorted = useMemo(
    () => [...climbs].sort((a, b) => b.date.localeCompare(a.date)),
    [climbs],
  )

  const filtered = useMemo(
    () =>
      sorted.filter(
        (c) =>
          (styleFilter === 'all' || c.style === styleFilter) &&
          (ascentFilter === 'all' || c.ascentType === ascentFilter),
      ),
    [sorted, styleFilter, ascentFilter],
  )

  const stats = useMemo(() => {
    const now = new Date()
    const monthCount = climbs.filter((c) => {
      const d = new Date(c.date)
      return (
        d.getMonth() === now.getMonth() &&
        d.getFullYear() === now.getFullYear()
      )
    }).length
    const best = maxGrade(climbs) ?? '—'
    const flashCount = climbs.filter((c) => c.ascentType === 'flash').length
    const avg =
      climbs.length === 0
        ? 0
        : climbs.reduce((s, c) => s + c.rating, 0) / climbs.length
    return {
      monthLabel: MONTH_NAMES[now.getMonth()].toUpperCase(),
      monthCount,
      best,
      flashCount,
      avg: avg.toFixed(1),
    }
  }, [climbs])

  const groups = useMemo(() => groupByDate(filtered), [filtered])

  return (
    <motion.div
      className="px-4 pt-6 pb-6 max-w-lg mx-auto"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      <div className="flex items-end justify-between mb-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-text-muted">
            Il tuo logbook
          </p>
          <h1
            className="text-3xl flex items-baseline gap-2"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Climbs
            <span className="text-base text-primary">·{climbs.length}</span>
          </h1>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="inline-flex items-center gap-1 font-bold border-[3px] border-[#3A1248] px-4 py-2 text-sm cursor-pointer"
          style={{
            backgroundColor: '#D4541A',
            color: '#FFFBF0',
            borderRadius: RADIUS.btnMd,
            boxShadow: `4px 4px 0px ${INK}, inset 0 2px 0 rgba(255,255,255,0.4)`,
          }}
        >
          + Aggiungi
        </button>
      </div>

      <div
        className="grid grid-cols-4 gap-0 border-[3px] border-[#3A1248] p-3 mb-4"
        style={{
          backgroundColor: SURFACE_ELEVATED,
          borderRadius: RADIUS.card,
          boxShadow: SHADOW.md,
        }}
      >
        <StatCell value={String(stats.monthCount)} label={stats.monthLabel} color="#D4541A" />
        <StatCell value={stats.best} label="MAX" color="#7B3A9E" />
        <StatCell value={String(stats.flashCount)} label="FLASH" color="#17A8A8" />
        <StatCell value={climbs.length === 0 ? '—' : stats.avg} label="★ AVG" color="#E8B820" />
      </div>

      <div className="flex gap-2 mb-3 overflow-x-auto no-scrollbar">
        <FilterChip
          label="Tutto"
          active={styleFilter === 'all'}
          onClick={() => setStyleFilter('all')}
          activeBg="#3A1248"
          activeText="#FFFBF0"
        />
        {STYLE_OPTIONS.map((opt) => (
          <FilterChip
            key={opt.value}
            label={STYLE_LABELS[opt.value]}
            active={styleFilter === opt.value}
            onClick={() => setStyleFilter(opt.value)}
            activeBg="#3A1248"
            activeText="#FFFBF0"
          />
        ))}
      </div>

      <div className="flex gap-2 mb-5 overflow-x-auto no-scrollbar">
        <FilterChip
          label="Tutti gli stili"
          active={ascentFilter === 'all'}
          onClick={() => setAscentFilter('all')}
          activeBg="#3A1248"
          activeText="#FFFBF0"
        />
        {(Object.keys(ASCENT_TONES) as AscentType[]).map((t) => {
          const tone = ASCENT_TONES[t]
          return (
            <FilterChip
              key={t}
              label={formatAscent(t)}
              active={ascentFilter === t}
              onClick={() => setAscentFilter(t)}
              activeBg={tone.border}
              activeText="#FFFBF0"
              inactiveBorder={tone.border}
              inactiveText={tone.text}
            />
          )
        })}
      </div>

      {groups.length === 0 && (
        <div className="text-center py-12">
          <MountainIcon size={40} />
          <p className="text-text-secondary mt-2">Nessuna scalata registrata</p>
          <p className="text-xs text-text-muted mt-1">
            Aggiungi la tua prima via dal pulsante in alto
          </p>
        </div>
      )}

      <div className="space-y-6">
        {groups.map((g) => (
          <div key={g.date}>
            <div className="flex items-center gap-3 mb-2 px-1">
              <p className="text-sm font-bold text-text">
                {formatDateHeader(g.date)}
              </p>
              <div className="flex-1 border-t-2 border-dashed border-[#3A1248]/30" />
              <p className="text-xs text-text-muted">
                {g.climbs[0].location.split('·')[0].trim()}
              </p>
            </div>
            <div className="space-y-3">
              {g.climbs.map((c) => (
                <ClimbCard key={c.id} climb={c} onClick={() => setEditing(c)} />
              ))}
            </div>
          </div>
        ))}
      </div>

      {showAdd && <AddClimbModal onClose={() => setShowAdd(false)} />}
      {editing && (
        <AddClimbModal initial={editing} onClose={() => setEditing(null)} />
      )}
    </motion.div>
  )
}

function ClimbCard({ climb, onClick }: { climb: Climb; onClick: () => void }) {
  const g = gradeTone(climb.grade)
  const a = ASCENT_TONES[climb.ascentType]
  return (
    <button
      onClick={onClick}
      className="w-full flex items-stretch border-[3px] border-[#3A1248] overflow-hidden cursor-pointer text-left"
      style={{
        backgroundColor: SURFACE_ELEVATED,
        borderRadius: RADIUS.card,
        boxShadow: SHADOW.md,
      }}
    >
      <div
        className="flex items-center justify-center w-16 font-timer font-bold text-lg border-r-[2px] border-[#3A1248]"
        style={{ backgroundColor: g.bg, color: g.text }}
      >
        {climb.grade}
      </div>
      <div className="flex-1 min-w-0 p-3">
        <p className="text-sm font-bold text-text truncate">{climb.name}</p>
        <p className="text-[11px] text-text-secondary truncate">
          <span className="font-semibold">{STYLE_LABELS[climb.style]}</span>
          {' · '}
          {climb.location}
        </p>
      </div>
      <div className="flex flex-col items-end justify-center gap-1 pr-3 py-2 shrink-0">
        <span
          className="text-[10px] font-bold uppercase tracking-wider border-[2px] px-2 py-0.5"
          style={{
            backgroundColor: a.bg,
            color: a.text,
            borderColor: a.border,
            borderRadius: RADIUS.pill,
          }}
        >
          {formatAscent(climb.ascentType, climb.attempts)}
        </span>
        <Stars value={climb.rating} />
      </div>
    </button>
  )
}

function Stars({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <svg
          key={n}
          width="11"
          height="11"
          viewBox="0 0 24 24"
          fill={n <= value ? '#E8B820' : 'none'}
          stroke="#3A1248"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </div>
  )
}

function StatCell({
  value,
  label,
  color,
}: {
  value: string
  label: string
  color: string
}) {
  return (
    <div className="flex flex-col items-center">
      <p
        className="text-2xl font-bold font-timer"
        style={{ color }}
      >
        {value}
      </p>
      <p className="text-[10px] uppercase tracking-wider text-text-muted mt-0.5">
        {label}
      </p>
    </div>
  )
}

function FilterChip({
  label,
  active,
  onClick,
  activeBg,
  activeText,
  inactiveBorder = '#3A1248',
  inactiveText = '#3A1248',
}: {
  label: string
  active: boolean
  onClick: () => void
  activeBg: string
  activeText: string
  inactiveBorder?: string
  inactiveText?: string
}) {
  return (
    <button
      onClick={onClick}
      className="shrink-0 px-3 py-1.5 text-xs font-bold border-[2px] cursor-pointer"
      style={{
        backgroundColor: active ? activeBg : 'transparent',
        color: active ? activeText : inactiveText,
        borderColor: active ? INK : inactiveBorder,
        borderRadius: RADIUS.pill,
        boxShadow: active ? SHADOW.xs : 'none',
        backgroundClip: 'padding-box',
      }}
    >
      {label}
    </button>
  )
}

function MountainIcon({ size = 20, color = '#8C7355' }: { size?: number; color?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="mx-auto"
    >
      <path d="M3 20l5-9 4 6 3-4 6 7z" />
    </svg>
  )
}

function groupByDate(climbs: Climb[]): { date: string; climbs: Climb[] }[] {
  const map = new Map<string, Climb[]>()
  for (const c of climbs) {
    const arr = map.get(c.date) ?? []
    arr.push(c)
    map.set(c.date, arr)
  }
  return Array.from(map.entries())
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([date, climbs]) => ({ date, climbs }))
}

function formatDateHeader(iso: string): string {
  const d = new Date(iso)
  const day = d.getDate()
  const month = MONTH_NAMES[d.getMonth()]
  return `${day} ${month}`
}
