/**
 * Game Constants
 * 
 * This file contains all the game constants used throughout the game.
 * Having these values centralized makes it easier to balance the game,
 * adjust difficulty, and ensure consistency.
 */

/**
 * Crew Quarters related constants
 */
export const CrewQuartersConstants = {
  // Base parameters
  BASE_CREW_CAPACITY: 5,
  QUARTERS_UPGRADE_CAPACITY_INCREASE: 3,
  MAX_WORKER_CREWS: 5,
  
  // Awakening parameters
  AWAKENING_THRESHOLD: 10,
  CREW_PER_CLICK: 1,
  WORKER_CREW_PRODUCTION_RATE: 1.0,
  ENERGY_COST_PER_CREW_AWAKENING_SECOND: 0.5,
  
  // Cost multipliers
  QUARTERS_COST_MULTIPLIER: 0.6,
  WORKER_CREW_COST_BASE: 2.5
};

/**
 * Reactor related constants
 */
export const ReactorConstants = {
  BASE_ENERGY_CAPACITY: 100,
  ENERGY_CAPACITY_MULTIPLIER: 1.5,
  ENERGY_PER_CLICK: 1,
  ENERGY_PER_CONVERTER: 1,
  
  EXPANSION_COST_MULTIPLIER: 0.8,
  CONVERTER_COST_BASE: 20
};

/**
 * Processor related constants
 */
export const ProcessorConstants = {
  BASE_INSIGHT_CAPACITY: 50,
  INSIGHT_CAPACITY_MULTIPLIER: 1.5,
  INSIGHT_PER_CLICK: 0.5,
  INSIGHT_PER_THREAD: 0.2,
  ENERGY_COST_PER_INSIGHT_SECOND: 0.1,
  
  EXPANSION_COST_MULTIPLIER: 0.7,
  THREAD_COST_BASE: 15
};

/**
 * Manufacturing related constants
 */
export const ManufacturingConstants = {
  BASE_SCRAP_CAPACITY: 100,
  SCRAP_CAPACITY_MULTIPLIER: 1.5,
  SCRAP_PER_CLICK: 1,
  SCRAP_PER_BAY: 0.5,
  ENERGY_COST_PER_SCRAP_SECOND: 0.2,
  
  EXPANSION_COST_MULTIPLIER: 0.5,
  BAY_COST_BASE: 25
};

export const AutomationConstants = {
  ENERGY_COST_PER_CLICK: 0.1, // Energy cost for manual resource generation clicks
  ENERGY_COST_PER_ACTIVE_UNIT_PER_SECOND: 0.1, // Energy cost per active automation unit per second
}; 
