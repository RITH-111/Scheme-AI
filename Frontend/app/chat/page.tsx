'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useChat } from '@/app/context/ChatContext'
import { useUser } from '@/app/context/UserContext'
import { Sidebar } from '@/components/chat/Sidebar'
import { ChatArea } from '@/components/chat/ChatArea'
import { InputArea } from '@/components/chat/InputArea'
import { RecommendedSchemes } from '@/components/chat/RecommendedSchemes'
import { EligibilityChecker } from '@/components/chat/EligibilityChecker'
import { GuidanceTool } from '@/components/chat/GuidanceTool'
import { fetchSchemesByPersona, generateAIResponse, Scheme } from '@/app/lib/mockApi'
import { Button } from '@/components/ui/button'
import { Menu } from 'lucide-react'

export default function ChatPage() {
  const router = useRouter()
  const { user } = useUser()
  const { currentChat, createNewChat, addMessage, getCurrentMessages } = useChat()
  const [sidebarOpen, setSidebarOpen] = useState(true) // Always starts open; user can toggle
  const [isLoading, setIsLoading] = useState(false)
  const [recommendedSchemes, setRecommendedSchemes] = useState<Scheme[]>([])
  const [selectedScheme, setSelectedScheme] = useState<Scheme | null>(null)
  const [showEligibility, setShowEligibility] = useState(false)
  const [showGuidance, setShowGuidance] = useState(false)

  // Redirect if not authenticated
  useEffect(() => {
    if (!user.isAuthenticated) {
      router.push('/auth')
    }
  }, [user.isAuthenticated, router])

  // Load initial schemes based on persona
  useEffect(() => {
    if (currentChat && getCurrentMessages().length === 0) {
      loadInitialSchemes()
    }
  }, [currentChat])

  const loadInitialSchemes = async () => {
    if (!user.persona) return

    setIsLoading(true)
    try {
      const schemes = await fetchSchemesByPersona(user.persona)
      setRecommendedSchemes(schemes)

      // Add initial AI message
      const response = await generateAIResponse('', { persona: user.persona, schemes })
      addMessage({
        role: 'assistant',
        content: response,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendMessage = async (message: string) => {
    // Add user message
    addMessage({
      role: 'user',
      content: message,
    })

    setIsLoading(true)
    try {
      // Generate AI response
      const response = await generateAIResponse(message, {
        persona: user.persona || undefined,
        schemes: recommendedSchemes,
      })

      addMessage({
        role: 'assistant',
        content: response,
      })

      // If user is asking about schemes, fetch recommended ones
      if (message.toLowerCase().includes('scheme') || message.toLowerCase().includes('eligible')) {
        if (user.persona) {
          const schemes = await fetchSchemesByPersona(user.persona)
          setRecommendedSchemes(schemes)
        }
      }
    } finally {
      setIsLoading(false)
    }
  }

  const messages = getCurrentMessages()

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header with unified toggle button */}
        <header className="border-b border-border bg-card px-4 sm:px-6 py-3 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-accent/10 rounded-lg transition-colors text-foreground"
            title={sidebarOpen ? "Hide chat history" : "Show chat history"}
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex-1 text-center">
            <h1 className="font-bold text-foreground">Scheme AI</h1>
          </div>
          <div className="w-10" />
        </header>

        {/* Chat area */}
        <ChatArea messages={messages} isLoading={isLoading} />

        {/* Recommended schemes */}
        {recommendedSchemes.length > 0 && messages.length === 1 && (
          <div className="px-4 sm:px-6 py-4 border-t border-border bg-background">
            <RecommendedSchemes
              schemes={recommendedSchemes}
              onSelectScheme={(scheme) => {
                setSelectedScheme(scheme)
                setShowEligibility(true)
              }}
            />
          </div>
        )}

        {/* Input area */}
        <InputArea onSendMessage={handleSendMessage} isLoading={isLoading} />
      </div>

      {/* Eligibility Checker Modal */}
      <EligibilityChecker
        scheme={selectedScheme}
        isOpen={showEligibility}
        onClose={() => setShowEligibility(false)}
      />

      {/* Guidance Tool Modal */}
      <GuidanceTool
        scheme={selectedScheme}
        isOpen={showGuidance}
        onClose={() => setShowGuidance(false)}
      />
    </div>
  )
}
