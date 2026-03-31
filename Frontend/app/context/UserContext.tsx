'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { getOrCreateUserId } from '@/app/lib/utils'

export type Persona = 'student' | 'senior-citizen' | 'farmer' | 'entrepreneur' | 'unemployed' | 'disabled'

export interface User {
  id: string
  name: string
  persona: Persona | null
  email?: string
  phone?: string
  profile?: Record<string, unknown>
  isAuthenticated: boolean
  authMode?: 'signin' | 'signup'
}

interface UserContextType {
  user: User
  setUser: (user: User) => void
  setPersona: (persona: Persona) => void
  logout: () => void
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User>({
    id: getOrCreateUserId(),
    name: '',
    persona: null,
    isAuthenticated: false,
  })

  // Load user data from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('scheme_user')
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser) as User
        setUser(prev => ({
          ...prev,
          ...parsed,
          id: parsed.id || prev.id || getOrCreateUserId(),
        }))
      } catch (e) {
        console.error('Failed to parse user data:', e)
      }
    }
  }, [])

  // Save user data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('scheme_user', JSON.stringify(user))
  }, [user])

  const handleSetUser = (newUser: User) => {
    setUser(prev => ({
      ...prev,
      ...newUser,
      id: newUser.id || prev.id || getOrCreateUserId(),
    }))
  }

  const handleSetPersona = (persona: Persona) => {
    setUser(prev => ({ ...prev, persona }))
  }

  const handleLogout = () => {
    const emptyUser: User = {
      id: '',
      name: '',
      persona: null,
      isAuthenticated: false,
    }
    setUser(emptyUser)
    localStorage.removeItem('scheme_user')
    localStorage.removeItem('scheme_ai_profile')
  }

  return (
    <UserContext.Provider value={{ user, setUser: handleSetUser, setPersona: handleSetPersona, logout: handleLogout }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error('useUser must be used within UserProvider')
  }
  return context
}
