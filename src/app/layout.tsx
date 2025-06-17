import type { Metadata } from 'next'
import localFont from 'next/font/local'
import './globals.css'
import TanstackClientProvider from '@/components/providers/tanstack-client-provider'
import { ThemeProvider } from '@/components/providers/theme-provider'
import { SystemStatusProvider } from '@/components/providers/system-status-provider'
import { GameProvider } from '@/game-engine/hooks/useGame'
import { DevModeProvider } from '@/components/providers/dev-mode-provider'

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900',
})
const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  weight: '100 900',
})

export const metadata: Metadata = {
  title: 'Derelict Dawn',
  description: 'A sci-fi incremental game about reviving an abandoned spaceship',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <SystemStatusProvider>
            <TanstackClientProvider>
              <DevModeProvider>
                <GameProvider>
                  {children}
                </GameProvider>
              </DevModeProvider>
            </TanstackClientProvider>
          </SystemStatusProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
