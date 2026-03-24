'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Send, Square, Play } from 'lucide-react'

interface InputAreaProps {
  onSendMessage: (message: string) => void
  isLoading: boolean
  onStop?: () => void
  onResume?: () => void
}

export function InputArea({ onSendMessage, isLoading, onStop, onResume }: InputAreaProps) {
  const [message, setMessage] = useState('')
  const [isStopped, setIsStopped] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + 'px'
    }
  }, [message])

  const handleSendMessage = () => {
    if (message.trim()) {
      onSendMessage(message.trim())
      setMessage('')
      setIsStopped(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleStop = () => {
    setIsStopped(true)
    onStop?.()
  }

  const handleResume = () => {
    setIsStopped(false)
    onResume?.()
  }

  return (
    <div className="border-t border-border bg-background p-4 sm:p-6">
      <div className="max-w-4xl mx-auto space-y-4">
        {/* Input Box */}
        <div className="flex gap-3 items-end">
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about schemes, check eligibility, or get guidance..."
              className="w-full bg-input border border-border rounded-xl px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-accent/50 text-foreground placeholder:text-muted-foreground"
              rows={1}
              disabled={isLoading}
            />
          </div>

          {/* Send Button */}
          <Button
            onClick={handleSendMessage}
            disabled={isLoading || !message.trim()}
            className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2 h-auto py-3"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Send</span>
          </Button>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 sm:gap-3 justify-center sm:justify-start flex-wrap">
          {isLoading && (
            <Button
              onClick={handleStop}
              variant="outline"
              size="sm"
              className="gap-2 border-border hover:bg-destructive/10"
            >
              <Square className="w-4 h-4" />
              Stop
            </Button>
          )}

          {isStopped && (
            <Button
              onClick={handleResume}
              variant="outline"
              size="sm"
              className="gap-2 border-border hover:bg-accent/10"
            >
              <Play className="w-4 h-4" />
              Resume
            </Button>
          )}

          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground"
            onClick={() => {
              setMessage('')
            }}
          >
            Clear
          </Button>
        </div>
      </div>
    </div>
  )
}
