import { motion } from 'framer-motion'
import Card from '../ui/Card'

export default function ToggleRow({
  label,
  description,
  enabled,
  onToggle
}: {
  label: string
  description: string
  enabled: boolean
  onToggle: () => void
}) {
  return (
    <Card>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-text">{label}</p>
          <p className="text-xs text-text-secondary">{description}</p>
        </div>
        <button
          onClick={onToggle}
          role="switch"
          aria-checked={enabled}
          aria-label={label}
          className={`relative w-11 h-6 rounded-full transition-colors ${
            enabled ? 'bg-primary' : 'bg-border'
          }`}
        >
          <motion.div
            className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow"
            animate={{ left: enabled ? '22px' : '2px' }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          />
        </button>
      </div>
    </Card>
  )
}
