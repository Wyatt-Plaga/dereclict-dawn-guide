import { GameProgress, ResourceState } from '@/utils/supabase/context';

/**
 * Calculate offline progress for a specific resource based on latestSave timestamp
 * @param resourceType The type of resource to calculate for (energy, insight, crew, scrap)
 * @param gameProgress The current game progress
 * @param maxOfflineMinutes Maximum minutes to calculate (default: 24 hours) 
 * @returns Object containing updated resource, minutes passed, and gains
 */
export function calculateResourceOfflineProgress(
  resourceType: 'energy' | 'insight' | 'crew' | 'scrap',
  gameProgress: GameProgress,
  maxOfflineMinutes = 1440 // 24 hours
) {
  const now = new Date();
  
  // Make a deep copy of resources to avoid mutating the original
  const updatedResources = JSON.parse(JSON.stringify(gameProgress.resources)) as ResourceState;
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
  const resourceTimestamp = (resourceData as any).latestSave;
  const pageTimestamp = pageTimestamps[resourceToPageMap[resourceType]] || null;
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
  
  // Calculate minutes passed
  let minutesPassed = Math.floor((now.getTime() - referenceTimestamp.getTime()) / 60000);
  
  // Cap the offline progress if needed
  if (minutesPassed > maxOfflineMinutes) {
    minutesPassed = maxOfflineMinutes;
    console.log(`[OFFLINE] Capping ${resourceType} offline progress to ${maxOfflineMinutes} minutes`);
  }
  
  // If less than 1 minute passed, don't calculate any offline progress
  if (minutesPassed < 1) {
    console.log(`[OFFLINE] Less than 1 minute passed for ${resourceType}, skipping calculation`);
    return {
      updatedResource: resourceData,
      minutesPassed: 0,
      gain: 0
    };
  }
  
  console.log(`[OFFLINE] ${minutesPassed} minutes passed since last ${resourceType} update`);
  
  // Calculate resource gain based on type
  let gain = 0;
  const typedResource = resourceData as any; // Use any to bypass type checking temporarily
  
  switch (resourceType) {
    case 'energy':
      if (typedResource.autoGeneration > 0) {
        gain = typedResource.autoGeneration * minutesPassed * 60; // Per minute
        console.log(`[OFFLINE] Energy gain calculation: ${typedResource.autoGeneration} * ${minutesPassed} minutes * 60 = ${gain}`);
      }
      break;
    case 'insight':
      if (typedResource.autoGeneration > 0) {
        gain = typedResource.autoGeneration * minutesPassed * 60 * 0.2; // Per minute (0.2 per second)
        console.log(`[OFFLINE] Insight gain calculation: ${typedResource.autoGeneration} * ${minutesPassed} minutes * 60 * 0.2 = ${gain}`);
      }
      break;
    case 'crew':
      if (typedResource.workerCrews > 0) {
        gain = typedResource.workerCrews * minutesPassed * 60 * 0.1; // Per minute (0.1 per second)
        console.log(`[OFFLINE] Crew gain calculation: ${typedResource.workerCrews} * ${minutesPassed} minutes * 60 * 0.1 = ${gain}`);
      }
      break;
    case 'scrap':
      if (typedResource.manufacturingBays > 0) {
        gain = typedResource.manufacturingBays * minutesPassed * 60 * 0.5; // Per minute (0.5 per second)
        console.log(`[OFFLINE] Scrap gain calculation: ${typedResource.manufacturingBays} * ${minutesPassed} minutes * 60 * 0.5 = ${gain}`);
      }
      break;
  }
  
  // Cap gain to available capacity
  const newAmount = Math.min(
    typedResource.amount + gain,
    typedResource.capacity
  );
  
  const actualGain = newAmount - typedResource.amount;
  console.log(`[OFFLINE] ${resourceType} gain capped by capacity: ${actualGain} (from calculated ${gain})`);
  
  // Update the resource
  const updatedResource = {
    ...typedResource,
    amount: newAmount,
    latestSave: now.toISOString() // Update the latestSave timestamp
  };
  
  return {
    updatedResource,
    minutesPassed,
    gain: actualGain
  };
}

// Map resource types to their corresponding pages
const resourceToPageMap: Record<string, string> = {
  'energy': 'reactor',
  'insight': 'processor',
  'crew': 'crew-quarters',
  'scrap': 'manufacturing'
};

/**
 * Calculate offline progress based on time difference for each resource
 * @param gameProgress The last saved game progress
 * @param maxOfflineMinutes Maximum minutes to calculate (default: 24 hours)
 * @returns Object containing updated resources and gain information
 */
