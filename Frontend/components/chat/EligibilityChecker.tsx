'use client'

import { useState, useEffect } from 'react'
import { Scheme, EligibilityQuestion, fetchEligibilityQuestions } from '@/app/lib/mockApi'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { CheckCircle2 } from 'lucide-react'

interface EligibilityCheckerProps {
  scheme: Scheme | null
  isOpen: boolean
  onClose: () => void
  onSubmitProfile?: (profile: Record<string, unknown>) => Promise<void> | void
}

export function EligibilityChecker({ scheme, isOpen, onClose, onSubmitProfile }: EligibilityCheckerProps) {
  const [questions, setQuestions] = useState<EligibilityQuestion[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string | boolean>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (isOpen && scheme) {
      loadQuestions()
    }
  }, [isOpen, scheme])

  const loadQuestions = async () => {
    if (!scheme) return
    setIsLoading(true)
    try {
      const qs = await fetchEligibilityQuestions(scheme.id)
      setQuestions(qs)
      setAnswers({})
      setCurrentQuestionIndex(0)
    } finally {
      setIsLoading(false)
    }
  }

  if (!scheme) return null

  const currentQuestion = questions[currentQuestionIndex]
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100

  const handleAnswerChange = (value: string | boolean) => {
    if (currentQuestion) {
      setAnswers(prev => ({
        ...prev,
        [currentQuestion.id]: value,
      }))
    }
  }

  const handleNext = async () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
      return
    }

    if (!onSubmitProfile) return

    setIsSubmitting(true)
    try {
      const profile = buildProfileFromAnswers(answers)
      await onSubmitProfile(profile)
      onClose()
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1)
    }
  }

  const parseNumber = (value: string | boolean) => {
    if (typeof value === 'boolean') return value ? 1 : 0
    const digits = value.replace(/[^\d]/g, '')
    const num = Number.parseInt(digits, 10)
    return Number.isNaN(num) ? null : num
  }

  const buildProfileFromAnswers = (currentAnswers: Record<string, string | boolean>) => {
    const profile: Record<string, unknown> = {}

    Object.entries(currentAnswers).forEach(([key, value]) => {
      switch (key) {
        case 'q-age': {
          const age = parseNumber(value)
          if (age !== null) profile.age = age
          break
        }
        case 'q-income': {
          const income = parseNumber(value)
          if (income !== null) profile.annual_income = income
          break
        }
        case 'q-citizen':
          profile.is_citizen = Boolean(value)
          break
        case 'q-edu':
          profile.is_student = Boolean(value)
          break
        case 'q-farm':
          if (Boolean(value)) profile.occupation = 'farmer'
          break
        case 'q-work':
          if (typeof value === 'string' && value.trim()) {
            profile.occupation = value.trim().toLowerCase()
          }
          break
        case 'q-disability':
          profile.is_disabled = Boolean(value)
          break
        default:
          break
      }
    })

    return profile
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-accent" />
            Eligibility Checker
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
              <p className="text-muted-foreground">Loading eligibility questions...</p>
            </div>
          </div>
        ) : questions.length > 0 ? (
          <div className="space-y-6 py-6">
            {/* Progress */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-foreground">
                  Question {currentQuestionIndex + 1} of {questions.length}
                </span>
                <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            {/* Question */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">
                {currentQuestion?.question}
              </h3>

              {currentQuestion?.type === 'yes-no' ? (
                <RadioGroup
                  value={
                    typeof answers[currentQuestion.id] === 'undefined'
                      ? ''
                      : String(answers[currentQuestion.id])
                  }
                  onValueChange={(val) => handleAnswerChange(val === 'true')}
                  className="space-y-3"
                >
                  {['Yes', 'No'].map(option => (
                    <div key={option} className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:border-accent/50 hover:bg-accent/5 transition-colors cursor-pointer">
                      <RadioGroupItem value={String(option === 'Yes')} id={option} />
                      <Label htmlFor={option} className="cursor-pointer flex-1">
                        {option}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              ) : currentQuestion?.type === 'multiple-choice' ? (
                <RadioGroup
                  value={String(answers[currentQuestion.id] ?? '')}
                  onValueChange={(val) => handleAnswerChange(val)}
                  className="space-y-3"
                >
                  {currentQuestion?.options?.map(option => (
                    <div key={option} className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:border-accent/50 hover:bg-accent/5 transition-colors cursor-pointer">
                      <RadioGroupItem value={option} id={option} />
                      <Label htmlFor={option} className="cursor-pointer flex-1">
                        {option}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              ) : (
                <Input
                  type="text"
                  placeholder="Enter your answer"
                  value={String(answers[currentQuestion?.id] || '')}
                  onChange={(e) => handleAnswerChange(e.target.value)}
                  className="bg-input border-border"
                />
              )}
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                onClick={handlePrev}
                disabled={currentQuestionIndex === 0}
                variant="outline"
                className="flex-1 border-border hover:bg-accent/10"
              >
                Previous
              </Button>
              <Button
                onClick={handleNext}
                disabled={typeof answers[currentQuestion?.id] === 'undefined' || isSubmitting}
                className="flex-1 bg-primary hover:bg-primary/90"
              >
                {isSubmitting
                  ? 'Submitting...'
                  : currentQuestionIndex === questions.length - 1
                    ? 'Finish'
                    : 'Next'}
              </Button>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
