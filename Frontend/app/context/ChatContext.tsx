'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react'

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  type?: 'text' | 'scheme-recommendation' | 'eligibility' | 'guidance' | 'checklist'
}

export interface ChatSession {
  id: string
  title: string
  messages: Message[]
  createdAt: Date
  updatedAt: Date
}

interface ChatContextType {
  currentChat: ChatSession | null
  chatHistory: ChatSession[]
  createNewChat: () => void
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void
  loadChat: (chatId: string) => void
  deleteChat: (chatId: string) => void
  getCurrentMessages: () => Message[]
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

export function ChatProvider({ children }: { children: ReactNode }) {
  const [chatHistory, setChatHistory] = useState<ChatSession[]>([])
  const [currentChat, setCurrentChat] = useState<ChatSession | null>(null)

  const generateId = () => Math.random().toString(36).substr(2, 9)

  const createNewChat = () => {
    const newChat: ChatSession = {
      id: generateId(),
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

    const updatedChat = {
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
