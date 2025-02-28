"use client"

import { createContext, useContext, ReactNode } from "react"
import { useDatabase } from "@/components/providers/database-context"
import { createSupabaseRepository } from "@/lib/repositories/supabase-repository"
import { BaseRepository } from "@/lib/repositories/base-repository"

// Define repository types
export interface GameProgress {
  id: string
  user_id: string
  save_name: string
  game_state: Record<string, any>
  created_at: string
  updated_at: string
  last_played_at: string
  version: string
  is_auto_save: boolean
}

export interface UserProfile {
  id: string
  user_id: string
  display_name: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
  preferences: Record<string, any>
  last_login: string
  tutorial_completed: boolean
}

export interface ResourceData {
  id: string
  user_id: string
  resource_type: string
  resource_id: string
  amount: number
  capacity: number
  auto_gen_value: number
  created_at: string
  updated_at: string
}

export interface UpgradeData {
  id: string
  user_id: string
  upgrade_id: string
  is_unlocked: boolean
  created_at: string
  updated_at: string
}

export interface LogData {
  id: string
  user_id: string
  log_id: string
  is_unlocked: boolean
  category: string
  created_at: string
  unlocked_at: string | null
}

// Define repositories interface
export interface Repositories {
  gameProgress: BaseRepository<GameProgress>
  userProfile: BaseRepository<UserProfile>
  resources: BaseRepository<ResourceData>
  upgrades: BaseRepository<UpgradeData>
  logs: BaseRepository<LogData>
}

// Create repository context
const RepositoryContext = createContext<Repositories | null>(null)

// Repository provider component
export function RepositoryProvider({ children }: { children: ReactNode }) {
  const { select, insert, update, delete: deleteRecord } = useDatabase()
  
  // Create database interface for repositories
  const db = {
    select,
    insert,
    update,
    delete: deleteRecord
  }
  
  // Initialize repositories
  const repositories: Repositories = {
    // Game progress repository
    gameProgress: createSupabaseRepository<GameProgress>(db, {
      tableName: 'game_progress',
      orderBy: 'updated_at',
      ascending: false
    }),
    
    // User profile repository
    userProfile: createSupabaseRepository<UserProfile>(db, {
      tableName: 'profiles'
    }),
    
    // Resources repository
    resources: createSupabaseRepository<ResourceData>(db, {
      tableName: 'resources',
      toDomain: (dbEntity) => ({
        ...dbEntity,
        amount: Number(dbEntity.amount),
        capacity: Number(dbEntity.capacity),
        auto_gen_value: Number(dbEntity.auto_gen_value)
      }),
      toDatabase: (domainEntity) => ({
        ...domainEntity,
        amount: domainEntity.amount !== undefined ? String(domainEntity.amount) : undefined,
        capacity: domainEntity.capacity !== undefined ? String(domainEntity.capacity) : undefined,
        auto_gen_value: domainEntity.auto_gen_value !== undefined ? String(domainEntity.auto_gen_value) : undefined
      })
    }),
    
    // Upgrades repository
    upgrades: createSupabaseRepository<UpgradeData>(db, {
      tableName: 'upgrades',
      toDomain: (dbEntity) => ({
        ...dbEntity,
        is_unlocked: Boolean(dbEntity.is_unlocked)
      })
    }),
    
    // Logs repository
    logs: createSupabaseRepository<LogData>(db, {
      tableName: 'logs',
      orderBy: 'unlocked_at',
      ascending: false,
      toDomain: (dbEntity) => ({
        ...dbEntity,
        is_unlocked: Boolean(dbEntity.is_unlocked)
      })
    })
  }
  
  return (
    <RepositoryContext.Provider value={repositories}>
      {children}
    </RepositoryContext.Provider>
  )
}

// Custom hook to use repositories
export function useRepositories() {
  const context = useContext(RepositoryContext)
  
  if (!context) {
    throw new Error('useRepositories must be used within a RepositoryProvider')
  }
  
  return context
}

// Hooks for specific repositories
export function useGameProgressRepository() {
  return useRepositories().gameProgress
}

export function useUserProfileRepository() {
  return useRepositories().userProfile
}

export function useResourcesRepository() {
  return useRepositories().resources
}

export function useUpgradesRepository() {
  return useRepositories().upgrades
}

export function useLogsRepository() {
  return useRepositories().logs
} 