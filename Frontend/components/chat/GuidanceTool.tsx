'use client'

import { useState, useEffect } from 'react'
import { Scheme, GuidanceStep, fetchGuidanceSteps } from '@/app/lib/mockApi'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, Circle, ExternalLink } from 'lucide-react'

interface GuidanceToolProps {
  scheme: Scheme | null
  isOpen: boolean
  onClose: () => void
}

export function GuidanceTool({ scheme, isOpen, onClose }: GuidanceToolProps) {
  const [steps, setSteps] = useState<GuidanceStep[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (isOpen && scheme) {
      loadSteps()
    }
  }, [isOpen, scheme])

  const loadSteps = async () => {
    if (!scheme) return
    setIsLoading(true)
    try {
      const s = await fetchGuidanceSteps(scheme.id)
      setSteps(s)
      setCompletedSteps(new Set())
    } finally {
      setIsLoading(false)
    }
  }

  if (!scheme) return null

  const toggleStepCompletion = (stepId: string) => {
    setCompletedSteps(prev => {
      const newSet = new Set(prev)
      if (newSet.has(stepId)) {
        newSet.delete(stepId)
      } else {
        newSet.add(stepId)
      }
      return newSet
    })
  }

  const completionPercentage = steps.length > 0 ? (completedSteps.size / steps.length) * 100 : 0

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-accent" />
            Step-by-Step Guidance
          </DialogTitle>
          <DialogDescription className="text-base mt-2">
            {scheme.name}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4 animate-pulse">
                <CheckCircle2 className="w-6 h-6 text-accent" />
              </div>
              <p className="text-muted-foreground">Loading guidance steps...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6 py-6">
            {/* Progress */}
            {steps.length > 0 && (
              <div className="bg-secondary/20 border border-border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-foreground">Your Progress</h4>
                  <Badge className="bg-accent/20 text-accent border-0">
                    {completedSteps.size}/{steps.length} Complete
                  </Badge>
                </div>
                <div className="w-full bg-border rounded-full h-2">
                  <div
                    className="bg-accent h-2 rounded-full transition-all duration-300"
                    style={{ width: `${completionPercentage}%` }}
                  />
                </div>
              </div>
            )}

            {/* Steps Accordion */}
            {steps.length > 0 ? (
              <Accordion type="single" collapsible className="w-full space-y-2">
                {steps.map((step, index) => {
                  const isCompleted = completedSteps.has(step.id)
                  return (
                    <AccordionItem
                      key={step.id}
                      value={step.id}
                      className="border border-border rounded-lg px-4 data-[state=open]:border-accent/50 transition-colors"
                    >
                      <AccordionTrigger
                        onClick={() => toggleStepCompletion(step.id)}
                        className="hover:no-underline py-4"
                      >
                        <div className="flex items-start gap-4 flex-1 text-left">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              toggleStepCompletion(step.id)
                            }}
                            className="mt-1 flex-shrink-0"
                          >
                            {isCompleted ? (
                              <CheckCircle2 className="w-5 h-5 text-accent" />
                            ) : (
                              <Circle className="w-5 h-5 text-border" />
                            )}
                          </button>
                          <div className="flex-1">
                            <h4 className={`font-semibold ${isCompleted ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                              Step {index + 1}: {step.title}
                            </h4>
                            <p className="text-sm text-muted-foreground mt-1">
                              {step.description}
                            </p>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-0 pt-0 pb-4">
                        <div className="ml-12 space-y-4">
                          <div className="bg-background border border-border rounded-lg p-4">
                            <h5 className="font-semibold text-foreground mb-2">What to do:</h5>
                            <p className="text-sm text-foreground/80 mb-4">
                              {step.action}
                            </p>

                            {step.resources && step.resources.length > 0 && (
                              <div>
                                <h6 className="text-xs font-semibold text-muted-foreground uppercase mb-2">
                                  Resources
                                </h6>
                                <div className="flex flex-wrap gap-2">
                                  {step.resources.map((resource, i) => (
                                    <a
                                      key={i}
                                      href="#"
                                      className="inline-flex items-center gap-1 text-xs text-accent hover:underline"
                                    >
                                      {resource}
                                      <ExternalLink className="w-3 h-3" />
                                    </a>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  )
                })}
              </Accordion>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No guidance steps available for this scheme</p>
              </div>
            )}

            {/* Completion Message */}
            {steps.length > 0 && completionPercentage === 100 && (
              <div className="bg-accent/10 border border-accent/50 rounded-lg p-4 text-center">
                <CheckCircle2 className="w-6 h-6 text-accent mx-auto mb-2" />
                <p className="font-semibold text-foreground">All steps completed!</p>
                <p className="text-sm text-muted-foreground mt-1">
                  You're ready to apply for this scheme. Visit the official portal to submit your application.
                </p>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
