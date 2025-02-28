"use client"

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback
} from "react"
import { useAuth } from "@/components/providers/auth-context"
import { useDatabase } from "@/components/providers/database-context"
import { useGameStore } from "@/lib/store/store"
import { initialGameState } from "@/lib/store/initialState"
import { toast } from "sonner"

// Types for game progress
export interface GameProgress {
  id: string
  user_id: string
  save_name: string
  game_state: Record<string, any> // The serialized game state
  created_at: string
  updated_at: string
  last_played_at: string
  version: string
  is_auto_save: boolean
}

// Game progress context definition
interface GameProgressContextType {
  // Data
  currentSaveId: string | null
  availableSaves: GameProgress[]
  isLoading: boolean
  error: string | null
  
  // Actions
  saveGame: (saveName?: string, isAutoSave?: boolean) => Promise<boolean>
  loadGame: (saveId: string) => Promise<boolean>
  newGame: () => Promise<boolean>
  deleteSave: (saveId: string) => Promise<boolean>
  
  // Auto-save
  enableAutoSave: () => void
  disableAutoSave: () => void
  
  // Utilities
  formatSaveDate: (date: string) => string
  getCurrentVersion: () => string
}

// Context with default values
const GameProgressContext = createContext<GameProgressContextType>({
  currentSaveId: null,
  availableSaves: [],
  isLoading: false,
  error: null,
  
  saveGame: async () => false,
  loadGame: async () => false,
  newGame: async () => false,
  deleteSave: async () => false,
  
  enableAutoSave: () => {},
  disableAutoSave: () => {},
  
  formatSaveDate: () => "",
  getCurrentVersion: () => "1.0.0"
})

// Current game version
const CURRENT_VERSION = "1.0.0"

