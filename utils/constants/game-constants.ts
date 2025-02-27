import { ResourceType } from '@/types/game.types';

/**
 * Maps resource types to their corresponding pages in the application
 */
export const RESOURCE_PAGE_MAP: Record<ResourceType, string> = {
  'energy': 'reactor',
  'insight': 'processor',
  'crew': 'crew-quarters',
  'scrap': 'manufacturing'
};

/**
 * Resource generation rates for offline progress calculations
 */
export const RESOURCE_GENERATION_RATES = {
  ENERGY_RATE: 1, // Base rate: 1 per second
  INSIGHT_RATE: 0.2, // Base rate: 0.2 per second
  CREW_RATE: 0.1, // Base rate: 0.1 per second
  SCRAP_RATE: 0.5, // Base rate: 0.5 per second
};

/**
 * Time constants
 */
export const TIME_CONSTANTS = {
  MAX_OFFLINE_MINUTES: 1440, // 24 hours in minutes
  SAVE_DEBOUNCE_TIME: 2000, // 2 seconds in milliseconds
  AUTO_SAVE_INTERVAL: 30000, // 30 seconds in milliseconds
};

/**
 * Default resource state values
 */
export const DEFAULT_RESOURCE_VALUES = {
  ENERGY: {
    INITIAL_AMOUNT: 0,
    INITIAL_CAPACITY: 100,
    INITIAL_AUTO_GENERATION: 0
  },
  INSIGHT: {
    INITIAL_AMOUNT: 0,
    INITIAL_CAPACITY: 50,
    INITIAL_AUTO_GENERATION: 0
  },
  CREW: {
    INITIAL_AMOUNT: 0,
    INITIAL_CAPACITY: 5,
    INITIAL_WORKER_CREWS: 0
  },
  SCRAP: {
    INITIAL_AMOUNT: 0,
    INITIAL_CAPACITY: 100,
    INITIAL_MANUFACTURING_BAYS: 0
  }
}; 