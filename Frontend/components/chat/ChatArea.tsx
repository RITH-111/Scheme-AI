'use client'

import { Message } from '@/app/context/ChatContext'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Markdown } from '@/components/chat/Markdown'
import { Bot, User } from 'lucide-react'

interface ChatAreaProps {
  messages: Message[]
  isLoading?: boolean
}

export function ChatArea({ messages, isLoading = false }: ChatAreaProps) {
  return (
    <ScrollArea className="flex-1 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto space-y-4 pb-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-96 text-center">
            <div>
              <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                <Bot className="w-8 h-8 text-accent" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Start a conversation</h3>
              <p className="text-muted-foreground max-w-sm">
                Ask about government schemes, check your eligibility, or get step-by-step guidance
              </p>
            </div>
          </div>
        ) : (
          <>
            {messages.map(message => (
              <div
                key={message.id}
                className={`flex gap-3 sm:gap-4 animate-in fade-in ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {message.role === 'assistant' && (
                  <div className="w-8 h-8 flex-shrink-0 rounded-full bg-primary/10 flex items-center justify-center">
                    <Bot className="w-5 h-5 text-primary" />
                  </div>
                )}

                <div
                  className={`max-w-md sm:max-w-2xl rounded-2xl px-4 py-3 ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground rounded-br-none'
                      : 'bg-secondary/20 text-foreground rounded-bl-none border border-border'
                  }`}
                >
                  <div className="space-y-2">
                    <Markdown content={message.content} />
                    <div className={`text-xs ${message.role === 'user' ? 'opacity-70' : 'text-muted-foreground'}`}>
                      {new Date(message.timestamp).toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>
                </div>

                {message.role === 'user' && (
                  <div className="w-8 h-8 flex-shrink-0 rounded-full bg-accent/20 flex items-center justify-center">
                    <User className="w-5 h-5 text-accent" />
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3 sm:gap-4 animate-in fade-in">
                <div className="w-8 h-8 flex-shrink-0 rounded-full bg-primary/10 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-primary" />
                </div>
                <div className="max-w-md sm:max-w-2xl rounded-2xl px-4 py-3 bg-secondary/20 text-foreground rounded-bl-none border border-border">
                  <div className="flex gap-2">
                    <div className="w-2 h-2 rounded-full bg-foreground/50 animate-bounce" />
                    <div className="w-2 h-2 rounded-full bg-foreground/50 animate-bounce" style={{ animationDelay: '0.2s' }} />
                    <div className="w-2 h-2 rounded-full bg-foreground/50 animate-bounce" style={{ animationDelay: '0.4s' }} />
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </ScrollArea>
  )
}
