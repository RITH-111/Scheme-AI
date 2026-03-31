'use client'

import { Persona } from '@/app/context/UserContext'
import { getOrCreateUserId } from '@/app/lib/utils'

export interface Scheme {
  id: string
  name: string
  description: string
  eligibility: string[]
  benefits: string[]
  category: 'education' | 'health' | 'employment' | 'welfare' | 'agricultural' | 'infrastructure'
  matchPercentage?: number
  why_recommended?: string[]
  eligibility_breakdown?: {
    status?: string
    score?: number
    checked_criteria?: string[]
  }
  confidence?: number
  raw?: Record<string, unknown>
}

export interface EligibilityQuestion {
  id: string
  question: string
  type: 'yes-no' | 'multiple-choice' | 'text'
  options?: string[]
}

export interface GuidanceStep {
  id: string
  title: string
  description: string
  status?: 'done' | 'pending' | 'blocked'
  action?: string
  resources?: string[]
}

export interface SchemeOverview {
  name: string
  objective: string
  benefits: string[]
  eligibilitySummary: string[]
  targetGroup: string
  applicationMode: string
  officialUrl?: string
}

export interface GuidancePayload {
  steps: GuidanceStep[]
  blockers?: string[]
  required_documents?: string[]
  authority?: string
  application_url?: string
  timeline?: string
}

export interface ChatApiResponse {
  session_id: string
  assistant_message: string
  recommended_schemes?: Scheme[]
  selected_scheme?: Scheme
  eligibility_result?: Record<string, unknown>
  scheme_overview?: SchemeOverview
  guidance?: GuidancePayload
}

export interface SessionResponse {
  session_id: string
  user_id: string
  created_at: string
  updated_at: string
  memory: Record<string, unknown>
}

export interface OtpSendResponse {
  phone: string
  message: string
  dev_otp?: string
}

export interface AuthResponse {
  user_id: string
  name: string
  email: string
  phone: string
  message: string
  persona?: string | null
  profile?: Record<string, unknown>
}

export interface ReadyResponse {
  status: string
  checks: Record<string, string>
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000'

async function safeFetch<T>(path: string, init?: RequestInit): Promise<T | null> {
  try {
    const userId = getOrCreateUserId()
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        'X-User-Id': userId,
        ...(init?.headers || {}),
      },
      cache: 'no-store',
    })

    if (!response.ok) {
      return null
    }

    return (await response.json()) as T
  } catch (error) {
    console.warn('API request failed:', error)
    return null
  }
}

export async function createSession(): Promise<SessionResponse | null> {
  const userId = getOrCreateUserId()
  return safeFetch<SessionResponse>('/sessions', {
    method: 'POST',
    body: JSON.stringify({ user_id: userId }),
  })
}

export async function getSession(sessionId: string): Promise<SessionResponse | null> {
  return safeFetch<SessionResponse>(`/sessions/${sessionId}`, {
    method: 'GET',
  })
}

export async function deleteSession(sessionId: string): Promise<boolean> {
  const data = await safeFetch<{ deleted: boolean }>(`/sessions/${sessionId}`, {
    method: 'DELETE',
  })
  return Boolean(data?.deleted)
}

export async function fetchSchemesByPersona(persona: Persona, limit = 6): Promise<Scheme[]> {
  const data = await safeFetch<{ schemes: Scheme[] }>('/schemes/by-persona', {
    method: 'POST',
    body: JSON.stringify({ persona, limit }),
  })
  return data?.schemes || []
}

export async function fetchEligibilityQuestions(schemeId: string): Promise<EligibilityQuestion[]> {
  const data = await safeFetch<{ questions: EligibilityQuestion[] }>(`/schemes/${schemeId}/eligibility-questions`, {
    method: 'GET',
  })
  return data?.questions || []
}

export async function fetchGuidanceSteps(schemeId: string): Promise<GuidancePayload | null> {
  const data = await safeFetch<GuidancePayload>(`/schemes/${schemeId}/guidance`, {
    method: 'GET',
  })
  return data
}

export async function chatWithAssistant(
  message: string,
  context: { persona?: string; profile?: Record<string, unknown>; sessionId?: string }
): Promise<ChatApiResponse | null> {
  const userId = getOrCreateUserId()
  return safeFetch<ChatApiResponse>('/chat', {
    method: 'POST',
    body: JSON.stringify({
      message: message || 'Recommend schemes for me',
      persona: context.persona || null,
      profile: context.profile || {},
      session_id: context.sessionId || null,
      user_id: userId,
    }),
  })
}

export async function fetchReadiness(): Promise<ReadyResponse | null> {
  return safeFetch<ReadyResponse>('/ready', {
    method: 'GET',
  })
}

export async function sendOtp(payload: {
  name: string
  email: string
  phone: string
  purpose: 'signin' | 'signup'
}): Promise<OtpSendResponse | null> {
  return safeFetch<OtpSendResponse>('/auth/send-otp', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function signInWithOtp(payload: {
  name: string
  email: string
  phone: string
  otp: string
}): Promise<AuthResponse | null> {
  return safeFetch<AuthResponse>('/auth/signin', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function signUpWithOtp(payload: {
  name: string
  email: string
  phone: string
  otp: string
}): Promise<AuthResponse | null> {
  return safeFetch<AuthResponse>('/auth/signup', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function upsertUserProfile(payload: {
  user_id: string
  profile: Record<string, unknown>
  persona?: string | null
}): Promise<AuthResponse | null> {
  return safeFetch<AuthResponse>('/users/profile', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function getUserProfile(userId: string): Promise<AuthResponse | null> {
  return safeFetch<AuthResponse>(`/users/${userId}/profile`, {
    method: 'GET',
  })
}
