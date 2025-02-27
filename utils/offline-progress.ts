import { GameProgress, ResourceType } from '@/types/game.types';
import { ResourceManager } from './managers/ResourceManager';

// Re-export ResourceManager methods for backward compatibility
export const calculateResourceOfflineProgress = ResourceManager.calculateResourceOfflineProgress;
export const calculateOfflineProgress = ResourceManager.calculateOfflineProgress; 