'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useTheme } from '@/app/hooks/useTheme'
import { Moon, Sun } from 'lucide-react'

export function NavBar() {
  const { isDark, toggleTheme } = useTheme()

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/95 backdrop-blur">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-primary">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold">
            S
          </div>
          Scheme AI
        </Link>

        {/* Right section */}
        <div className="flex items-center gap-4">
          <Link href="/auth">
            <Button variant="ghost" className="text-foreground hover:bg-accent/10">
              Sign In
            </Button>
          </Link>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg border border-border hover:bg-accent/10 transition-colors"
            aria-label="Toggle theme"
          >
            {isDark ? (
              <Sun className="w-5 h-5 text-foreground" />
            ) : (
              <Moon className="w-5 h-5 text-foreground" />
            )}
          </button>
        </div>
      </div>
    </nav>
  )
}
