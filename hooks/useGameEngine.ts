import { useEffect, useState } from 'react';
import { useGameStore } from '@/store/rootStore';
import { ResourceType } from '@/types/game.types';
import { GameEngine } from '@/engine/GameEngine';
import { ResourceProperties, Resource } from '@/engine/interfaces';
import { GameStore } from '@/store/types';

/**
 * Singleton instance of GameEngine
 */
let gameEngine: GameEngine | null = null;

/**
 * Hook to interact with the Game Engine
 * @returns Game engine utilities and actions
 */
export const useGameEngine = () => {
  // Get the game store for updates
  const store = useGameStore() as GameStore;
  
  // State to track initialization
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Initialize the engine if it doesn't exist
  useEffect(() => {
    if (!gameEngine) {
      // Create the engine instance
      gameEngine = GameEngine.getInstance();
      
      // Initial sync from store to engine
      syncStoreToEngine();
      
      setIsInitialized(true);
    } else {
      setIsInitialized(true);
    }
    
    // Set up manual sync from engine to store whenever resources change
    // We'll use a simple interval instead of a complex event system for now
    const syncInterval = setInterval(() => {
      syncEngineToStore();
    }, 1000); // Sync every second
    
    // Clean up on unmount
    return () => {
      clearInterval(syncInterval);
    };
  }, []);
  
  /**
   * Sync resources from store to engine
   */
  const syncStoreToEngine = () => {
    if (!gameEngine) return;
    
    const { resources } = store;
    
    // Update engine resources from store
    if (resources.energy) {
      updateEngineResource('energy', resources.energy.amount, resources.energy.capacity);
    }
    
    if (resources.crew) {
      updateEngineResource('crew', resources.crew.amount, resources.crew.capacity);
    }
    
    if (resources.scrap) {
      updateEngineResource('scrap', resources.scrap.amount, resources.scrap.capacity);
    }
    
    if (resources.insight) {
      updateEngineResource('insight', resources.insight.amount, resources.insight.capacity);
    }
  };
  
  /**
   * Sync resources from engine to store
   */
  const syncEngineToStore = () => {
    if (!gameEngine) return;
    
    // Get all resources from the engine
    const resources = gameEngine.getAllResources();
    
    // Update resources in the store
    resources.forEach(resource => {
      const { id, amount, capacity } = resource.properties;
      
      // Map engine resource to store resource
      if (id === 'energy' || id === 'crew' || id === 'scrap' || id === 'insight') {
        const resourceType = id as ResourceType;
        
        // Only update if values have changed
        const storeResource = store.resources[resourceType];
        if (storeResource && (storeResource.amount !== amount || storeResource.capacity !== capacity)) {
          store.updateResource(resourceType, 'amount', amount);
          store.updateResource(resourceType, 'capacity', capacity);
        }
      }
    });
  };
  
  /**
   * Helper method to update an engine resource
   */
  const updateEngineResource = (id: string, amount: number, capacity: number): void => {
    if (!gameEngine) return;
    
    const resource = gameEngine.getResource(id);
    if (resource) {
      // Only update if values are different to avoid loops
      if (resource.getAmount() !== amount || resource.getCapacity() !== capacity) {
        resource.update({
          amount,
          capacity,
          lastUpdated: new Date().toISOString()
        });
      }
    }
  };
  
  /**
   * Update a resource in the game engine
   * @param resourceId Resource ID to update
   * @param amount Amount to change by (can be positive or negative)
   */
  const updateResource = (resourceId: string, amount: number): boolean => {
    if (!gameEngine) return false;
    
    const result = gameEngine.updateResource(resourceId, amount);
    
    // Sync changes to store immediately
    syncEngineToStore();
    
    return result;
  };
  
  /**
   * Get resource details from the game engine
   * @param resourceId Resource ID to get
   */
  const getResource = (resourceId: string): ResourceProperties | null => {
    if (!gameEngine) return null;
    
    const resource = gameEngine.getResource(resourceId);
    return resource?.properties || null;
  };
  
  /**
   * Process offline progress
   * @param elapsedTime Time elapsed in milliseconds
   */
  const processOfflineProgress = (elapsedTime: number): void => {
    // Currently, the Game Engine automatically calculates resource changes
    // based on rates when it starts up, so we don't need to do anything here
    // except sync the results to the store
    syncEngineToStore();
  };
  
  /**
   * Modify a resource by a relative amount
   * This is a convenience method that handles both positive and negative amounts
   * @param resourceType Resource type to modify
   * @param amount Amount to change by
   */
  const modifyResource = (resourceType: ResourceType, amount: number): boolean => {
    return updateResource(resourceType, amount);
  };
  
  /**
   * Check if a resource cost can be afforded
   * @param costs Cost record mapping resource types to required amounts
   */
  const canAffordCost = (costs: Record<ResourceType, number>): boolean => {
    if (!gameEngine) return false;
    
    for (const [resourceType, amount] of Object.entries(costs)) {
      const resource = getResource(resourceType);
      if (!resource || resource.amount < amount) {
        return false;
      }
    }
    
    return true;
  };
  
  /**
   * Deduct a cost from resources
   * @param costs Cost record mapping resource types to required amounts
   */
  const deductCost = (costs: Record<ResourceType, number>): boolean => {
    if (!canAffordCost(costs)) return false;
    
    let success = true;
    for (const [resourceType, amount] of Object.entries(costs)) {
      if (!updateResource(resourceType, -amount)) {
        success = false;
      }
    }
    
    return success;
  };

  return {
    isInitialized,
    updateResource,
    getResource,
    processOfflineProgress,
    modifyResource,
    canAffordCost,
    deductCost,
    syncEngineToStore,
    syncStoreToEngine,
  };
}; 