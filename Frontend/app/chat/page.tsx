'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChatContainer } from '@/components/chat/ChatContainer'
import { InputBar } from '@/components/chat/InputBar'
import { ProfileForm } from '@/components/chat/ProfileForm'
import type { Message, Scheme } from '@/components/chat/types'
import {
  chatWithAssistant,
  createSession,
  fetchGuidanceSteps,
  type GuidancePayload,
  type SchemeOverview,
  type Scheme as ApiScheme,
} from '@/app/lib/mockApi'
import { generateId, getOrCreateUserId, getStoredProfile, setStoredProfile } from '@/app/lib/utils'
import { useUser } from '@/app/context/UserContext'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { LogOut, MessageSquare, Settings, UserRound } from 'lucide-react'

type EligibilityResult = {
  status?: string
  score?: number
  reason?: string[]
}

const STORAGE_KEY = 'scheme_ai_chat_first_state'
const QUICK_ACTIONS = [
  'Recommend schemes for me',
  'Schemes for students',
  'Schemes for farmers',
  'am i eligible',
]

function inferPersonaFromText(text: string): 'student' | 'farmer' | 'unemployed' {
  const lower = text.toLowerCase()
  if (
    lower.includes('student') ||
    lower.includes('undergraduate') ||
    lower.includes('ug ') ||
    lower.includes('college')
  ) return 'student'
  if (lower.includes('farmer')) return 'farmer'
  return 'unemployed'
}

function normalizeMappedTerms(text: string): string {
  return text
    .replace(/\bundergraduate\b/gi, 'student')
    .replace(/\bug\b/gi, 'student')
    .replace(/\bvisually impaired\b/gi, 'disabled')
    .replace(/\bblind\b/gi, 'disabled')
    .replace(/\bsc\b/gi, 'scheduled caste')
}

function extractProfileFromText(text: string): Record<string, unknown> {
  const lower = text.toLowerCase()
  const partial: Record<string, unknown> = {}

  const ageMatch = lower.match(/\bage\s*(?:is|:)?\s*(\d{1,3})\b/)
  if (ageMatch?.[1]) {
    partial.age = Number(ageMatch[1])
  }

  if (lower.includes('undergraduate') || lower.includes('student') || lower.includes('college')) {
    partial.is_student = true
    partial.occupation = 'student'
  }

  if (lower.includes('visually impaired') || lower.includes('blind') || lower.includes('disabled')) {
    partial.is_disabled = true
  }

  if (lower.match(/\bcommunity\s*(?:is|:)?\s*sc\b/) || lower.includes('scheduled caste')) {
    partial.community = 'sc'
  } else if (lower.match(/\bcommunity\s*(?:is|:)?\s*st\b/)) {
    partial.community = 'st'
  } else if (lower.match(/\bcommunity\s*(?:is|:)?\s*obc\b/)) {
    partial.community = 'obc'
  }

  return partial
}

function normalizeDiscoveryText(text: string): string {
  const mappedText = normalizeMappedTerms(text)
  const lower = mappedText.toLowerCase()
  if (lower.includes('show student')) return 'schemes for students'
  if (lower.includes('show farmer')) return 'schemes for farmers'
  if (lower === 'recommend schemes for me') return 'schemes for unemployed'
  return mappedText
}

function getDiscoveryRetryQuery(persona: 'student' | 'farmer' | 'unemployed'): string {
  if (persona === 'student') return 'schemes for students'
  if (persona === 'farmer') return 'schemes for farmers'
  return 'schemes for unemployed'
}

function toUiScheme(scheme: ApiScheme): Scheme {
  return {
    id: scheme.id,
    name: scheme.name,
    description: scheme.description,
    matchPercentage: scheme.matchPercentage || 0,
  }
}

function buildFallbackGuidance(scheme: Scheme): GuidancePayload {
  const portal = `https://www.india.gov.in/search?query=${encodeURIComponent(scheme.id)}`
  return {
    steps: [
      {
        id: 'step-1',
        title: 'Confirm eligibility criteria',
        description: 'Verify age, category, student/occupation, and income criteria from the official notice.',
        status: 'pending',
      },
      {
        id: 'step-2',
        title: 'Prepare required documents',
        description: 'Keep ID proof, address proof, category/income certificate, and bank details ready.',
        status: 'pending',
      },
      {
        id: 'step-3',
        title: 'Submit application',
        description: 'Apply through the official portal or designated nodal office.',
        status: 'pending',
      },
    ],
    blockers: [],
    required_documents: [
      'Identity proof (Aadhaar/Voter ID)',
      'Address proof',
      'Community/income certificates (if applicable)',
      'Bank account details',
    ],
    authority: 'Relevant government department',
    application_url: portal,
    timeline: 'Typical verification and approval may take 2-6 weeks.',
  }
}

