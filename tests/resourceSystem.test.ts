import { describe, it, expect, beforeEach } from 'vitest';
import { ResourceSystem } from '@/game-engine/systems/ResourceSystem';
import { GameState } from '@/game-engine/types';
import { WING_DEFS } from '@/game-engine/content/wingResources';
import { freshState } from './helpers';

const REACTOR_PRIMARY_RATE = WING_DEFS.reactor.resources.primary.baseRate;

describe('ResourceSystem worker-based production', () => {
  let system: ResourceSystem;
  let state: GameState;

  beforeEach(() => {
    system = new ResourceSystem();
    state = freshState();
  });

  it('generates primary resource proportional to workers × baseRate × delta', () => {
    // Assign 2 workers to reactor primary (energy)
    state.categories.reactor.automated.primary = true;
    state.categories.reactor.workers.primary = 2;
    system.update(state, 1); // 1 second

    // 2 workers × baseRate × 1s
    expect(state.categories.reactor.resources.primary).toBeCloseTo(2 * REACTOR_PRIMARY_RATE, 5);
  });

  it('does not exceed capacity', () => {
    state.categories.reactor.automated.primary = true;
    state.categories.reactor.workers.primary = 20;
    state.categories.reactor.resources.primary = 3;
    // 20 workers × baseRate × 1s should overshoot, but cap is 10
    system.update(state, 1);
    expect(state.categories.reactor.resources.primary).toBe(10);
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
    // efficiencyBonus = 0.75, so multiplier = 1 + 2 × 0.75 = 2.5
    // Expected: 1 worker × baseRate × 2.5 × 1s
    system.update(state, 1);
    expect(state.categories.reactor.resources.primary).toBeCloseTo(REACTOR_PRIMARY_RATE * 2.5, 5);
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
    state = freshState();
  });

  it('updates capacity based on upgrade levels', () => {
    state.categories.reactor.upgrades.primaryCap = 2;
    system.recalcStats(state);
    // baseCapacity=10, geometric 1.22, level 2 → floor(10 × 1.22²) = 14
    expect(state.categories.reactor.stats.primaryCapacity).toBe(14);
  });
});

describe('ResourceSystem.hasResources / consumeResources', () => {
  let system: ResourceSystem;
  let state: GameState;

  beforeEach(() => {
    system = new ResourceSystem();
    state = freshState();
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
