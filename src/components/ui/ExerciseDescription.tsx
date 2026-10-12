import type { MouseEvent } from 'react'
import { parseExerciseDescription } from '../../utils/exerciseDescription'

/**
 * Renders exercise copy; a trailing "Ref: domain/path" (as in program JSON) becomes a real https link.
 */
function refToHref(raw: string): string {
  const t = raw.trim()
  if (/^https?:\/\//i.test(t)) return t
  if (t.startsWith('//')) return `https:${t}`
  return `https://${t}`
}

interface ExerciseDescriptionProps {
  text: string
  className?: string
  /** Use when the description sits inside a clickable parent (e.g. exercise card) */
  linkStopPropagation?: boolean
}

export default function ExerciseDescription({
  text,
  className,
  linkStopPropagation
}: ExerciseDescriptionProps) {
  const { body, refUrl } = parseExerciseDescription(text)

  if (!refUrl) {
    return <span className={className}>{text}</span>
  }

  const href = refToHref(refUrl)
  const onLinkClick = linkStopPropagation
    ? (e: MouseEvent<HTMLAnchorElement>) => e.stopPropagation()
    : undefined

  const refRowClass = body
    ? 'mt-2 block border-t border-border/40 pt-2 text-[0.92em] leading-snug'
    : 'block text-[0.92em] leading-snug'

  return (
    <span className={className}>
      {body ? <span className="block">{body}</span> : null}
      <span className={refRowClass}>
        <span aria-hidden className="mr-1.5 select-none">
          🔗
        </span>
        Ref:{' '}
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          onClick={onLinkClick}
          className="text-primary font-medium underline underline-offset-2 decoration-primary/50 hover:decoration-primary break-all"
        >
          {refUrl}
        </a>
      </span>
    </span>
  )
}
