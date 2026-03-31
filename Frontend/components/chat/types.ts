export type Scheme = {
  id: string
  name: string
  description: string
  matchPercentage: number
}

export type TextMessage = {
  id: string
  type: 'text'
  sender: 'user' | 'bot'
  content: string
}

export type SchemeMessage = {
  id: string
  type: 'schemes'
  schemes: Scheme[]
}

export type SelectedSchemeMessage = {
  id: string
  type: 'selected'
  scheme: Scheme
}

export type EligibilityMessage = {
  id: string
  type: 'eligibility'
  status: string
  score: number
  breakdown: string[]
}

export type GuidanceMessage = {
  id: string
  type: 'guidance'
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

export type SchemeOverviewMessage = {
  id: string
  type: 'overview'
  scheme: {
    name: string
    objective: string
    benefits: string[]
    eligibilitySummary: string[]
    targetGroup: string
    applicationMode: string
    officialUrl?: string
  }
}

export type Message =
  | TextMessage
  | SchemeMessage
  | SelectedSchemeMessage
  | EligibilityMessage
  | GuidanceMessage
  | SchemeOverviewMessage
