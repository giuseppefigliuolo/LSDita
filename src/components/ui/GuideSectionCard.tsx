import type { GuideSection } from '../../types'
import { INK, RADIUS, SHADOW } from '../../styles/tokens'

const STEP_COLORS = ['#17A8A8', '#D4541A', '#E8B820', '#7B3A9E', '#5A9A1E', '#E84830']

export default function GuideSectionCard({
  section,
  step
}: {
  section: GuideSection
  /** 0-based step number; renders a numbered tile when set */
  step?: number
}) {
  return (
    <div
      className="px-4 py-3.5 border-[2.5px] border-[#3A1248]"
      style={{
        borderRadius: RADIUS.card,
        backgroundColor: '#FFF8E8',
        boxShadow: SHADOW.sm
      }}
    >
      <div className="flex items-center gap-3">
        {step != null && (
          <div
            className="flex items-center justify-center w-8 h-8 shrink-0 border-[2px] border-[#3A1248]"
            style={{
              backgroundColor: STEP_COLORS[step % STEP_COLORS.length],
              borderRadius: RADIUS.btnSm,
              boxShadow: SHADOW.xxs
            }}
          >
            <span
              className="text-sm font-bold font-timer text-[#FFFBF0]"
              style={{ textShadow: '0 1px 2px rgba(58,18,72,0.6)' }}
            >
              {step + 1}
            </span>
          </div>
        )}
        <h3 className="flex-1 min-w-0 text-sm font-bold text-text leading-snug">
          {section.title}
        </h3>
        {section.duration && (
          <span
            className="shrink-0 text-[11px] font-bold font-timer px-2.5 py-0.5 border-[1.5px]"
            style={{
              borderColor: INK,
              borderRadius: RADIUS.pill,
              color: INK
            }}
          >
            {section.duration}
          </span>
        )}
      </div>

      {section.body && (
        <p className="text-sm text-text leading-relaxed mt-2">{section.body}</p>
      )}

      {section.items && section.items.length > 0 && (
        <ul className="mt-2 space-y-1.5">
          {section.items.map((item) => (
            <li key={item} className="flex gap-2.5 text-sm text-text leading-relaxed">
              <span
                className="mt-[0.55em] w-1.5 h-1.5 shrink-0 rounded-full"
                style={{ backgroundColor: '#D4541A' }}
                aria-hidden
              />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
