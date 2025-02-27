/**
 * Type for resource identifiers in the game
 */
export type ResourceType = 'energy' | 'insight' | 'crew' | 'scrap';

/**
 * Base interface for all resources
 */
export interface BaseResource {
  amount: number;
  capacity: number;
  latestSave?: string; // ISO timestamp when this resource was last updated
}

/**
 * Interface for energy resource
 */
export interface EnergyResource extends BaseResource {
  autoGeneration: number;
}

/**
 * Interface for insight resource
 */
export interface InsightResource extends BaseResource {
  autoGeneration: number;
}

/**
 * Interface for crew resource
 */
export interface CrewResource extends BaseResource {
  workerCrews: number;
}

/**
 * Interface for scrap resource
 */
export interface ScrapResource extends BaseResource {
  manufacturingBays: number;
}

/**
 * Resource state containing all resources
 */
export interface ResourceState {
  energy?: EnergyResource;
  insight?: InsightResource;
  crew?: CrewResource;
  scrap?: ScrapResource;
}

/**
 * Type guard to check if resource is energy
 */
export function isEnergyResource(resource: any): resource is EnergyResource {
  return resource && 'autoGeneration' in resource && !('workerCrews' in resource) && !('manufacturingBays' in resource);
}

/**
 * Type guard to check if resource is insight
 */
export function isInsightResource(resource: any): resource is InsightResource {
  return resource && 'autoGeneration' in resource && !('workerCrews' in resource) && !('manufacturingBays' in resource);
}

/**
 * Type guard to check if resource is crew
 */
export function isCrewResource(resource: any): resource is CrewResource {
  return resource && 'workerCrews' in resource;
}

/**
 * Type guard to check if resource is scrap
 */
export function isScrapResource(resource: any): resource is ScrapResource {
  return resource && 'manufacturingBays' in resource;
}

/**
 * Interface for game progress
 */
export interface GameProgress {
  resources: ResourceState;
  upgrades: Record<string, boolean>;
  unlockedLogs: number[];
  lastOnline: string; // ISO timestamp
  page_timestamps?: Record<string, string>; // Timestamps for when each page was last visited
} 