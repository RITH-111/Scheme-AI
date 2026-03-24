'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export type Persona = 'student' | 'senior-citizen' | 'farmer' | 'entrepreneur' | 'unemployed' | 'disabled'

export interface User {
  id: string
  name: string
  persona: Persona | null
  email?: string
  phone?: string
  isAuthenticated: boolean
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
    id: '',
    name: '',
    persona: null,
    isAuthenticated: false,
  })

  // Load user data from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('scheme_user')
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser))
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
    setUser(newUser)
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
