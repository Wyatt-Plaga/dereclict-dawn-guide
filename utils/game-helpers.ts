import { GameProgress } from '@/types/game.types';
import { ResourceType } from '@/types/game.types';
import { RESOURCE_PAGE_MAP } from './constants/game-constants';

// Update a single resource and trigger save
export function updateResource(
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

// Batch update multiple resources at once
export function batchUpdateResources(
  gameProgress: GameProgress,
  updates: Array<{
    resourceType: ResourceType,
    property: string,
    value: number
  }>,
  triggerSave: (progress: GameProgress) => void
): GameProgress {
  let updatedProgress = { ...gameProgress };
  
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

// Get the page name from a resource type
export function getPageFromResourceType(resourceType: ResourceType): string {
  return RESOURCE_PAGE_MAP[resourceType] || '';
} 