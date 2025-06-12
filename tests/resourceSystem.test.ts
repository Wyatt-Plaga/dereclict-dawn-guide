import { describe, it, expect, beforeEach } from 'vitest';
import { ResourceSystem } from '@/game-engine/systems/ResourceSystem';
import { initialGameState, GameState } from '@/game-engine/types';

// Helper to get a fresh deep copy of game state for each test
const cloneState = (): GameState => JSON.parse(JSON.stringify(initialGameState));

describe('ResourceSystem.updateResourceCategory', () => {
  let system: ResourceSystem;
  let state: GameState;

  beforeEach(() => {
    system = new ResourceSystem();
    state = cloneState();
  });

  it('generates resources according to rate × delta', () => {
    state.categories.reactor.stats.energyPerSecond = 10;
    system.update(state, 1); // 1 second
    expect(state.categories.reactor.resources.energy).toBe(10);
  });

  it('does not exceed capacity', () => {
    state.categories.reactor.stats.energyPerSecond = 200; // would generate 200 > capacity 100
    system.update(state, 1);
    expect(state.categories.reactor.resources.energy).toBe(state.categories.reactor.stats.energyCapacity);
  });
});

describe('ResourceSystem.hasResources / consumeResources', () => {
  let system: ResourceSystem;
  let state: GameState;

  beforeEach(() => {
    system = new ResourceSystem();
    state = cloneState();
    // give plenty of resources for tests
    state.categories.reactor.resources.energy = 50;
    state.categories.processor.resources.insight = 20;
  });

  it('checks resource sufficiency correctly', () => {
    expect(system.hasResources(state, [{ type: 'energy', amount: 40 }])).toBe(true);
    expect(system.hasResources(state, [{ type: 'energy', amount: 60 }])).toBe(false);
  });

  it('consumes resources when available', () => {
    const ok = system.consumeResources(state, [{ type: 'energy', amount: 30 }]);
    expect(ok).toBe(true);
    expect(state.categories.reactor.resources.energy).toBe(20);
  });

  it('fails to consume when insufficient', () => {
    const ok = system.consumeResources(state, [{ type: 'insight', amount: 50 }]);
    expect(ok).toBe(false);
    expect(state.categories.processor.resources.insight).toBe(20); // unchanged
  });
}); 