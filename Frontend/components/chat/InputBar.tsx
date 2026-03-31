'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

interface InputBarProps {
  onSend: (text: string) => void
  loading: boolean
  quickActions?: string[]
}

export function InputBar({ onSend, loading, quickActions = [] }: InputBarProps) {
  const [value, setValue] = useState('')

  const submit = () => {
    const trimmed = value.trim()
    if (!trimmed || loading) {
      return
    }
    onSend(trimmed)
    setValue('')
  }

  return (
    <div className="sticky bottom-0 border-t border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-3 px-3 py-3 sm:px-4">
        {quickActions.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {quickActions.map(action => (
              <Button
                key={action}
                variant="outline"
                size="sm"
                className="rounded-full"
                onClick={() => onSend(action)}
                disabled={loading}
              >
                {action}
              </Button>
            ))}
          </div>
        ) : null}
        <div className="flex items-end gap-2">
          <textarea
            value={value}
            onChange={e => setValue(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                submit()
              }
            }}
            placeholder="Ask about schemes, eligibility, or guidance..."
            className="min-h-10 flex-1 resize-none rounded-2xl border border-border bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
            rows={1}
            disabled={loading}
          />
          <Button className="rounded-full" onClick={submit} disabled={loading || !value.trim()}>
            Send
          </Button>
        </div>
      </div>
    </div>
  )
}
