"use client"

import { 
  createContext, 
  useContext, 
  useState, 
  useEffect, 
  ReactNode 
} from "react"
import { 
  createClient, 
  SupabaseClient, 
  PostgrestResponse,
  PostgrestError,
  PostgrestSingleResponse
} from "@supabase/supabase-js"
import { useAuth } from "@/components/providers/auth-context"

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

// Define generic database operation types
export type InsertOperation<T> = (tableName: string, data: T) => Promise<PostgrestResponse<T>>
export type UpsertOperation<T> = (tableName: string, data: T, onConflict?: string) => Promise<PostgrestResponse<T>>
export type UpdateOperation<T> = (
  tableName: string, 
  data: Partial<T>, 
  eq: Record<string, any>
) => Promise<PostgrestResponse<T>>
export type SelectOperation<T> = (
  tableName: string, 
  columns: string, 
  eq?: Record<string, any>, 
  options?: {
    limit?: number,
    offset?: number,
    orderBy?: string,
    ascending?: boolean
  }
) => Promise<PostgrestResponse<T>>
export type DeleteOperation = (
  tableName: string, 
  eq: Record<string, any>
) => Promise<PostgrestResponse<null>>

// Create dummy error for default context values
const dummyError: PostgrestError = {
  message: '',
  details: '',
  hint: '',
  code: '',
  name: 'PostgrestError'
}

// Define the DatabaseContext shape
interface DatabaseContextType {
  // Core DB operations
  insert: InsertOperation<any>
  upsert: UpsertOperation<any>
  update: UpdateOperation<any>
  select: SelectOperation<any>
  delete: DeleteOperation
  
  // Utility operations
  executeRpc: <T = any>(
    functionName: string, 
    params: Record<string, any>
  ) => Promise<PostgrestSingleResponse<T>>
  
  // Raw access (use with caution)
  supabase: SupabaseClient
  
  // State
  isConnected: boolean
  isLoading: boolean
  error: string | null
  clearError: () => void
}

// Create context with default values
const DatabaseContext = createContext<DatabaseContextType>({
  insert: async () => ({ data: null, error: dummyError, count: null, status: 0, statusText: "" }),
  upsert: async () => ({ data: null, error: dummyError, count: null, status: 0, statusText: "" }),
  update: async () => ({ data: null, error: dummyError, count: null, status: 0, statusText: "" }),
  select: async () => ({ data: null, error: dummyError, count: null, status: 0, statusText: "" }),
  delete: async () => ({ data: null, error: dummyError, count: null, status: 0, statusText: "" }),
  executeRpc: async () => ({ data: null, error: dummyError, count: null, status: 0, statusText: "" }),
  supabase: createClient(supabaseUrl, supabaseAnonKey),
  isConnected: false,
  isLoading: false,
  error: null,
  clearError: () => {}
})

