import { GameProgress, ResourceState, ResourceType } from '@/types/game.types';

// Store version for migration purposes
export const STORE_VERSION = 1;

// Root state interface
export interface RootState {
  game: GameState;
  version: number;
}

// Game state interface
export interface GameState {
  resources: ResourceState;
  upgrades: Record<string, boolean>;
  unlockedLogs: number[];
  lastOnline: string; // ISO timestamp
  pageTimestamps: Record<string, string>; // Timestamps for when each page was last visited
  isLoading: boolean;
  error: string | null;
  version?: number; // Optional version field for migrations
}

// Game actions interface
export interface GameActions {
  // Resource actions
  updateResource: (resourceType: ResourceType, property: string, value: number) => void;
  batchUpdateResources: (updates: Array<{
    resourceType: ResourceType,
    property: string,
    value: number
  }>) => void;
  
  // Upgrade actions
  unlockUpgrade: (upgradeId: string) => void;
  
  // Log actions
  unlockLog: (logId: number) => void;
  
  // Page actions
  updatePageTimestamp: (pageName: string) => void;
  
  // General state actions
  setGameState: (gameProgress: GameProgress) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  resetError: () => void;
}

// Combined store type
export type GameStore = GameState & GameActions; 