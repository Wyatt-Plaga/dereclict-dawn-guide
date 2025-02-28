import { GameStore } from './types';
import { ResourceType, isEnergyResource, isInsightResource } from '@/types/game.types';

/**
 * Selectors for the game store
 * These provide optimized ways to access common data patterns from the store
 */

// Resource selectors
export const selectResource = (state: GameStore, resourceType: ResourceType) => 
  state.resources[resourceType];

export const selectResourceAmount = (state: GameStore, resourceType: ResourceType) => 
  state.resources[resourceType]?.amount || 0;

export const selectResourceCapacity = (state: GameStore, resourceType: ResourceType) => 
  state.resources[resourceType]?.capacity || 0;

export const selectResourceGeneration = (state: GameStore, resourceType: ResourceType) => {
  const resource = state.resources[resourceType];
  
  if (!resource) return 0;
  
  // Return autoGeneration for energy and insight, or zero for other resources
  if (resourceType === 'energy' || resourceType === 'insight') {
    return (resource as any).autoGeneration || 0;
  }
  
  return 0;
};

export const selectWorkerCrews = (state: GameStore) => 
  state.resources.crew?.workerCrews || 0;

export const selectManufacturingBays = (state: GameStore) => 
  state.resources.scrap?.manufacturingBays || 0;

export const selectAllResources = (state: GameStore) => state.resources;

// Upgrade selectors
export const selectUpgrade = (state: GameStore, upgradeId: string) => 
  state.upgrades[upgradeId] || false;

export const selectUpgrades = (state: GameStore) => state.upgrades;

export const selectUpgradeCategories = (state: GameStore, category: string) => {
  const filtered: Record<string, boolean> = {};
  
  Object.entries(state.upgrades).forEach(([id, unlocked]) => {
    if (id.startsWith(`${category}-`)) {
      filtered[id] = unlocked;
    }
  });
  
  return filtered;
};

// Log selectors
export const selectUnlockedLogs = (state: GameStore) => state.unlockedLogs;

export const selectIsLogUnlocked = (state: GameStore, logId: number) => 
  state.unlockedLogs.includes(logId);

// Page selectors
export const selectAvailablePages = (state: GameStore) => state.availablePages;

export const selectIsPageAvailable = (state: GameStore, pageName: string) => 
  state.availablePages.includes(pageName);

export const selectPageTimestamp = (state: GameStore, pageName: string) => 
  state.pageTimestamps[pageName] || null;

// Game state selectors
export const selectLastOnline = (state: GameStore) => state.lastOnline;

export const selectIsLoading = (state: GameStore) => state.isLoading;

export const selectError = (state: GameStore) => state.error; 