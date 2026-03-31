import type { Metadata, Viewport } from 'next'
import { Analytics } from '@vercel/analytics/next'
import { ThemeProvider } from '@/components/theme-provider'
import { UserProvider } from '@/app/context/UserContext'
import { ChatProvider } from '@/app/context/ChatContext'
import './globals.css'

export const metadata: Metadata = {
  title: 'Scheme AI - Government Scheme Finder',
  description: 'Discover eligible government schemes using AI-powered recommendations',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: '#0f1419' },
  ],
  userScalable: true,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <UserProvider>
            <ChatProvider>
              {children}
              <Analytics />
            </ChatProvider>
          </UserProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
