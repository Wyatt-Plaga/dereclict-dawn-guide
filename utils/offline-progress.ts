import { GameProgress, ResourceState } from '@/utils/supabase/context';

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
  
  // Calculate energy gains based on reactor page timestamp
  if (updatedResources.energy && updatedResources.energy.autoGeneration > 0) {
    const reactorTimestamp = pageTimestamps.reactor || gameProgress.lastOnline;
    const reactorDate = new Date(reactorTimestamp);
    let energyMinutesPassed = Math.floor((now.getTime() - reactorDate.getTime()) / 60000);
    
    // Cap to max minutes if needed
    energyMinutesPassed = Math.min(energyMinutesPassed, maxOfflineMinutes);
    
    if (energyMinutesPassed > 0) {
      console.log(`Energy offline progress: ${energyMinutesPassed} minutes`);
      const offlineGain = updatedResources.energy.autoGeneration * energyMinutesPassed * 60; // Per minute
      const newAmount = Math.min(
        updatedResources.energy.amount + offlineGain,
        updatedResources.energy.capacity
      );
      gains.energy = newAmount - updatedResources.energy.amount;
      updatedResources.energy.amount = newAmount;
    }
  }
  
  // Calculate insight gains based on processor page timestamp
  if (updatedResources.insight && updatedResources.insight.autoGeneration > 0) {
    const processorTimestamp = pageTimestamps.processor || gameProgress.lastOnline;
    const processorDate = new Date(processorTimestamp);
    let insightMinutesPassed = Math.floor((now.getTime() - processorDate.getTime()) / 60000);
    
    // Cap to max minutes if needed
    insightMinutesPassed = Math.min(insightMinutesPassed, maxOfflineMinutes);
    
    if (insightMinutesPassed > 0) {
      console.log(`Insight offline progress: ${insightMinutesPassed} minutes`);
      const offlineGain = updatedResources.insight.autoGeneration * insightMinutesPassed * 60 * 0.2; // Per minute (0.2 per second)
      const newAmount = Math.min(
        updatedResources.insight.amount + offlineGain,
        updatedResources.insight.capacity
      );
      gains.insight = newAmount - updatedResources.insight.amount;
      updatedResources.insight.amount = newAmount;
    }
  }
  
  // Calculate crew gains based on crew-quarters page timestamp
  if (updatedResources.crew && updatedResources.crew.workerCrews > 0) {
    const crewTimestamp = pageTimestamps["crew-quarters"] || gameProgress.lastOnline;
    const crewDate = new Date(crewTimestamp);
    let crewMinutesPassed = Math.floor((now.getTime() - crewDate.getTime()) / 60000);
    
    // Cap to max minutes if needed
    crewMinutesPassed = Math.min(crewMinutesPassed, maxOfflineMinutes);
    
    if (crewMinutesPassed > 0) {
      console.log(`Crew offline progress: ${crewMinutesPassed} minutes`);
      const offlineGain = updatedResources.crew.workerCrews * crewMinutesPassed * 60 * 0.1; // Per minute (0.1 per second)
      const newAmount = Math.min(
        updatedResources.crew.amount + offlineGain,
        updatedResources.crew.capacity
      );
      gains.crew = newAmount - updatedResources.crew.amount;
      updatedResources.crew.amount = newAmount;
    }
  }
  
  // Calculate scrap gains based on manufacturing page timestamp
  if (updatedResources.scrap && updatedResources.scrap.manufacturingBays > 0) {
    const manufacturingTimestamp = pageTimestamps.manufacturing || gameProgress.lastOnline;
    const manufacturingDate = new Date(manufacturingTimestamp);
    let scrapMinutesPassed = Math.floor((now.getTime() - manufacturingDate.getTime()) / 60000);
    
    // Cap to max minutes if needed
    scrapMinutesPassed = Math.min(scrapMinutesPassed, maxOfflineMinutes);
    
    if (scrapMinutesPassed > 0) {
      console.log(`Scrap offline progress: ${scrapMinutesPassed} minutes`);
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