interface SetProgressDotsProps {
  total: number
  current: number
  activeState: 'active' | 'resting' | 'complete'
  /** What the circles count, for the screen-reader sentence ("Serie 1 di 3") */
  unit?: 'Serie' | 'Rep'
}

/** Numbered circles: current in mustard, done in plum, upcoming on paper. */
export default function SetProgressDots({
  total,
  current,
  activeState,
  unit = 'Serie',
}: SetProgressDotsProps) {
  return (
    <div>
      <p className="sr-only">
        {unit} {current} di {total}
      </p>
      <ol aria-hidden="true" className="flex flex-wrap items-center justify-center gap-2.5">
        {Array.from({ length: total }, (_, i) => {
          const isCurrent = i === current - 1 && activeState === 'active'
          const isDone =
            i < current - 1 || (i === current - 1 && activeState !== 'active')

          return (
            <li
              key={i}
              className={`flex size-9 items-center justify-center rounded-full border-2 border-plum font-poster text-base leading-none ${
                isDone
                  ? 'bg-plum text-cream'
                  : isCurrent
                    ? 'bg-mustard text-plum shadow-[2px_2px_0_#3b1746]'
                    : 'bg-paper text-plum'
              }`}
            >
              {i + 1}
            </li>
          )
        })}
      </ol>
    </div>
  )
}
