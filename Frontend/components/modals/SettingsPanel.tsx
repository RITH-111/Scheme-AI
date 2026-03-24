'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useTheme } from '@/app/hooks/useTheme'
import { useUser } from '@/app/context/UserContext'
import { useRouter } from 'next/navigation'
import { Settings, Bell, Shield, LogOut } from 'lucide-react'

interface SettingsPanelProps {
  isOpen: boolean
  onClose: () => void
}

export function SettingsPanel({ isOpen, onClose }: SettingsPanelProps) {
  const router = useRouter()
  const { isDark, toggleTheme } = useTheme()
  const { user, logout } = useUser()

  const handleLogout = () => {
    logout()
    router.push('/')
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Settings
          </DialogTitle>
          <DialogDescription>
            Manage your preferences and account
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-6">
          {/* Display Settings */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground text-sm uppercase tracking-wider">
              Display
            </h3>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Label htmlFor="dark-mode" className="text-foreground font-medium">
                  Dark Mode
                </Label>
              </div>
              <Switch checked={isDark} onCheckedChange={toggleTheme} />
            </div>
          </div>

          <Separator className="bg-border" />

          {/* Notification Settings */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground text-sm uppercase tracking-wider flex items-center gap-2">
              <Bell className="w-4 h-4" />
              Notifications
            </h3>
            <div className="flex items-center justify-between">
              <Label htmlFor="app-notif" className="text-foreground font-medium">
                Enable Notifications
              </Label>
              <Switch id="app-notif" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="email-notif" className="text-foreground font-medium">
                Email Updates
              </Label>
              <Switch id="email-notif" defaultChecked />
            </div>
          </div>

          <Separator className="bg-border" />

          {/* Privacy Settings */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground text-sm uppercase tracking-wider flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Privacy & Security
            </h3>
            <Button variant="outline" className="w-full border-border hover:bg-accent/10">
              Privacy Policy
            </Button>
            <Button variant="outline" className="w-full border-border hover:bg-accent/10">
              Terms of Service
            </Button>
          </div>

          <Separator className="bg-border" />

          {/* Account */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground text-sm uppercase tracking-wider">
              Account
            </h3>
            <div className="bg-secondary/20 border border-border rounded-lg p-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase">Logged In As</p>
              <p className="text-sm font-medium text-foreground mt-1">{user.name || 'User'}</p>
              <p className="text-xs text-muted-foreground mt-1">{user.email || 'No email set'}</p>
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="w-full border-destructive/50 hover:bg-destructive/10 text-destructive"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
