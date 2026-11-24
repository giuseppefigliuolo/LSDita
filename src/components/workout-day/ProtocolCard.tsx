import type { Exercise } from '../../types'
import { INK, RADIUS, SHADOW } from '../../styles/tokens'

const HANG_COLOR = '#E8B820'
const REST_COLOR = '#3FB6A8'

/** Sets × reps, hang and rest times, plus a to-scale timeline of one set */
export default function ProtocolCard({ exercise }: { exercise: Exercise }) {
  const isReps = exercise.type === 'reps'
  const showTimeline = !isReps
  return (
    <div
      className="mb-3 border-[2.5px] border-[#3A1248] overflow-hidden"
      style={{
        borderRadius: RADIUS.card,
        backgroundColor: '#FFF8E8',
        boxShadow: SHADOW.sm
      }}
    >
      <div className="px-4 pt-3 pb-1">
        <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-text-muted">
          Protocollo
        </p>
      </div>
      <div className="flex items-stretch px-2 pb-2">
        <ProtocolStat
          value={`${exercise.sets}×${exercise.repsPerSet}`}
          label={isReps ? 'Set × Rep' : 'Serie × Rep'}
          color="#D4541A"
        />
        {!isReps && (
          <>
            <DashedDivider />
            <ProtocolStat
              value={`${exercise.hangTime}s`}
              label="Tenuta"
              color={HANG_COLOR}
            />
          </>
        )}
        {!isReps && exercise.restBetweenReps > 0 && (
          <>
            <DashedDivider />
            <ProtocolStat
              value={`${exercise.restBetweenReps}s`}
              label="Pausa rep"
              color={REST_COLOR}
            />
          </>
        )}
      </div>
      {showTimeline && (
        <div className="px-4 pb-3 pt-1">
          <RepTimeline
            reps={exercise.repsPerSet}
            hangTime={exercise.hangTime}
            restBetweenReps={exercise.restBetweenReps}
          />
          <div className="flex items-center justify-between mt-2 text-[11px] text-text-muted font-timer">
            <span>
              1 serie = {exercise.repsPerSet} ripetizioni ×{' '}
              {exercise.hangTime}s hang
              {exercise.restBetweenReps > 0
                ? ` / ${exercise.restBetweenReps}s pausa`
                : ''}
            </span>
            <span className="flex items-center gap-1">
              <span
                className="inline-block w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: HANG_COLOR }}
              />
              hang
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

function ProtocolStat({
  value,
  label,
  color
}: {
  value: string
  label: string
  color: string
}) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center py-2 px-2">
      <span
        className="font-bold font-timer leading-none"
        style={{ color, fontSize: 26 }}
      >
        {value}
      </span>
      <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted mt-1.5">
        {label}
      </span>
    </div>
  )
}

function DashedDivider() {
  return (
    <div
      className="self-stretch my-2"
      style={{
        width: 0,
        borderLeft: `1.5px dashed ${INK}`,
        opacity: 0.4
      }}
    />
  )
}

function RepTimeline({
  reps,
  hangTime,
  restBetweenReps
}: {
  reps: number
  hangTime: number
  restBetweenReps: number
}) {
  const hasRest = restBetweenReps > 0
  const segments: { weight: number; color: string }[] = []
  for (let i = 0; i < reps; i++) {
    segments.push({ weight: hangTime, color: HANG_COLOR })
    if (hasRest && i < reps - 1) {
      segments.push({ weight: restBetweenReps, color: REST_COLOR })
    }
  }
  const total = segments.reduce((sum, s) => sum + s.weight, 0)

  return (
    <div
      className="flex w-full overflow-hidden border-[2px] border-[#3A1248]"
      style={{
        height: 22,
        borderRadius: RADIUS.pill,
        boxShadow: SHADOW.xxs
      }}
    >
      {segments.map((s, i) => (
        <div
          key={i}
          style={{
            width: `${(s.weight / total) * 100}%`,
            backgroundColor: s.color,
            borderRight:
              i < segments.length - 1 ? `1.5px solid ${INK}` : 'none'
          }}
        />
      ))}
    </div>
  )
}
