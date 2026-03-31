'use client'

import { Card } from '@/components/ui/card'

interface EligibilityCardProps {
  status: string
  score: number
  breakdown: string[]
}

export function EligibilityCard({ status, score, breakdown }: EligibilityCardProps) {
  return (
    <Card className="rounded-2xl border border-border p-4">
      <div className="mb-2 flex items-center justify-between gap-2">
        <h4 className="text-sm font-semibold">Eligibility Result</h4>
        <span className="rounded-full bg-secondary px-2 py-1 text-xs">
          {status} ({score}%)
        </span>
      </div>
      <div className="space-y-1 text-xs text-muted-foreground">
        {breakdown.length === 0 ? <p>No breakdown returned.</p> : null}
        {breakdown.map((item, idx) => (
          <p key={`${item}-${idx}`}>{item}</p>
        ))}
      </div>
    </Card>
  )
}
