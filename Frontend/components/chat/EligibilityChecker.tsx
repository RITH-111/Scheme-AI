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
import { CheckCircle2, AlertCircle } from 'lucide-react'

interface EligibilityCheckerProps {
  scheme: Scheme | null
  isOpen: boolean
  onClose: () => void
}

export function EligibilityChecker({ scheme, isOpen, onClose }: EligibilityCheckerProps) {
  const [questions, setQuestions] = useState<EligibilityQuestion[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string | boolean>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [showResult, setShowResult] = useState(false)

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
      setShowResult(false)
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

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
    } else {
      setShowResult(true)
    }
  }

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1)
    }
  }

  const calculateEligibility = () => {
    const answeredCount = Object.keys(answers).length
    const percentage = (answeredCount / questions.length) * 100
    return Math.round(percentage)
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
        ) : showResult ? (
          <div className="space-y-6 py-6">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-accent" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-2">
                {calculateEligibility()}% Eligible
              </h3>
              <p className="text-muted-foreground">
                Based on your responses, you appear to meet the eligibility criteria for this scheme
              </p>
            </div>

            <div className="bg-secondary/20 border border-border rounded-lg p-4">
              <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-accent" />
                Next Steps
              </h4>
              <ol className="space-y-2 text-sm text-foreground/80">
                <li>1. Prepare all required documents mentioned above</li>
                <li>2. Visit the official scheme portal or nearest government office</li>
                <li>3. Submit your application with supporting documents</li>
                <li>4. Track your application status online</li>
              </ol>
            </div>

            <Button
              onClick={() => {
                setShowResult(false)
                setCurrentQuestionIndex(0)
              }}
              variant="outline"
              className="w-full border-border hover:bg-accent/10"
            >
              Retake Quiz
            </Button>
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
                  value={String(answers[currentQuestion.id] || '')}
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
                  value={String(answers[currentQuestion.id] || '')}
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
                disabled={!answers[currentQuestion?.id]}
                className="flex-1 bg-primary hover:bg-primary/90"
              >
                {currentQuestionIndex === questions.length - 1 ? 'Finish' : 'Next'}
              </Button>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
