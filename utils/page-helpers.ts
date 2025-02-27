import { ResourceState } from './supabase/context';

/**
 * Maps resource types to their corresponding page names
 */
export const resourceToPageMap: Record<keyof ResourceState, string> = {
  'energy': 'reactor',
  'insight': 'processor',
  'crew': 'crew-quarters',
  'scrap': 'manufacturing'
};

/**
 * Maps page names to their corresponding resource types
 */
export const pageToResourceMap: Record<string, keyof ResourceState> = {
  'reactor': 'energy',
  'processor': 'insight',
  'crew-quarters': 'crew',
  'manufacturing': 'scrap'
};

/**
 * Helper function to perform standard operations when a resource page loads.
 * This includes updating the page timestamp and calculating resource-specific offline progress.
 * 
 * @param pageName The name of the page (reactor, processor, crew-quarters, manufacturing)
 * @param updatePageTimestamp Function to update the page timestamp in the game state
 * @param calculateResourceOfflineProgress Function to calculate resource-specific offline progress
 */
export function handleResourcePageLoad(
  pageName: string,
  updatePageTimestamp: (pageName: string) => void,
  calculateResourceOfflineProgress: (resourceType: keyof ResourceState) => void
) {
  // Log page load
  console.log(`[PAGE LOAD] ${pageName} page loaded`);
  
  // Update the page timestamp
  updatePageTimestamp(pageName);
  
  // Calculate resource-specific offline progress if this is a resource page
  if (pageToResourceMap[pageName]) {
    const resourceType = pageToResourceMap[pageName];
    console.log(`[PAGE LOAD] Calculating offline progress for ${resourceType}`);
    calculateResourceOfflineProgress(resourceType);
  }
} 