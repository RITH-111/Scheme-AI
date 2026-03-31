'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import type { Scheme } from '@/components/chat/types'

interface SchemeCardProps {
  scheme: Scheme
  index: number
  isSelected: boolean
  onSelect: (scheme: Scheme, index: number) => void
  onCheckEligibility: (scheme: Scheme) => void
  onGetGuidance: (scheme: Scheme) => void
}

export function SchemeCard({
  scheme,
  index,
  isSelected,
  onSelect,
  onCheckEligibility,
  onGetGuidance,
}: SchemeCardProps) {
  return (
    <Card
      className={`rounded-2xl p-4 ${
        isSelected ? 'border-primary ring-1 ring-primary/30' : 'border-border'
      }`}
    >
      <div className="mb-2 flex items-start justify-between gap-3">
        <h4 className="text-sm font-semibold leading-5">{scheme.name}</h4>
        <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
          {scheme.matchPercentage}%
        </span>
      </div>
      <p className="mb-4 line-clamp-3 text-xs text-muted-foreground">{scheme.description}</p>
      <div className="flex flex-wrap gap-2">
        <Button size="sm" className="rounded-full" onClick={() => onSelect(scheme, index)}>
          Select
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="rounded-full"
          onClick={() => onCheckEligibility(scheme)}
        >
          Check Eligibility
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="rounded-full"
          onClick={() => onGetGuidance(scheme)}
        >
          Guidance
        </Button>
      </div>
    </Card>
  )
}
