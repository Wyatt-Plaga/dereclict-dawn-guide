import { GameProgress, ResourceType, isEnergyResource, isInsightResource, isCrewResource, isScrapResource, BaseResource, EnergyResource, InsightResource, CrewResource, ScrapResource } from '@/types/game.types';
import { RESOURCE_PAGE_MAP, RESOURCE_GENERATION_RATES, TIME_CONSTANTS } from './constants/game-constants';
import cloneDeep from 'lodash.clonedeep';

/**
 * Calculate offline progress for a specific resource based on latestSave timestamp
 * @param resourceType The type of resource to calculate for (energy, insight, crew, scrap)
 * @param gameProgress The current game progress
 * @param maxOfflineMinutes Maximum minutes to calculate (default from constants) 
 * @returns Object containing updated resource, minutes passed, and gains
 */
export function calculateResourceOfflineProgress(
  resourceType: ResourceType,
  gameProgress: GameProgress,
  maxOfflineMinutes = TIME_CONSTANTS.MAX_OFFLINE_MINUTES
) {
  const now = new Date();
  
  // Make a deep copy of resources to avoid mutating the original
  const updatedResources = cloneDeep(gameProgress.resources);
  const resourceData = updatedResources[resourceType];
  
  if (!resourceData) {
    console.log(`[OFFLINE] No ${resourceType} resource data found`);
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
  
  // Log the timestamps we're working with
  console.log(`[OFFLINE] Calculating ${resourceType} offline progress:`);
  console.log(`[OFFLINE] - Resource latestSave: ${resourceTimestamp || 'not set'}`);
  console.log(`[OFFLINE] - Page timestamp: ${pageTimestamp || 'not set'}`);
  console.log(`[OFFLINE] - Global lastOnline: ${gameProgress.lastOnline}`);
  
  // Use the most specific timestamp available
  let referenceTimestamp;
  if (resourceTimestamp) {
    referenceTimestamp = new Date(resourceTimestamp);
    console.log(`[OFFLINE] Using resource-specific timestamp for ${resourceType}`);
  } else if (pageTimestamp) {
    referenceTimestamp = new Date(pageTimestamp);
    console.log(`[OFFLINE] Using page timestamp for ${resourceType}`);
  } else {
    referenceTimestamp = lastOnlineDate;
    console.log(`[OFFLINE] Using global lastOnline timestamp for ${resourceType}`);
  }
  
  // Calculate seconds passed
  let secondsPassed = Math.floor((now.getTime() - referenceTimestamp.getTime()) / 1000);
  
  // Convert maxOfflineMinutes to seconds for comparison
  const maxOfflineSeconds = maxOfflineMinutes * 60;
  
  // Cap the offline progress if needed
  if (secondsPassed > maxOfflineSeconds) {
    secondsPassed = maxOfflineSeconds;
    console.log(`[OFFLINE] Capping ${resourceType} offline progress to ${maxOfflineMinutes} minutes (${maxOfflineSeconds} seconds)`);
  }
  
  // Convert to minutes for display purposes only
  const minutesPassed = secondsPassed / 60;
  
  console.log(`[OFFLINE] ${secondsPassed} seconds passed since last ${resourceType} update`);
  
  // Calculate resource gain based on type
  let gain = 0;
  
  switch (resourceType) {
    case 'energy':
      if (isEnergyResource(resourceData) && resourceData.autoGeneration > 0) {
        gain = resourceData.autoGeneration * secondsPassed * RESOURCE_GENERATION_RATES.ENERGY_RATE; 
        console.log(`[OFFLINE] Energy gain calculation: ${resourceData.autoGeneration} * ${secondsPassed} seconds * ${RESOURCE_GENERATION_RATES.ENERGY_RATE} = ${gain}`);
      }
      break;
    case 'insight':
      if (isInsightResource(resourceData) && resourceData.autoGeneration > 0) {
        gain = resourceData.autoGeneration * secondsPassed * RESOURCE_GENERATION_RATES.INSIGHT_RATE;
        console.log(`[OFFLINE] Insight gain calculation: ${resourceData.autoGeneration} * ${secondsPassed} seconds * ${RESOURCE_GENERATION_RATES.INSIGHT_RATE} = ${gain}`);
      }
      break;
    case 'crew':
      if (isCrewResource(resourceData) && resourceData.workerCrews > 0) {
        gain = resourceData.workerCrews * secondsPassed * RESOURCE_GENERATION_RATES.CREW_RATE;
        console.log(`[OFFLINE] Crew gain calculation: ${resourceData.workerCrews} * ${secondsPassed} seconds * ${RESOURCE_GENERATION_RATES.CREW_RATE} = ${gain}`);
      }
      break;
    case 'scrap':
      if (isScrapResource(resourceData) && resourceData.manufacturingBays > 0) {
        gain = resourceData.manufacturingBays * secondsPassed * RESOURCE_GENERATION_RATES.SCRAP_RATE;
        console.log(`[OFFLINE] Scrap gain calculation: ${resourceData.manufacturingBays} * ${secondsPassed} seconds * ${RESOURCE_GENERATION_RATES.SCRAP_RATE} = ${gain}`);
      }
      break;
  }
  
  // Cap gain to available capacity
  const newAmount = Math.min(
    resourceData.amount + gain,
    resourceData.capacity
  );
  
  const actualGain = newAmount - resourceData.amount;
  console.log(`[OFFLINE] ${resourceType} gain capped by capacity: ${actualGain} (from calculated ${gain})`);
  
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
 * Calculate offline progress based on time difference for each resource
 * @param gameProgress The last saved game progress
 * @param maxOfflineMinutes Maximum minutes to calculate (default from constants)
 * @returns Object containing updated resources and gain information
 */
export function calculateOfflineProgress(
  gameProgress: GameProgress,
  maxOfflineMinutes = TIME_CONSTANTS.MAX_OFFLINE_MINUTES
) {
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
    const result = calculateResourceOfflineProgress(resourceType, gameProgress, maxOfflineMinutes);
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
    }
  });
  
  // Calculate minutes passed for display
  const lastOnline = new Date(gameProgress.lastOnline);
  let timeDiffMinutes = (now.getTime() - lastOnline.getTime()) / (1000 * 60);
  
  // Cap offline time to maxOfflineMinutes
  if (timeDiffMinutes > maxOfflineMinutes) {
    timeDiffMinutes = maxOfflineMinutes;
  }
  
  return {
    updatedResources,
    minutesPassed: timeDiffMinutes,
    gains
  };
} 