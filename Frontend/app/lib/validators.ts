import { z } from 'zod'

// Auth validators
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().regex(/^[0-9]{10}$/, 'Phone must be 10 digits'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

export const otpSchema = z.object({
  otp: z.string().regex(/^[0-9]{6}$/, 'OTP must be 6 digits'),
})

// Chat validators
export const messageSchema = z.object({
  content: z.string().min(1, 'Message cannot be empty').max(1000, 'Message too long'),
})

// Eligibility question validators
export const eligibilityResponseSchema = z.object({
  questionId: z.string(),
  answer: z.union([z.string(), z.boolean()]),
})

export type LoginInput = z.infer<typeof loginSchema>
export type SignupInput = z.infer<typeof signupSchema>
export type OTPInput = z.infer<typeof otpSchema>
export type MessageInput = z.infer<typeof messageSchema>
export type EligibilityResponse = z.infer<typeof eligibilityResponseSchema>
