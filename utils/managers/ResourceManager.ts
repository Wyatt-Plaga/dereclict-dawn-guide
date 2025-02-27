import { 
  GameProgress, 
  ResourceType, 
  EnergyResource,
  InsightResource,
  CrewResource,
  ScrapResource,
  isEnergyResource, 
  isInsightResource, 
  isCrewResource, 
  isScrapResource 
} from '@/types/game.types';
import { 
  RESOURCE_PAGE_MAP, 
  RESOURCE_GENERATION_RATES, 
  TIME_CONSTANTS,
  DEFAULT_RESOURCE_VALUES 
} from '../constants/game-constants';
import { Logger } from '../logging/Logger';
import cloneDeep from 'lodash.clonedeep';

// Create a logger instance for ResourceManager
const logger = new Logger('ResourceManager');

/**
 * ResourceManager class handles all resource-related operations
 * including updates, validation, and calculations
 */
export class ResourceManager {
  /**
   * Update a single resource and optionally trigger save
   * @param gameProgress The current game progress
   * @param resourceType The resource type to update
   * @param property The property to update
   * @param value The new value
   * @param triggerSave Optional callback to save game progress
   * @returns Updated GameProgress object
   */
  static updateResource(
    gameProgress: GameProgress,
    resourceType: ResourceType,
    property: string,
    value: number,
    triggerSave?: (progress: GameProgress) => void
  ): GameProgress {
    if (!gameProgress.resources[resourceType]) {
      logger.warn(`Attempted to update non-existent resource: ${resourceType}`);
      return gameProgress;
    }
    
    logger.debug(`Updating ${resourceType}.${property} to ${value}`);
    
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
    
    // Trigger save with debounce if callback provided
    if (triggerSave) {
      logger.debug(`Triggering save for ${resourceType} update`);
      triggerSave(updatedProgress);
    }
    
    return updatedProgress;
  }

