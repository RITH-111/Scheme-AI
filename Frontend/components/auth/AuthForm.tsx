'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/app/context/UserContext'
import { sendOtp, signInWithOtp, signUpWithOtp } from '@/app/lib/mockApi'
import { setStoredProfile } from '@/app/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Chrome } from 'lucide-react'

interface AuthFormProps {
  type: 'login' | 'signup'
}

export function AuthForm({ type }: AuthFormProps) {
  const router = useRouter()
  const { setUser } = useUser()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null)
  const [retryAfter, setRetryAfter] = useState(0)

  const purpose = type === 'login' ? 'signin' : 'signup'

  const canRequestOtp = name.trim() && email.trim() && phone.trim()
  const canVerify = canRequestOtp && otp.trim().length === 6

  useEffect(() => {
    if (!retryAfter) return
    const timer = window.setInterval(() => {
      setRetryAfter(prev => (prev > 0 ? prev - 1 : 0))
    }, 1000)
    return () => window.clearInterval(timer)
  }, [retryAfter])

  useEffect(() => {
    if (!otpSent || typeof window === 'undefined') return
    const supportsOtpApi = 'OTPCredential' in window
    if (!supportsOtpApi) return

    const ac = new AbortController()
    navigator.credentials
      .get({ otp: { transport: ['sms'] }, signal: ac.signal } as CredentialRequestOptions)
      .then(credential => {
        const code = (credential as { code?: string } | null)?.code
        if (code) {
          setOtp(code.slice(0, 6))
        }
      })
      .catch(() => {
        // Silent fallback for browsers/devices that reject auto OTP retrieval.
      })
    return () => ac.abort()
  }, [otpSent])

  const requestOtp = async () => {
    if (!canRequestOtp) {
      setStatusMessage({ type: 'error', text: 'Please enter name, email, and phone number.' })
      return
    }

    setIsLoading(true)
    setStatusMessage(null)
    try {
      const result = await sendOtp({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        purpose,
      })

      if (!result) {
        setStatusMessage({ type: 'error', text: 'Failed to send OTP. Please check backend and try again.' })
        return
      }

      setOtpSent(true)
      setRetryAfter(30)
      const devHint = result.dev_otp ? ` (Dev OTP: ${result.dev_otp})` : ''
      setStatusMessage({ type: 'success', text: `${result.message}${devHint}` })
    } finally {
      setIsLoading(false)
    }
  }

  const verifyOtp = async () => {
    if (!canVerify) {
      setStatusMessage({ type: 'error', text: 'Please enter a valid 6-digit OTP.' })
      return
    }

    setIsLoading(true)
    setStatusMessage(null)
    try {
      const payload = {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        otp: otp.trim(),
      }

      const response = type === 'login' ? await signInWithOtp(payload) : await signUpWithOtp(payload)
      if (!response) {
        setStatusMessage({ type: 'error', text: 'Invalid or expired OTP. Please try again.' })
        return
      }

      setUser({
        id: response.user_id,
        name: response.name,
        email: response.email,
        phone: response.phone,
        persona: (response.persona as any) || null,
        profile: response.profile || {},
        isAuthenticated: true,
        authMode: type === 'login' ? 'signin' : 'signup',
      })

      setStoredProfile(response.profile || {})
      setStatusMessage({ type: 'success', text: response.message })
      setTimeout(() => {
        router.push('/chat')
      }, 600)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = () => {
    setStatusMessage({
      type: 'info',
      text: 'Google sign-in UI is ready. Connect Google auth provider to activate it.',
    })
  }

  return (
    <div className="w-full space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2 text-foreground">Name</label>
        <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Your full name" />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2 text-foreground">Email</label>
        <Input value={email} onChange={(event) => setEmail(event.target.value)} type="email" placeholder="you@example.com" />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2 text-foreground">Phone Number</label>
        <Input value={phone} onChange={(event) => setPhone(event.target.value)} type="tel" placeholder="9876543210" />
      </div>

      {otpSent && (
        <div>
          <label className="block text-sm font-medium mb-2 text-foreground">OTP</label>
          <Input
            value={otp}
            onChange={(event) => setOtp(event.target.value.replace(/\D/g, '').slice(0, 6))}
            type="text"
            maxLength={6}
            placeholder="Enter 6-digit OTP"
            className="tracking-widest"
          />
        </div>
      )}

      <Button
        onClick={handleGoogleSignIn}
        type="button"
        variant="outline"
        className="w-full rounded-full border-border hover:bg-accent/10"
      >
        <Chrome className="mr-2 h-4 w-4" />
        Continue with Google
      </Button>

      {!otpSent ? (
        <Button onClick={requestOtp} disabled={isLoading || !canRequestOtp} className="w-full bg-primary hover:bg-primary/90 rounded-full">
          {isLoading ? 'Sending OTP...' : 'Send OTP'}
        </Button>
      ) : (
        <div className="space-y-2">
          <Button onClick={verifyOtp} disabled={isLoading || !canVerify} className="w-full bg-primary hover:bg-primary/90 rounded-full">
            {isLoading ? 'Verifying...' : type === 'login' ? 'Sign In' : 'Register'}
          </Button>
          <Button
            onClick={requestOtp}
            type="button"
            variant="outline"
            disabled={isLoading || !canRequestOtp || retryAfter > 0}
            className="w-full rounded-full"
          >
            {retryAfter > 0 ? `Retry in ${retryAfter}s` : 'Resend OTP'}
          </Button>
        </div>
      )}

      {statusMessage && (
        <p
          className={`text-sm rounded-xl border px-3 py-2 ${
            statusMessage.type === 'error'
              ? 'border-destructive/50 bg-destructive/10 text-destructive'
              : statusMessage.type === 'success'
                ? 'border-emerald-600/40 bg-emerald-600/10 text-emerald-700 dark:text-emerald-300'
                : 'border-border bg-background/70 text-muted-foreground'
          }`}
        >
          {statusMessage.text}
        </p>
      )}
    </div>
  )
}
