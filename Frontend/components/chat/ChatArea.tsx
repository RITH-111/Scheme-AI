'use client'

import { Message } from '@/app/context/ChatContext'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Markdown } from '@/components/chat/Markdown'
import { Badge } from '@/components/ui/badge'
import { getCategoryColor } from '@/app/lib/utils'
import { Bot, User } from 'lucide-react'

interface ChatAreaProps {
  messages: Message[]
  isLoading?: boolean
}

export function ChatArea({ messages, isLoading = false }: ChatAreaProps) {
  const renderSchemeDetails = (payload?: Record<string, unknown>) => {
    const schemes = (payload?.schemes as Array<Record<string, any>>) || []
    if (!schemes.length) return null

    return (
      <div className="space-y-4">
        {schemes.map(scheme => {
          const colors = getCategoryColor(String(scheme.category || 'education'))
          const benefits = Array.isArray(scheme.benefits) ? scheme.benefits.slice(0, 3) : []
          const eligibility = Array.isArray(scheme.eligibility) ? scheme.eligibility.slice(0, 3) : []
          const why = Array.isArray(scheme.why_recommended) ? scheme.why_recommended.slice(0, 2) : []
          const fullBenefits = Array.isArray(scheme.benefits) ? scheme.benefits : []
          const fullEligibility = Array.isArray(scheme.eligibility) ? scheme.eligibility : []
          const fullWhy = Array.isArray(scheme.why_recommended) ? scheme.why_recommended : []
          const breakdown = scheme.eligibility_breakdown as Record<string, any> | undefined

          return (
            <div key={scheme.id || scheme.name} className="border border-border rounded-2xl p-5 bg-background/80">
              <div className="flex items-center justify-between gap-3 mb-2">
                <h4 className="font-semibold text-foreground text-lg">{scheme.name}</h4>
                <Badge className={`${colors.bg} ${colors.text} border-0`}>
                  {String(scheme.category || 'welfare')}
                </Badge>
              </div>

              {scheme.description && (
                <p className="text-sm text-muted-foreground mb-3">{scheme.description}</p>
              )}

              {benefits.length > 0 && (
                <div className="mb-3">
                  <p className="text-[10px] font-semibold text-foreground/60 uppercase tracking-[0.2em] mb-2">Benefits</p>
                  <div className="space-y-1 text-sm text-foreground/80">
                    {benefits.map((benefit: string, index: number) => (
                      <div key={`${scheme.id}-benefit-${index}`}>{benefit}</div>
                    ))}
                  </div>
                </div>
              )}

              {eligibility.length > 0 && (
                <div className="mb-3">
                  <p className="text-[10px] font-semibold text-foreground/60 uppercase tracking-[0.2em] mb-2">Eligibility</p>
                  <div className="space-y-1 text-sm text-foreground/80">
                    {eligibility.map((item: string, index: number) => (
                      <div key={`${scheme.id}-elig-${index}`}>{item}</div>
                    ))}
                  </div>
                </div>
              )}

              {breakdown && (
                <div className="mb-3">
                  <p className="text-[10px] font-semibold text-foreground/60 uppercase tracking-[0.2em] mb-2">Eligibility Breakdown</p>
                  <div className="text-sm text-foreground/80 space-y-1">
                    {breakdown.status && <div>Status: {String(breakdown.status)}</div>}
                    {typeof breakdown.score !== 'undefined' && <div>Score: {String(breakdown.score)}</div>}
                    {Array.isArray(breakdown.checked_criteria) && breakdown.checked_criteria.length > 0 && (
                      <div>
                        {breakdown.checked_criteria.slice(0, 3).map((criteria: string, index: number) => (
                          <div key={`${scheme.id}-criteria-${index}`}>{criteria}</div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {why.length > 0 && (
                <div>
                  <p className="text-[10px] font-semibold text-foreground/60 uppercase tracking-[0.2em] mb-2">Why Recommended</p>
                  <div className="space-y-1 text-sm text-foreground/80">
                    {why.map((reason: string, index: number) => (
                      <div key={`${scheme.id}-why-${index}`}>{reason}</div>
                    ))}
                  </div>
                </div>
              )}

              <details className="mt-4">
                <summary className="cursor-pointer text-sm font-semibold text-accent hover:underline">
                  View Full Scheme Details
                </summary>
                <div className="mt-3 space-y-3 text-sm text-foreground/80">
                  {fullBenefits.length > 0 && (
                    <div>
                      <p className="text-[10px] font-semibold text-foreground/60 uppercase tracking-[0.2em] mb-2">All Benefits</p>
                      <div className="space-y-1">
                        {fullBenefits.map((benefit: string, index: number) => (
                          <div key={`${scheme.id}-benefit-full-${index}`}>{benefit}</div>
                        ))}
                      </div>
                    </div>
                  )}

                  {fullEligibility.length > 0 && (
                    <div>
                      <p className="text-[10px] font-semibold text-foreground/60 uppercase tracking-[0.2em] mb-2">All Eligibility</p>
                      <div className="space-y-1">
                        {fullEligibility.map((item: string, index: number) => (
                          <div key={`${scheme.id}-elig-full-${index}`}>{item}</div>
                        ))}
                      </div>
                    </div>
                  )}

                  {fullWhy.length > 0 && (
                    <div>
                      <p className="text-[10px] font-semibold text-foreground/60 uppercase tracking-[0.2em] mb-2">All Reasons</p>
                      <div className="space-y-1">
                        {fullWhy.map((reason: string, index: number) => (
                          <div key={`${scheme.id}-why-full-${index}`}>{reason}</div>
                        ))}
                      </div>
                    </div>
                  )}

                  {typeof scheme.matchPercentage !== 'undefined' && (
                    <div>Match: {String(scheme.matchPercentage)}%</div>
                  )}
                  {typeof scheme.confidence !== 'undefined' && (
                    <div>Confidence: {String(scheme.confidence)}</div>
                  )}
                </div>
              </details>
            </div>
          )
        })}
      </div>
    )
  }

  const renderGuidance = (payload?: Record<string, unknown>) => {
    const steps = (payload?.steps as Array<Record<string, any>>) || []
    if (!steps.length) return null

    return (
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">Step-by-step guidance</p>
        <div className="space-y-2">
          {steps.map((step, index) => (
            <div key={step.id || index} className="border border-border rounded-2xl p-4 bg-background/80">
              <p className="font-semibold text-foreground">
                Step {index + 1}: {step.title}
              </p>
              <p className="text-sm text-foreground/80 mt-1">{step.description}</p>
              <p className="text-sm text-foreground/80 mt-2">{step.action}</p>
              {Array.isArray(step.resources) && step.resources.length > 0 && (
                <div className="text-xs text-muted-foreground mt-2 space-y-1">
                  {step.resources.map((resource: string, resourceIndex: number) => (
                    <div key={`${step.id}-res-${resourceIndex}`}>{resource}</div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <ScrollArea className="flex-1 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto space-y-6 pb-6">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-[28rem] text-center">
            <div className="rounded-[28px] border border-border bg-card/80 px-8 py-10 max-w-md">
              <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-4">
                <Bot className="w-8 h-8 text-accent" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Start a conversation</h3>
              <p className="text-muted-foreground">
                Ask about government schemes, check eligibility, or get step-by-step guidance tailored to you.
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
                      : 'bg-card/80 text-foreground rounded-bl-none border border-border'
                  }`}
                >
                  <div className="space-y-2">
                    {message.type === 'scheme-details' ? (
                      renderSchemeDetails(message.payload)
                    ) : message.type === 'guidance' ? (
                      renderGuidance(message.payload)
                    ) : (
                      <Markdown content={message.content} />
                    )}
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