  /**
   * Batch update multiple resources at once
   * @param gameProgress The current game progress
   * @param updates Array of updates to apply
   * @param triggerSave Optional callback to save game progress
   * @returns Updated GameProgress object
   */
  static batchUpdateResources(
    gameProgress: GameProgress,
    updates: Array<{
      resourceType: ResourceType,
      property: string,
      value: number
    }>,
    triggerSave?: (progress: GameProgress) => void
  ): GameProgress {
    logger.debug(`Batch updating ${updates.length} resources`);
    
    let updatedProgress = cloneDeep(gameProgress);
    
    // Current timestamp for the save
    const currentTime = new Date().toISOString();
    
    // Apply all updates to the copy
    updates.forEach(update => {
      if (!updatedProgress.resources[update.resourceType]) {
        logger.warn(`Skipping update for non-existent resource: ${update.resourceType}`);
        return;
      }
      
      logger.debug(`Updating ${update.resourceType}.${update.property} to ${update.value}`);
      
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
    
    // Trigger save once with all updates if callback provided
    if (triggerSave) {
      logger.debug(`Triggering save for batch update of ${updates.length} resources`);
      triggerSave(updatedProgress);
    }
    
    return updatedProgress;
  }

  /**
   * Calculate offline progress for a specific resource
   * @param resourceType The resource type to calculate for
   * @param gameProgress The current game progress
   * @param maxOfflineMinutes Maximum minutes to calculate
   * @returns Object with updated resource, minutes passed, and gain
   */
  static calculateResourceOfflineProgress(
    resourceType: ResourceType,
    gameProgress: GameProgress,
    maxOfflineMinutes = TIME_CONSTANTS.MAX_OFFLINE_MINUTES
  ) {
    const now = new Date();
    
    // Make a deep copy of resources to avoid mutating the original
    const updatedResources = cloneDeep(gameProgress.resources);
    const resourceData = updatedResources[resourceType];
    
    if (!resourceData) {
      logger.warn(`No ${resourceType} resource data found for offline progress calculation`);
      return {
        updatedResource: null,
        minutesPassed: 0,
        gain: 0
      };
    }
    
    // Get page and resource timestamps
    const pageTimestamps = gameProgress.page_timestamps || {};
    const resourceTimestamp = resourceData.latestSave;
    const pageTimestamp = pageTimestamps[RESOURCE_PAGE_MAP[resourceType]] || null;
    const lastOnlineDate = new Date(gameProgress.lastOnline);
    
    logger.debug(`Calculating ${resourceType} offline progress:
      Resource latestSave: ${resourceTimestamp || 'not set'}
      Page timestamp: ${pageTimestamp || 'not set'}
      Global lastOnline: ${gameProgress.lastOnline}`);
    
    // Use the most specific timestamp available
    let referenceTimestamp;
    if (resourceTimestamp) {
      referenceTimestamp = new Date(resourceTimestamp);
      logger.debug(`Using resource-specific timestamp for ${resourceType}`);
    } else if (pageTimestamp) {
      referenceTimestamp = new Date(pageTimestamp);
      logger.debug(`Using page timestamp for ${resourceType}`);
    } else {
      referenceTimestamp = lastOnlineDate;
      logger.debug(`Using global lastOnline timestamp for ${resourceType}`);
    }
    
    // Calculate seconds passed
    let secondsPassed = Math.floor((now.getTime() - referenceTimestamp.getTime()) / 1000);
    
    // Convert maxOfflineMinutes to seconds for comparison
    const maxOfflineSeconds = maxOfflineMinutes * 60;
    
    // Cap the offline progress if needed
    if (secondsPassed > maxOfflineSeconds) {
      secondsPassed = maxOfflineSeconds;
      logger.debug(`Capping ${resourceType} offline progress to ${maxOfflineMinutes} minutes (${maxOfflineSeconds} seconds)`);
    }
    
    // Convert to minutes for display purposes only
    const minutesPassed = secondsPassed / 60;
    
    logger.debug(`${secondsPassed} seconds passed since last ${resourceType} update`);
    
    // Calculate resource gain based on type
    let gain = 0;
    
    switch (resourceType) {
      case 'energy':
        if (isEnergyResource(resourceData) && resourceData.autoGeneration > 0) {
          gain = resourceData.autoGeneration * secondsPassed * RESOURCE_GENERATION_RATES.ENERGY_RATE;
          logger.debug(`Energy gain calculation: ${resourceData.autoGeneration} * ${secondsPassed} seconds * ${RESOURCE_GENERATION_RATES.ENERGY_RATE} = ${gain}`);
        }
        break;
      case 'insight':
        if (isInsightResource(resourceData) && resourceData.autoGeneration > 0) {
          gain = resourceData.autoGeneration * secondsPassed * RESOURCE_GENERATION_RATES.INSIGHT_RATE;
          logger.debug(`Insight gain calculation: ${resourceData.autoGeneration} * ${secondsPassed} seconds * ${RESOURCE_GENERATION_RATES.INSIGHT_RATE} = ${gain}`);
        }
        break;
      case 'crew':
        if (isCrewResource(resourceData) && resourceData.workerCrews > 0) {
          gain = resourceData.workerCrews * secondsPassed * RESOURCE_GENERATION_RATES.CREW_RATE;
          logger.debug(`Crew gain calculation: ${resourceData.workerCrews} * ${secondsPassed} seconds * ${RESOURCE_GENERATION_RATES.CREW_RATE} = ${gain}`);
        }
        break;
      case 'scrap':
        if (isScrapResource(resourceData) && resourceData.manufacturingBays > 0) {
          gain = resourceData.manufacturingBays * secondsPassed * RESOURCE_GENERATION_RATES.SCRAP_RATE;
          logger.debug(`Scrap gain calculation: ${resourceData.manufacturingBays} * ${secondsPassed} seconds * ${RESOURCE_GENERATION_RATES.SCRAP_RATE} = ${gain}`);
        }
        break;
    }
    
    // Cap gain to available capacity
    const newAmount = Math.min(
      resourceData.amount + gain,
      resourceData.capacity
    );
    
    const actualGain = newAmount - resourceData.amount;
    logger.debug(`${resourceType} gain capped by capacity: ${actualGain} (from calculated ${gain})`);
    
    // Update the resource with type-specific handling
    let updatedResource: EnergyResource | InsightResource | CrewResource | ScrapResource | null = null;
    
    if (resourceType === 'energy' && isEnergyResource(resourceData)) {
      updatedResource = {
        ...resourceData,
        amount: newAmount,
        latestSave: now.toISOString()
      };
    } else if (resourceType === 'insight' && isInsightResource(resourceData)) {
      updatedResource = {
        ...resourceData,
        amount: newAmount,
        latestSave: now.toISOString()
      };
    } else if (resourceType === 'crew' && isCrewResource(resourceData)) {
      updatedResource = {
        ...resourceData,
        amount: newAmount,
        latestSave: now.toISOString()
      };
    } else if (resourceType === 'scrap' && isScrapResource(resourceData)) {
      updatedResource = {
        ...resourceData,
        amount: newAmount,
        latestSave: now.toISOString()
      };
    }
    
    return {
      updatedResource,
      minutesPassed,
      gain: actualGain
    };
  }

  /**
   * Calculate offline progress for all resources
   * @param gameProgress The current game progress
   * @param maxOfflineMinutes Maximum minutes to calculate
   * @returns Object with updated resources, minutes passed, and gains
   */
  static calculateOfflineProgress(
    gameProgress: GameProgress,
    maxOfflineMinutes = TIME_CONSTANTS.MAX_OFFLINE_MINUTES
  ) {
    logger.info(`Calculating offline progress for all resources, max minutes: ${maxOfflineMinutes}`);
    const now = new Date();
    
    // Make a deep copy of resources to avoid mutating the original
    const updatedResources = cloneDeep(gameProgress.resources);
    
    // Initialize gains tracking
    const gains = {
      energy: 0,
      insight: 0,
      crew: 0,
      scrap: 0
    };
    
    // Calculate gains for each resource type
    const resourceTypes: ResourceType[] = ['energy', 'insight', 'crew', 'scrap'];
    
    resourceTypes.forEach(resourceType => {
      const result = this.calculateResourceOfflineProgress(resourceType, gameProgress, maxOfflineMinutes);
      if (result.updatedResource) {
        // Type-safe assignment
        switch(resourceType) {
          case 'energy':
            if(isEnergyResource(result.updatedResource)) {
              updatedResources.energy = result.updatedResource;
            }
            break;
          case 'insight':
            if(isInsightResource(result.updatedResource)) {
              updatedResources.insight = result.updatedResource;
            }
            break;
          case 'crew':
            if(isCrewResource(result.updatedResource)) {
              updatedResources.crew = result.updatedResource;
            }
            break;
          case 'scrap':
            if(isScrapResource(result.updatedResource)) {
              updatedResources.scrap = result.updatedResource;
            }
            break;
        }
        gains[resourceType] = result.gain;
        logger.info(`${resourceType} gained ${result.gain} after ${result.minutesPassed.toFixed(2)} minutes offline`);
      }
    });
    
    // Calculate minutes passed for display
    const lastOnline = new Date(gameProgress.lastOnline);
    let timeDiffMinutes = (now.getTime() - lastOnline.getTime()) / (1000 * 60);
    
    // Cap offline time to maxOfflineMinutes
    if (timeDiffMinutes > maxOfflineMinutes) {
      timeDiffMinutes = maxOfflineMinutes;
      logger.debug(`Capping offline time to max: ${maxOfflineMinutes} minutes`);
    }
    
    logger.info(`Total offline time: ${timeDiffMinutes.toFixed(2)} minutes`);
    
    return {
      updatedResources,
      minutesPassed: timeDiffMinutes,
      gains
    };
  }

  /**
   * Get page name corresponding to a resource type
   * @param resourceType The resource type
   * @returns Page name for the resource
   */
  static getPageFromResourceType(resourceType: ResourceType): string {
    return RESOURCE_PAGE_MAP[resourceType] || '';
  }

  /**
   * Validate that a resource exists and is of the correct type
   * @param gameProgress The game progress object
   * @param resourceType The resource type to validate
   * @returns Boolean indicating if resource is valid
   */
  static validateResource(
    gameProgress: GameProgress,
    resourceType: ResourceType
  ): boolean {
    const resource = gameProgress.resources[resourceType];
    if (!resource) {
      logger.warn(`Resource ${resourceType} does not exist in game progress`);
      return false;
    }
    
    let isValid = false;
    
    switch (resourceType) {
      case 'energy':
        isValid = isEnergyResource(resource);
        break;
      case 'insight':
        isValid = isInsightResource(resource);
        break;
      case 'crew':
        isValid = isCrewResource(resource);
        break;
      case 'scrap':
        isValid = isScrapResource(resource);
        break;
      default:
        isValid = false;
    }
    
    if (!isValid) {
      logger.warn(`Resource ${resourceType} has an invalid type`);
    }
    
    return isValid;
  }

  /**
   * Create default game progress with initial resource values
   * @returns New GameProgress object with default values
   */
  static createDefaultGameProgress(): GameProgress {
    logger.info('Creating default game progress');
    const now = new Date().toISOString();
    
    return {
      resources: {
        energy: {
          amount: DEFAULT_RESOURCE_VALUES.ENERGY.INITIAL_AMOUNT,
          capacity: DEFAULT_RESOURCE_VALUES.ENERGY.INITIAL_CAPACITY,
          autoGeneration: DEFAULT_RESOURCE_VALUES.ENERGY.INITIAL_AUTO_GENERATION,
          latestSave: now
        },
        insight: {
          amount: DEFAULT_RESOURCE_VALUES.INSIGHT.INITIAL_AMOUNT,
          capacity: DEFAULT_RESOURCE_VALUES.INSIGHT.INITIAL_CAPACITY,
          autoGeneration: DEFAULT_RESOURCE_VALUES.INSIGHT.INITIAL_AUTO_GENERATION,
          latestSave: now
        },
        crew: {
          amount: DEFAULT_RESOURCE_VALUES.CREW.INITIAL_AMOUNT,
          capacity: DEFAULT_RESOURCE_VALUES.CREW.INITIAL_CAPACITY,
          workerCrews: DEFAULT_RESOURCE_VALUES.CREW.INITIAL_WORKER_CREWS,
          latestSave: now
        },
        scrap: {
          amount: DEFAULT_RESOURCE_VALUES.SCRAP.INITIAL_AMOUNT,
          capacity: DEFAULT_RESOURCE_VALUES.SCRAP.INITIAL_CAPACITY,
          manufacturingBays: DEFAULT_RESOURCE_VALUES.SCRAP.INITIAL_MANUFACTURING_BAYS,
          latestSave: now
        }
      },
      upgrades: {},
      unlockedLogs: [1, 2, 3], // Initial unlocked logs
      lastOnline: now,
      page_timestamps: {
        reactor: now,
        processor: now,
        "crew-quarters": now,
        manufacturing: now
      }
    };
  }
} 