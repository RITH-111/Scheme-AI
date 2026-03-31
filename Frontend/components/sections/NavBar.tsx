'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useTheme } from '@/app/hooks/useTheme'
import { Moon, Sun } from 'lucide-react'

export function NavBar() {
  const { isDark, toggleTheme } = useTheme()

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/75 backdrop-blur-xl">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 font-semibold text-xl tracking-tight text-foreground">
          <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center text-primary font-bold">
            SG
          </div>
          <span className="hidden sm:inline">Scheme AI</span>
        </Link>

        <div className="hidden md:flex items-center gap-2 rounded-full border border-border bg-card/70 px-4 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Landing → Auth → Discovery → Eligibility → Guidance
        </div>

        <div className="flex items-center gap-3">
          <Link href="/auth">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-5">
              Get Started
            </Button>
          </Link>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full border border-border hover:bg-accent/10 transition-colors"
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
