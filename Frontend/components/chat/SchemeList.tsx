'use client'

import { Skeleton } from '@/components/ui/skeleton'
import { SchemeCard } from '@/components/chat/SchemeCard'
import type { Scheme } from '@/components/chat/types'

interface SchemeListProps {
  schemes: Scheme[]
  selectedSchemeId: string | null
  onSelect: (scheme: Scheme, index: number) => void
  onCheckEligibility: (scheme: Scheme) => void
  onGetGuidance: (scheme: Scheme) => void
  loading?: boolean
}

export function SchemeList({
  schemes,
  selectedSchemeId,
  onSelect,
  onCheckEligibility,
  onGetGuidance,
  loading = false,
}: SchemeListProps) {
  if (loading) {
    return (
      <div className="grid gap-3 sm:grid-cols-2">
        {[0, 1, 2].map(item => (
          <div key={item} className="rounded-2xl border border-border p-4">
            <Skeleton className="mb-3 h-4 w-2/3" />
            <Skeleton className="mb-2 h-3 w-full" />
            <Skeleton className="mb-4 h-3 w-4/5" />
            <div className="flex gap-2">
              <Skeleton className="h-8 w-20 rounded-full" />
              <Skeleton className="h-8 w-28 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {schemes.map((scheme, index) => (
        <SchemeCard
          key={scheme.id}
          scheme={scheme}
          index={index}
          isSelected={selectedSchemeId === scheme.id}
          onSelect={onSelect}
          onCheckEligibility={onCheckEligibility}
          onGetGuidance={onGetGuidance}
        />
      ))}
    </div>
  )
}
