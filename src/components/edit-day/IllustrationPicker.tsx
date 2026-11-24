import { useState } from 'react'
import { motion } from 'framer-motion'
import ExerciseIllustration from '../illustrations/ExerciseIllustration'
import { SURFACE, SURFACE_ELEVATED, RADIUS, SHADOW } from '../../styles/tokens'
import { TONES, type Tone } from '../../styles/tones'

const ILLUSTRATION_OPTIONS = [
  'max-hang', 'max-hang-open', 'dead-hang-balls', 'leg-raises',
  'weighted-pullup', 'lockoff', 'hammer-curl', 'scapular-pull',
  'hollow-body', 'repeaters', 'repeaters-balls', 'negative-pullup',
  'band-shoulder', 'forearm-stretch', 'pigeon-pose', 'frog-stretch',
  'shoulder-dislocates', 'thoracic-rotation', 'cat-cow', 'hamstring-stretch',
  'default',
]

export default function IllustrationPicker({
  value,
  onChange,
  tone = 'green',
}: {
  value: string
  onChange: (v: string) => void
  tone?: Tone
}) {
  const [open, setOpen] = useState(false)
  const current = ILLUSTRATION_OPTIONS.includes(value) ? value : 'default'
  const t = TONES[tone]
  return (
    <div>
      <motion.button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-2 border-[2px] border-[#3A1248] px-2 py-1.5 cursor-pointer"
        style={{
          backgroundColor: t.soft,
          borderRadius: RADIUS.btnSm,
          boxShadow: SHADOW.xs,
        }}
        whileTap={{ x: 1, y: 1, boxShadow: SHADOW.pressed }}
      >
        <ExerciseIllustration name={current} size={32} />
        <span className="text-xs flex-1 truncate text-left font-semibold" style={{ color: t.label }}>
          {current}
        </span>
      </motion.button>
      {open && (
        <div
          className="mt-2 grid grid-cols-4 gap-2 p-2 border-[2px] border-[#3A1248]"
          style={{ backgroundColor: SURFACE, borderRadius: RADIUS.btnSm, boxShadow: SHADOW.xs }}
        >
          {ILLUSTRATION_OPTIONS.map((name) => (
            <button
              key={name}
              type="button"
              onClick={() => {
                onChange(name)
                setOpen(false)
              }}
              className="flex items-center justify-center aspect-square border-[1.5px] border-[#3A1248] cursor-pointer"
              style={{
                backgroundColor: name === current ? t.ring : SURFACE_ELEVATED,
                borderRadius: RADIUS.btnSm,
              }}
            >
              <ExerciseIllustration name={name} size={32} />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
