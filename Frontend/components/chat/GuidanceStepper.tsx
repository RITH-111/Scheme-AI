'use client'

import { Card } from '@/components/ui/card'

interface GuidanceStepperProps {
  steps: {
    title: string
    description: string
    status?: 'done' | 'pending' | 'blocked'
  }[]
  blockers?: string[]
  requiredDocuments?: string[]
  authority?: string
  applicationUrl?: string
  timeline?: string
}

export function GuidanceStepper({
  steps,
  blockers = [],
  requiredDocuments = [],
  authority,
  applicationUrl,
  timeline,
}: GuidanceStepperProps) {
  return (
    <div className="space-y-3">
      {steps.map((step, index) => (
        <Card key={`${step.title}-${index}`} className="rounded-2xl border border-border p-4">
          <div className="mb-1 flex items-center justify-between gap-2 text-xs uppercase tracking-wide text-muted-foreground">
            <span>Step {index + 1}</span>
            {step.status ? (
              <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-semibold">
                {step.status}
              </span>
            ) : null}
          </div>
          <h4 className="text-sm font-semibold">{step.title}</h4>
          <p className="mt-1 text-xs text-muted-foreground">{step.description}</p>
        </Card>
      ))}

      {blockers.length > 0 ? (
        <Card className="rounded-2xl border border-amber-400/40 bg-amber-50/30 p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-amber-700">Eligibility blockers</p>
          <ul className="mt-1 list-disc space-y-1 pl-4 text-xs text-foreground/90">
            {blockers.map(item => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </Card>
      ) : null}

      {requiredDocuments.length > 0 ? (
        <Card className="rounded-2xl border border-border p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Required documents</p>
          <ul className="mt-1 list-disc space-y-1 pl-4 text-xs text-foreground/90">
            {requiredDocuments.map(item => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </Card>
      ) : null}

      {(authority || timeline || applicationUrl) ? (
        <Card className="rounded-2xl border border-border p-4 text-xs">
          {authority ? <p><span className="font-semibold">Authority:</span> {authority}</p> : null}
          {timeline ? <p className="mt-1"><span className="font-semibold">Timeline:</span> {timeline}</p> : null}
          {applicationUrl ? (
            <a
              href={applicationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-block font-medium text-primary underline-offset-4 hover:underline"
            >
              Open application portal
            </a>
          ) : null}
        </Card>
      ) : null}
    </div>
  )
}
