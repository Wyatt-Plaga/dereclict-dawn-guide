import { GameProgress, ResourceType } from '@/types/game.types';
import { ResourceManager } from './managers/ResourceManager';

// Re-export ResourceManager methods for backward compatibility
export const updateResource = ResourceManager.updateResource;
export const batchUpdateResources = ResourceManager.batchUpdateResources;
export const getPageFromResourceType = ResourceManager.getPageFromResourceType;

// Additional resource helper functions can be added here if needed 