import { describe, it, expect, beforeEach } from 'vitest';
import { UpgradeSystem } from '@/game-engine/systems/UpgradeSystem';
import { initialGameState, GameState } from '@/game-engine/types';
import { capacityUpgradeCost, efficiencyUpgradeCost, workerHireEnergyCost, workerMaxUpgradeRelicCost } from '@/game-engine/content/wingResources';

const clone = <T>(o: T): T => JSON.parse(JSON.stringify(o));

describe('UpgradeSystem — capacity upgrades', () => {
  let system: UpgradeSystem;
  let state: GameState;

  beforeEach(() => {
    system = new UpgradeSystem();
    state = clone(initialGameState);
  });

  it('purchases capacity upgrade when secondary resource is sufficient', () => {
    const cost = capacityUpgradeCost(0);
    state.categories.reactor.resources.secondary = cost + 10;
    const baseCap = state.categories.reactor.stats.primaryCapacity;

    const result = system.buyCapacityUpgrade(state, 'reactor', 'primary');

    expect(result).toBe(true);
    expect(state.categories.reactor.upgrades.primaryCap).toBe(1);
    expect(state.categories.reactor.stats.primaryCapacity).toBeGreaterThan(baseCap);
    expect(state.categories.reactor.resources.secondary).toBe(10);
  });

  it('fails when secondary resource is insufficient', () => {
    state.categories.reactor.resources.secondary = 0;
    const result = system.buyCapacityUpgrade(state, 'reactor', 'primary');

    expect(result).toBe(false);
    expect(state.categories.reactor.upgrades.primaryCap).toBe(0);
  });

  it('cost scales with level', () => {
    const cost0 = capacityUpgradeCost(0);
    const cost1 = capacityUpgradeCost(1);
    expect(cost1).toBeGreaterThan(cost0);
  });
});

describe('UpgradeSystem — efficiency upgrades', () => {
  let system: UpgradeSystem;
  let state: GameState;

  beforeEach(() => {
    system = new UpgradeSystem();
    state = clone(initialGameState);
  });

  it('purchases efficiency upgrade when tertiary resource is sufficient', () => {
    const cost = efficiencyUpgradeCost(0);
    state.categories.reactor.resources.tertiary = cost + 5;

    const result = system.buyEfficiencyUpgrade(state, 'reactor', 'primary');

    expect(result).toBe(true);
    expect(state.categories.reactor.upgrades.primaryEff).toBe(1);
    expect(state.categories.reactor.resources.tertiary).toBe(5);
  });

  it('fails when tertiary resource is insufficient', () => {
    state.categories.reactor.resources.tertiary = 0;
    const result = system.buyEfficiencyUpgrade(state, 'reactor', 'primary');

    expect(result).toBe(false);
    expect(state.categories.reactor.upgrades.primaryEff).toBe(0);
  });
});

describe('UpgradeSystem — hire worker (global pool)', () => {
  let system: UpgradeSystem;
  let state: GameState;

  beforeEach(() => {
    system = new UpgradeSystem();
    state = clone(initialGameState);
  });

  it('hires a worker when reactor energy is sufficient and below cap', () => {
    const cost = workerHireEnergyCost(state.workers.total);
    state.categories.reactor.resources.primary = cost + 5;
    const before = state.workers.total;

    const result = system.hireWorker(state);

    expect(result).toBe(true);
    expect(state.workers.total).toBe(before + 1);
    expect(state.categories.reactor.resources.primary).toBe(5);
  });

  it('fails when reactor energy is insufficient', () => {
    state.categories.reactor.resources.primary = 0;
    const result = system.hireWorker(state);
    expect(result).toBe(false);
  });

  it('fails when at global worker capacity', () => {
    state.workers.total = state.workers.max;
    state.categories.reactor.resources.primary = 9999;

    const result = system.hireWorker(state);
    expect(result).toBe(false);
  });
});

describe('UpgradeSystem — global worker cap upgrade', () => {
  let system: UpgradeSystem;
  let state: GameState;

  beforeEach(() => {
    system = new UpgradeSystem();
    state = clone(initialGameState);
  });

  it('upgrades worker max when relics are sufficient and below boss ceiling', () => {
    // Lift the boss-gated ceiling so the upgrade isn't capped
    state.workerGateLevel = 99;
    const cost = workerMaxUpgradeRelicCost(state.workers.maxLevel);
    state.relics = cost + 5;
    const levelBefore = state.workers.maxLevel;

    const result = system.buyWorkerCapUpgrade(state);

    expect(result).toBe(true);
    expect(state.workers.maxLevel).toBe(levelBefore + 1);
    expect(state.relics).toBe(5);
  });

  it('fails when relics are insufficient', () => {
    state.workerGateLevel = 99;
    state.relics = 0;
    const result = system.buyWorkerCapUpgrade(state);

    expect(result).toBe(false);
    expect(state.workers.maxLevel).toBe(0);
  });
});

describe('UpgradeSystem — special catalog upgrades', () => {
  let system: UpgradeSystem;
  let state: GameState;

  beforeEach(() => {
    system = new UpgradeSystem();
    state = clone(initialGameState);
  });

  it('purchases relic-cost upgrades from relics pool', () => {
    state.relics = 100;
    const result = system.purchaseUpgrade(state, 'reactor', 'shielding');

    expect(result).toBe(true);
    expect(state.relics).toBe(50); // cost is 50
    expect(state.categories.reactor.specialUpgrades.shielding).toBe(1);
  });

  it('returns false for unknown upgrade type', () => {
    const result = system.purchaseUpgrade(state, 'reactor', 'nonexistentUpgrade');
    expect(result).toBe(false);
  });

  it('returns false for unknown category', () => {
    const result = system.purchaseUpgrade(state, 'unknown' as any, 'shielding');
    expect(result).toBe(false);
  });

  it('updateAllStats recalculates capacity from upgrade levels', () => {
    state.categories.reactor.upgrades.primaryCap = 3;
    system.updateAllStats(state);
    // baseCapacity=100, capacityPerLevel=50, 3 levels → 100 + 150 = 250
    expect(state.categories.reactor.stats.primaryCapacity).toBe(250);
  });
});
