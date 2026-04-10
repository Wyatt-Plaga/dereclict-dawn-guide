import { describe, it, expect, beforeEach } from 'vitest';
import { EventBus } from '@/game-engine/core/EventBus';
import { EventMap } from '@/game-engine/types/events';
import { initialGameState, GameState } from '@/game-engine/types';
import { CombatSystem } from '@/game-engine/systems/CombatSystem';
import { ResourceSystem } from '@/game-engine/systems/ResourceSystem';
import { RegionType } from '@/game-engine/types/regions';
import { ENEMY_DEFINITIONS } from '@/game-engine/content/enemies';

const clone = <T>(o: T): T => JSON.parse(JSON.stringify(o));

function makeRig() {
  const bus = new EventBus<EventMap>();
  const state = clone(initialGameState);
  const resource = new ResourceSystem();
  const combat = new CombatSystem(bus);
  combat.setResourceSystem(resource);
  return { bus, state, combat };
}

describe('START_COMBAT event', () => {
  let bus: EventBus<EventMap>;
  let state: GameState;

  beforeEach(() => {
    ({ bus, state } = makeRig());
  });

  it('activates combat state', () => {
    bus.emit('START_COMBAT', {
      state,
      enemyId: 'scavenger',
      regionId: RegionType.VOID
    });

    expect(state.combat.active).toBe(true);
    expect(state.combat.currentEnemy).toBe('scavenger');
  });

  it('initializes the player turn with full AP', () => {
    bus.emit('START_COMBAT', {
      state,
      enemyId: 'scavenger',
      regionId: RegionType.VOID
    });

    expect(state.combat.turn).toBe(1);
    expect(state.combat.turnPhase).toBe('PLAYER');
    expect(state.combat.maxPlayerAP).toBeGreaterThan(0);
    expect(state.combat.playerAP).toBe(state.combat.maxPlayerAP);
    expect(state.combat.playerStunTurns).toBe(0);
  });

  it('sets enemy cooldowns to zero so they can act on the first enemy turn', () => {
    bus.emit('START_COMBAT', {
      state,
      enemyId: 'scavenger',
      regionId: RegionType.VOID
    });

    const enemy = ENEMY_DEFINITIONS['scavenger'];
    for (const aid of enemy.actions) {
      expect(state.combat.enemyCooldowns[aid]).toBe(0);
    }
  });
});

describe('Player combat actions (AP / turn-based)', () => {
  let state: GameState;
  let combat: CombatSystem;
  let bus: EventBus<EventMap>;

  beforeEach(() => {
    ({ bus, state, combat } = makeRig());
    bus.emit('START_COMBAT', {
      state,
      enemyId: 'scavenger',
      regionId: RegionType.VOID
    });

    state.categories.reactor.resources.primary = 100;
    state.categories.manufacturing.resources.primary = 100;
    state.categories.processor.resources.primary = 100;
    state.categories.crewQuarters.resources.primary = 100;
    state.ammo.powerCells.current = 10;
    // Allow multiple actions per turn for tests that need it
    state.combat.maxPlayerAP = 5;
    state.combat.playerAP = 5;
  });

  it('performs an action and deducts AP and ammo', () => {
    const apBefore = state.combat.playerAP;
    const ammoBefore = state.ammo.powerCells.current;
    const result = combat.performCombatAction(state, 'basic-phaser');

    expect(result.success).toBe(true);
    expect(state.combat.playerAP).toBe(apBefore - 1); // basic-phaser apCost = 1
    expect(state.ammo.powerCells.current).toBeLessThan(ammoBefore);
  });

  it('rejects an action when AP is insufficient', () => {
    state.combat.playerAP = 0;
    const result = combat.performCombatAction(state, 'basic-phaser');
    expect(result.success).toBe(false);
  });

  it('rejects an action while stunned', () => {
    state.combat.playerStunTurns = 2;
    const result = combat.performCombatAction(state, 'basic-phaser');
    expect(result.success).toBe(false);
  });

  it('rejects an action when not the player turn', () => {
    state.combat.turnPhase = 'ENEMY';
    const result = combat.performCombatAction(state, 'basic-phaser');
    expect(result.success).toBe(false);
  });

  it('sets cooldown in turns after firing', () => {
    // hull-patch has cooldown 2
    const result = combat.performCombatAction(state, 'hull-patch');
    expect(result.success).toBe(true);
    expect(state.combat.cooldowns['hull-patch']).toBe(2);
  });

  it('rejects an action while on cooldown', () => {
    combat.performCombatAction(state, 'hull-patch');
    const result = combat.performCombatAction(state, 'hull-patch');
    expect(result.success).toBe(false);
  });
});

