"use client"

import { createContext, useContext, ReactNode, useState, useEffect } from "react";
import { useSession } from "@clerk/nextjs";
import { useDatabase } from "@/contexts/database/DatabaseContext";
import { reportError } from "@/utils/error/error-service";

// Interface for the auth context
interface AuthContextType {
  userId: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  userEmail: string | null;
  error: string | null;
}

// Create the context with default values
const AuthContext = createContext<AuthContextType>({
  userId: null,
  isAuthenticated: false,
  isLoading: true,
  userEmail: null,
  error: null
});

// Provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const { session, isLoaded } = useSession();
  const { supabase, isInitialized } = useDatabase();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Update when session or database initialization changes
  useEffect(() => {
    if (isLoaded) {
      try {
        // Set loading to false once we have session info
        setIsLoading(false);
        
        // Check for database connection if needed
        if (session && !supabase && isInitialized) {
          setError("Database connection error. Please try again later.");
        } else {
          setError(null);
        }
        
        // Log authentication status for debugging
        if (session) {
          console.log('User authenticated with Clerk, user ID:', session.user.id);
        }
      } catch (e) {
        reportError(e);
        setError(`Authentication error: ${e instanceof Error ? e.message : 'Unknown error'}`);
        setIsLoading(false);
      }
    }
  }, [isLoaded, session, supabase, isInitialized]);

  // Context values
  const contextValue: AuthContextType = {
    userId: session?.user?.id || null,
    isAuthenticated: !!session,
    isLoading,
    userEmail: session?.user?.emailAddresses[0]?.emailAddress || null,
    error
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