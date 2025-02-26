import { GameProgress, ResourceState } from '@/utils/supabase/context';

/**
 * Calculate offline progress based on time difference
 * @param gameProgress The last saved game progress
 * @param maxOfflineMinutes Maximum minutes to calculate (default: 24 hours)
 * @returns Object containing updated resources and gain information
 */
export function calculateOfflineProgress(
  gameProgress: GameProgress,
  maxOfflineMinutes = 1440 // 24 hours
) {
  const now = new Date();
  const lastOnlineDate = new Date(gameProgress.lastOnline);
  
  // Calculate minutes passed
  let minutesPassed = Math.floor((now.getTime() - lastOnlineDate.getTime()) / 60000);
  
  // Cap the offline progress if needed
  if (minutesPassed > maxOfflineMinutes) {
    minutesPassed = maxOfflineMinutes;
    console.log(`Capping offline progress to ${maxOfflineMinutes} minutes`);
  }
  
  // If less than 1 minute passed, don't calculate offline progress
  if (minutesPassed < 1) {
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
  
  console.log(`Calculating offline progress for ${minutesPassed} minutes`);
  
  // Make a deep copy of resources to avoid mutating the original
  const updatedResources = JSON.parse(JSON.stringify(gameProgress.resources)) as ResourceState;
  
  // Initialize gains tracking
  const gains = {
    energy: 0,
    insight: 0,
    crew: 0,
    scrap: 0
  };
  
  // Energy calculation
  if (updatedResources.energy && updatedResources.energy.autoGeneration > 0) {
    const offlineGain = updatedResources.energy.autoGeneration * minutesPassed * 60; // Per minute
    const newAmount = Math.min(
      updatedResources.energy.amount + offlineGain,
      updatedResources.energy.capacity
    );
    gains.energy = newAmount - updatedResources.energy.amount;
    updatedResources.energy.amount = newAmount;
  }
  
  // Insight calculation
  if (updatedResources.insight && updatedResources.insight.autoGeneration > 0) {
    const offlineGain = updatedResources.insight.autoGeneration * minutesPassed * 60 * 0.2; // Per minute (0.2 per second)
    const newAmount = Math.min(
      updatedResources.insight.amount + offlineGain,
      updatedResources.insight.capacity
    );
    gains.insight = newAmount - updatedResources.insight.amount;
    updatedResources.insight.amount = newAmount;
  }
  
  // Crew calculation
  if (updatedResources.crew && updatedResources.crew.workerCrews > 0) {
    const offlineGain = updatedResources.crew.workerCrews * minutesPassed * 60 * 0.1; // Per minute (0.1 per second)
    const newAmount = Math.min(
      updatedResources.crew.amount + offlineGain,
      updatedResources.crew.capacity
    );
    gains.crew = newAmount - updatedResources.crew.amount;
    updatedResources.crew.amount = newAmount;
  }
  
  // Scrap calculation
  if (updatedResources.scrap && updatedResources.scrap.manufacturingBays > 0) {
    const offlineGain = updatedResources.scrap.manufacturingBays * minutesPassed * 60 * 0.5; // Per minute (0.5 per second)
    const newAmount = Math.min(
      updatedResources.scrap.amount + offlineGain,
      updatedResources.scrap.capacity
    );
    gains.scrap = newAmount - updatedResources.scrap.amount;
    updatedResources.scrap.amount = newAmount;
  }
  
  return {
    updatedResources,
    minutesPassed,
    gains
  };
} 