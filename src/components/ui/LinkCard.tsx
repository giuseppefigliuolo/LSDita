import Card from './Card'

export default function LinkCard({
  eyebrow,
  title,
  subtitle,
  onClick,
  variant = 'default'
}: {
  eyebrow?: string
  title: string
  subtitle?: string
  onClick: () => void
  variant?: 'default' | 'primary' | 'secondary' | 'violet'
}) {
  return (
    <Card onClick={onClick} variant={variant} className="!p-3.5">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          {eyebrow && (
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-muted">
              {eyebrow}
            </p>
          )}
          <p className="text-sm font-bold text-text">{title}</p>
          {subtitle && (
            <p className="text-xs text-text-secondary mt-0.5">{subtitle}</p>
          )}
        </div>
        <svg
          className="shrink-0"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#8C7355"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </div>
    </Card>
  )
}
