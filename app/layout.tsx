import type { Metadata } from 'next'
import localFont from 'next/font/local'
import './globals.css'
import TanstackClientProvider from '@/components/providers/tanstack-client-provider'
import { ThemeProvider } from '@/components/providers/theme-provider'
import { SystemStatusProvider } from '@/components/providers/system-status-provider'
import { GameProvider } from '@/app/game/hooks/useGame'
import { StateLoggerWrapper } from '@/app/components/StateLoggerWrapper'

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
              <GameProvider>
                {children}
                <StateLoggerWrapper />
              </GameProvider>
            </TanstackClientProvider>
          </SystemStatusProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
