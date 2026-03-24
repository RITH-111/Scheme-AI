'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema, signupSchema, type LoginInput, type SignupInput } from '@/app/lib/validators'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useUser } from '@/app/context/UserContext'
import { Eye, EyeOff, Phone, Mail } from 'lucide-react'

interface AuthFormProps {
  type: 'login' | 'signup'
}

export function AuthForm({ type }: AuthFormProps) {
  const router = useRouter()
  const { setUser } = useUser()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [authMethod, setAuthMethod] = useState<'email' | 'phone'>('email')
  const [otpSent, setOtpSent] = useState(false)
  const [otp, setOtp] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')

  const schema = type === 'login' ? loginSchema : signupSchema
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: LoginInput | SignupInput) => {
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Mock user creation/authentication
      const userId = Math.random().toString(36).substr(2, 9)
      const user = {
        id: userId,
        name: type === 'signup' ? (data as SignupInput).name : 'User',
        email: data.email,
        phone: type === 'signup' ? (data as SignupInput).phone : undefined,
        persona: null,
        isAuthenticated: true,
      }

      setUser(user)
      router.push('/persona')
    } catch (error) {
      console.error('Auth error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendOTP = async () => {
    if (!phoneNumber.trim()) return
    
    setIsLoading(true)
    try {
      // Simulate API call for sending OTP
      await new Promise(resolve => setTimeout(resolve, 800))
      setOtpSent(true)
    } catch (error) {
      console.error('OTP send error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyOTP = async () => {
    if (!otp.trim() || otp.length !== 6) return
    
    setIsLoading(true)
    try {
      // Simulate API call for verifying OTP
      await new Promise(resolve => setTimeout(resolve, 800))

      // Mock user creation/authentication
      const userId = Math.random().toString(36).substr(2, 9)
      const user = {
        id: userId,
        name: 'User',
        email: `user${userId}@example.com`,
        phone: phoneNumber,
        persona: null,
        isAuthenticated: true,
      }

      setUser(user)
      router.push('/persona')
    } catch (error) {
      console.error('OTP verification error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Show OTP form for login if using phone method
  if (type === 'login' && authMethod === 'phone') {
    return (
      <div className="w-full space-y-4">
        <div className="flex gap-2 mb-4">
          <button
            type="button"
            onClick={() => {
              setAuthMethod('email')
              setOtpSent(false)
              setOtp('')
              setPhoneNumber('')
            }}
            className="flex-1 p-2 rounded-lg border border-border hover:bg-accent/10 flex items-center justify-center gap-2 text-sm font-medium"
          >
            <Mail className="w-4 h-4" />
            Email & Password
          </button>
          <button
            type="button"
            disabled
            className="flex-1 p-2 rounded-lg bg-accent/20 border border-accent flex items-center justify-center gap-2 text-sm font-medium text-accent-foreground"
          >
            <Phone className="w-4 h-4" />
            Phone OTP
          </button>
        </div>

        {!otpSent ? (
          <>
            <div>
              <label className="block text-sm font-medium mb-2 text-foreground">Phone Number</label>
              <Input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+91 9876543210"
                className="w-full"
              />
            </div>

            <Button
              type="button"
              onClick={handleSendOTP}
              disabled={isLoading || !phoneNumber.trim()}
              className="w-full bg-primary hover:bg-primary/90"
            >
              {isLoading ? 'Sending...' : 'Send OTP'}
            </Button>
          </>
        ) : (
          <>
            <div className="p-3 rounded-lg bg-accent/5 border border-accent/20">
              <p className="text-sm text-foreground/70">OTP sent to {phoneNumber}</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-foreground">Enter OTP</label>
              <Input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                maxLength={6}
                className="w-full text-center text-xl tracking-widest"
              />
              <p className="text-xs text-foreground/50 mt-1">Enter the 6-digit code sent to your phone</p>
            </div>

            <Button
              type="button"
              onClick={handleVerifyOTP}
              disabled={isLoading || otp.length !== 6}
              className="w-full bg-primary hover:bg-primary/90"
            >
              {isLoading ? 'Verifying...' : 'Verify OTP'}
            </Button>

            <button
              type="button"
              onClick={() => {
                setOtpSent(false)
                setOtp('')
              }}
              className="w-full p-2 text-sm text-accent hover:text-accent/80 font-medium"
            >
              Send OTP again
            </button>
          </>
        )}
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-4">
      {/* Auth method toggle for login */}
      {type === 'login' && (
        <div className="flex gap-2 mb-4">
          <button
            type="button"
            onClick={() => setAuthMethod('email')}
            disabled={authMethod === 'email'}
            className={`flex-1 p-2 rounded-lg border flex items-center justify-center gap-2 text-sm font-medium transition-colors ${
              authMethod === 'email'
                ? 'bg-accent/20 border-accent text-accent-foreground'
                : 'border-border hover:bg-accent/10'
            }`}
          >
            <Mail className="w-4 h-4" />
            Email & Password
          </button>
          <button
            type="button"
            onClick={() => setAuthMethod('phone')}
            disabled={authMethod === 'phone'}
            className={`flex-1 p-2 rounded-lg border flex items-center justify-center gap-2 text-sm font-medium transition-colors ${
              authMethod === 'phone'
                ? 'bg-accent/20 border-accent text-accent-foreground'
                : 'border-border hover:bg-accent/10'
            }`}
          >
            <Phone className="w-4 h-4" />
            Phone OTP
          </button>
        </div>
      )}

      {type === 'signup' && (
        <div>
          <label className="block text-sm font-medium mb-2 text-foreground">Full Name</label>
          <Input
            {...register('name')}
            placeholder="John Doe"
            className="w-full"
          />
          {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium mb-2 text-foreground">Email</label>
        <Input
          {...register('email')}
          type="email"
          placeholder="you@example.com"
          className="w-full"
        />
        {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
      </div>

      {type === 'signup' && (
        <div>
          <label className="block text-sm font-medium mb-2 text-foreground">Phone</label>
          <Input
            {...register('phone')}
            placeholder="9876543210"
            className="w-full"
          />
          {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium mb-2 text-foreground">Password</label>
        <div className="relative">
          <Input
            {...register('password')}
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            className="w-full pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
      </div>

      {type === 'signup' && (
        <div>
          <label className="block text-sm font-medium mb-2 text-foreground">Confirm Password</label>
          <Input
            {...register('confirmPassword')}
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            className="w-full"
          />
          {errors.confirmPassword && (
            <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>
          )}
        </div>
      )}

      <Button
        type="submit"
        disabled={isLoading}
        className="w-full bg-primary hover:bg-primary/90"
      >
        {isLoading ? 'Loading...' : type === 'login' ? 'Sign In' : 'Create Account'}
      </Button>
    </form>
  )
}
