/**
 * Bridge fuel — the Dawn's FTL fuel reservoir.
 *
 * Fuel is generated on the Bridge (not a wing) by drones assigned from the
 * shared worker pool. It is the resource spent to INITIATE_JUMP.
 *
 * At 1 worker the reservoir fills at 0.1 fuel / minute, so a jump costing
 * 5 fuel takes 50 minutes of real time to prepare.
 */

export const FUEL_CAPACITY = 25;

/** Fuel produced per worker per second (0.1/min = 0.1/60 per second) */
export const FUEL_RATE_PER_SECOND = 0.1 / 60;

/** Cost in fuel to initiate a jump, regardless of destination. */
export const JUMP_FUEL_COST = 5;

/* -------------------------------------------------------------------------- */
/* Fuel Pump upgrade — paid in reactor energy, boosts fuel generation rate.   */
/* -------------------------------------------------------------------------- */

/** Hard ceiling on fuel pump upgrade levels. */
export const FUEL_PUMP_MAX_LEVEL = 50;

/** Base energy cost of the first fuel pump upgrade (level 0 → 1). */
export const FUEL_PUMP_BASE_COST = 500;

/** Geometric growth rate per level for the upgrade cost. */
export const FUEL_PUMP_COST_GROWTH = 1.1;

/** Cost in energy to buy the upgrade that takes pump from `level` → `level+1`. */
export function fuelPumpUpgradeCost(level: number): number {
  return Math.ceil(FUEL_PUMP_BASE_COST * Math.pow(FUEL_PUMP_COST_GROWTH, level));
}

/** Multiplier on `FUEL_RATE_PER_SECOND` for a given pump level.
 *  Linear 1 → 10 across [0, FUEL_PUMP_MAX_LEVEL]. */
export function fuelPumpMultiplier(level: number): number {
  const clamped = Math.max(0, Math.min(level, FUEL_PUMP_MAX_LEVEL));
  return 1 + clamped * (9 / FUEL_PUMP_MAX_LEVEL);
}
