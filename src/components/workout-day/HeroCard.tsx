import PosterPill from '../ui/PosterPill'
import Sunburst from '../ui/Sunburst'
import ExerciseDescription from '../ui/ExerciseDescription'
import type { DayIntensity } from '../../types'

const intensityLabels: Record<DayIntensity, string> = {
  alta: 'Dita: alta',
  media: 'Dita: media',
  bassa: 'Dita: bassa'
}

const SUN_STYLE = {
  background: 'radial-gradient(circle at 36% 34%, #f9e6a8 0 20%, #f5d77a 21%)',
  boxShadow:
    '3px 3px 0 #3b1746, 0 0 0 12px rgba(253,245,228,0.3), 0 0 0 24px rgba(253,245,228,0.14)'
}

/** Poster-style session header: type, title, chips and description */
export default function HeroCard({
  typeLabel,
  title,
  description,
  exerciseCount,
  durationLabel,
  intensity
}: {
  typeLabel: string
  title: string
  description: string
  /** null hides the chip (sessions that are mostly read, not timed) */
  exerciseCount: number | null
  durationLabel: string
  intensity?: DayIntensity
}) {
  return (
    <div className="overflow-hidden rounded-3xl border-2 border-plum bg-paper shadow-[4px_4px_0_#3b1746]">
      <div className="relative isolate flex flex-col gap-3 overflow-hidden border-b-2 border-plum bg-pastel-lavender px-5 pt-[22px] pb-5">
        <Sunburst
          ray="#C7A6CF"
          base="#D9C2E0"
          size={420}
          center={{ right: 60, top: 60 }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute right-[28px] top-[28px] size-[64px] rounded-full border-2 border-plum"
          style={SUN_STYLE}
        />
        <p className="relative font-mono text-[11px] font-bold uppercase tracking-[0.14em]">
          {typeLabel}
        </p>
        <h2 className="relative max-w-[230px] font-poster text-[34px] leading-[1.05]">
          {title}
        </h2>
        <div className="relative flex flex-wrap gap-2">
          {exerciseCount != null && <PosterPill>{exerciseCount} esercizi</PosterPill>}
          <PosterPill>{durationLabel}</PosterPill>
          {intensity && <PosterPill>{intensityLabels[intensity]}</PosterPill>}
        </div>
      </div>
      <p className="px-5 pt-4 pb-5 text-[15px] leading-[1.55] text-plum-soft [text-wrap:pretty]">
        <ExerciseDescription text={description} />
      </p>
    </div>
  )
}
