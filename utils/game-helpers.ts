import { GameProgress, ResourceState } from '@/utils/supabase/context';

// Update a single resource and trigger save
export function updateResource(
  gameProgress: GameProgress,
  resourceType: keyof ResourceState,
  property: string,
  value: number,
  triggerSave: (progress: GameProgress) => void
): GameProgress {
  if (!gameProgress.resources[resourceType]) return gameProgress;
  
  const updatedProgress = {
    ...gameProgress,
    resources: {
      ...gameProgress.resources,
      [resourceType]: {
        ...gameProgress.resources[resourceType],
        [property]: value
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
    resourceType: keyof ResourceState,
    property: string,
    value: number
  }>,
  triggerSave: (progress: GameProgress) => void
): GameProgress {
  let updatedProgress = { ...gameProgress };
  
  // Apply all updates to the copy
  updates.forEach(update => {
    if (!updatedProgress.resources[update.resourceType]) return;
    
    updatedProgress = {
      ...updatedProgress,
      resources: {
        ...updatedProgress.resources,
        [update.resourceType]: {
          ...updatedProgress.resources[update.resourceType],
          [update.property]: update.value
        }
      }
    };
  });
  
  // Trigger save once with all updates
  triggerSave(updatedProgress);
  
  return updatedProgress;
} 