'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AuthForm } from '@/components/auth/AuthForm'
import { Button } from '@/components/ui/button'
import { ChevronLeft } from 'lucide-react'

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState('login')

  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Back button */}
        <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8">
          <ChevronLeft className="w-4 h-4" />
          Back to Home
        </Link>

        {/* Card container */}
        <div className="rounded-2xl border border-border bg-card p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Welcome</h1>
            <p className="text-muted-foreground">
              Sign in to your account or create a new one to get started
            </p>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            {/* Login Tab */}
            <TabsContent value="login" className="space-y-4">
              <AuthForm type="login" />

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">or continue with</span>
                </div>
              </div>

              {/* Social buttons */}
              <Button variant="outline" className="w-full border-border hover:bg-accent/10">
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Google
              </Button>
            </TabsContent>

            {/* Signup Tab */}
            <TabsContent value="signup" className="space-y-4">
              <AuthForm type="signup" />

              <p className="text-xs text-muted-foreground text-center mt-4">
                By signing up, you agree to our{' '}
                <a href="#" className="underline hover:text-foreground">
                  Terms of Service
                </a>
              </p>
            </TabsContent>
          </Tabs>
        </div>

        {/* Footer text */}
        <p className="text-center text-sm text-muted-foreground mt-6">
          {activeTab === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <button
            onClick={() => setActiveTab(activeTab === 'login' ? 'signup' : 'login')}
            className="font-medium text-accent hover:underline"
          >
            {activeTab === 'login' ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </div>
    </main>
  )
}
