"use client"

import { useSession } from "@clerk/nextjs";
import { SupabaseClient, createClient } from "@supabase/supabase-js";
import { createContext, useContext, useMemo, ReactNode, useState, useEffect } from "react";
import { reportError } from "@/utils/error/error-service";

// Interface for the database context
interface DatabaseContextType {
  supabase: SupabaseClient | null;
  isInitialized: boolean;
  loading: boolean;
  error: string | null;
}

// Create the context with default values
const DatabaseContext = createContext<DatabaseContextType>({
  supabase: null,
  isInitialized: false,
  loading: false,
  error: null
});

// Provider component that wraps your app and makes the client available
export function DatabaseProvider({ children }: { children: ReactNode }) {
  const { session, isLoaded } = useSession();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Create the Supabase client
  const supabase = useMemo(() => {
    // Make sure we're using the correct environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('Supabase credentials not found');
      setError('Supabase configuration is missing. Please check your environment variables.');
      return null;
    }
    
    try {
      // Create a basic client
      const client = createClient(supabaseUrl, supabaseKey);
      setIsInitialized(true);
      return client;
    } catch (err) {
      console.error('Error creating Supabase client:', err);
      reportError(err);
      setError(`Failed to initialize Supabase: ${err instanceof Error ? err.message : 'Unknown error'}`);
      return null;
    }
  }, []);  // Only recreate the client when necessary

  // Auth token management
  useEffect(() => {
    // When session changes, update the supabase auth
    if (supabase && session) {
      const updateSupabaseAuth = async () => {
        try {
          console.log('User authenticated with Clerk, session ID:', session.id);
          
          // Since we're not using JWT tokens, we'll rely on the service role in API routes
          // and the user ID for identification without Row Level Security
          
          // Clear any previous errors so the UI shows we're connected
          setError(null);
        } catch (err) {
          console.error('Error in auth handling:', err);
          reportError(err);
          setError(`Authentication error: ${err instanceof Error ? err.message : 'Unknown error'}`);
        } finally {
          setLoading(false);
        }
      };
      
      updateSupabaseAuth();
    } else if (isLoaded) {
      // If session loaded but no session exists
      setLoading(false);
    }
  }, [session, supabase, isLoaded]);

  return (
    <DatabaseContext.Provider value={{ 
      supabase, 
      isInitialized,
      loading,
      error
    }}>
      {children}
    </DatabaseContext.Provider>
  );
}

// Hook to use the Supabase client
export function useDatabase() {
  const context = useContext(DatabaseContext);
  if (context === undefined) {
    throw new Error('useDatabase must be used within a DatabaseProvider');
  }
  return context;
} 