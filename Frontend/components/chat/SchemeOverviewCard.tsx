'use client'

import { Card } from '@/components/ui/card'

interface SchemeOverviewCardProps {
  scheme: {
    name: string
    objective: string
    benefits: string[]
    eligibilitySummary: string[]
    targetGroup: string
    applicationMode: string
    officialUrl?: string
  }
}

export function SchemeOverviewCard({ scheme }: SchemeOverviewCardProps) {
  return (
    <Card className="rounded-2xl border border-border p-4">
      <h4 className="text-sm font-semibold">Scheme Overview: {scheme.name}</h4>
      <p className="mt-2 text-xs text-muted-foreground">{scheme.objective}</p>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Target Group</p>
          <p className="text-xs">{scheme.targetGroup}</p>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Application Mode</p>
          <p className="text-xs">{scheme.applicationMode}</p>
        </div>
      </div>

      <div className="mt-3">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Top Benefits</p>
        <ul className="mt-1 list-disc space-y-1 pl-4 text-xs text-foreground/90">
          {scheme.benefits.slice(0, 3).map(item => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>

      <div className="mt-3">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Eligibility Snapshot</p>
        <ul className="mt-1 list-disc space-y-1 pl-4 text-xs text-foreground/90">
          {scheme.eligibilitySummary.slice(0, 3).map(item => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>

      {scheme.officialUrl ? (
        <a
          href={scheme.officialUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-block text-xs font-medium text-primary underline-offset-4 hover:underline"
        >
          Open official portal
        </a>
      ) : null}
    </Card>
  )
}
