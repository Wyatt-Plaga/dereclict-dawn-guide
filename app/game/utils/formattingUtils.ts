import { ResourceCost } from '../types/combat';

/**
 * Formats an array of resource costs into a human-readable string.
 * Example: [{ type: 'energy', amount: 10 }, { type: 'scrap', amount: 5 }] => "10 Energy, 5 Scrap"
 * 
 * @param costs - The array of resource costs.
 * @returns A formatted string representing the costs.
 */
export function formatResourceCosts(costs: ResourceCost[]): string {
  if (!costs || costs.length === 0) {
    return "Free"; // Or perhaps indicate an error/unknown cost?
  }

  return costs
    .map(cost => `${cost.amount} ${cost.type.charAt(0).toUpperCase() + cost.type.slice(1)}`)
    .join(', ');
} 
