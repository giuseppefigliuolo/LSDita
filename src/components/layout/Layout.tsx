import { Outlet } from 'react-router-dom'
import BottomNav from '../ui/BottomNav'

export default function Layout() {
  return (
    <div className="flex flex-col min-h-dvh bg-bg relative overflow-x-hidden">

      {/* Psychedelic decorations only — rainbow stripes removed */}

      {/* ── Large psychedelic illustrations — fixed at screen edges ── */}
      <PsychedelicDecor />

      {/* ── Page content ── */}
      <main className="flex-1 pb-28 relative z-10">
        <Outlet />
      </main>

      <BottomNav />
    </div>
  )
}

/* ─── Full psychedelic illustrations ─── */
function PsychedelicDecor() {
  return (
    <div className="pointer-events-none select-none" aria-hidden="true">

      {/* ── Top-right: Large sunflower (12 outer + 8 inner petals + 3 rings) ── */}
      <svg viewBox="0 0 260 260" width={260} height={260}
        className="fixed -top-16 -right-16 z-0 opacity-35">
        <g transform="translate(130,130)">
          {/* Sun rays */}
          {Array.from({ length: 16 }, (_, i) => (
            <line key={`ray-${i}`}
              x1={0} y1={-75} x2={0} y2={-110}
              stroke="#E8B820" strokeWidth={3} strokeLinecap="round"
              transform={`rotate(${i * 22.5})`} opacity={0.7}
            />
          ))}
          {/* Outer petals — orange */}
          {Array.from({ length: 12 }, (_, i) => (
            <ellipse key={`op-${i}`}
              cx={0} cy={-62} rx={11} ry={28}
              fill="#D4541A" transform={`rotate(${i * 30})`}
            />
          ))}
          {/* Inner petals — gold, rotated 15° offset */}
          {Array.from({ length: 12 }, (_, i) => (
            <ellipse key={`ip-${i}`}
              cx={0} cy={-50} rx={8} ry={20}
              fill="#E8B820" transform={`rotate(${i * 30 + 15})`}
            />
          ))}
          {/* Center rings */}
          <circle r={32} fill="#7B3A9E" />
          <circle r={23} fill="#D4541A" />
          <circle r={14} fill="#E8B820" />
          <circle r={7}  fill="#3A1248" />
        </g>
      </svg>

      {/* ── Bottom-left: Large cosmic flower (teal + violet) ── */}
      <svg viewBox="0 0 240 240" width={240} height={240}
        className="fixed bottom-14 -left-16 z-0 opacity-30">
        <g transform="translate(120,120)">
          {/* Outer petals — violet */}
          {Array.from({ length: 8 }, (_, i) => (
            <ellipse key={`vp-${i}`}
              cx={0} cy={-58} rx={14} ry={35}
              fill="#7B3A9E" transform={`rotate(${i * 45})`}
            />
          ))}
          {/* Inner petals — teal, 22.5° offset */}
          {Array.from({ length: 8 }, (_, i) => (
            <ellipse key={`tp-${i}`}
              cx={0} cy={-46} rx={9} ry={24}
              fill="#17A8A8" transform={`rotate(${i * 45 + 22.5})`}
            />
          ))}
          <circle r={28} fill="#5A9A1E" />
          <circle r={18} fill="#17A8A8" />
          <circle r={9}  fill="#E8B820" />
          <circle r={4}  fill="#3A1248" />
        </g>
      </svg>

      {/* ── Top-left: Peace symbol ── */}
      <svg viewBox="0 0 130 130" width={130} height={130}
        className="fixed -top-4 -left-4 z-0 opacity-28">
        <g transform="translate(65,65)">
          <circle cx={0} cy={0} r={52} fill="#5A9A1E" opacity={0.6} />
          <circle cx={0} cy={0} r={52} fill="none" stroke="#3A1248" strokeWidth={6} />
          <line x1={0} y1={-52} x2={0} y2={52} stroke="#3A1248" strokeWidth={6} />
          <line x1={-45} y1={26} x2={0} y2={0} stroke="#3A1248" strokeWidth={6} />
          <line x1={45} y1={26} x2={0} y2={0} stroke="#3A1248" strokeWidth={6} />
          <circle cx={0} cy={0} r={42} fill="#5A9A1E" opacity={0.4} />
        </g>
      </svg>

      {/* ── Mid-right: Small star flower (coral + gold) ── */}
      <svg viewBox="0 0 160 160" width={160} height={160}
        className="fixed top-[42%] -right-10 z-0 opacity-25">
        <g transform="translate(80,80)">
          {Array.from({ length: 6 }, (_, i) => (
            <ellipse key={`sf-${i}`}
              cx={0} cy={-35} rx={8} ry={22}
              fill="#E84830" transform={`rotate(${i * 60})`}
            />
          ))}
          {Array.from({ length: 6 }, (_, i) => (
            <ellipse key={`sg-${i}`}
              cx={0} cy={-28} rx={5} ry={15}
              fill="#E8B820" transform={`rotate(${i * 60 + 30})`}
            />
          ))}
          <circle r={16} fill="#D4541A" />
          <circle r={8}  fill="#E8B820" />
        </g>
      </svg>

      {/* ── Bottom-right: Peace symbol (small) ── */}
      <svg viewBox="0 0 100 100" width={100} height={100}
        className="fixed bottom-24 -right-3 z-0 opacity-22">
        <g transform="translate(50,50)">
          <circle cx={0} cy={0} r={40} fill="#E8B820" opacity={0.5} />
          <circle cx={0} cy={0} r={40} fill="none" stroke="#3A1248" strokeWidth={5} />
          <line x1={0} y1={-40} x2={0} y2={40} stroke="#3A1248" strokeWidth={5} />
          <line x1={-34.6} y1={20} x2={0} y2={0} stroke="#3A1248" strokeWidth={5} />
          <line x1={34.6} y1={20} x2={0} y2={0} stroke="#3A1248" strokeWidth={5} />
        </g>
      </svg>

      {/* ── Mid-left: Daisy accent ── */}
      <svg viewBox="0 0 120 120" width={120} height={120}
        className="fixed top-[18%] -left-8 z-0 opacity-22">
        <g transform="translate(60,60)">
          {Array.from({ length: 8 }, (_, i) => (
            <ellipse key={`da-${i}`}
              cx={0} cy={-28} rx={7} ry={18}
              fill="#E8B820" transform={`rotate(${i * 45})`}
            />
          ))}
          <circle r={14} fill="#D4541A" />
          <circle r={7}  fill="#E8B820" />
        </g>
      </svg>

    </div>
  )
}
