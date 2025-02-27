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
  const typedResource = resourceData as any; // Use any to bypass type checking temporarily
  
  switch (resourceType) {
    case 'energy':
      if (typedResource.autoGeneration > 0) {
        gain = typedResource.autoGeneration * secondsPassed; // Per second
        console.log(`[OFFLINE] Energy gain calculation: ${typedResource.autoGeneration} * ${secondsPassed} seconds = ${gain}`);
      }
      break;
    case 'insight':
      if (typedResource.autoGeneration > 0) {
        gain = typedResource.autoGeneration * secondsPassed * 0.2; // 0.2 per second
        console.log(`[OFFLINE] Insight gain calculation: ${typedResource.autoGeneration} * ${secondsPassed} seconds * 0.2 = ${gain}`);
      }
      break;
    case 'crew':
      if (typedResource.workerCrews > 0) {
        gain = typedResource.workerCrews * secondsPassed * 0.1; // 0.1 per second
        console.log(`[OFFLINE] Crew gain calculation: ${typedResource.workerCrews} * ${secondsPassed} seconds * 0.1 = ${gain}`);
      }
      break;
    case 'scrap':
      if (typedResource.manufacturingBays > 0) {
        gain = typedResource.manufacturingBays * secondsPassed * 0.5; // 0.5 per second
        console.log(`[OFFLINE] Scrap gain calculation: ${typedResource.manufacturingBays} * ${secondsPassed} seconds * 0.5 = ${gain}`);
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
  
  // Calculate seconds passed since last global online
  let totalSecondsPassed = Math.floor((now.getTime() - lastOnlineDate.getTime()) / 1000);
  
  // Convert maximum offline minutes to seconds
  const maxOfflineSeconds = maxOfflineMinutes * 60;
  
  // Cap the total offline progress if needed
  if (totalSecondsPassed > maxOfflineSeconds) {
    totalSecondsPassed = maxOfflineSeconds;
    console.log(`Capping total offline progress to ${maxOfflineMinutes} minutes (${maxOfflineSeconds} seconds)`);
  }
  
  // Calculate minutes passed for display purposes
  const totalMinutesPassed = totalSecondsPassed / 60;
  
  console.log(`Calculating offline progress for a total of ${totalSecondsPassed} seconds (${totalMinutesPassed.toFixed(2)} minutes)`);
  
  // Process each resource type
  // Energy calculation
  if (updatedResources.energy && updatedResources.energy.autoGeneration > 0) {
    // Check for resource-specific timestamp first
    let energyTimestamp = (updatedResources.energy as any).latestSave 
      ? new Date((updatedResources.energy as any).latestSave)
      : pageTimestamps['reactor'] 
        ? new Date(pageTimestamps['reactor']) 
        : lastOnlineDate;
    
    let energySecondsPassed = Math.min(
      Math.floor((now.getTime() - energyTimestamp.getTime()) / 1000),
      maxOfflineSeconds
    );
    
    const energyGain = updatedResources.energy.autoGeneration * energySecondsPassed;
    console.log(`Energy gain: ${updatedResources.energy.autoGeneration} * ${energySecondsPassed} seconds = ${energyGain}`);
    
    // Cap gain to available capacity
    const newEnergyAmount = Math.min(
      updatedResources.energy.amount + energyGain,
      updatedResources.energy.capacity
    );
    
    gains.energy = newEnergyAmount - updatedResources.energy.amount;
    updatedResources.energy.amount = newEnergyAmount;
    (updatedResources.energy as any).latestSave = now.toISOString();
  }
  
  // Insight calculation
  if (updatedResources.insight && updatedResources.insight.autoGeneration > 0) {
    // Check for resource-specific timestamp first
    let insightTimestamp = (updatedResources.insight as any).latestSave 
      ? new Date((updatedResources.insight as any).latestSave)
      : pageTimestamps['processor'] 
        ? new Date(pageTimestamps['processor']) 
        : lastOnlineDate;
    
    let insightSecondsPassed = Math.min(
      Math.floor((now.getTime() - insightTimestamp.getTime()) / 1000),
      maxOfflineSeconds
    );
    
    const insightGain = updatedResources.insight.autoGeneration * insightSecondsPassed * 0.2;
    console.log(`Insight gain: ${updatedResources.insight.autoGeneration} * ${insightSecondsPassed} seconds * 0.2 = ${insightGain}`);
    
    // Cap gain to available capacity
    const newInsightAmount = Math.min(
      updatedResources.insight.amount + insightGain,
      updatedResources.insight.capacity
    );
    
    gains.insight = newInsightAmount - updatedResources.insight.amount;
    updatedResources.insight.amount = newInsightAmount;
    (updatedResources.insight as any).latestSave = now.toISOString();
  }
  
  // Crew calculation
  if (updatedResources.crew && updatedResources.crew.workerCrews > 0) {
    // Check for resource-specific timestamp first
    let crewTimestamp = (updatedResources.crew as any).latestSave 
      ? new Date((updatedResources.crew as any).latestSave)
      : pageTimestamps['crew-quarters'] 
        ? new Date(pageTimestamps['crew-quarters']) 
        : lastOnlineDate;
    
    let crewSecondsPassed = Math.min(
      Math.floor((now.getTime() - crewTimestamp.getTime()) / 1000),
      maxOfflineSeconds
    );
    
    const crewGain = updatedResources.crew.workerCrews * crewSecondsPassed * 0.1;
    console.log(`Crew gain: ${updatedResources.crew.workerCrews} * ${crewSecondsPassed} seconds * 0.1 = ${crewGain}`);
    
    // Cap gain to available capacity
    const newCrewAmount = Math.min(
      updatedResources.crew.amount + crewGain,
      updatedResources.crew.capacity
    );
    
    gains.crew = newCrewAmount - updatedResources.crew.amount;
    updatedResources.crew.amount = newCrewAmount;
    (updatedResources.crew as any).latestSave = now.toISOString();
  }
  
  // Scrap calculation
  if (updatedResources.scrap && updatedResources.scrap.manufacturingBays > 0) {
    // Check for resource-specific timestamp first
    let scrapTimestamp = (updatedResources.scrap as any).latestSave 
      ? new Date((updatedResources.scrap as any).latestSave)
      : pageTimestamps['manufacturing'] 
        ? new Date(pageTimestamps['manufacturing']) 
        : lastOnlineDate;
    
    let scrapSecondsPassed = Math.min(
      Math.floor((now.getTime() - scrapTimestamp.getTime()) / 1000),
      maxOfflineSeconds
    );
    
    const scrapGain = updatedResources.scrap.manufacturingBays * scrapSecondsPassed * 0.5;
    console.log(`Scrap gain: ${updatedResources.scrap.manufacturingBays} * ${scrapSecondsPassed} seconds * 0.5 = ${scrapGain}`);
    
    // Cap gain to available capacity
    const newScrapAmount = Math.min(
      updatedResources.scrap.amount + scrapGain,
      updatedResources.scrap.capacity
    );
    
    gains.scrap = newScrapAmount - updatedResources.scrap.amount;
    updatedResources.scrap.amount = newScrapAmount;
    (updatedResources.scrap as any).latestSave = now.toISOString();
  }
  
  return {
    updatedResources,
    minutesPassed: totalMinutesPassed,
    gains
  };
} 