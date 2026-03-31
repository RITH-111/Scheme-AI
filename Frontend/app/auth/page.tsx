'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AuthForm } from '@/components/auth/AuthForm'
import { ChevronLeft, ShieldCheck, Sparkles, ClipboardCheck, TimerReset } from 'lucide-react'

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState('login')

  return (
    <main className="min-h-screen bg-background px-4 py-12">
      <div className="mx-auto grid w-full max-w-5xl overflow-hidden rounded-[28px] border border-border bg-card shadow-xl lg:grid-cols-[1.1fr_0.9fr]">
        <div className="relative hidden flex-col justify-between p-10 lg:flex">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-accent/10 to-secondary/20" />
          <div className="relative z-10 space-y-6">
            <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-foreground/80 hover:text-foreground">
              <ChevronLeft className="h-4 w-4" />
              Back to home
            </Link>
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-foreground/70">
                Secure access
              </div>
              <h1 className="text-4xl font-semibold leading-tight text-foreground">
                Your personal gateway to benefits.
              </h1>
              <p className="text-base text-muted-foreground">
                Sign in to keep your eligibility profile, track schemes, and get tailored guidance.
              </p>
            </div>
            <div className="space-y-4">
              {[ 
                { icon: Sparkles, title: 'Smart recommendations', text: 'Schemes matched to your persona and needs.' },
                { icon: ShieldCheck, title: 'Private by design', text: 'Your data stays local to your device.' },
                { icon: ClipboardCheck, title: 'Actionable next steps', text: 'Clear steps and document checklist.' },
                { icon: TimerReset, title: 'Fast OTP login', text: 'Auto-read OTP support and retry countdown.' },
              ].map((item, i) => {
                const Icon = item.icon
                return (
                  <div key={i} className="flex items-start gap-3 rounded-2xl border border-border bg-background/70 p-4">
                    <div className="rounded-xl bg-accent/20 p-2 text-accent">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{item.title}</p>
                      <p className="text-sm text-muted-foreground">{item.text}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <div className="p-8 sm:p-10">
          <Link href="/" className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-foreground/70 hover:text-foreground lg:hidden">
            <ChevronLeft className="h-4 w-4" />
            Back to home
          </Link>
          <div className="mb-8 space-y-2">
            <h2 className="text-3xl font-semibold text-foreground">Welcome back</h2>
            <p className="text-sm text-muted-foreground">
              Sign in with OTP or Google and continue your guided scheme journey.
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 rounded-full bg-muted p-1">
              <TabsTrigger value="login" className="rounded-full">Sign In</TabsTrigger>
              <TabsTrigger value="signup" className="rounded-full">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="mt-6 space-y-4">
              <AuthForm type="login" />
            </TabsContent>

            <TabsContent value="signup" className="mt-6 space-y-4">
              <AuthForm type="signup" />

              <p className="text-xs text-muted-foreground text-center mt-4">
                By signing up, you agree to our{' '}
                <a href="#" className="underline hover:text-foreground">
                  Terms of Service
                </a>
              </p>
            </TabsContent>
          </Tabs>

          <p className="text-center text-sm text-muted-foreground mt-6">
            {activeTab === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button
              onClick={() => setActiveTab(activeTab === 'login' ? 'signup' : 'login')}
              className="font-semibold text-accent hover:underline"
            >
              {activeTab === 'login' ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </main>
  )
}