// Provider component
export function GameProgressProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const { select, insert, update, delete: deleteRecord, error: dbError } = useDatabase()
  const { setGameState, getState } = useGameStore()
  
  const [currentSaveId, setCurrentSaveId] = useState<string | null>(null)
  const [availableSaves, setAvailableSaves] = useState<GameProgress[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [autoSaveEnabled, setAutoSaveEnabled] = useState<boolean>(true)
  const [autoSaveInterval, setAutoSaveInterval] = useState<NodeJS.Timeout | null>(null)
  
  // Load available saves when user changes
  useEffect(() => {
    if (user) {
      loadAvailableSaves()
    } else {
      setAvailableSaves([])
      setCurrentSaveId(null)
    }
  }, [user])
  
  // Set up auto-save
  useEffect(() => {
    if (autoSaveEnabled && user && currentSaveId) {
      const interval = setInterval(() => {
        saveGame(undefined, true).catch(err => {
          console.error('Auto-save failed:', err)
        })
      }, 5 * 60 * 1000) // Auto-save every 5 minutes
      
      setAutoSaveInterval(interval)
      
      return () => {
        if (interval) clearInterval(interval)
      }
    } else if (autoSaveInterval) {
      clearInterval(autoSaveInterval)
      setAutoSaveInterval(null)
    }
  }, [autoSaveEnabled, user, currentSaveId])
  
  // Reset error when database error changes
  useEffect(() => {
    if (dbError) {
      setError(dbError)
    }
  }, [dbError])
  
  // Load available saves for the current user
  const loadAvailableSaves = async () => {
    if (!user) return
    
    setIsLoading(true)
    setError(null)
    
    try {
      const { data, error } = await select(
        'game_progress',
        '*',
        { user_id: user.id },
        { orderBy: 'updated_at', ascending: false }
      )
      
      if (error) throw new Error(error.message)
      
      if (data) {
        setAvailableSaves(data as GameProgress[])
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load saved games'
      setError(message)
      console.error('Load saves error:', message)
    } finally {
      setIsLoading(false)
    }
  }
  
  // Save current game state
  const saveGame = async (saveName?: string, isAutoSave = false): Promise<boolean> => {
    if (!user) return false
    
    setIsLoading(true)
    setError(null)
    
    try {
      const now = new Date().toISOString()
      const currentState = getState()
      
      // If this is an auto-save but auto-save is disabled, exit
      if (isAutoSave && !autoSaveEnabled) {
        return false
      }
      
      // If we have a current save, update it
      if (currentSaveId) {
        const { data, error } = await update(
          'game_progress',
          {
            game_state: currentState,
            updated_at: now,
            last_played_at: now,
            version: CURRENT_VERSION,
            is_auto_save: isAutoSave
          },
          { id: currentSaveId }
        )
        
        if (error) throw new Error(error.message)
        
        if (!isAutoSave) {
          toast.success('Game saved successfully')
        }
        
        // Refresh available saves
        await loadAvailableSaves()
        return true
      } 
      // Otherwise create a new save
      else {
        const name = saveName || `Save ${new Date().toLocaleDateString()}`
        
        const newSave = {
          user_id: user.id,
          save_name: name,
          game_state: currentState,
          created_at: now,
          updated_at: now,
          last_played_at: now,
          version: CURRENT_VERSION,
          is_auto_save: isAutoSave
        }
        
        const { data, error } = await insert('game_progress', newSave)
        
        if (error) throw new Error(error.message)
        
        if (data && data.length > 0) {
          setCurrentSaveId(data[0].id)
          if (!isAutoSave) {
            toast.success('Game saved successfully')
          }
        }
        
        // Refresh available saves
        await loadAvailableSaves()
        return true
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save game'
      setError(message)
      console.error('Save game error:', message)
      toast.error(`Failed to save game: ${message}`)
      return false
    } finally {
      setIsLoading(false)
    }
  }
  
  // Load a saved game
  const loadGame = async (saveId: string): Promise<boolean> => {
    if (!user) return false
    
    setIsLoading(true)
    setError(null)
    
    try {
      const { data, error } = await select(
        'game_progress',
        '*',
        { id: saveId, user_id: user.id }
      )
      
      if (error) throw new Error(error.message)
      
      if (data && data.length > 0) {
        const savedGame = data[0] as GameProgress
        
        // Check version compatibility
        if (savedGame.version && savedGame.version !== CURRENT_VERSION) {
          console.warn(`Loading save from version ${savedGame.version} (current: ${CURRENT_VERSION})`)
          // You might want to implement migration logic here
        }
        
        // Load the saved state into the store
        setGameState(savedGame.game_state)
        
        // Update last played time
        await update(
          'game_progress',
          { last_played_at: new Date().toISOString() },
          { id: saveId }
        )
        
        setCurrentSaveId(saveId)
        toast.success('Game loaded successfully')
        
        return true
      } else {
        throw new Error('Save not found or belongs to another user')
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load game'
      setError(message)
      console.error('Load game error:', message)
      toast.error(`Failed to load game: ${message}`)
      return false
    } finally {
      setIsLoading(false)
    }
  }
  
  // Start a new game
  const newGame = async (): Promise<boolean> => {
    setIsLoading(true)
    setError(null)
    
    try {
      // Reset the game state to initial values
      setGameState(initialGameState)
      
      // Clear current save ID
      setCurrentSaveId(null)
      
      // If the user is authenticated, create a new save
      if (user) {
        return await saveGame('New Game', false)
      }
      
      return true
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to start new game'
      setError(message)
      console.error('New game error:', message)
      toast.error(`Failed to start new game: ${message}`)
      return false
    } finally {
      setIsLoading(false)
    }
  }
  
  // Delete a save
  const deleteSave = async (saveId: string): Promise<boolean> => {
    if (!user) return false
    
    setIsLoading(true)
    setError(null)
    
    try {
      // Check if we're deleting the current save
      const isCurrentSave = saveId === currentSaveId
      
      const { error } = await deleteRecord(
        'game_progress',
        { id: saveId, user_id: user.id }
      )
      
      if (error) throw new Error(error.message)
      
      // If we deleted the current save, clear current save ID
      if (isCurrentSave) {
        setCurrentSaveId(null)
      }
      
      // Refresh available saves
      await loadAvailableSaves()
      
      toast.success('Save deleted')
      return true
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete save'
      setError(message)
      console.error('Delete save error:', message)
      toast.error(`Failed to delete save: ${message}`)
      return false
    } finally {
      setIsLoading(false)
    }
  }
  
  // Enable auto-save
  const enableAutoSave = useCallback(() => {
    setAutoSaveEnabled(true)
  }, [])
  
  // Disable auto-save
  const disableAutoSave = useCallback(() => {
    setAutoSaveEnabled(false)
  }, [])
  
  // Format a date for display
  const formatSaveDate = (date: string): string => {
    try {
      return new Date(date).toLocaleString()
    } catch (e) {
      return date
    }
  }
  
  // Get current game version
  const getCurrentVersion = (): string => {
    return CURRENT_VERSION
  }
  
  return (
    <GameProgressContext.Provider
      value={{
        currentSaveId,
        availableSaves,
        isLoading,
        error,
        
        saveGame,
        loadGame,
        newGame,
        deleteSave,
        
        enableAutoSave,
        disableAutoSave,
        
        formatSaveDate,
        getCurrentVersion
      }}
    >
      {children}
    </GameProgressContext.Provider>
  )
}

// Custom hook to use the game progress context
export function useGameProgress() {
  const context = useContext(GameProgressContext)
  
  if (context === undefined) {
    throw new Error('useGameProgress must be used within a GameProgressProvider')
  }
  
  return context
} 