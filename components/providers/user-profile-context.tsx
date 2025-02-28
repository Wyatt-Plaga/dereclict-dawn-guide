"use client"

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode
} from "react"
import { useAuth } from "@/components/providers/auth-context"
import { useDatabase } from "@/components/providers/database-context"

// Define user profile types
export interface UserProfile {
  id: string
  user_id: string
  display_name: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
  preferences: UserPreferences
  last_login: string
  tutorial_completed: boolean
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system'
  notifications_enabled: boolean
  sound_enabled: boolean
  auto_save: boolean
}

// Default user preferences
const DEFAULT_USER_PREFERENCES: UserPreferences = {
  theme: 'system',
  notifications_enabled: true,
  sound_enabled: true,
  auto_save: true
}

// Context type definition
interface UserProfileContextType {
  // Profile data
  profile: UserProfile | null
  isLoading: boolean
  error: string | null
  
  // Profile actions
  updateProfile: (data: Partial<UserProfile>) => Promise<void>
  updatePreferences: (preferences: Partial<UserPreferences>) => Promise<void>
  resetProfile: () => Promise<void>
  
  // Utility functions
  getDisplayName: () => string
  getAvatarUrl: () => string | null
  hasCompletedTutorial: () => boolean
  markTutorialCompleted: () => Promise<void>
}

// Create the context with default values
const UserProfileContext = createContext<UserProfileContextType>({
  profile: null,
  isLoading: false,
  error: null,
  
  updateProfile: async () => {},
  updatePreferences: async () => {},
  resetProfile: async () => {},
  
  getDisplayName: () => "Guest",
  getAvatarUrl: () => null,
  hasCompletedTutorial: () => false,
  markTutorialCompleted: async () => {}
})

// Provider component
export function UserProfileProvider({ children }: { children: ReactNode }) {
  const { user, session } = useAuth()
  const { select, upsert, update, error: dbError } = useDatabase()
  
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  
  // Load user profile when user signs in
  useEffect(() => {
    if (user) {
      loadUserProfile()
    } else {
      setProfile(null)
      setIsLoading(false)
    }
  }, [user])
  
  // Reset error when database error changes
  useEffect(() => {
    if (dbError) {
      setError(dbError)
    }
  }, [dbError])
  
  // Load or create a user profile
  const loadUserProfile = async () => {
    if (!user) return
    
    setIsLoading(true)
    setError(null)
    
    try {
      // Try to fetch existing profile
      const { data, error } = await select(
        'profiles',
        '*',
        { user_id: user.id }
      )
      
      if (error) throw new Error(error.message)
      
      if (data && data.length > 0) {
        // Profile exists, use it
        const userProfile = data[0] as UserProfile
        
        // Ensure preferences has all required fields
        if (!userProfile.preferences) {
          userProfile.preferences = DEFAULT_USER_PREFERENCES
        } else {
          userProfile.preferences = {
            ...DEFAULT_USER_PREFERENCES,
            ...userProfile.preferences
          }
        }
        
        setProfile(userProfile)
      } else {
        // Create new profile
        await createUserProfile()
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load user profile'
      setError(message)
      console.error('Profile loading error:', message)
    } finally {
      setIsLoading(false)
    }
  }
  
  // Create a new user profile
  const createUserProfile = async () => {
    if (!user) return
    
    try {
      const now = new Date().toISOString()
      const newProfile: Omit<UserProfile, 'id' | 'created_at'> = {
        user_id: user.id,
        display_name: user.email?.split('@')[0] || 'User',
        avatar_url: null,
        updated_at: now,
        preferences: DEFAULT_USER_PREFERENCES,
        last_login: now,
        tutorial_completed: false
      }
      
      const { data, error } = await upsert(
        'profiles',
        newProfile,
        'user_id'
      )
      
      if (error) throw new Error(error.message)
      
      if (data && data.length > 0) {
        setProfile(data[0] as UserProfile)
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create user profile'
      setError(message)
      console.error('Profile creation error:', message)
    }
  }
  
  // Update user profile
  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!user || !profile) return
    
    setIsLoading(true)
    setError(null)
    
    try {
      const updateData = {
        ...data,
        updated_at: new Date().toISOString()
      }
      
      // Don't allow updating user_id or id
      delete updateData.user_id
      delete updateData.id
      
      const { data: updatedData, error } = await update(
        'profiles', 
        updateData, 
        { user_id: user.id }
      )
      
      if (error) throw new Error(error.message)
      
      if (updatedData && updatedData.length > 0) {
        setProfile({
          ...profile,
          ...updatedData[0]
        })
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update user profile'
      setError(message)
      console.error('Profile update error:', message)
    } finally {
      setIsLoading(false)
    }
  }
  
  // Update user preferences
  const updatePreferences = async (preferences: Partial<UserPreferences>) => {
    if (!profile) return
    
    const updatedPreferences = {
      ...profile.preferences,
      ...preferences
    }
    
    await updateProfile({ preferences: updatedPreferences })
  }
  
  // Reset profile to defaults (but keep id and user_id)
  const resetProfile = async () => {
    if (!profile) return
    
    const now = new Date().toISOString()
    const resetData: Partial<UserProfile> = {
      display_name: user?.email?.split('@')[0] || 'User',
      avatar_url: null,
      updated_at: now,
      preferences: DEFAULT_USER_PREFERENCES,
      last_login: now,
      tutorial_completed: false
    }
    
    await updateProfile(resetData)
  }
  
  // Get display name with fallback
  const getDisplayName = () => {
    if (profile?.display_name) {
      return profile.display_name
    }
    
    if (user?.email) {
      return user.email.split('@')[0]
    }
    
    return "Guest"
  }
  
  // Get avatar URL with fallback
  const getAvatarUrl = () => {
    return profile?.avatar_url || null
  }
  
  // Check if tutorial is completed
  const hasCompletedTutorial = () => {
    return profile?.tutorial_completed || false
  }
  
  // Mark tutorial as completed
  const markTutorialCompleted = async () => {
    await updateProfile({ tutorial_completed: true })
  }
  
  return (
    <UserProfileContext.Provider
      value={{
        profile,
        isLoading,
        error,
        updateProfile,
        updatePreferences,
        resetProfile,
        getDisplayName,
        getAvatarUrl,
        hasCompletedTutorial,
        markTutorialCompleted
      }}
    >
      {children}
    </UserProfileContext.Provider>
  )
}

// Custom hook to use the user profile context
export function useUserProfile() {
  const context = useContext(UserProfileContext)
  
  if (context === undefined) {
    throw new Error('useUserProfile must be used within a UserProfileProvider')
  }
  
  return context
} 