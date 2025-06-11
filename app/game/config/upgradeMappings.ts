/**
 * Shared upgrade key mappings
 * 
 * Maps legacy upgrade identifiers to the new namespaced upgrade keys.
 * This configuration is shared between systems to avoid circular dependencies.
 */

import { UpgradeKey } from '../components/interfaces';

export const LEGACY_TO_UPGRADE_KEY: Record<string, UpgradeKey> = {
  reactorExpansions: 'reactor:expansions',
  energyConverters: 'reactor:converters',
  mainframeExpansions: 'processor:expansions',
  processingThreads: 'processor:threads',
  additionalQuarters: 'crew:quartersExpansion',
  workerCrews: 'crew:workerCrews',
  cargoHoldExpansions: 'manufacturing:expansions',
  manufacturingBays: 'manufacturing:bays',
};

/**
 * Reverse mapping for converting upgrade keys back to legacy format
 */
export const UPGRADE_KEY_TO_LEGACY: Record<UpgradeKey, string> = Object.entries(
  LEGACY_TO_UPGRADE_KEY
).reduce((acc, [legacy, key]) => {
  acc[key] = legacy;
  return acc;
}, {} as Record<UpgradeKey, string>); 