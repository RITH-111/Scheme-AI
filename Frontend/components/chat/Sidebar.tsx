'use client'

import { useRouter } from 'next/navigation'
import { useChat } from '@/app/context/ChatContext'
import { useUser } from '@/app/context/UserContext'
import { useTheme } from '@/app/hooks/useTheme'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Menu,
  Plus,
  MessageSquare,
  Trash2,
  Settings,
  LogOut,
  Moon,
  Sun,
  ChevronDown,
} from 'lucide-react'
import { useState } from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface SidebarProps {
  isOpen: boolean
  onToggle: () => void
}

export function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const router = useRouter()
  const { chatHistory, currentChat, loadChat, deleteChat, createNewChat } = useChat()
  const { user, logout } = useUser()
  const { isDark, toggleTheme } = useTheme()
  const [hoveredChatId, setHoveredChatId] = useState<string | null>(null)

  const handleNewChat = async () => {
    await createNewChat()
    router.push('/chat')
  }

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen w-72 bg-sidebar border-r border-sidebar-border z-50 flex flex-col transition-transform ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="border-b border-sidebar-border p-5 flex items-center justify-between">
          <div className="flex items-center gap-3 font-semibold text-sidebar-foreground">
            <div className="w-9 h-9 rounded-xl bg-sidebar-primary/10 border border-sidebar-primary/20 flex items-center justify-center text-sidebar-primary text-xs font-bold">
              SA
            </div>
            <div className="leading-tight">
              <p className="text-sm">Scheme AI</p>
              <p className="text-[10px] uppercase tracking-[0.2em] text-sidebar-foreground/60">Assistant</p>
            </div>
          </div>
          <button 
            onClick={onToggle} 
            className="p-2 hover:bg-sidebar-accent/10 rounded-full transition-colors text-sidebar-foreground"
            title={isOpen ? "Hide sidebar" : "Show sidebar"}
          >
            <ChevronDown className="w-4 h-4 transform transition-transform" style={{
              transform: isOpen ? 'rotate(0deg)' : 'rotate(-90deg)'
            }} />
          </button>
        </div>

        {/* New Chat Button */}
        <div className="p-5">
          <Button
            onClick={handleNewChat}
            className="w-full bg-sidebar-primary hover:bg-sidebar-primary/90 text-sidebar-primary-foreground gap-2 rounded-full"
          >
            <Plus className="w-4 h-4" />
            New Chat
          </Button>
        </div>

        {/* Chat History */}
        <div className="flex-1 px-5 overflow-hidden flex flex-col">
          <p className="text-[10px] font-semibold text-sidebar-foreground/60 uppercase tracking-[0.2em] mb-3">Chat History</p>
          <ScrollArea className="flex-1">
            <div className="space-y-2 pr-4">
              {chatHistory.length === 0 ? (
                <p className="text-xs text-sidebar-foreground/50 text-center py-8">No chats yet</p>
              ) : (
                chatHistory.map(chat => (
                  <div
                    key={chat.id}
                    onMouseEnter={() => setHoveredChatId(chat.id)}
                    onMouseLeave={() => setHoveredChatId(null)}
                    className={`group p-3 rounded-2xl cursor-pointer transition-colors ${
                      currentChat?.id === chat.id
                        ? 'bg-sidebar-accent/20 border border-sidebar-accent'
                        : 'hover:bg-sidebar-accent/10'
                    }`}
                    onClick={() => {
                      loadChat(chat.id)
                      onToggle() // Close sidebar on mobile
                    }}
                  >
                    <div className="flex items-start gap-2">
                      <MessageSquare className="w-4 h-4 flex-shrink-0 mt-0.5 text-sidebar-accent" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-sidebar-foreground truncate">
                          {chat.title}
                        </p>
                        <p className="text-xs text-sidebar-foreground/50">
                          {new Date(chat.updatedAt).toLocaleDateString()}
                        </p>
                      </div>
                      {hoveredChatId === chat.id && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteChat(chat.id)
                          }}
                          className="p-1 hover:bg-destructive/20 rounded"
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Footer */}
        <div className="border-t border-sidebar-border p-5 space-y-3">
          {/* User Info */}
          <div className="px-3 py-3 rounded-2xl bg-sidebar-accent/5 border border-sidebar-border">
            <p className="text-[10px] uppercase tracking-[0.2em] text-sidebar-foreground/60">Logged in as</p>
            <p className="text-sm font-semibold text-sidebar-foreground truncate mt-1">
              {user.name || 'User'}
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={toggleTheme}
              className="flex-1 p-2 rounded-full border border-sidebar-border hover:bg-sidebar-accent/10 transition-colors flex items-center justify-center gap-2"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              <span className="text-xs font-medium">{isDark ? 'Light' : 'Dark'}</span>
            </button>

            {/* Settings dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex-1 p-2 rounded-full border border-sidebar-border hover:bg-sidebar-accent/10 transition-colors flex items-center justify-center">
                  <Settings className="w-4 h-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem className="flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-destructive flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </aside>
    </>
  )
}