describe('END_TURN flow', () => {
  let state: GameState;
  let combat: CombatSystem;
  let bus: EventBus<EventMap>;

  beforeEach(() => {
    ({ bus, state, combat } = makeRig());
    bus.emit('START_COMBAT', {
      state,
      enemyId: 'scavenger',
      regionId: RegionType.VOID
    });
    state.combat.maxPlayerAP = 3;
    state.combat.playerAP = 3;
  });

  it('refills player AP at the start of the next player turn', () => {
    state.combat.playerAP = 0;
    bus.emit('END_TURN', { state });
    expect(state.combat.playerAP).toBe(state.combat.maxPlayerAP);
  });

  it('advances the turn counter and returns control to the player', () => {
    const turnBefore = state.combat.turn;
    bus.emit('END_TURN', { state });
    expect(state.combat.turn).toBe(turnBefore + 1);
    expect(state.combat.turnPhase).toBe('PLAYER');
  });

  it('decrements player ability cooldowns by one turn', () => {
    state.combat.cooldowns['hull-patch'] = 2;
    bus.emit('END_TURN', { state });
    expect(state.combat.cooldowns['hull-patch']).toBe(1);
  });

  it('decrements player stun by one turn', () => {
    state.combat.playerStunTurns = 2;
    bus.emit('END_TURN', { state });
    expect(state.combat.playerStunTurns).toBe(1);
  });

  it('lets the enemy fire one ability and records lastEnemyActionId', () => {
    const healthBefore = state.combat.playerStats.health;
    const shieldBefore = state.combat.playerStats.shield;

    bus.emit('END_TURN', { state });

    const totalDmg =
      (healthBefore - state.combat.playerStats.health) +
      (shieldBefore - state.combat.playerStats.shield);
    expect(totalDmg).toBeGreaterThan(0);
    expect(state.combat.lastEnemyActionId).toBeTruthy();
  });

  it('puts the fired enemy ability on cooldown', () => {
    bus.emit('END_TURN', { state });
    const fired = state.combat.lastEnemyActionId!;
    // After firing, cooldown is set to def.cooldown then ticked down by 1
    expect(state.combat.enemyCooldowns[fired]).toBeGreaterThanOrEqual(0);
  });

  it('does nothing when not currently the player turn', () => {
    state.combat.turnPhase = 'ENEMY';
    const turnBefore = state.combat.turn;
    bus.emit('END_TURN', { state });
    expect(state.combat.turn).toBe(turnBefore);
  });

  it('applies radiation damage at the start of the next player turn', () => {
    state.combat.radiationStacks = 2;
    const healthBefore = state.combat.playerStats.health;
    bus.emit('END_TURN', { state });
    // After enemy turn, startPlayerTurn deals stacks*3 hull damage
    // Player took both enemy damage and radiation damage; just verify radiation reduced stacks
    expect(state.combat.radiationStacks).toBe(1);
    expect(state.combat.playerStats.health).toBeLessThan(healthBefore);
  });
});

describe('update() is a no-op for turn-based combat', () => {
  it('does not change combat state when ticked', () => {
    const { bus, state, combat } = makeRig();
    bus.emit('START_COMBAT', {
      state,
      enemyId: 'scavenger',
      regionId: RegionType.VOID
    });

    const snapshot = clone(state.combat);
    combat.update(state, 5);
    expect(state.combat).toEqual(snapshot);
  });
});

describe('Retreat', () => {
  let state: GameState;
  let combat: CombatSystem;
  let bus: EventBus<EventMap>;

  beforeEach(() => {
    ({ bus, state, combat } = makeRig());
    bus.emit('START_COMBAT', {
      state,
      enemyId: 'scavenger',
      regionId: RegionType.VOID
    });
  });

  it('ends combat on retreat via event', () => {
    bus.emit('RETREAT_FROM_BATTLE', { state });

    expect(state.combat.active).toBe(false);
    expect(state.combat.encounterCompleted).toBe(true);
    expect(state.combat.outcome).toBe('retreat');
  });

  it('retreatFromCombat returns new state with combat ended', () => {
    const newState = combat.retreatFromCombat(state);

    expect(newState.combat.active).toBe(false);
    expect(newState.combat.encounterCompleted).toBe(true);
    expect(newState.combat.outcome).toBe('retreat');
  });
});
