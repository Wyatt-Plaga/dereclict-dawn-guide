/**
 * Crew Quarters Utility Functions
 * 
 * This file contains utility functions for working with crew-related data
 * and operations throughout the game.
 */

import { CrewQuartersTexts } from '../content/texts';

/**
 * Get the text description for the current awakening stage
 * 
 * @param progress The current awakening progress value
 * @returns The text description for the current stage
 */
export function getAwakeningStageText(progress: number): string {
  if (progress < 0.5) return CrewQuartersTexts.awakeningStages.dormant;
  if (progress < 3) return CrewQuartersTexts.awakeningStages.warmup;
  if (progress < 5) return CrewQuartersTexts.awakeningStages.stabilizing;
  if (progress < 7) return CrewQuartersTexts.awakeningStages.neural;
  if (progress < 9) return CrewQuartersTexts.awakeningStages.consciousness;
  return CrewQuartersTexts.awakeningStages.final;
}

/**
 * Get a random flavor text for the awakening process
 * 
 * @returns A random flavor text
 */
export function getRandomAwakeningFlavor(): string {
  const flavors = CrewQuartersTexts.awakeningFlavor;
  return flavors[Math.floor(Math.random() * flavors.length)];
}

/**
 * Format a crew count value for display
 * Shows integers as whole numbers, non-integers with 1 decimal place
 * 
 * @param count The crew count value to format
 * @returns Formatted string representation
 */
export function formatCrewCount(count: number): string {
  return Number.isInteger(count) ? count.toString() : count.toFixed(1);
}

/**
 * Calculate the maximum progress width for display in progress bar
 * Ensures progress bar doesn't exceed the container
 * 
 * @param crew The current crew count
 * @param crewCapacity The maximum crew capacity
 * @param awakeningProgress The current awakening progress
 * @returns The width percentage for the awakening progress bar
 */
export function calculateAwakeningProgressWidth(
  crew: number, 
  crewCapacity: number, 
  awakeningProgress: number
): number {
  // The width of a single unit's progress bar
  const singleUnitWidth = (awakeningProgress / 10) * (100 / crewCapacity);
  
  // Don't exceed the remaining space
  const remainingSpace = 100 - (crew / crewCapacity) * 100;
  
  return Math.min(singleUnitWidth, remainingSpace);
}

/**
 * Format a text template with provided values
 * Replaces {0}, {1}, etc. with the corresponding values
 * 
 * @param template The text template containing {n} placeholders
 * @param values The values to insert into the template
 * @returns The formatted string
 */
export function formatTemplate(template: string, ...values: any[]): string {
  return template.replace(/{(\d+)}/g, (match, index) => {
    const valueIndex = parseInt(index, 10);
    return valueIndex < values.length ? values[valueIndex].toString() : match;
  });
} 
