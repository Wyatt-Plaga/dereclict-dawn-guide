import { describe, it, expect, beforeEach } from 'vitest';
import { EventBus } from '@/game-engine/core/EventBus';
import { EventMap } from '@/game-engine/types/events';
import { initialGameState, GameState } from '@/game-engine/types';
import { CombatSystem } from '@/game-engine/systems/CombatSystem';
import { ResourceSystem } from '@/game-engine/systems/ResourceSystem';

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