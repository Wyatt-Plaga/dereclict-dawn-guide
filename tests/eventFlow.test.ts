import { describe, it, expect, beforeEach } from 'vitest';
import { EventBus } from '../app/game/core/EventBus';
import { initialGameState, GameState } from '../app/game/types';
import { UpgradeSystem } from '../app/game/systems/UpgradeSystem';
import { ActionSystem } from '../app/game/systems/ActionSystem';

const clone = <T>(obj: T): T => JSON.parse(JSON.stringify(obj));

describe('EventBus integration', () => {
  let bus: EventBus;
  let state: GameState;
  beforeEach(() => {
    bus = new EventBus();
    state = clone(initialGameState);
  });

  it('purchase upgrade via event bus mutates state', () => {
    // give resources
    state.categories.reactor.resources.energy = 200;

    // attach systems
    new UpgradeSystem(bus);
    const actionSystem = new ActionSystem(bus);

    // dispatch purchase upgrade through ActionSystem handler
    actionSystem.processAction(state, {
      type: 'PURCHASE_UPGRADE',
      payload: { category: 'reactor', upgradeType: 'reactorExpansions' }
    } as any);

    expect(state.categories.reactor.upgrades.reactorExpansions).toBe(1);
    expect(state.categories.reactor.resources.energy).toBeLessThan(200);
  });
}); 