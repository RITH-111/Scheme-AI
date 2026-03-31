'use client'

import * as React from 'react'
import type { ThemeProviderProps } from 'next-themes'

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  void props
  return <>{children}</>
}
