"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser, SignInButton } from '@clerk/nextjs'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Zap } from 'lucide-react'

interface AuthCheckProps {
  children: React.ReactNode
}

export function AuthCheck({ children }: AuthCheckProps) {
  const { isLoaded, isSignedIn, user } = useUser()
  const [checking, setChecking] = useState(true)
  const router = useRouter()
  
  useEffect(() => {
    // Wait for Clerk to load
    if (!isLoaded) return
    
    // Give a short delay to ensure everything is properly loaded
    const timer = setTimeout(() => {
      setChecking(false)
    }, 1000)
    
    return () => clearTimeout(timer)
  }, [isLoaded])
  
  // Show loading while checking auth
  if (!isLoaded || checking) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background">
        <LoadingSpinner size={36} text="Initializing systems..." />
      </div>
    )
  }
  
  // If not signed in, show login screen
  if (!isSignedIn) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background">
        <div className="system-panel p-8 w-full max-w-md mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-primary mb-2 flickering-text">DERELICT DAWN</h1>
            <p className="text-muted-foreground text-sm">
              Authorization required to access ship systems
            </p>
          </div>
          
          <div className="flex justify-center mb-8">
            <Zap className="h-16 w-16 text-chart-1 flickering-text" />
          </div>
          
          <div className="text-center">
            <SignInButton mode="modal">
              <button className="system-panel py-3 px-8 hover:bg-accent/10 transition-colors w-full">
                <span className="terminal-text">Authenticate</span>
              </button>
            </SignInButton>
            
            <p className="text-xs text-muted-foreground mt-4">
              Ship systems locked. Authentication required to proceed.
            </p>
          </div>
        </div>
      </div>
    )
  }
  
  // User is authenticated, render children
  return <>{children}</>
} 