import { GameState, WingCategory } from '../types';
import { BuffType, maxWorkersKey, capStatKey, rateStatKey } from '../types/resources';
import { WING_DEFS, WingId, WING_ORDER, SLOT_ORDER, SLOT_CONSUMES, ResourceSlot, WORKER_BASE, WORKER_PER_UPGRADE, WORKER_BOSS_GATE_SIZE, INITIAL_MAX_WORKERS_PER_SLOT, computeCapacity, speedMultiplier } from '../content/wingResources';
import { speedKey } from '../types/resources';
import { FUEL_CAPACITY, FUEL_RATE_PER_SECOND, MANUAL_FUEL_CYCLE_MS, MANUAL_FUEL_PER_CYCLE, fuelPumpMultiplier } from '../content/bridgeFuel';
import Logger, { LogCategory, LogContext } from "@/app/utils/logger";
import { getResourceAccessor } from '../utils/resourceAccessor';

/**
 * Worker-based resource production system.
 *
 * Each wing has 3 resources in a chain: primary → secondary → tertiary.
 * Workers assigned to each slot produce at: baseRate × (1 + effLevel × effBonus).
 * Each slot (except reactor primary) consumes the previous resource in the chain.
 * Non-reactor primary slots also consume energy from the reactor.
 */
export class ResourceSystem {

  /* ---------------------------------------------------------------------- */
  /* Buff helpers                                                            */
  /* ---------------------------------------------------------------------- */

  getBuffMultiplier(state: GameState, type: BuffType): number {
    let mult = 1;
    for (const buff of state.buffs ?? []) {
      if (buff.type === type && buff.remainingMs > 0) {
        mult += buff.magnitude;
      }
    }
    return mult;
  }

  private static BUFF_MAP: Record<WingId, BuffType> = {
    reactor: 'energyRate',
    processor: 'insightRate',
    crewQuarters: 'crewRate',
    manufacturing: 'scrapRate',
  };

  /* ---------------------------------------------------------------------- */
  /* Main update                                                             */
  /* ---------------------------------------------------------------------- */

