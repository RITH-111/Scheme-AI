'use client'

import { useEffect, useRef } from 'react'
import { MessageBubble } from '@/components/chat/MessageBubble'
import { MessageRenderer } from '@/components/chat/MessageRenderer'
import { SchemeList } from '@/components/chat/SchemeList'
import type { Message, Scheme } from '@/components/chat/types'

interface ChatContainerProps {
  messages: Message[]
  loading: boolean
  showSchemeSkeleton: boolean
  selectedSchemeId: string | null
  onSelectScheme: (scheme: Scheme, index: number) => void
  onCheckEligibility: (scheme: Scheme) => void
  onGetGuidance: (scheme: Scheme) => void
}

export function ChatContainer({
  messages,
  loading,
  showSchemeSkeleton,
  selectedSchemeId,
  onSelectScheme,
  onCheckEligibility,
  onGetGuidance,
}: ChatContainerProps) {
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [loading, messages])

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-4 px-3 py-4 sm:px-4">
        {messages.map(message => (
          <MessageRenderer
            key={message.id}
            message={message}
            selectedSchemeId={selectedSchemeId}
            onSelectScheme={onSelectScheme}
            onCheckEligibility={onCheckEligibility}
            onGetGuidance={onGetGuidance}
          />
        ))}

        {loading ? (
          <MessageBubble sender="bot">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 animate-bounce rounded-full bg-foreground/50" />
              <span className="h-2 w-2 animate-bounce rounded-full bg-foreground/50 [animation-delay:120ms]" />
              <span className="h-2 w-2 animate-bounce rounded-full bg-foreground/50 [animation-delay:240ms]" />
            </div>
          </MessageBubble>
        ) : null}

        {loading && showSchemeSkeleton ? (
          <div className="rounded-2xl border border-border bg-card p-3">
            <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">Finding schemes</p>
            <SchemeList
              schemes={[]}
              selectedSchemeId={selectedSchemeId}
              onSelect={onSelectScheme}
              onCheckEligibility={onCheckEligibility}
              onGetGuidance={onGetGuidance}
              loading
            />
          </div>
        ) : null}

        <div ref={endRef} />
      </div>
    </div>
  )
}
