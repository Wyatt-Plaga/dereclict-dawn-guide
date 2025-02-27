"use client"

import { createContext, useContext, ReactNode, useCallback, useState, useEffect } from "react";
import { useSession } from "@clerk/nextjs";
import { useDatabase } from "@/contexts/database/DatabaseContext";
import { reportError } from "@/utils/error/error-service";

// Interface for the auth context
interface AuthContextType {
  userId: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  userEmail: string | null;
  userProfile: any | null; // Type will depend on your profile structure
  error: string | null;
  refreshUserProfile: () => Promise<void>;
}

// Create the context with default values
const AuthContext = createContext<AuthContextType>({
  userId: null,
  isAuthenticated: false,
  isLoading: true,
  userEmail: null,
  userProfile: null,
  error: null,
  refreshUserProfile: async () => {}
});

// Provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const { session, isLoaded } = useSession();
  const { supabase, isInitialized } = useDatabase();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<any | null>(null);

  // Load user profile from Supabase
  const loadUserProfile = useCallback(async () => {
    if (!supabase || !session?.user?.id) {
      return null;
    }

    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', session.user.id)
        .single();

      if (error) {
        // If no profile exists, create one
        if (error.code === 'PGRST116') {
          const { data: newProfile, error: createError } = await supabase
            .from('user_profiles')
            .insert({
              user_id: session.user.id,
              email: session.user.emailAddresses[0]?.emailAddress || null,
              display_name: session.user.firstName || 'Anonymous Explorer',
              created_at: new Date().toISOString(),
              last_login: new Date().toISOString()
            })
            .select();

          if (createError) {
            reportError(createError);
            setError(`Failed to create user profile: ${createError.message}`);
            return null;
          }

          setUserProfile(newProfile[0]);
          return newProfile[0];
        } else {
          reportError(error);
          setError(`Failed to load user profile: ${error.message}`);
          return null;
        }
      }

      setUserProfile(data);
      return data;
    } catch (e) {
      reportError(e);
      setError(`Error loading user profile: ${e instanceof Error ? e.message : 'Unknown error'}`);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [supabase, session]);

  // Function to refresh user profile
  const refreshUserProfile = useCallback(async () => {
    await loadUserProfile();
  }, [loadUserProfile]);

  // Update last login timestamp
  const updateLastLogin = useCallback(async () => {
    if (!supabase || !session?.user?.id) return;
    
    try {
      await supabase
        .from('user_profiles')
        .update({ last_login: new Date().toISOString() })
        .eq('user_id', session.user.id);
    } catch (e) {
      reportError(e);
    }
  }, [supabase, session]);

  // Load user profile on session change
  useEffect(() => {
    if (isLoaded && session && isInitialized) {
      loadUserProfile();
      updateLastLogin();
    } else if (isLoaded && !session) {
      setUserProfile(null);
      setIsLoading(false);
    }
  }, [isLoaded, session, isInitialized, loadUserProfile, updateLastLogin]);

  // Context values
  const contextValue: AuthContextType = {
    userId: session?.user?.id || null,
    isAuthenticated: !!session,
    isLoading,
    userEmail: session?.user?.emailAddresses[0]?.emailAddress || null,
    userProfile,
    error,
    refreshUserProfile
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 