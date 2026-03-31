export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date)
}

export function formatTime(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(date)
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

export function generateId(): string {
  return Math.random().toString(36).substr(2, 9)
}

export function getOrCreateUserId(): string {
  if (typeof window === 'undefined') return 'anonymous'
  const key = 'scheme_ai_user_id'
  const existing = localStorage.getItem(key)
  if (existing) return existing
  const newId =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `user_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`
  localStorage.setItem(key, newId)
  return newId
}

export function getStoredProfile(): Record<string, unknown> {
  if (typeof window === 'undefined') return {}
  const key = 'scheme_ai_profile'
  const stored = localStorage.getItem(key)
  if (!stored) return {}
  try {
    return JSON.parse(stored) as Record<string, unknown>
  } catch {
    return {}
  }
}

export function setStoredProfile(profile: Record<string, unknown>): void {
  if (typeof window === 'undefined') return
  const key = 'scheme_ai_profile'
  localStorage.setItem(key, JSON.stringify(profile))
}

export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export function getEligibilityColor(percentage: number): string {
  if (percentage >= 80) return 'text-green-600 dark:text-green-400'
  if (percentage >= 60) return 'text-amber-600 dark:text-amber-400'
  return 'text-orange-600 dark:text-orange-400'
}

export function getEligibilityBgColor(percentage: number): string {
  if (percentage >= 80) return 'bg-green-500/10'
  if (percentage >= 60) return 'bg-amber-500/10'
  return 'bg-orange-500/10'
}

export function getCategoryColor(category: string): { bg: string; text: string } {
  const colors: Record<string, { bg: string; text: string }> = {
    education: { bg: 'bg-sky-500/10', text: 'text-sky-700 dark:text-sky-300' },
    health: { bg: 'bg-emerald-500/10', text: 'text-emerald-700 dark:text-emerald-300' },
    employment: { bg: 'bg-amber-500/10', text: 'text-amber-700 dark:text-amber-300' },
    welfare: { bg: 'bg-rose-500/10', text: 'text-rose-700 dark:text-rose-300' },
    agricultural: { bg: 'bg-lime-500/10', text: 'text-lime-700 dark:text-lime-300' },
    infrastructure: { bg: 'bg-teal-500/10', text: 'text-teal-700 dark:text-teal-300' },
  }
  return colors[category] || colors.education
}
