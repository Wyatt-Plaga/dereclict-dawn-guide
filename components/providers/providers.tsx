"use client"

import { ReactNode } from "react"
import { AuthProvider } from "@/components/providers/auth-context"
import { DatabaseProvider } from "@/components/providers/database-context"
import { UserProfileProvider } from "@/components/providers/user-profile-context"
import { GameProgressProvider } from "@/components/providers/game-progress-context"
import { RepositoryProvider } from "@/components/providers/repository-context"
import { Toaster } from "sonner"
import { ThemeProvider } from "next-themes"

// Combined providers component for app-wide context
export function Providers({ children }: { children: ReactNode }) {
  // Returns nested providers in the correct order
  // Auth needs to be first as other providers depend on it
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <AuthProvider>
        <DatabaseProvider>
          <RepositoryProvider>
            <UserProfileProvider>
              <Toaster position="top-right" closeButton />
              {children}
            </UserProfileProvider>
          </RepositoryProvider>
        </DatabaseProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

// A simpler version that only includes auth for minimal pages
export function MinimalProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <AuthProvider>
        <Toaster position="top-right" closeButton />
        {children}
      </AuthProvider>
    </ThemeProvider>
  )
}

// Full app providers including game progress management
// To be used after game store is initialized
export function GameProviders({ children }: { children: ReactNode }) {
  return (
    <Providers>
      <GameProgressProvider>
        {children}
      </GameProgressProvider>
    </Providers>
  )
} 