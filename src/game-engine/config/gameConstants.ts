/**
 * Game Constants
 *
 * Wing-specific production rates and capacities are defined in
 * content/wingResources.ts. This file holds remaining constants.
 */

/**
 * Crew Quarters related constants (legacy — kept for any remaining refs)
 */
export const CrewQuartersConstants = {
  BASE_CREW_CAPACITY: 20,
  QUARTERS_UPGRADE_CAPACITY_INCREASE: 10,
  MAX_WORKER_CREWS: 5,
  AWAKENING_THRESHOLD: 10,
  CREW_PER_CLICK: 0.5,
  WORKER_CREW_PRODUCTION_RATE: 1.0,
  QUARTERS_COST_MULTIPLIER: 0.6,
  WORKER_CREW_COST_BASE: 2.5
};

export const ReactorConstants = {
  BASE_ENERGY_CAPACITY: 100,
  ENERGY_CAPACITY_MULTIPLIER: 1.5,
  ENERGY_PER_CLICK: 1,
  ENERGY_PER_CONVERTER: 1,
  EXPANSION_COST_MULTIPLIER: 0.8,
  CONVERTER_COST_BASE: 20
};

export const ProcessorConstants = {
  BASE_INSIGHT_CAPACITY: 50,
  INSIGHT_CAPACITY_MULTIPLIER: 1.5,
  INSIGHT_PER_CLICK: 0.5,
  INSIGHT_PER_THREAD: 0.2,
  EXPANSION_COST_MULTIPLIER: 0.7,
  THREAD_COST_BASE: 15
};

export const ManufacturingConstants = {
  BASE_SCRAP_CAPACITY: 100,
  SCRAP_CAPACITY_MULTIPLIER: 1.5,
  SCRAP_PER_CLICK: 1,
  SCRAP_PER_BAY: 0.5,
  EXPANSION_COST_MULTIPLIER: 0.5,
  BAY_COST_BASE: 25
};
