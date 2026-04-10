import { GameState, WingCategory } from '../types';
import { BuffType } from '../types/resources';
import { WING_DEFS, WingId, WING_ORDER, SLOT_ORDER, ResourceSlot, WORKER_BASE, WORKER_PER_UPGRADE, WORKER_BOSS_GATE_SIZE } from '../content/wingResources';
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

    // Calculate desired production and consumption for every slot
    for (const wingId of WING_ORDER) {
      const wing = state.categories[wingId] as WingCategory;
      if (!wing.unlocked) continue;

      const def = WING_DEFS[wingId];
      const buffMult = this.getBuffMultiplier(state, ResourceSystem.BUFF_MAP[wingId]);

      for (const slot of SLOT_ORDER) {
        // Only produce via workers for automated slots
        if (!wing.automated[slot]) {
          this.setRate(wing, slot, 0);
          continue;
        }

        const slotDef = def.resources[slot];
        const workers = wing.workers[slot];
        if (workers <= 0) {
          this.setRate(wing, slot, 0);
          continue;
        }

        const effLevel = wing.upgrades[`${slot}Eff` as keyof typeof wing.upgrades] as number;
        const effMultiplier = 1 + effLevel * slotDef.efficiencyBonus;

        // Raw production before clamping
        let produce = workers * slotDef.baseRate * effMultiplier * buffMult * delta;

        // Consumption of input resource
        let canProduce = true;

        if (slot === 'primary' && wingId !== 'reactor') {
          // Non-reactor primary consumes energy
          const energyNeeded = workers * def.energyCostPerPrimaryWorker * delta;
          const reactorRes = state.categories.reactor.resources;
          if (reactorRes.primary < energyNeeded) {
            // Partial production proportional to available energy
            const ratio = reactorRes.primary / energyNeeded;
            produce *= ratio;
            reactorRes.primary = 0;
          } else {
            reactorRes.primary -= energyNeeded;
          }
        } else if (slot === 'secondary') {
          // Consumes primary
          const needed = workers * slotDef.consumeRate * delta;
          if (wing.resources.primary < needed) {
            const ratio = needed > 0 ? wing.resources.primary / needed : 0;
            produce *= ratio;
            wing.resources.primary = 0;
          } else {
            wing.resources.primary -= needed;
          }
        } else if (slot === 'tertiary') {
          // Consumes secondary
          const needed = workers * slotDef.consumeRate * delta;
          if (wing.resources.secondary < needed) {
            const ratio = needed > 0 ? wing.resources.secondary / needed : 0;
            produce *= ratio;
            wing.resources.secondary = 0;
          } else {
            wing.resources.secondary -= needed;
          }
        }

        // Apply production capped at capacity
        const capKey = `${slot}Capacity` as keyof typeof wing.stats;
        const cap = wing.stats[capKey] as number;
        wing.resources[slot] = Math.min(wing.resources[slot] + produce, cap);

        // Store net rate for UI display (approximate, recalculated each tick)
        this.setRate(wing, slot, produce / delta);
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
        const capKey = `${slot}Capacity` as keyof typeof wing.stats;
        (wing.stats as any)[capKey] = slotDef.baseCapacity + capLevel * slotDef.capacityPerLevel;
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

  /** Check if tier unlock thresholds are met (used by UI to show buttons) */
  static canUnlockTier(wing: WingCategory, wingId: WingId, tier: 'secondary' | 'tertiary'): boolean {
    const thresholds = WING_DEFS[wingId].unlockThresholds;
    if (tier === 'secondary') {
      return !wing.secondaryUnlocked && wing.resources.primary >= thresholds.secondary;
    }
    return !wing.tertiaryUnlocked && wing.resources.secondary >= thresholds.tertiary;
  }

  /* ---------------------------------------------------------------------- */
  /* Internals                                                               */
  /* ---------------------------------------------------------------------- */

  private setRate(wing: WingCategory, slot: ResourceSlot, rate: number) {
    const key = `${slot}Rate` as keyof typeof wing.stats;
    (wing.stats as any)[key] = rate;
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
