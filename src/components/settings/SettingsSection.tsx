import type { ReactNode } from 'react'

export default function SettingsSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="text-xs font-semibold uppercase tracking-widest text-text-muted mb-3">
        {title}
      </h2>
      {children}
    </section>
  )
}
