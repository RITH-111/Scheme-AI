'use client'

interface MessageBubbleProps {
  sender: 'user' | 'bot'
  children: React.ReactNode
}

export function MessageBubble({ sender, children }: MessageBubbleProps) {
  return (
    <div className={`flex ${sender === 'user' ? 'justify-end' : 'justify-start'}`}>
      <div
        className={[
          'max-w-[85%] rounded-2xl px-4 py-3 text-sm sm:max-w-[75%]',
          sender === 'user'
            ? 'bg-primary text-primary-foreground rounded-br-md'
            : 'bg-card border border-border text-foreground rounded-bl-md',
        ].join(' ')}
      >
        {children}
      </div>
    </div>
  )
}
