import { GameState, WingCategory } from '../types';
import { GameCategory } from '../types/actions';
import Logger, { LogCategory, LogContext } from '@/app/utils/logger';
import { EventBus } from "../core/EventBus";
import { EventMap } from "../types/events";
import { UPGRADE_CATALOG } from '../config/upgradeCatalog';
import { getResourceAccessor } from '../utils/resourceAccessor';
import { ResourceSystem } from './ResourceSystem';
import {
  WingId, ResourceSlot, SLOT_ORDER,
  capacityUpgradeCost, efficiencyUpgradeCost,
  workerHireEnergyCost, workerMaxUpgradeRelicCost,
  WORKER_BASE, WORKER_PER_UPGRADE, WORKER_BOSS_GATE_SIZE,
} from '../content/wingResources';
import { capKey, effKey } from '../types/resources';
import { incrementAtPath } from '../utils/objectPath';

export class UpgradeSystem {
  private eventBus?: EventBus<EventMap>;
  private resourceSystem: ResourceSystem;

  constructor(eventBus?: EventBus<EventMap>) {
    this.eventBus = eventBus;
    this.resourceSystem = new ResourceSystem();

    if (this.eventBus) {
      this.eventBus.on('PURCHASE_UPGRADE', (data) => {
        const { state, category, upgradeType } = data;

        // Route internal wing upgrade types
        if (upgradeType.startsWith('__cap__')) {
          const slot = upgradeType.replace('__cap__', '') as ResourceSlot;
          this.buyCapacityUpgrade(state, category as WingId, slot);
          return;
        }
        if (upgradeType.startsWith('__eff__')) {
          const slot = upgradeType.replace('__eff__', '') as ResourceSlot;
          this.buyEfficiencyUpgrade(state, category as WingId, slot);
          return;
        }
        if (upgradeType === '__hireWorker__') {
          this.hireWorker(state);
          return;
        }
        if (upgradeType === '__workerCap__') {
          this.buyWorkerCapUpgrade(state);
          return;
        }

        // Standard catalog-based upgrade
        this.purchaseUpgrade(state, category, upgradeType);
      });
    }
  }

  /** Purchase a special (catalog-based) upgrade */
  purchaseUpgrade(state: GameState, category: GameCategory, upgradeType: string): boolean {
    Logger.debug(LogCategory.UPGRADES, `Attempting to purchase ${upgradeType} in ${category}`, LogContext.UPGRADE_PURCHASE);

    const catalogEntry = UPGRADE_CATALOG[category]?.[upgradeType];
    if (!catalogEntry) {
      Logger.warn(LogCategory.UPGRADES, `Unknown upgrade ${upgradeType} in category ${category}`, LogContext.UPGRADE_PURCHASE);
      return false;
    }

    const cost = catalogEntry.cost(state);
    const accessor = getResourceAccessor(state, catalogEntry.resource);
    if (!accessor) {
      Logger.warn(LogCategory.UPGRADES, `Unknown resource type: ${catalogEntry.resource}`, LogContext.UPGRADE_PURCHASE);
      return false;
    }

    if (accessor.obj[accessor.key] < cost) {
      Logger.debug(LogCategory.UPGRADES, 'Insufficient resources for upgrade', LogContext.UPGRADE_PURCHASE);
      return false;
    }

    accessor.obj[accessor.key] -= cost;

    // For boolean-style unlocks, the catalog apply() handles the increment.
    // For numeric unlocks we still increment the path.
    if (catalogEntry.incrementPath) {
      // Special case: unlocked fields are booleans now
      if (catalogEntry.incrementPath.endsWith('.unlocked')) {
        // apply() already sets it
      } else {
        incrementAtPath(state, catalogEntry.incrementPath, 1);
      }
    }
    catalogEntry.apply(state);
    return true;
  }

  /** Buy a capacity upgrade for a specific slot in a wing (costs secondary resource) */
  buyCapacityUpgrade(state: GameState, wingId: WingId, slot: ResourceSlot): boolean {
    const wing = state.categories[wingId] as WingCategory;
    const level = wing.upgrades[capKey(slot)] as number;
    const cost = capacityUpgradeCost(level);

    if (wing.resources.secondary < cost) return false;
    wing.resources.secondary -= cost;
    (wing.upgrades as any)[capKey(slot)] = level + 1;

    this.resourceSystem.recalcStats(state);
    return true;
  }

  /** Buy an efficiency upgrade for a specific slot in a wing (costs tertiary resource) */
  buyEfficiencyUpgrade(state: GameState, wingId: WingId, slot: ResourceSlot): boolean {
    const wing = state.categories[wingId] as WingCategory;
    const level = wing.upgrades[effKey(slot)] as number;
    const cost = efficiencyUpgradeCost(level);

    if (wing.resources.tertiary < cost) return false;
    wing.resources.tertiary -= cost;
    (wing.upgrades as any)[effKey(slot)] = level + 1;

    return true;
  }

  /** Hire a worker into the shared pool (costs energy from the reactor) */
  hireWorker(state: GameState): boolean {
    if (state.workers.total >= state.workers.max) return false;

    const cost = workerHireEnergyCost(state.workers.total);
    if (state.categories.reactor.resources.primary < cost) return false;

    state.categories.reactor.resources.primary -= cost;
    state.workers.total += 1;
    return true;
  }

  /** Upgrade the global worker maximum (costs relics, +WORKER_PER_UPGRADE per level) */
  buyWorkerCapUpgrade(state: GameState): boolean {
    const level = state.workers.maxLevel;
    const cost = workerMaxUpgradeRelicCost(level);
    if (state.relics < cost) return false;

    // No point upgrading past the boss-gated ceiling
    const bossCeiling = (state.workerGateLevel ?? 1) * WORKER_BOSS_GATE_SIZE;
    const currentRawMax = WORKER_BASE + level * WORKER_PER_UPGRADE;
    if (currentRawMax >= bossCeiling) return false;

    state.relics -= cost;
    state.workers.maxLevel = level + 1;

    this.resourceSystem.recalcStats(state);
    return true;
  }

  /** Recalculate all computed stats from upgrade levels */
  updateAllStats(state: GameState): void {
    this.resourceSystem.recalcStats(state);

    for (const catEntries of Object.values(UPGRADE_CATALOG)) {
      for (const def of Object.values(catEntries)) {
        def.apply(state);
      }
    }
  }
}
