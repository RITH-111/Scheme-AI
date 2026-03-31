'use client'

import { MessageBubble } from '@/components/chat/MessageBubble'
import { SchemeList } from '@/components/chat/SchemeList'
import { EligibilityCard } from '@/components/chat/EligibilityCard'
import { GuidanceStepper } from '@/components/chat/GuidanceStepper'
import { SchemeOverviewCard } from '@/components/chat/SchemeOverviewCard'
import type { Message, Scheme } from '@/components/chat/types'

interface MessageRendererProps {
  message: Message
  selectedSchemeId: string | null
  onSelectScheme: (scheme: Scheme, index: number) => void
  onCheckEligibility: (scheme: Scheme) => void
  onGetGuidance: (scheme: Scheme) => void
}

export function MessageRenderer({
  message,
  selectedSchemeId,
  onSelectScheme,
  onCheckEligibility,
  onGetGuidance,
}: MessageRendererProps) {
  if (message.type === 'text') {
    return <MessageBubble sender={message.sender}>{message.content}</MessageBubble>
  }

  if (message.type === 'schemes') {
    return (
      <div className="rounded-2xl border border-border bg-card p-3">
        <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">Recommended schemes</p>
        <SchemeList
          schemes={message.schemes}
          selectedSchemeId={selectedSchemeId}
          onSelect={onSelectScheme}
          onCheckEligibility={onCheckEligibility}
          onGetGuidance={onGetGuidance}
        />
      </div>
    )
  }

  if (message.type === 'selected') {
    return (
      <MessageBubble sender="bot">
        <span className="font-medium">Selected scheme:</span> {message.scheme.name}
      </MessageBubble>
    )
  }

  if (message.type === 'eligibility') {
    return (
      <div className="max-w-2xl">
        <EligibilityCard status={message.status} score={message.score} breakdown={message.breakdown} />
      </div>
    )
  }

  if (message.type === 'overview') {
    return (
      <div className="max-w-2xl">
        <SchemeOverviewCard scheme={message.scheme} />
      </div>
    )
  }

  return (
    <div className="max-w-2xl">
      <GuidanceStepper
        steps={message.steps}
        blockers={message.blockers}
        requiredDocuments={message.requiredDocuments}
        authority={message.authority}
        applicationUrl={message.applicationUrl}
        timeline={message.timeline}
      />
    </div>
  )
}