  update(state: GameState, delta: number) {
    this.updateBuffs(state, delta);

    // Snapshot start-of-tick values so all scarcity checks use the same baseline.
    const snaps = new Map<WingId, Record<ResourceSlot, number>>();
    for (const wingId of WING_ORDER) {
      snaps.set(wingId, { ...(state.categories[wingId] as WingCategory).resources });
    }

    // Per-wing planned gross production and consumption per slot.
    type Plan = { prod: Record<ResourceSlot, number>; consume: Record<ResourceSlot, number> };
    const plans = new Map<WingId, Plan>();
    for (const wingId of WING_ORDER) {
      plans.set(wingId, {
        prod: { primary: 0, secondary: 0, tertiary: 0, quaternary: 0 },
        consume: { primary: 0, secondary: 0, tertiary: 0, quaternary: 0 },
      });
    }

    // Energy withdrawn from reactor.primary by non-reactor primary workers.
    let nonReactorEnergyDemand = 0;

    // Process reactor first so its planned production is visible to non-reactor
    // wings when they check energy scarcity.
    const wingsInOrder: WingId[] = ['reactor', ...WING_ORDER.filter((w) => w !== 'reactor')];

    for (const wingId of wingsInOrder) {
      const wing = state.categories[wingId] as WingCategory;
      if (!wing.unlocked) continue;

      const def = WING_DEFS[wingId];
      const buffMult = this.getBuffMultiplier(state, ResourceSystem.BUFF_MAP[wingId]);
      const snap = snaps.get(wingId)!;
      const plan = plans.get(wingId)!;

      for (const slot of SLOT_ORDER) {
        if (!wing.automated[slot]) continue;
        const workers = wing.workers[slot];
        if (workers <= 0) continue;

        const slotDef = def.resources[slot];
        const effLevel = wing.upgrades[`${slot}Eff` as keyof typeof wing.upgrades] as number;
        const effMultiplier = 1 + effLevel * slotDef.efficiencyBonus;
        const speedLevel = (wing.upgrades[speedKey(slot)] as number) ?? 0;
        const speedMult = speedMultiplier(speedLevel);
        let produce = workers * slotDef.baseRate * effMultiplier * speedMult * buffMult * delta;

        // Scale production down if inputs are scarce.
        if (slot === 'primary' && wingId !== 'reactor') {
          // Non-reactor primary consumes energy from reactor.primary (global pool).
          const needed = workers * def.energyCostPerPrimaryWorker * delta;
          const reactorPlan = plans.get('reactor')!;
          const reactorStart = snaps.get('reactor')!.primary;
          const available =
            reactorStart + reactorPlan.prod.primary - reactorPlan.consume.primary - nonReactorEnergyDemand;
          const usable = Math.max(0, Math.min(needed, available));
          produce *= needed > 0 ? usable / needed : 0;
          nonReactorEnergyDemand += usable;
        } else {
          const inputSlot = SLOT_CONSUMES[slot];
          if (inputSlot) {
            const needed = workers * slotDef.consumeRate * delta;
            // Available from this wing's own chain: start + production so far - already-consumed.
            const available = snap[inputSlot] + plan.prod[inputSlot] - plan.consume[inputSlot];
            const usable = Math.max(0, Math.min(needed, available));
            produce *= needed > 0 ? usable / needed : 0;
            plan.consume[inputSlot] += usable;
          }
        }

        plan.prod[slot] = produce;
      }
    }

    // Apply all deltas atomically. Consumption drains first (floor 0), then
    // production is added (capped — but pre-existing overflow is preserved so
    // the cap only limits *new* production, not values already above it).
    for (const wingId of WING_ORDER) {
      const wing = state.categories[wingId] as WingCategory;
      const plan = plans.get(wingId)!;
      const snap = snaps.get(wingId)!;

      for (const slot of SLOT_ORDER) {
        if (!wing.unlocked) {
          this.setRate(wing, slot, 0);
          continue;
        }
        const cap = wing.stats[capStatKey(slot)];
        let consumed = plan.consume[slot];
        if (wingId === 'reactor' && slot === 'primary') {
          consumed += nonReactorEnergyDemand;
        }
        const produced = plan.prod[slot];
        const afterConsume = Math.max(0, snap[slot] - consumed);
        const effectiveCap = Math.max(cap, afterConsume);
        wing.resources[slot] = Math.min(afterConsume + produced, effectiveCap);
        this.setRate(wing, slot, produced / delta);
      }
    }

    // ── Bridge fuel production (standalone, not a wing) ──
    // Single-drone slot: production runs whenever a worker is assigned.
    // Pump upgrade multiplies the base rate.
    if (state.bridge && state.bridge.fuelWorkers > 0) {
      const pumpMult = fuelPumpMultiplier(state.bridge.fuelPumpLevel ?? 0);
      const produced = state.bridge.fuelWorkers * FUEL_RATE_PER_SECOND * pumpMult * delta;
      state.bridge.fuel = Math.min(FUEL_CAPACITY, (state.bridge.fuel ?? 0) + produced);
    }
    // Pre-drone manual pump: once a cycle has been kicked off, wait for the
    // 30s timer to elapse, then deposit MANUAL_FUEL_PER_CYCLE fuel and clear
    // the marker so the player can click again.
    if (state.bridge && state.bridge.manualFuelCycleStartMs !== undefined) {
      if (Date.now() - state.bridge.manualFuelCycleStartMs >= MANUAL_FUEL_CYCLE_MS) {
        state.bridge.fuel = Math.min(
          FUEL_CAPACITY,
          (state.bridge.fuel ?? 0) + MANUAL_FUEL_PER_CYCLE,
        );
        state.bridge.manualFuelCycleStartMs = undefined;
      }
    }
  }

  /* ---------------------------------------------------------------------- */
  /* Stat recalculation (called after upgrades)                              */
  /* ---------------------------------------------------------------------- */

  recalcStats(state: GameState) {
    const bossGate = (state.workerGateLevel ?? 1) * WORKER_BOSS_GATE_SIZE;

    for (const wingId of WING_ORDER) {
      const wing = state.categories[wingId] as WingCategory;
      const def = WING_DEFS[wingId];

      for (const slot of SLOT_ORDER) {
        const slotDef = def.resources[slot];
        const capLevel = wing.upgrades[`${slot}Cap` as keyof typeof wing.upgrades] as number;
        wing.stats[capStatKey(slot)] = computeCapacity(slotDef.baseCapacity, capLevel);
      }
    }

    // Global worker pool max = base + upgrades, hard-capped by boss gate
    if (state.workers) {
      const rawMax = WORKER_BASE + state.workers.maxLevel * WORKER_PER_UPGRADE;
      state.workers.max = Math.min(rawMax, bossGate);
    }
  }

  /* ---------------------------------------------------------------------- */
  /* Energy accounting helpers                                               */
  /* ---------------------------------------------------------------------- */

  /** Total energy produced per second (by reactor primary workers) */
  getEnergyProduction(state: GameState): number {
    const wing = state.categories.reactor;
    const def = WING_DEFS.reactor.resources.primary;
    const workers = wing.workers.primary;
    const effLevel = wing.upgrades.primaryEff;
    const effMult = 1 + effLevel * def.efficiencyBonus;
    const buffMult = this.getBuffMultiplier(state, 'energyRate');
    return workers * def.baseRate * effMult * buffMult;
  }

