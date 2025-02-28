import { useCallback } from 'react';
import { useGameStore } from '@/store/rootStore';
import { ResourceType } from '@/types/game.types';

/**
 * Custom hook for accessing and manipulating game resources
 */
export function useGameResources() {
  // Select parts of the state
  const resources = useGameStore(state => state.resources);
  const updateResource = useGameStore(state => state.updateResource);
  const batchUpdateResources = useGameStore(state => state.batchUpdateResources);
  
  /**
   * Get the amount of a specific resource
   */
  const getResourceAmount = useCallback((resourceType: ResourceType): number => {
    return resources[resourceType]?.amount || 0;
  }, [resources]);
  
  /**
   * Get the capacity of a specific resource
   */
  const getResourceCapacity = useCallback((resourceType: ResourceType): number => {
    return resources[resourceType]?.capacity || 0;
  }, [resources]);
  
  /**
   * Check if a resource has enough amount for a cost
   */
  const hasEnoughResource = useCallback((resourceType: ResourceType, cost: number): boolean => {
    return getResourceAmount(resourceType) >= cost;
  }, [getResourceAmount]);
  
  /**
   * Get the auto-generation property value for a resource type
   */
  const getAutoGeneration = useCallback((resourceType: ResourceType): number => {
    switch (resourceType) {
      case 'energy':
      case 'insight':
        return (resources[resourceType] as any)?.autoGeneration || 0;
      case 'crew':
        return (resources[resourceType] as any)?.workerCrews || 0;
      case 'scrap':
        return (resources[resourceType] as any)?.manufacturingBays || 0;
      default:
        return 0;
    }
  }, [resources]);
  
  /**
   * Get the auto-generation property name for a resource type
   */
  const getAutoGenPropertyName = useCallback((resourceType: ResourceType): string => {
    switch (resourceType) {
      case 'energy':
      case 'insight':
        return 'autoGeneration';
      case 'crew':
        return 'workerCrews';
      case 'scrap':
        return 'manufacturingBays';
      default:
        return 'autoGeneration';
    }
  }, []);
  
  return {
    resources,
    updateResource,
    batchUpdateResources,
    getResourceAmount,
    getResourceCapacity,
    hasEnoughResource,
    getAutoGeneration,
    getAutoGenPropertyName
  };
} 