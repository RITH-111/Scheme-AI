'use client'

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react'
import { createSession } from '@/app/lib/mockApi'
import { generateId } from '@/app/lib/utils'

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  type?: 'text' | 'scheme-recommendation' | 'eligibility' | 'guidance' | 'checklist' | 'scheme-details'
  payload?: Record<string, unknown>
}

export interface ChatSession {
  id: string
  backendSessionId?: string
  title: string
  messages: Message[]
  createdAt: Date
  updatedAt: Date
}

interface ChatContextType {
  currentChat: ChatSession | null
  chatHistory: ChatSession[]
  createNewChat: () => Promise<void>
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void
  loadChat: (chatId: string) => void
  deleteChat: (chatId: string) => void
  getCurrentMessages: () => Message[]
  updateCurrentChat: (updates: Partial<ChatSession>) => void
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

export function ChatProvider({ children }: { children: ReactNode }) {
  const [chatHistory, setChatHistory] = useState<ChatSession[]>([])
  const [currentChat, setCurrentChat] = useState<ChatSession | null>(null)
  const storageKey = 'scheme_chat_state'

  useEffect(() => {
    const stored = localStorage.getItem(storageKey)
    if (!stored) return
    try {
      const parsed = JSON.parse(stored) as {
        chatHistory?: Array<Omit<ChatSession, 'createdAt' | 'updatedAt' | 'messages'> & {
          createdAt: string
          updatedAt: string
          messages: Array<Omit<Message, 'timestamp'> & { timestamp: string }>
        }>
        currentChatId?: string | null
      }
      if (parsed.chatHistory?.length) {
        const revived = parsed.chatHistory.map(chat => ({
          ...chat,
          createdAt: new Date(chat.createdAt),
          updatedAt: new Date(chat.updatedAt),
          messages: chat.messages.map(msg => ({
            ...msg,
            timestamp: new Date(msg.timestamp),
          })),
        }))
        setChatHistory(revived)
        const current = revived.find(c => c.id === parsed.currentChatId) || revived[0] || null
        setCurrentChat(current || null)
      }
    } catch (error) {
      console.warn('Failed to load chat history:', error)
    }
  }, [])

  useEffect(() => {
    const serialized = chatHistory.map(chat => ({
      ...chat,
      createdAt: chat.createdAt.toISOString(),
      updatedAt: chat.updatedAt.toISOString(),
      messages: chat.messages.map(msg => ({
        ...msg,
        timestamp: msg.timestamp.toISOString(),
      })),
    }))
    localStorage.setItem(
      storageKey,
      JSON.stringify({ chatHistory: serialized, currentChatId: currentChat?.id || null })
    )
  }, [chatHistory, currentChat])

  const createNewChat = async () => {
    const session = await createSession()
    const newChat: ChatSession = {
      id: generateId(),
      backendSessionId: session?.session_id,
      title: `Chat ${new Date().toLocaleDateString()}`,
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    setChatHistory(prev => [newChat, ...prev])
    setCurrentChat(newChat)
  }

  const addMessage = (message: Omit<Message, 'id' | 'timestamp'>) => {
    if (!currentChat) return

    const newMessage: Message = {
      ...message,
      id: generateId(),
      timestamp: new Date(),
    }

    const updatedChat: ChatSession = {
      ...currentChat,
      messages: [...currentChat.messages, newMessage],
      updatedAt: new Date(),
    }

    setCurrentChat(updatedChat)
    setChatHistory(prev =>
      prev.map(chat => (chat.id === updatedChat.id ? updatedChat : chat))
    )

    // Auto-update title if it's the first user message
    if (updatedChat.messages.length === 1) {
      const title = message.content.substring(0, 40) + '...'
      updatedChat.title = title
    }
  }

  const updateCurrentChat = (updates: Partial<ChatSession>) => {
    if (!currentChat) return
    const updated: ChatSession = {
      ...currentChat,
      ...updates,
      updatedAt: new Date(),
    }
    setCurrentChat(updated)
    setChatHistory(prev => prev.map(chat => (chat.id === updated.id ? updated : chat)))
  }

  const loadChat = (chatId: string) => {
    const chat = chatHistory.find(c => c.id === chatId)
    if (chat) {
      setCurrentChat(chat)
    }
  }

  const deleteChat = (chatId: string) => {
    setChatHistory(prev => prev.filter(chat => chat.id !== chatId))
    if (currentChat?.id === chatId) {
      setCurrentChat(null)
    }
  }

  const getCurrentMessages = () => {
    return currentChat?.messages || []
  }

  return (
    <ChatContext.Provider
      value={{
        currentChat,
        chatHistory,
        createNewChat,
        addMessage,
        loadChat,
        deleteChat,
        getCurrentMessages,
        updateCurrentChat,
      }}
    >
      {children}
    </ChatContext.Provider>
  )
}

export function useChat() {
  const context = useContext(ChatContext)
  if (context === undefined) {
    throw new Error('useChat must be used within ChatProvider')
  }
  return context
}
