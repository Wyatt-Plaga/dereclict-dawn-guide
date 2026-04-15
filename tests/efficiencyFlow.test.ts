import { describe, it, expect, beforeEach } from 'vitest';
import { ActionSystem } from '@/game-engine/systems/ActionSystem';
import { UpgradeSystem } from '@/game-engine/systems/UpgradeSystem';
import { ResourceSystem } from '@/game-engine/systems/ResourceSystem';
import { EventBus } from '@/game-engine/core/EventBus';
import { EventMap } from '@/game-engine/types/events';
import { GameState } from '@/game-engine/types';
import { freshState } from './helpers';
import { produce } from 'immer';

describe('Full dispatch flow: BUY_EFFICIENCY_UPGRADE', () => {
  let bus: EventBus<EventMap>;
  let action: ActionSystem;
  let resource: ResourceSystem;
  let state: GameState;

  beforeEach(() => {
    bus = new EventBus<EventMap>();
    // UpgradeSystem registers its PURCHASE_UPGRADE listener in its constructor.
    new UpgradeSystem(bus);
    action = new ActionSystem(bus);
    resource = new ResourceSystem();
    state = freshState();
    state.laboratory.efficiencyUpgrades = true;
    state.laboratory.workerHiring = true;
    state.categories.reactor.automated.primary = true;
    state.categories.reactor.workers.primary = 1;
    state.categories.reactor.resources.tertiary = 9999;
  });

  it('dispatching BUY_EFFICIENCY_UPGRADE increments primaryEff via eventBus', () => {
    const next = produce(state, (draft) => {
      action.processAction(draft as GameState, {
        type: 'BUY_EFFICIENCY_UPGRADE',
        payload: { wing: 'reactor', slot: 'primary' },
      });
    });
    expect(next.categories.reactor.upgrades.primaryEff).toBe(1);
  });

  it('after upgrade, next production tick produces at higher rate', () => {
    // Purchase upgrade
    const s1 = produce(state, (draft) => {
      action.processAction(draft as GameState, {
        type: 'BUY_EFFICIENCY_UPGRADE',
        payload: { wing: 'reactor', slot: 'primary' },
      });
    });
    // Then tick one second
    const s2 = produce(s1, (draft) => {
      resource.update(draft as GameState, 1);
    });
    // baseRate 2.0 × 1 worker × (1 + 1*0.5) = 3.0 in 1 second
    expect(s2.categories.reactor.resources.primary).toBeCloseTo(3.0, 1);
    expect(s2.categories.reactor.stats.primaryRate).toBeCloseTo(3.0, 1);
  });
});
