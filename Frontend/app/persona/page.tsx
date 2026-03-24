'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUser, type Persona } from '@/app/context/UserContext'
import { useChat } from '@/app/context/ChatContext'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BookOpen, Briefcase, Leaf, Users, Accessibility, Smile } from 'lucide-react'

const PERSONAS: Array<{ id: Persona; title: string; description: string; icon: typeof BookOpen }> = [
  {
    id: 'student',
    title: 'Student',
    description: 'Education grants, scholarships, and skill development programs',
    icon: BookOpen,
  },
  {
    id: 'entrepreneur',
    title: 'Entrepreneur',
    description: 'Startup funding, business loans, and market access schemes',
    icon: Briefcase,
  },
  {
    id: 'farmer',
    title: 'Farmer',
    description: 'Agricultural subsidies, crop insurance, and farming loans',
    icon: Leaf,
  },
  {
    id: 'senior-citizen',
    title: 'Senior Citizen',
    description: 'Healthcare, pension, and senior welfare programs',
    icon: Users,
  },
  {
    id: 'disabled',
    title: 'Person with Disability',
    description: 'Accessibility aids, rehabilitation, and disability allowances',
    icon: Accessibility,
  },
  {
    id: 'unemployed',
    title: 'Unemployed',
    description: 'Job training, skill development, and employment assistance',
    icon: Smile,
  },
]

export default function PersonaPage() {
  const router = useRouter()
  const { user, setPersona } = useUser()
  const { createNewChat } = useChat()

  // Redirect if not authenticated
  useEffect(() => {
    if (!user.isAuthenticated) {
      router.push('/auth')
    }
  }, [user.isAuthenticated, router])

  const handleSelectPersona = (persona: Persona) => {
    setPersona(persona)
    createNewChat()
    router.push('/chat')
  }

  return (
    <main className="min-h-screen bg-background py-12 px-4">
      <div className="container mx-auto max-w-5xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 text-foreground">Tell us about yourself</h1>
          <p className="text-lg text-muted-foreground">
            Select your profile to receive personalized government scheme recommendations
          </p>
        </div>

        {/* Persona Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {PERSONAS.map(persona => {
            const Icon = persona.icon
            return (
              <button
                key={persona.id}
                onClick={() => handleSelectPersona(persona.id)}
                className="group"
              >
                <Card className="h-full p-6 hover:border-accent hover:shadow-lg hover:shadow-accent/10 transition-all duration-300 cursor-pointer">
                  <div className="flex flex-col h-full gap-4">
                    {/* Icon */}
                    <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                      <Icon className="w-6 h-6 text-accent" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 text-left">
                      <h3 className="font-semibold text-lg text-foreground mb-2">{persona.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {persona.description}
                      </p>
                    </div>

                    {/* Arrow */}
                    <div className="flex justify-end group-hover:translate-x-1 transition-transform">
                      <svg className="w-5 h-5 text-accent opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </Card>
              </button>
            )
          })}
        </div>

        {/* Skip option */}
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Not sure yet?</p>
          <Button
            variant="outline"
            onClick={() => {
              createNewChat()
              router.push('/chat')
            }}
            className="border-border hover:bg-accent/10"
          >
            Skip and explore all schemes
          </Button>
        </div>
      </div>
    </main>
  )
}
