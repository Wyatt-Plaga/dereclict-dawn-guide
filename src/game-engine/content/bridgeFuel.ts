/**
 * Bridge fuel — the Dawn's FTL fuel reservoir.
 *
 * Fuel is generated on the Bridge (not a wing) by drones assigned from the
 * shared worker pool. It is the resource spent to INITIATE_JUMP.
 *
 * One worker (or one perpetual manual pump cycle) yields 1 fuel every 5
 * minutes, so a jump costing 5 fuel takes 25 minutes of real time at L0.
 */

export const FUEL_CAPACITY = 25;

/** Pre-drone manual pump: each click pays energy and runs a 5-minute fill
 *  cycle that produces +MANUAL_FUEL_PER_CYCLE on completion. */
export const MANUAL_FUEL_CYCLE_MS = 300_000;
export const MANUAL_FUEL_PER_CYCLE = 1;

/** Worker rate matches the manual pump so 1 drone = 1 perpetual pump. */
export const FUEL_RATE_PER_SECOND = MANUAL_FUEL_PER_CYCLE / (MANUAL_FUEL_CYCLE_MS / 1000);

/** Energy spent to start one fuel pump cycle. */
export const MANUAL_FUEL_IGNITE_ENERGY_COST = 5;

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
export const FUEL_PUMP_COST_GROWTH = 1.18;

/** Cost in energy to buy the upgrade that takes pump from `level` → `level+1`. */
export function fuelPumpUpgradeCost(level: number): number {
  return Math.ceil(FUEL_PUMP_BASE_COST * Math.pow(FUEL_PUMP_COST_GROWTH, level));
}

/** Multiplier on `FUEL_RATE_PER_SECOND` for a given pump level.
 *  Linear 1 → 15 across [0, FUEL_PUMP_MAX_LEVEL]. */
export function fuelPumpMultiplier(level: number): number {
  const clamped = Math.max(0, Math.min(level, FUEL_PUMP_MAX_LEVEL));
  return 1 + clamped * (14 / FUEL_PUMP_MAX_LEVEL);
}
