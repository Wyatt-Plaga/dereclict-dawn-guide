import { describe, it, expect, beforeEach } from 'vitest';
import { ResourceSystem } from '@/game-engine/systems/ResourceSystem';
import { initialGameState, GameState } from '@/game-engine/types';

const cloneState = (): GameState => JSON.parse(JSON.stringify(initialGameState));

describe('ResourceSystem worker-based production', () => {
  let system: ResourceSystem;
  let state: GameState;

  beforeEach(() => {
    system = new ResourceSystem();
    state = cloneState();
  });

  it('generates primary resource proportional to workers × baseRate × delta', () => {
    // Assign 2 workers to reactor primary (energy)
    state.categories.reactor.automated.primary = true;
    state.categories.reactor.workers.primary = 2;
    system.update(state, 1); // 1 second

    // baseRate = 2.0/s, 2 workers, 1 second → 4.0 energy
    expect(state.categories.reactor.resources.primary).toBeCloseTo(4.0, 1);
  });

  it('does not exceed capacity', () => {
    state.categories.reactor.automated.primary = true;
    state.categories.reactor.workers.primary = 5;
    state.categories.reactor.resources.primary = 98;
    // 5 workers × 2.0 baseRate × 1s = 10, but cap is 100
    system.update(state, 1);
    expect(state.categories.reactor.resources.primary).toBe(100);
  });

  it('produces nothing when no workers assigned', () => {
    state.categories.reactor.workers.primary = 0;
    system.update(state, 1);
    expect(state.categories.reactor.resources.primary).toBe(0);
  });

  it('secondary production consumes primary resource', () => {
    // Give energy and assign workers to reactor secondary (fuel rods)
    state.categories.reactor.automated.secondary = true;
    state.categories.reactor.resources.primary = 50;
    state.categories.reactor.workers.secondary = 1;
    system.update(state, 1);

    // Should have consumed energy (consumeRate = 1.5/s per worker)
    expect(state.categories.reactor.resources.primary).toBeLessThan(50);
    // Should have produced fuel rods (baseRate = 0.3/s)
    expect(state.categories.reactor.resources.secondary).toBeGreaterThan(0);
  });

  it('non-reactor primary workers consume energy from reactor', () => {
    state.categories.reactor.resources.primary = 50;
    state.categories.processor.unlocked = true;
    state.categories.processor.automated.primary = true;
    state.categories.processor.workers.primary = 1;
    system.update(state, 1);

    // Processor primary consumes energy (energyCostPerPrimaryWorker = 1.0)
    expect(state.categories.reactor.resources.primary).toBeLessThan(50);
    // Processor primary should have produced insight
    expect(state.categories.processor.resources.primary).toBeGreaterThan(0);
  });

  it('efficiency upgrades increase production', () => {
    state.categories.reactor.automated.primary = true;
    state.categories.reactor.workers.primary = 1;
    state.categories.reactor.upgrades.primaryEff = 2;
    // efficiencyBonus = 0.5, so multiplier = 1 + 2 × 0.5 = 2.0
    // Expected: 1 × 2.0 × 2.0 × 1s = 4.0
    system.update(state, 1);
    expect(state.categories.reactor.resources.primary).toBeCloseTo(4.0, 1);
  });

  it('partial production when insufficient input', () => {
    // Only 0.5 energy available, but worker needs 1.5/s
    state.categories.reactor.automated.secondary = true;
    state.categories.reactor.resources.primary = 0.5;
    state.categories.reactor.workers.secondary = 1;
    system.update(state, 1);

    // Should partially produce fuel rods proportional to available energy
    expect(state.categories.reactor.resources.secondary).toBeGreaterThan(0);
    // Energy should be fully consumed
    expect(state.categories.reactor.resources.primary).toBeCloseTo(0, 5);
  });

  it('skips unlocked=false wings', () => {
    state.categories.processor.unlocked = false;
    state.categories.processor.workers.primary = 5;
    system.update(state, 1);
    expect(state.categories.processor.resources.primary).toBe(0);
  });
});

describe('ResourceSystem.recalcStats', () => {
  let system: ResourceSystem;
  let state: GameState;

  beforeEach(() => {
    system = new ResourceSystem();
    state = cloneState();
  });

  it('updates capacity based on upgrade levels', () => {
    const baseCap = state.categories.reactor.stats.primaryCapacity;
    state.categories.reactor.upgrades.primaryCap = 2;
    system.recalcStats(state);
    // capacityPerLevel = 50, so 2 levels = +100
    expect(state.categories.reactor.stats.primaryCapacity).toBe(baseCap + 100);
  });
});

describe('ResourceSystem.hasResources / consumeResources', () => {
  let system: ResourceSystem;
  let state: GameState;

  beforeEach(() => {
    system = new ResourceSystem();
    state = cloneState();
    // give resources via new primary slot
    state.categories.reactor.resources.primary = 50;
    state.categories.processor.resources.primary = 20;
  });

  it('checks resource sufficiency correctly', () => {
    expect(system.hasResources(state, [{ type: 'energy', amount: 40 }])).toBe(true);
    expect(system.hasResources(state, [{ type: 'energy', amount: 60 }])).toBe(false);
  });

  it('consumes resources when available', () => {
    const ok = system.consumeResources(state, [{ type: 'energy', amount: 30 }]);
    expect(ok).toBe(true);
    expect(state.categories.reactor.resources.primary).toBe(20);
  });

  it('fails to consume when insufficient', () => {
    const ok = system.consumeResources(state, [{ type: 'insight', amount: 50 }]);
    expect(ok).toBe(false);
    expect(state.categories.processor.resources.primary).toBe(20); // unchanged
  });
});
