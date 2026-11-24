import type { ReactNode } from 'react'
import { RADIUS, SHADOW } from '../../styles/tokens'
import { TONES, type Tone } from '../../styles/tones'

const inputBase =
  'w-full border-[2px] border-[#3A1248] px-3 py-2 text-sm text-text outline-none focus:outline-none'

function inputStyle(tone: Tone) {
  return {
    backgroundColor: TONES[tone].soft,
    borderRadius: RADIUS.btnSm,
    boxShadow: SHADOW.xs,
  }
}

export function FieldBlock({
  label,
  tone = 'primary',
  children,
}: {
  label: string
  tone?: Tone
  children: ReactNode
}) {
  return (
    <label className="block mb-3 last:mb-0">
      <span
        className="text-[11px] font-bold uppercase tracking-wider mb-1 block"
        style={{ color: TONES[tone].label }}
      >
        {label}
      </span>
      {children}
    </label>
  )
}

export function TextInput({
  value,
  onChange,
  placeholder,
  tone = 'primary',
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  tone?: Tone
}) {
  return (
    <input
      type="text"
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className={inputBase}
      style={inputStyle(tone)}
    />
  )
}

export function TextArea({
  value,
  onChange,
  tone = 'primary',
}: {
  value: string
  onChange: (v: string) => void
  tone?: Tone
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={3}
      className={`${inputBase} resize-none`}
      style={inputStyle(tone)}
    />
  )
}

/** Non-negative number, committed on every keystroke */
export function NumberInput({
  value,
  onChange,
  tone = 'accent',
}: {
  value: number
  onChange: (v: number) => void
  tone?: Tone
}) {
  return (
    <input
      type="number"
      inputMode="numeric"
      min={0}
      value={value}
      onChange={(e) => {
        const n = Number(e.target.value)
        onChange(Number.isFinite(n) ? Math.max(0, n) : 0)
      }}
      className={`${inputBase} font-timer font-bold`}
      style={{ ...inputStyle(tone), color: TONES[tone].label }}
    />
  )
}

/** Digits only, kept as text so the field can be empty while typing */
export function DigitsInput({
  value,
  onChange,
  onBlur,
  tone = 'accent',
}: {
  value: string
  onChange: (v: string) => void
  onBlur?: () => void
  tone?: Tone
}) {
  return (
    <input
      type="text"
      inputMode="numeric"
      pattern="[0-9]*"
      value={value}
      onChange={(e) => onChange(e.target.value.replace(/\D/g, ''))}
      onBlur={onBlur}
      className={`${inputBase} font-timer font-bold`}
      style={{ ...inputStyle(tone), color: TONES[tone].label }}
    />
  )
}

export function DateInput({
  value,
  onChange,
  tone = 'secondary',
}: {
  value: string
  onChange: (v: string) => void
  tone?: Tone
}) {
  return (
    <input
      type="date"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={inputBase}
      style={inputStyle(tone)}
    />
  )
}

export function SelectInput({
  value,
  onChange,
  options,
  tone = 'secondary',
}: {
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
  tone?: Tone
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={inputBase}
      style={inputStyle(tone)}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  )
}