export function calculateOfflineProgress(
  gameProgress: GameProgress,
  maxOfflineMinutes = 1440 // 24 hours
) {
  const now = new Date();
  
  // Make a deep copy of resources to avoid mutating the original
  const updatedResources = JSON.parse(JSON.stringify(gameProgress.resources)) as ResourceState;
  
  // Initialize gains tracking
  const gains = {
    energy: 0,
    insight: 0,
    crew: 0,
    scrap: 0
  };
  
  // Get page timestamps or use lastOnline as fallback
  const pageTimestamps = gameProgress.page_timestamps || {};
  const lastOnlineDate = new Date(gameProgress.lastOnline);
  
  // Calculate minutes passed since last global online
  let totalMinutesPassed = Math.floor((now.getTime() - lastOnlineDate.getTime()) / 60000);
  
  // Cap the total offline progress if needed
  if (totalMinutesPassed > maxOfflineMinutes) {
    totalMinutesPassed = maxOfflineMinutes;
    console.log(`Capping total offline progress to ${maxOfflineMinutes} minutes`);
  }
  
  // If less than 1 minute passed globally, don't calculate any offline progress
  if (totalMinutesPassed < 1) {
    return {
      updatedResources: gameProgress.resources,
      minutesPassed: 0,
      gains: {
        energy: 0,
        insight: 0,
        crew: 0,
        scrap: 0
      }
    };
  }
  
  console.log(`Calculating offline progress for a total of ${totalMinutesPassed} minutes`);
  
  // Calculate energy gains based on latestSave timestamp or reactor page timestamp
  if (updatedResources.energy && updatedResources.energy.autoGeneration > 0) {
    // Use latestSave if available, otherwise fall back to page timestamp or lastOnline
    const latestSaveTimestamp = (updatedResources.energy as any).latestSave;
    const reactorTimestamp = latestSaveTimestamp || pageTimestamps.reactor || gameProgress.lastOnline;
    const reactorDate = new Date(reactorTimestamp);
    let energyMinutesPassed = Math.floor((now.getTime() - reactorDate.getTime()) / 60000);
    
    // Cap to max minutes if needed
    energyMinutesPassed = Math.min(energyMinutesPassed, maxOfflineMinutes);
    
    if (energyMinutesPassed > 0) {
      console.log(`Energy offline progress: ${energyMinutesPassed} minutes (from ${reactorTimestamp})`);
      const offlineGain = updatedResources.energy.autoGeneration * energyMinutesPassed * 60; // Per minute
      const newAmount = Math.min(
        updatedResources.energy.amount + offlineGain,
        updatedResources.energy.capacity
      );
      gains.energy = newAmount - updatedResources.energy.amount;
      updatedResources.energy.amount = newAmount;
    }
  }
  
  // Calculate insight gains based on latestSave timestamp or processor page timestamp
  if (updatedResources.insight && updatedResources.insight.autoGeneration > 0) {
    // Use latestSave if available, otherwise fall back to page timestamp or lastOnline
    const latestSaveTimestamp = (updatedResources.insight as any).latestSave;
    const processorTimestamp = latestSaveTimestamp || pageTimestamps.processor || gameProgress.lastOnline;
    const processorDate = new Date(processorTimestamp);
    let insightMinutesPassed = Math.floor((now.getTime() - processorDate.getTime()) / 60000);
    
    // Cap to max minutes if needed
    insightMinutesPassed = Math.min(insightMinutesPassed, maxOfflineMinutes);
    
    if (insightMinutesPassed > 0) {
      console.log(`Insight offline progress: ${insightMinutesPassed} minutes (from ${processorTimestamp})`);
      const offlineGain = updatedResources.insight.autoGeneration * insightMinutesPassed * 60 * 0.2; // Per minute (0.2 per second)
      const newAmount = Math.min(
        updatedResources.insight.amount + offlineGain,
        updatedResources.insight.capacity
      );
      gains.insight = newAmount - updatedResources.insight.amount;
      updatedResources.insight.amount = newAmount;
    }
  }
  
  // Calculate crew gains based on latestSave timestamp or crew-quarters page timestamp
  if (updatedResources.crew && updatedResources.crew.workerCrews > 0) {
    // Use latestSave if available, otherwise fall back to page timestamp or lastOnline
    const latestSaveTimestamp = (updatedResources.crew as any).latestSave;
    const crewTimestamp = latestSaveTimestamp || pageTimestamps["crew-quarters"] || gameProgress.lastOnline;
    const crewDate = new Date(crewTimestamp);
    let crewMinutesPassed = Math.floor((now.getTime() - crewDate.getTime()) / 60000);
    
    // Cap to max minutes if needed
    crewMinutesPassed = Math.min(crewMinutesPassed, maxOfflineMinutes);
    
    if (crewMinutesPassed > 0) {
      console.log(`Crew offline progress: ${crewMinutesPassed} minutes (from ${crewTimestamp})`);
      const offlineGain = updatedResources.crew.workerCrews * crewMinutesPassed * 60 * 0.1; // Per minute (0.1 per second)
      const newAmount = Math.min(
        updatedResources.crew.amount + offlineGain,
        updatedResources.crew.capacity
      );
      gains.crew = newAmount - updatedResources.crew.amount;
      updatedResources.crew.amount = newAmount;
    }
  }
  
  // Calculate scrap gains based on latestSave timestamp or manufacturing page timestamp
  if (updatedResources.scrap && updatedResources.scrap.manufacturingBays > 0) {
    // Use latestSave if available, otherwise fall back to page timestamp or lastOnline
    const latestSaveTimestamp = (updatedResources.scrap as any).latestSave;
    const manufacturingTimestamp = latestSaveTimestamp || pageTimestamps.manufacturing || gameProgress.lastOnline;
    const manufacturingDate = new Date(manufacturingTimestamp);
    let scrapMinutesPassed = Math.floor((now.getTime() - manufacturingDate.getTime()) / 60000);
    
    // Cap to max minutes if needed
    scrapMinutesPassed = Math.min(scrapMinutesPassed, maxOfflineMinutes);
    
    if (scrapMinutesPassed > 0) {
      console.log(`Scrap offline progress: ${scrapMinutesPassed} minutes (from ${manufacturingTimestamp})`);
      const offlineGain = updatedResources.scrap.manufacturingBays * scrapMinutesPassed * 60 * 0.5; // Per minute (0.5 per second)
      const newAmount = Math.min(
        updatedResources.scrap.amount + offlineGain,
        updatedResources.scrap.capacity
      );
      gains.scrap = newAmount - updatedResources.scrap.amount;
      updatedResources.scrap.amount = newAmount;
    }
  }
  
  // Use total minutes passed for displaying time away
  return {
    updatedResources,
    minutesPassed: totalMinutesPassed,
    gains
  };
} 