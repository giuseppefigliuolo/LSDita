interface SetProgressDotsProps {
  total: number
  current: number
  /** complete: the current set is done too (rest between sets) */
  activeState: 'active' | 'complete'
}

/** Numbered circles: current in mustard, done in plum, upcoming on paper. */
export default function SetProgressDots({ total, current, activeState }: SetProgressDotsProps) {
  // Up to 10 sets stay on one line on a 375px phone
  const compact = total > 7

  return (
    <div>
      <p className="sr-only">
        Serie {current} di {total}
      </p>
      <ol
        aria-hidden="true"
        className={`flex flex-wrap items-center justify-center ${compact ? 'gap-1.5' : 'gap-2.5'}`}
      >
        {Array.from({ length: total }, (_, i) => {
          const isCurrent = i === current - 1 && activeState === 'active'
          const isDone = i < current - 1 || (i === current - 1 && activeState === 'complete')

          return (
            <li
              key={i}
              className={`flex items-center justify-center rounded-full border-2 border-plum font-poster leading-none ${
                compact ? 'size-7 text-sm' : 'size-9 text-base'
              } ${
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
