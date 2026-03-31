'use client'

import { Scheme } from '@/app/lib/mockApi'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { CheckCircle2, ArrowRight } from 'lucide-react'

interface RecommendedSchemesProps {
  schemes: Scheme[]
  onSelectScheme?: (scheme: Scheme, index: number) => void
  onShowGuidance?: (scheme: Scheme) => void
  onCheckEligibility?: (scheme: Scheme) => void
}

const categoryColors: Record<string, { bg: string; text: string }> = {
  education: { bg: 'bg-sky-500/10', text: 'text-sky-700 dark:text-sky-300' },
  health: { bg: 'bg-emerald-500/10', text: 'text-emerald-700 dark:text-emerald-300' },
  employment: { bg: 'bg-amber-500/10', text: 'text-amber-700 dark:text-amber-300' },
  welfare: { bg: 'bg-rose-500/10', text: 'text-rose-700 dark:text-rose-300' },
  agricultural: { bg: 'bg-lime-500/10', text: 'text-lime-700 dark:text-lime-300' },
  infrastructure: { bg: 'bg-teal-500/10', text: 'text-teal-700 dark:text-teal-300' },
}

export function RecommendedSchemes({ schemes, onSelectScheme, onShowGuidance, onCheckEligibility }: RecommendedSchemesProps) {
  if (schemes.length === 0) return null

  return (
    <div className="bg-card border border-border rounded-[24px] p-4 sm:p-6 shadow-lg">
      <div className="mb-4">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Recommended</p>
        <h3 className="text-xl font-semibold text-foreground mt-2">Schemes that fit you best</h3>
        <p className="text-sm text-muted-foreground">
          Personalized matches based on persona, eligibility, and benefits.
        </p>
      </div>

      <ScrollArea className="w-full">
        <div className="flex gap-4 pb-4">
          {schemes.map((scheme, index) => {
            const colors = categoryColors[scheme.category] || categoryColors.education
            return (
              <div
                key={scheme.id}
                className="flex-shrink-0 w-80 group"
              >
                <Card className="h-full p-5 rounded-2xl hover:border-accent hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col bg-background/80">
                  {/* Header with category */}
                  <div className="flex items-start justify-between mb-3">
                    <Badge className={`${colors.bg} ${colors.text} border-0 font-medium`}>
                      {scheme.category.charAt(0).toUpperCase() + scheme.category.slice(1).replace('-', ' ')}
                    </Badge>
                    {(scheme.matchPercentage || 0) > 0 && (
                      <span className="text-xs font-semibold text-accent">
                        {Math.round(scheme.matchPercentage || 0)}% match
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h4 className="font-semibold text-foreground mb-2 line-clamp-2 text-lg">
                    {scheme.name}
                  </h4>

                  {/* Description */}
                  <p className="text-sm text-muted-foreground mb-4 flex-grow line-clamp-2">
                    {scheme.description}
                  </p>

                  {/* Benefits */}
                  <div className="mb-4">
                    <p className="text-[10px] font-medium text-foreground/60 uppercase tracking-[0.2em] mb-2">Key Benefits</p>
                    <ul className="space-y-1">
                      {scheme.benefits.slice(0, 2).map((benefit, i) => (
                        <li key={i} className="flex gap-2 items-start text-xs text-muted-foreground">
                          <CheckCircle2 className="w-3 h-3 flex-shrink-0 mt-0.5 text-accent" />
                          <span>{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* CTA Button */}
                  <div className="mt-auto space-y-2">
                    <Button
                      onClick={() => onSelectScheme?.(scheme, index)}
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground gap-2 rounded-full group-hover:shadow-lg transition-all"
                    >
                      Select Scheme
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={() => onShowGuidance?.(scheme)}
                      variant="outline"
                      className="w-full border-border hover:bg-accent/10 rounded-full"
                    >
                      Guidance Steps
                    </Button>
                    <Button
                      onClick={() => onCheckEligibility?.(scheme)}
                      variant="outline"
                      className="w-full border-border hover:bg-accent/10 rounded-full"
                    >
                      Check Eligibility
                    </Button>
                  </div>
                </Card>
              </div>
            )
          })}
        </div>
      </ScrollArea>
    </div>
  )
}
