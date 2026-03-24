'use client'

import { useTheme as useNextTheme } from 'next-themes'
import { useEffect, useState } from 'react'

export function useTheme() {
  const { theme, setTheme, resolvedTheme } = useNextTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return {
      theme: 'system',
      setTheme: () => {},
      isDark: false,
      toggleTheme: () => {},
      resolvedTheme: undefined,
    }
  }

  return {
    theme: theme || 'system',
    setTheme,
    isDark: resolvedTheme === 'dark',
    toggleTheme: () => {
      setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
    },
    resolvedTheme: resolvedTheme as 'light' | 'dark' | undefined,
  }
}
