'use client'

import { Scheme } from '@/app/lib/mockApi'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { CheckCircle2, ArrowRight } from 'lucide-react'

interface RecommendedSchemesProps {
  schemes: Scheme[]
  onSelectScheme?: (scheme: Scheme) => void
}

const categoryColors: Record<string, { bg: string; text: string }> = {
  education: { bg: 'bg-blue-500/10', text: 'text-blue-600 dark:text-blue-400' },
  health: { bg: 'bg-green-500/10', text: 'text-green-600 dark:text-green-400' },
  employment: { bg: 'bg-purple-500/10', text: 'text-purple-600 dark:text-purple-400' },
  welfare: { bg: 'bg-pink-500/10', text: 'text-pink-600 dark:text-pink-400' },
  agricultural: { bg: 'bg-amber-500/10', text: 'text-amber-600 dark:text-amber-400' },
  infrastructure: { bg: 'bg-cyan-500/10', text: 'text-cyan-600 dark:text-cyan-400' },
}

export function RecommendedSchemes({ schemes, onSelectScheme }: RecommendedSchemesProps) {
  if (schemes.length === 0) return null

  return (
    <div className="bg-card border border-border rounded-2xl p-4 sm:p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-foreground mb-2">Recommended Schemes</h3>
        <p className="text-sm text-muted-foreground">
          These schemes match your profile and eligibility criteria
        </p>
      </div>

      <ScrollArea className="w-full">
        <div className="flex gap-4 pb-4">
          {schemes.map(scheme => {
            const colors = categoryColors[scheme.category] || categoryColors.education
            return (
              <div
                key={scheme.id}
                className="flex-shrink-0 w-80 group"
              >
                <Card className="h-full p-4 sm:p-5 hover:border-accent hover:shadow-lg hover:shadow-accent/10 transition-all duration-300 flex flex-col">
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
                  <h4 className="font-semibold text-foreground mb-2 line-clamp-2">
                    {scheme.name}
                  </h4>

                  {/* Description */}
                  <p className="text-sm text-muted-foreground mb-4 flex-grow line-clamp-2">
                    {scheme.description}
                  </p>

                  {/* Benefits */}
                  <div className="mb-4">
                    <p className="text-xs font-medium text-foreground/70 mb-2">Key Benefits</p>
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
                  <Button
                    onClick={() => onSelectScheme?.(scheme)}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground gap-2 group-hover:shadow-lg transition-all"
                  >
                    Learn More
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Card>
              </div>
            )
          })}
        </div>
      </ScrollArea>
    </div>
  )
}
