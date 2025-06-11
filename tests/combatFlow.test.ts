import { describe, it, expect, beforeEach } from 'vitest';
import { EventBus } from '../app/game/core/EventBus';
import { EventMap } from '../app/game/types/events';
import { initialGameState, GameState } from '../app/game/types';
import { CombatSystem } from '../app/game/systems/CombatSystem';
import { ResourceSystem } from '../app/game/systems/ResourceSystem';

const clone = <T>(o: T): T => JSON.parse(JSON.stringify(o));

describe('START_COMBAT event', () => {
  let bus: EventBus<EventMap>;
  let state: GameState;
  let combat: CombatSystem;

  beforeEach(() => {
    bus = new EventBus<EventMap>();
    state = clone(initialGameState);
    const resource = new ResourceSystem();
    combat = new CombatSystem(bus);
    combat.setResourceSystem(resource);
  });

  it('activates combat state', () => {
    bus.emit('START_COMBAT', {
      state,
      enemyId: 'scavenger',
      regionId: 'void'
    });

    expect(state.combat.active).toBe(true);
    expect(state.combat.currentEnemy).toBe('scavenger');
  });
}); 