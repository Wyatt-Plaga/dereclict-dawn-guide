import { describe, it, expect, beforeEach } from 'vitest';
import { EventBus } from '@/game-engine/core/EventBus';
import { EventMap } from '@/game-engine/types/events';
import { GameState } from '@/game-engine/types';
import { UpgradeSystem } from '@/game-engine/systems/UpgradeSystem';
import { ActionSystem } from '@/game-engine/systems/ActionSystem';
import { freshState } from './helpers';

describe('EventBus integration', () => {
  let bus: EventBus<EventMap>;
  let state: GameState;
  beforeEach(() => {
    bus = new EventBus<EventMap>();
    state = freshState();
  });

  it('purchase special upgrade via event bus mutates state', () => {
    // give relics for shielding upgrade
    state.relics = 200;

    // attach systems
    new UpgradeSystem(bus);
    const actionSystem = new ActionSystem(bus);

    // dispatch purchase of shielding (a catalog-based special upgrade)
    actionSystem.processAction(state, {
      type: 'PURCHASE_UPGRADE',
      payload: { category: 'reactor', upgradeType: 'shielding' }
    } as any);

    expect(state.categories.reactor.specialUpgrades.shielding).toBe(1);
    expect(state.relics).toBeLessThan(200);
  });

  it('purchase capacity upgrade via event bus', () => {
    // give secondary resources for capacity upgrade
    state.categories.reactor.resources.secondary = 100;

    new UpgradeSystem(bus);
    const actionSystem = new ActionSystem(bus);

    actionSystem.processAction(state, {
      type: 'BUY_CAPACITY_UPGRADE',
      payload: { wing: 'reactor', slot: 'primary' }
    } as any);

    expect(state.categories.reactor.upgrades.primaryCap).toBe(1);
    expect(state.categories.reactor.resources.secondary).toBeLessThan(100);
  });
});