// Database provider component
export function DatabaseProvider({ children }: { children: ReactNode }) {
  const { session } = useAuth()
  const [supabase, setSupabase] = useState<SupabaseClient>(() => createClient(supabaseUrl, supabaseAnonKey))
  const [isConnected, setIsConnected] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  
  // Re-initialize supabase client when session changes
  useEffect(() => {
    // Create a new supabase client with the current session
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true
      },
      global: {
        headers: session ? {
          Authorization: `Bearer ${session.access_token}`
        } : undefined
      }
    })
    
    setSupabase(supabaseClient)
    
    // Check connection
    checkConnection(supabaseClient).then(connected => {
      setIsConnected(connected)
    })
  }, [session])
  
  // Check database connection by making a simple query
  const checkConnection = async (client: SupabaseClient): Promise<boolean> => {
    try {
      setIsLoading(true)
      // Try to query something simple
      const { error } = await client.from('game_progress').select('created_at', { count: 'exact', head: true }).limit(1)
      
      if (error) {
        console.error('Database connection error:', error)
        setError(error.message)
        return false
      }
      
      return true
    } catch (err) {
      console.error('Unexpected database error:', err)
      setError('Failed to connect to database')
      return false
    } finally {
      setIsLoading(false)
    }
  }
  
  // Insert operation
  const insert: InsertOperation<any> = async (tableName, data) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await supabase.from(tableName).insert(data).select()
      
      if (response.error) {
        setError(response.error.message)
      }
      
      return response
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error during insert'
      setError(errorMessage)
      return {
        data: null,
        error: { 
          message: errorMessage,
          details: '',
          hint: '',
          code: 'UNKNOWN_ERROR',
          name: 'PostgrestError'
        } as PostgrestError,
        count: null,
        status: 500,
        statusText: 'Error'
      }
    } finally {
      setIsLoading(false)
    }
  }
  
  // Upsert operation
  const upsert: UpsertOperation<any> = async (tableName, data, onConflict) => {
    setIsLoading(true)
    setError(null)
    
    try {
      // Create the base upsert query
      const query = supabase.from(tableName).upsert(data)
      
      // Set up the query with or without onConflict
      let finalQuery;
      if (onConflict) {
        // TypeScript doesn't recognize this method, but it exists in the Supabase API
        // So we need to use 'any' to bypass type checking
        finalQuery = (query as any).onConflict(onConflict);
      } else {
        finalQuery = query;
      }
      
      const response = await finalQuery.select()
      
      if (response.error) {
        setError(response.error.message)
      }
      
      return response
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error during upsert'
      setError(errorMessage)
      return {
        data: null,
        error: { 
          message: errorMessage,
          details: '',
          hint: '',
          code: 'UNKNOWN_ERROR',
          name: 'PostgrestError'
        } as PostgrestError,
        count: null,
        status: 500,
        statusText: 'Error'
      }
    } finally {
      setIsLoading(false)
    }
  }
  
  // Update operation
  const update: UpdateOperation<any> = async (tableName, data, eq) => {
    setIsLoading(true)
    setError(null)
    
    try {
      let query = supabase.from(tableName).update(data)
      
      // Apply all equality filters
      Object.entries(eq).forEach(([column, value]) => {
        query = query.eq(column, value)
      })
      
      const response = await query.select()
      
      if (response.error) {
        setError(response.error.message)
      }
      
      return response
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error during update'
      setError(errorMessage)
      return {
        data: null,
        error: { 
          message: errorMessage,
          details: '',
          hint: '',
          code: 'UNKNOWN_ERROR',
          name: 'PostgrestError'
        } as PostgrestError,
        count: null,
        status: 500,
        statusText: 'Error'
      }
    } finally {
      setIsLoading(false)
    }
  }
  
  // Select operation
  const select: SelectOperation<any> = async (tableName, columns, eq, options) => {
    setIsLoading(true)
    setError(null)
    
    try {
      let query = supabase.from(tableName).select(columns)
      
      // Apply equality filters if provided
      if (eq) {
        Object.entries(eq).forEach(([column, value]) => {
          query = query.eq(column, value)
        })
      }
      
      // Apply options if provided
      if (options) {
        if (options.limit !== undefined) {
          query = query.limit(options.limit)
        }
        
        if (options.offset !== undefined) {
          query = query.range(options.offset, options.offset + (options.limit || 10) - 1)
        }
        
        if (options.orderBy) {
          query = query.order(options.orderBy, { ascending: options.ascending ?? true })
        }
      }
      
      const response = await query
      
      if (response.error) {
        setError(response.error.message)
      }
      
      return response
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error during select'
      setError(errorMessage)
      return {
        data: null,
        error: { 
          message: errorMessage,
          details: '',
          hint: '',
          code: 'UNKNOWN_ERROR',
          name: 'PostgrestError'
        } as PostgrestError,
        count: null,
        status: 500,
        statusText: 'Error'
      }
    } finally {
      setIsLoading(false)
    }
  }
  
  // Delete operation
  const deleteOperation: DeleteOperation = async (tableName, eq) => {
    setIsLoading(true)
    setError(null)
    
    try {
      let query = supabase.from(tableName).delete()
      
      // Apply all equality filters
      Object.entries(eq).forEach(([column, value]) => {
        query = query.eq(column, value)
      })
      
      const response = await query.select()
      
      if (response.error) {
        setError(response.error.message)
      }
      
      return response as unknown as PostgrestResponse<null>
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error during delete'
      setError(errorMessage)
      return {
        data: null,
        error: { 
          message: errorMessage,
          details: '',
          hint: '',
          code: 'UNKNOWN_ERROR',
          name: 'PostgrestError'
        } as PostgrestError,
        count: null,
        status: 500,
        statusText: 'Error'
      }
    } finally {
      setIsLoading(false)
    }
  }
  
  // Execute RPC function
  const executeRpc = async <T,>(functionName: string, params: Record<string, any>): Promise<PostgrestSingleResponse<T>> => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await supabase.rpc(functionName, params)
      
      if (response.error) {
        setError(response.error.message)
      }
      
      return response
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error during RPC call'
      setError(errorMessage)
      return {
        data: null,
        error: { 
          message: errorMessage,
          details: '',
          hint: '',
          code: 'UNKNOWN_ERROR',
          name: 'PostgrestError'
        } as PostgrestError,
        count: null,
        status: 500,
        statusText: 'Error'
      }
    } finally {
      setIsLoading(false)
    }
  }
  
  // Clear any database errors
  const clearError = () => {
    setError(null)
  }
  
  // Provide the database context
  return (
    <DatabaseContext.Provider
      value={{
        insert,
        upsert,
        update,
        select,
        delete: deleteOperation,
        executeRpc,
        supabase,
        isConnected,
        isLoading,
        error,
        clearError
      }}
    >
      {children}
    </DatabaseContext.Provider>
  )
}

// Custom hook to use the database context
export function useDatabase() {
  const context = useContext(DatabaseContext)
  
  if (context === undefined) {
    throw new Error('useDatabase must be used within a DatabaseProvider')
  }
  
  return context
} 