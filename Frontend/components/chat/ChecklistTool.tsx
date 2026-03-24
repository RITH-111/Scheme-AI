'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, AlertCircle } from 'lucide-react'

export interface ChecklistItem {
  id: string
  title: string
  description?: string
  category?: string
  completed?: boolean
}

interface ChecklistToolProps {
  title?: string
  schemeId?: string
  onItemToggle?: (itemId: string) => void
}

const defaultChecklist: ChecklistItem[] = [
  {
    id: 'docs-1',
    title: 'Aadhar Card',
    description: 'Valid Aadhar card or enrollment number',
    category: 'Identity Documents',
  },
  {
    id: 'docs-2',
    title: 'PAN Card',
    description: 'Permanent Account Number (PAN)',
    category: 'Identity Documents',
  },
  {
    id: 'income-1',
    title: 'Income Certificate',
    description: 'Official income certificate from authorized authority',
    category: 'Income Proof',
  },
  {
    id: 'income-2',
    title: 'Last 2 Years ITR',
    description: 'Income Tax Returns (if applicable)',
    category: 'Income Proof',
  },
  {
    id: 'bank-1',
    title: 'Bank Account Details',
    description: 'Account number and IFSC code',
    category: 'Banking',
  },
  {
    id: 'prop-1',
    title: 'Property Documents',
    description: 'Land ownership or rent agreement',
    category: 'Property',
  },
]

export function ChecklistTool({ title = 'Application Checklist', schemeId, onItemToggle }: ChecklistToolProps) {
  const [checklist, setChecklist] = useState<ChecklistItem[]>(
    defaultChecklist.map(item => ({ ...item, completed: false }))
  )

  const toggleItem = (id: string) => {
    setChecklist(prev =>
      prev.map(item =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    )
    onItemToggle?.(id)
  }

  const completed = checklist.filter(item => item.completed).length
  const total = checklist.length
  const percentage = (completed / total) * 100

  const categories = [...new Set(checklist.map(item => item.category || 'Other'))]

  return (
    <Card className="p-6 bg-card border-border">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-accent" />
            {title}
          </h3>
          <Badge className="bg-accent/20 text-accent border-0">
            {completed}/{total}
          </Badge>
        </div>
        <Progress value={percentage} className="h-2" />
        <p className="text-xs text-muted-foreground mt-2">
          {completed === total
            ? 'All documents ready!'
            : `${total - completed} documents needed`}
        </p>
      </div>

      <div className="space-y-6">
        {categories.map(category => {
          const categoryItems = checklist.filter(item => (item.category || 'Other') === category)
          const categoryCompleted = categoryItems.filter(item => item.completed).length

          return (
            <div key={category}>
              <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                {category}
                {categoryCompleted === categoryItems.length && (
                  <CheckCircle2 className="w-4 h-4 text-accent" />
                )}
              </h4>
              <div className="space-y-3 pl-2">
                {categoryItems.map(item => (
                  <div
                    key={item.id}
                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-accent/5 transition-colors cursor-pointer"
                    onClick={() => toggleItem(item.id)}
                  >
                    <Checkbox
                      checked={item.completed || false}
                      onCheckedChange={() => toggleItem(item.id)}
                      className="mt-1 cursor-pointer"
                    />
                    <div className="flex-1 min-w-0">
                      <Label
                        className={`cursor-pointer font-medium ${
                          item.completed
                            ? 'text-muted-foreground line-through'
                            : 'text-foreground'
                        }`}
                      >
                        {item.title}
                      </Label>
                      {item.description && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {item.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {completed === total && (
        <div className="mt-6 p-4 rounded-lg bg-accent/10 border border-accent/50 flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-foreground text-sm">Ready to apply!</p>
            <p className="text-xs text-muted-foreground mt-1">
              All required documents are prepared. You can now submit your application.
            </p>
          </div>
        </div>
      )}
    </Card>
  )
}