  /** Total energy consumed per second by all non-free slots */
  getEnergyConsumption(state: GameState): number {
    let total = 0;

    // Reactor secondary consumes energy
    const reactorDef = WING_DEFS.reactor;
    total += state.categories.reactor.workers.secondary * reactorDef.resources.secondary.consumeRate;

    // Non-reactor primary workers consume energy
    for (const wingId of WING_ORDER) {
      if (wingId === 'reactor') continue;
      const wing = state.categories[wingId] as WingCategory;
      if (!wing.unlocked) continue;
      const def = WING_DEFS[wingId];
      total += wing.workers.primary * def.energyCostPerPrimaryWorker;
    }

    return total;
  }

  /* ---------------------------------------------------------------------- */
  /* Progression unlock checks                                               */
  /* ---------------------------------------------------------------------- */

  /** Free (unassigned) workers across all wings + bridge fuel. */
  static getFreeWorkers(state: GameState): number {
    const assigned = WING_ORDER.reduce((sum, id) => {
      const w = state.categories[id] as WingCategory;
      return sum + w.workers.primary + w.workers.secondary + w.workers.tertiary + w.workers.quaternary;
    }, 0) + (state.bridge?.fuelWorkers ?? 0);
    return (state.workers?.total ?? 0) - assigned;
  }

  /** Thermal cores represent advanced reactor hardware that only comes online
   *  once the player has crew to install it. Unlocking it consumes one free
   *  worker globally (see ActionSystem.handleUnlockTier). */
  static tierConsumesWorker(wingId: WingId, tier: 'secondary' | 'tertiary' | 'quaternary'): boolean {
    return wingId === 'reactor' && tier === 'tertiary';
  }

  /** Check if tier unlock thresholds are met (used by UI to show buttons).
   *  All tiers gate on the wing's PRIMARY resource — the primary acts as a
   *  single progression ladder for the whole wing. Reactor's tertiary
   *  (Thermal Cores) additionally requires worker hiring researched and one
   *  free worker available, which it will consume on unlock. */
  static canUnlockTier(state: GameState, wing: WingCategory, wingId: WingId, tier: 'secondary' | 'tertiary' | 'quaternary'): boolean {
    const thresholds = WING_DEFS[wingId].unlockThresholds;
    const primary = wing.resources.primary;
    if (tier === 'secondary') {
      return !wing.secondaryUnlocked && primary >= thresholds.secondary;
    }
    if (tier === 'tertiary') {
      if (wing.tertiaryUnlocked || !wing.secondaryUnlocked) return false;
      if (primary < thresholds.tertiary) return false;
      if (ResourceSystem.tierConsumesWorker(wingId, tier)) {
        if (!state.laboratory.workerHiring) return false;
        if (ResourceSystem.getFreeWorkers(state) < 1) return false;
      }
      return true;
    }
    return !wing.quaternaryUnlocked && wing.tertiaryUnlocked && primary >= thresholds.quaternary;
  }

  /** Get the current per-slot worker cap for a given slot in a wing */
  static getMaxWorkersForSlot(wing: WingCategory, slot: ResourceSlot): number {
    return INITIAL_MAX_WORKERS_PER_SLOT + wing.upgrades[maxWorkersKey(slot)];
  }

  /* ---------------------------------------------------------------------- */
  /* Internals                                                               */
  /* ---------------------------------------------------------------------- */

  private setRate(wing: WingCategory, slot: ResourceSlot, rate: number) {
    wing.stats[rateStatKey(slot)] = rate;
  }

  private updateBuffs(state: GameState, delta: number) {
    if (!state.buffs || state.buffs.length === 0) return;
    const deltaMs = delta * 1000;
    for (const buff of state.buffs) {
      buff.remainingMs -= deltaMs;
    }
    state.buffs = state.buffs.filter(b => b.remainingMs > 0);
  }

  /* ---------------------------------------------------------------------- */
  /* Resource checks (used by combat, ammo, etc.)                           */
  /* ---------------------------------------------------------------------- */

  hasResources(state: GameState, costs: { type: string; amount: number }[]): boolean {
    for (const { type, amount } of costs) {
      if (amount <= 0) continue;
      const accessor = getResourceAccessor(state, type);
      if (!accessor) {
        Logger.warn(LogCategory.RESOURCES, `Unknown resource type: ${type}`, LogContext.COMBAT);
        return false;
      }
      if (accessor.obj[accessor.key] < amount) return false;
    }
    return true;
  }

  consumeResources(state: GameState, costs: { type: string; amount: number }[]): boolean {
    if (!this.hasResources(state, costs)) return false;
    for (const { type, amount } of costs) {
      if (amount <= 0) continue;
      const accessor = getResourceAccessor(state, type);
      if (!accessor) return false;
      accessor.obj[accessor.key] -= amount;
    }
    return true;
  }
}
