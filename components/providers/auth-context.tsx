"use client"

import { 
  createContext, 
  useContext, 
  useState, 
  useEffect, 
  ReactNode 
} from "react"
import { createClient, Session } from "@supabase/supabase-js"

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Define the AuthContext shape
interface AuthContextType {
  // State
  session: Session | null
  user: Session["user"] | null
  isLoading: boolean
  error: string | null
  
  // Actions
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  updatePassword: (password: string) => Promise<void>
  clearError: () => void
}

// Create context with default values
const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  isLoading: true,
  error: null,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
  resetPassword: async () => {},
  updatePassword: async () => {},
  clearError: () => {}
})

// Auth provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<Session["user"] | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  
  // Initial session load and auth state changes
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setIsLoading(false)
    })
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setIsLoading(false)
    })
    
    // Cleanup subscription on unmount
    return () => subscription.unsubscribe()
  }, [])
  
  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      if (error) {
        setError(error.message)
      }
    } catch (err) {
      setError('An unexpected error occurred during sign in')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }
  
  // Sign up with email and password
  const signUp = async (email: string, password: string) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password
      })
      
      if (error) {
        setError(error.message)
      }
    } catch (err) {
      setError('An unexpected error occurred during sign up')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }
  
  // Sign out
  const signOut = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        setError(error.message)
      }
    } catch (err) {
      setError('An unexpected error occurred during sign out')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }
  
  // Reset password (send reset email)
  const resetPassword = async (email: string) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      })
      
      if (error) {
        setError(error.message)
      }
    } catch (err) {
      setError('An unexpected error occurred sending password reset email')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }
  
  // Update password
  const updatePassword = async (password: string) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const { error } = await supabase.auth.updateUser({
        password
      })
      
      if (error) {
        setError(error.message)
      }
    } catch (err) {
      setError('An unexpected error occurred updating password')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }
  
  // Clear any auth errors
  const clearError = () => {
    setError(null)
  }
  
  // Provide the auth context
  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        isLoading,
        error,
        signIn,
        signUp,
        signOut,
        resetPassword,
        updatePassword,
        clearError
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

// Custom hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext)
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  
  return context
} 