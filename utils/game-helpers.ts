import { GameProgress } from '@/types/game.types';
import { ResourceType } from '@/types/game.types';
import { RESOURCE_PAGE_MAP } from './constants/game-constants';
import { cloneDeep } from 'lodash';

/**
 * ResourceManager class to handle all resource-related operations
 * This consolidates resource manipulation logic in one place
 */
export class ResourceManager {
  /**
   * Update a single resource property
   */
  static updateResource(
    gameProgress: GameProgress,
    resourceType: ResourceType,
    property: string,
    value: number,
    triggerSave: (progress: GameProgress) => void
  ): GameProgress {
    if (!gameProgress.resources[resourceType]) return gameProgress;
    
    // Current timestamp for the save
    const currentTime = new Date().toISOString();
    
    const updatedProgress = {
      ...gameProgress,
      resources: {
        ...gameProgress.resources,
        [resourceType]: {
          ...gameProgress.resources[resourceType],
          [property]: value,
          latestSave: currentTime // Add timestamp for when this resource was last updated
        }
      }
    };
    
    // Trigger save with debounce
    triggerSave(updatedProgress);
    
    return updatedProgress;
  }

  /**
   * Batch update multiple resources at once
   */
  static batchUpdateResources(
    gameProgress: GameProgress,
    updates: Array<{
      resourceType: ResourceType,
      property: string,
      value: number
    }>,
    triggerSave: (progress: GameProgress) => void
  ): GameProgress {
    let updatedProgress = cloneDeep(gameProgress);
    
    // Current timestamp for the save
    const currentTime = new Date().toISOString();
    
    // Apply all updates to the copy
    updates.forEach(update => {
      if (!updatedProgress.resources[update.resourceType]) return;
      
      updatedProgress = {
        ...updatedProgress,
        resources: {
          ...updatedProgress.resources,
          [update.resourceType]: {
            ...updatedProgress.resources[update.resourceType],
            [update.property]: update.value,
            latestSave: currentTime // Add timestamp for when this resource was last updated
          }
        }
      };
    });
    
    // Trigger save once with all updates
    triggerSave(updatedProgress);
    
    return updatedProgress;
  }
  
  /**
   * Check if a resource has enough amount for a cost
   */
  static hasEnoughResource(
    gameProgress: GameProgress,
    resourceType: ResourceType,
    cost: number
  ): boolean {
    const currentAmount = gameProgress.resources[resourceType]?.amount || 0;
    return currentAmount >= cost;
  }
  
  /**
   * Get the current value of a resource property
   */
  static getResourceProperty(
    gameProgress: GameProgress,
    resourceType: ResourceType,
    property: string
  ): number {
    return (gameProgress.resources[resourceType] as any)?.[property] || 0;
  }
  
  /**
   * Get the auto-generation property name for a resource type
   */
  static getAutoGenProperty(resourceType: ResourceType): string {
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
  }
}

// Legacy function for backward compatibility
export function updateResource(
  gameProgress: GameProgress,
  resourceType: ResourceType,
  property: string,
  value: number,
  triggerSave: (progress: GameProgress) => void
): GameProgress {
  return ResourceManager.updateResource(gameProgress, resourceType, property, value, triggerSave);
}

// Legacy function for backward compatibility
export function batchUpdateResources(
  gameProgress: GameProgress,
  updates: Array<{
    resourceType: ResourceType,
    property: string,
    value: number
  }>,
  triggerSave: (progress: GameProgress) => void
): GameProgress {
  return ResourceManager.batchUpdateResources(gameProgress, updates, triggerSave);
}

// Get the page name from a resource type
export function getPageFromResourceType(resourceType: ResourceType): string {
  return RESOURCE_PAGE_MAP[resourceType] || '';
} 