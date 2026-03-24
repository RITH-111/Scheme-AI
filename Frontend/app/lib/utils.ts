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
    education: { bg: 'bg-blue-500/10', text: 'text-blue-600 dark:text-blue-400' },
    health: { bg: 'bg-green-500/10', text: 'text-green-600 dark:text-green-400' },
    employment: { bg: 'bg-purple-500/10', text: 'text-purple-600 dark:text-purple-400' },
    welfare: { bg: 'bg-pink-500/10', text: 'text-pink-600 dark:text-pink-400' },
    agricultural: { bg: 'bg-amber-500/10', text: 'text-amber-600 dark:text-amber-400' },
    infrastructure: { bg: 'bg-cyan-500/10', text: 'text-cyan-600 dark:text-cyan-400' },
  }
  return colors[category] || colors.education
}