export default function ChatPage() {
  const router = useRouter()
  const { user, logout } = useUser()
  const [userId, setUserId] = useState('anonymous')

  const [messages, setMessages] = useState<Message[]>([])
  const [sessionId, setSessionId] = useState('')
  const [userProfile, setUserProfile] = useState<Record<string, unknown>>({})
  const [selectedScheme, setSelectedScheme] = useState<Scheme | null>(null)
  const [loading, setLoading] = useState(false)
  const [showSchemeSkeleton, setShowSchemeSkeleton] = useState(false)
  const [showProfileForm, setShowProfileForm] = useState(false)
  const [sidebarSection, setSidebarSection] = useState<'chat' | 'profile' | 'settings'>('chat')

  useEffect(() => {
    setUserId(getOrCreateUserId())

    const storedProfile = getStoredProfile()
    setUserProfile(storedProfile)

    const storedRaw = localStorage.getItem(STORAGE_KEY)
    if (!storedRaw) {
      setMessages([
        {
          id: generateId(),
          type: 'text',
          sender: 'bot',
          content: 'Hi, I can help you discover schemes, check eligibility, and guide you through next steps.',
        },
      ])
      return
    }

    try {
      const stored = JSON.parse(storedRaw) as {
        messages?: Message[]
        session_id?: string
        user_profile?: Record<string, unknown>
        selected_scheme?: Scheme | null
      }
      setMessages(stored.messages || [])
      setSessionId(stored.session_id || '')
      setSelectedScheme(stored.selected_scheme || null)
      if (stored.user_profile) {
        setUserProfile(stored.user_profile)
      }
    } catch {
      setMessages([])
    }
  }, [])

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        messages,
        session_id: sessionId,
        user_profile: userProfile,
        selected_scheme: selectedScheme,
      })
    )
  }, [messages, selectedScheme, sessionId, userProfile])

  const ensureSessionId = async (): Promise<string> => {
    if (sessionId) {
      return sessionId
    }
    const session = await createSession()
    const createdSessionId = session?.session_id || ''
    setSessionId(createdSessionId)
    return createdSessionId
  }

  const pushMessages = (newMessages: Message[]) => {
    setMessages(prev => [...prev, ...newMessages])
  }

  const sendChatWithRecovery = async (
    message: string,
    persona: 'student' | 'farmer' | 'unemployed',
    currentSessionId: string
  ) => {
    let response = await chatWithAssistant(message, {
      persona,
      profile: userProfile,
      sessionId: currentSessionId,
    })

    if (!response) {
      const fresh = await createSession()
      const freshSessionId = fresh?.session_id || ''
      if (freshSessionId) {
        setSessionId(freshSessionId)
        response = await chatWithAssistant(message, {
          persona,
          profile: userProfile,
          sessionId: freshSessionId,
        })
      }
    }

    return response
  }

  const handleChat = async (input: string) => {
    const text = input.trim()
    if (!text || loading) {
      return
    }

    pushMessages([
      {
        id: generateId(),
        type: 'text',
        sender: 'user',
        content: text,
      },
    ])

    const normalizedText = normalizeDiscoveryText(text)
    const profileFromText = extractProfileFromText(normalizedText)
    const mergedProfile = { ...userProfile, ...profileFromText }
    if (Object.keys(profileFromText).length > 0) {
      setUserProfile(mergedProfile)
      setStoredProfile(mergedProfile)
    }
    const lower = normalizedText.toLowerCase()
    const inferredPersona = inferPersonaFromText(normalizedText)
    let likelySchemeDiscovery =
      lower.includes('scheme') || lower.includes('recommend') || lower.includes('show') || lower.includes('find')
    let effectiveQuery = normalizedText

    if (!likelySchemeDiscovery && Object.keys(profileFromText).length > 0) {
      const personaHint =
        inferredPersona === 'student'
          ? 'student'
          : inferredPersona === 'farmer'
            ? 'farmer'
            : 'person'
      const disabilityHint = mergedProfile.is_disabled ? ' with disability' : ''
      const communityHint = mergedProfile.community ? ` in ${String(mergedProfile.community).toUpperCase()} category` : ''
      effectiveQuery = `schemes for ${personaHint}${disabilityHint}${communityHint}`
      likelySchemeDiscovery = true
    }

    setLoading(true)
    setShowSchemeSkeleton(likelySchemeDiscovery)

    try {
      const ensuredSessionId = await ensureSessionId()
      let response = await sendChatWithRecovery(effectiveQuery, inferredPersona, ensuredSessionId)

      if (
        response &&
        likelySchemeDiscovery &&
        (!response.recommended_schemes || response.recommended_schemes.length === 0)
      ) {
        const retryQuery = getDiscoveryRetryQuery(inferredPersona)
        if (retryQuery.toLowerCase() !== effectiveQuery.toLowerCase()) {
          const retried = await sendChatWithRecovery(
            retryQuery,
            inferredPersona,
            response.session_id || ensuredSessionId
          )
          if (retried) {
            response = retried
          }
        }
      }

      if (!response) {
        pushMessages([
          {
            id: generateId(),
            type: 'text',
            sender: 'bot',
            content: 'I could not reach the server. Please retry in a moment.',
          },
        ])
        return
      }

      if (response.session_id && response.session_id !== sessionId) {
        setSessionId(response.session_id)
      }

      const blocks: Message[] = []

      if (response.assistant_message) {
        blocks.push({
          id: generateId(),
          type: 'text',
          sender: 'bot',
          content: response.assistant_message,
        })
      }

      if (response.recommended_schemes?.length) {
        blocks.push({
          id: generateId(),
          type: 'schemes',
          schemes: response.recommended_schemes.map(toUiScheme),
        })
      }

      if (response.selected_scheme) {
        const scheme = toUiScheme(response.selected_scheme)
        setSelectedScheme(scheme)
        blocks.push({
          id: generateId(),
          type: 'selected',
          scheme,
        })
      }

      if (response.scheme_overview) {
        const overview = response.scheme_overview as SchemeOverview
        blocks.push({
          id: generateId(),
          type: 'overview',
          scheme: {
            name: overview.name,
            objective: overview.objective,
            benefits: overview.benefits || [],
            eligibilitySummary: overview.eligibilitySummary || [],
            targetGroup: overview.targetGroup,
            applicationMode: overview.applicationMode,
            officialUrl: overview.officialUrl,
          },
        })
      }

      if (response.eligibility_result) {
        const eligibility = response.eligibility_result as EligibilityResult
        blocks.push({
          id: generateId(),
          type: 'eligibility',
          status: eligibility.status || 'Unknown',
          score: Number(eligibility.score || 0),
          breakdown: Array.isArray(eligibility.reason) ? eligibility.reason : [],
        })
      }

      if (response.guidance?.steps?.length) {
        const guidance = response.guidance as GuidancePayload
        blocks.push({
          id: generateId(),
          type: 'guidance',
          steps: guidance.steps.map(step => ({
            title: step.title,
            description: step.description,
            status: step.status,
          })),
          blockers: guidance.blockers || [],
          requiredDocuments: guidance.required_documents || [],
          authority: guidance.authority,
          applicationUrl: guidance.application_url,
          timeline: guidance.timeline,
        })
      }

      if (blocks.length > 0) {
        pushMessages(blocks)
      }
    } finally {
      setLoading(false)
      setShowSchemeSkeleton(false)
    }
  }

  const handleSelectScheme = async (scheme: Scheme, index: number) => {
    setSelectedScheme(scheme)
    const mapped = [
      'first scheme',
      'second scheme',
      'third scheme',
      'fourth scheme',
      'fifth scheme',
      'sixth scheme',
    ][index]
    if (!mapped) {
      pushMessages([
        {
          id: generateId(),
          type: 'text',
          sender: 'bot',
          content: 'Please select one of the first six schemes to continue.',
        },
      ])
      return
    }
    await handleChat(mapped)
  }

  const handleCheckEligibility = async (scheme: Scheme) => {
    setSelectedScheme(scheme)
    await handleChat('am i eligible')
  }

  const handleGetGuidance = async (scheme: Scheme) => {
    setSelectedScheme(scheme)
    setLoading(true)
    try {
      const guidance = (await fetchGuidanceSteps(scheme.id)) || buildFallbackGuidance(scheme)
      pushMessages([
        {
          id: generateId(),
          type: 'text',
          sender: 'bot',
          content: `Guidance for ${scheme.name}:`,
        },
        {
          id: generateId(),
          type: 'guidance',
          steps: guidance.steps.map(step => ({
            title: step.title,
            description: step.description,
            status: step.status,
          })),
          blockers: guidance.blockers || [],
          requiredDocuments: guidance.required_documents || [],
          authority: guidance.authority,
          applicationUrl: guidance.application_url,
          timeline: guidance.timeline,
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleProfileSubmit = async (profile: Record<string, unknown>) => {
    setUserProfile(profile)
    setStoredProfile(profile)
  }

  const handleNewSession = () => {
    setSessionId('')
    setSelectedScheme(null)
    setMessages([
      {
        id: generateId(),
        type: 'text',
        sender: 'bot',
        content: 'New chat started. Tell me your profile and I will recommend schemes.',
      },
    ])
  }

  const handleClearChat = () => {
    setMessages([
      {
        id: generateId(),
        type: 'text',
        sender: 'bot',
        content: 'Chat cleared. Ask me anything about government schemes.',
      },
    ])
  }

  const handleLogout = () => {
    logout()
    router.push('/auth')
  }

  return (
    <main className="flex h-screen bg-background">
      <aside className="hidden w-72 shrink-0 border-r border-border bg-card/70 md:flex md:flex-col">
        <div className="border-b border-border p-4">
          <h2 className="text-lg font-semibold">Account</h2>
          <p className="text-xs text-muted-foreground">{user.name || 'Citizen'}</p>
        </div>
        <div className="flex-1 space-y-2 p-3">
          <button
            onClick={() => setSidebarSection('chat')}
            className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm ${
              sidebarSection === 'chat' ? 'bg-primary/10 text-primary' : 'hover:bg-accent/10'
            }`}
          >
            <MessageSquare className="h-4 w-4" />
            Chat
          </button>
          <button
            onClick={() => setSidebarSection('profile')}
            className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm ${
              sidebarSection === 'profile' ? 'bg-primary/10 text-primary' : 'hover:bg-accent/10'
            }`}
          >
            <UserRound className="h-4 w-4" />
            User Profile
          </button>
          <button
            onClick={() => setSidebarSection('settings')}
            className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm ${
              sidebarSection === 'settings' ? 'bg-primary/10 text-primary' : 'hover:bg-accent/10'
            }`}
          >
            <Settings className="h-4 w-4" />
            Settings
          </button>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-red-600 hover:bg-red-50"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>

          {sidebarSection === 'profile' ? (
            <Card className="mt-3 rounded-2xl p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">User Profile</p>
              <p className="mt-2 text-sm"><span className="font-semibold">User ID:</span> {userId}</p>
              <p className="mt-1 text-sm"><span className="font-semibold">State:</span> {String(userProfile.state || '-')}</p>
              <p className="mt-1 text-sm"><span className="font-semibold">Occupation:</span> {String(userProfile.occupation || '-')}</p>
              <p className="mt-1 text-sm"><span className="font-semibold">Community:</span> {String(userProfile.community || '-')}</p>
              <Button className="mt-3 w-full rounded-full" onClick={() => setShowProfileForm(true)}>
                Edit Profile
              </Button>
            </Card>
          ) : null}

          {sidebarSection === 'settings' ? (
            <Card className="mt-3 rounded-2xl p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Settings</p>
              <p className="mt-2 text-sm"><span className="font-semibold">Session:</span> {sessionId || 'Not started'}</p>
              <div className="mt-3 space-y-2">
                <Button variant="outline" className="w-full rounded-full" onClick={handleNewSession}>
                  New Session
                </Button>
                <Button variant="outline" className="w-full rounded-full" onClick={handleClearChat}>
                  Clear Chat
                </Button>
              </div>
            </Card>
          ) : null}
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="border-b border-border bg-card/60 px-3 py-3 backdrop-blur sm:px-4">
          <div className="mx-auto flex w-full max-w-4xl items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold">Scheme AI</h1>
            <p className="text-xs text-muted-foreground">Discover schemes, check eligibility, and get guidance in chat</p>
          </div>
          <div className="text-right text-xs text-muted-foreground">
            <p>User: {userId.slice(0, 8)}</p>
            <p>Session: {sessionId ? sessionId.slice(0, 8) : 'new'}</p>
          </div>
        </div>
        </header>

        <ChatContainer
          messages={messages}
          loading={loading}
          showSchemeSkeleton={showSchemeSkeleton}
          selectedSchemeId={selectedScheme?.id || null}
          onSelectScheme={handleSelectScheme}
          onCheckEligibility={handleCheckEligibility}
          onGetGuidance={handleGetGuidance}
        />

        <InputBar
          onSend={handleChat}
          loading={loading}
          quickActions={QUICK_ACTIONS}
        />
      </div>

      <ProfileForm
        scheme={null}
        isOpen={showProfileForm}
        onClose={() => setShowProfileForm(false)}
        onSubmitProfile={handleProfileSubmit}
      />
    </main>
  )
}
