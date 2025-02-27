"use client"

import { ReactNode } from 'react'
import { ThemeProvider } from '@/components/providers/theme-provider'
import { SystemStatusProvider } from '@/components/providers/system-status-provider'
import ClerkClientProvider from '@/components/providers/clerk-client-provider'
import { SupabaseProvider } from '@/utils/supabase/context'
import { ClerkLoaded, ClerkLoading } from '@clerk/nextjs'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { SaveStatusProvider } from '@/components/providers/save-status-provider'
import { OfflineProgressWrapper } from '@/components/ui/offline-progress-wrapper'
import { ResourceOfflineProgressWrapper } from '@/components/ui/resource-offline-progress-wrapper'
import TanstackClientProvider from '@/components/providers/tanstack-client-provider'
import { NotificationsProvider } from '@/components/ui/notifications'

export function ClientLayout({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <SaveStatusProvider>
        <ClerkClientProvider>
          <ClerkLoading>
            <div className="flex flex-col items-center justify-center min-h-screen bg-background">
              <LoadingSpinner size={36} text="Initializing systems..." />
            </div>
          </ClerkLoading>
          <ClerkLoaded>
            <SystemStatusProvider>
              <SupabaseProvider>
                <TanstackClientProvider>
                  <NotificationsProvider>
                    {children}
                    <OfflineProgressWrapper />
                    <ResourceOfflineProgressWrapper />
                  </NotificationsProvider>
                </TanstackClientProvider>
              </SupabaseProvider>
            </SystemStatusProvider>
          </ClerkLoaded>
        </ClerkClientProvider>
      </SaveStatusProvider>
    </ThemeProvider>
  )
} 