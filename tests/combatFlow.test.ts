import { describe, it, expect, beforeEach } from 'vitest';
import { EventBus } from '@/game-engine/core/EventBus';
import { EventMap } from '@/game-engine/types/events';
import { initialGameState, GameState } from '@/game-engine/types';
import { CombatSystem } from '@/game-engine/systems/CombatSystem';
import { ResourceSystem } from '@/game-engine/systems/ResourceSystem';
import { RegionType } from '@/game-engine/types/regions';
import { ENEMY_DEFINITIONS } from '@/game-engine/content/enemies';
import { ENEMY_ACTIONS } from '@/game-engine/content/combatActions';

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
      regionId: RegionType.VOID
    });

    expect(state.combat.active).toBe(true);
    expect(state.combat.currentEnemy).toBe('scavenger');
  });

  it('sets initial player stats', () => {
    bus.emit('START_COMBAT', {
      state,
      enemyId: 'scavenger',
      regionId: RegionType.VOID
    });

    expect(state.combat.playerStats.health).toBeGreaterThan(0);
    expect(state.combat.playerStats.maxHealth).toBeGreaterThan(0);
  });

  it('initializes empty rewards', () => {
    bus.emit('START_COMBAT', {
      state,
      enemyId: 'scavenger',
      regionId: RegionType.VOID
    });

    expect(state.combat.rewards).toBeDefined();
    expect(state.combat.rewards!.energy).toBe(0);
    expect(state.combat.rewards!.insight).toBe(0);
  });

  it('seeds enemy cooldowns to give the player a breath before first attacks', () => {
    bus.emit('START_COMBAT', {
      state,
      enemyId: 'scavenger',
      regionId: RegionType.VOID
    });

    // Each enemy ability should be on its full cooldown at combat start
    const enemy = ENEMY_DEFINITIONS['scavenger'];
    for (const aid of enemy.actions) {
      const def = ENEMY_ACTIONS[aid];
      expect(state.combat.enemyCooldowns[aid]).toBe(def.cooldown);
    }
  });
});

describe('Player combat actions (real-time)', () => {
  let bus: EventBus<EventMap>;
  let state: GameState;
  let combat: CombatSystem;

  beforeEach(() => {
    bus = new EventBus<EventMap>();
    state = clone(initialGameState);
    const resource = new ResourceSystem();
    combat = new CombatSystem(bus);
    combat.setResourceSystem(resource);

    bus.emit('START_COMBAT', {
      state,
      enemyId: 'scavenger',
      regionId: RegionType.VOID
    });

    state.categories.reactor.resources.primary = 100;
    state.categories.manufacturing.resources.primary = 100;
    state.categories.processor.resources.primary = 100;
    state.categories.crewQuarters.resources.primary = 100;
  });

  it('performs an action and deducts ammo cost', () => {
    state.ammo.powerCells.current = 5;
    const before = state.ammo.powerCells.current;
    const result = combat.performCombatAction(state, 'basic-phaser');

    expect(result.success).toBe(true);
    expect(state.ammo.powerCells.current).toBeLessThan(before);
  });

  it('fails when ammo is insufficient', () => {
    state.ammo.powerCells.current = 0;
    const result = combat.performCombatAction(state, 'basic-phaser');
    expect(result.success).toBe(false);
  });

  it('sets cooldown in seconds after firing', () => {
    combat.performCombatAction(state, 'basic-phaser');
    // basic-phaser cooldown is 2 (seconds)
    expect(state.combat.cooldowns['basic-phaser']).toBe(2);
  });

  it('rejects action while on cooldown', () => {
    combat.performCombatAction(state, 'basic-phaser');
    const result = combat.performCombatAction(state, 'basic-phaser');
    expect(result.success).toBe(false);
  });

  it('rejects action while stunned', () => {
    state.combat.playerStunTimer = 1.5;
    const result = combat.performCombatAction(state, 'basic-phaser');
    expect(result.success).toBe(false);
  });
});

describe('Real-time update loop', () => {
  let bus: EventBus<EventMap>;
  let state: GameState;
  let combat: CombatSystem;

  beforeEach(() => {
    bus = new EventBus<EventMap>();
    state = clone(initialGameState);
    const resource = new ResourceSystem();
    combat = new CombatSystem(bus);
    combat.setResourceSystem(resource);

    bus.emit('START_COMBAT', {
      state,
      enemyId: 'scavenger',
      regionId: RegionType.VOID
    });

    state.categories.reactor.resources.primary = 100;
  });

  it('decrements player stun timer by delta seconds', () => {
    state.combat.playerStunTimer = 2;
    combat.update(state, 0.5);
    expect(state.combat.playerStunTimer).toBeCloseTo(1.5);
  });

  it('decrements player ability cooldowns by delta seconds', () => {
    combat.performCombatAction(state, 'basic-phaser');
    const cdAfterUse = state.combat.cooldowns['basic-phaser'];
    expect(cdAfterUse).toBeGreaterThan(0);

    combat.update(state, 0.25);
    expect(state.combat.cooldowns['basic-phaser']).toBeCloseTo(cdAfterUse - 0.25);
  });

  it('decrements enemy cooldowns by delta seconds', () => {
    const aid = 'sputtering-phaser';
    const startCd = state.combat.enemyCooldowns[aid];
    expect(startCd).toBeGreaterThan(0);

    combat.update(state, 0.5);
    expect(state.combat.enemyCooldowns[aid]).toBeCloseTo(startCd - 0.5);
  });

  it('fires enemy abilities once their cooldown elapses', () => {
    const healthBefore = state.combat.playerStats.health;
    const shieldBefore = state.combat.playerStats.shield;

    // Force the scavenger's first ability to be ready by zeroing its cooldown
    state.combat.enemyCooldowns['sputtering-phaser'] = 0;
    combat.update(state, 0.1);

    const totalDamage = (healthBefore - state.combat.playerStats.health) +
                        (shieldBefore - state.combat.playerStats.shield);
    expect(totalDamage).toBeGreaterThan(0);
    expect(state.combat.lastEnemyActionId).toBeTruthy();
    // Cooldown is reset after firing
    expect(state.combat.enemyCooldowns['sputtering-phaser']).toBeGreaterThan(0);
  });

  it('respects use-condition (Chomp only when player < 30% hull)', () => {
    bus.emit('START_COMBAT', {
      state,
      enemyId: 'void-lurker',
      regionId: RegionType.VOID,
    });

    // Make Chomp ready and Rend not ready so we isolate the gating
    state.combat.enemyCooldowns['chomp'] = 0;
    state.combat.enemyCooldowns['rend'] = 5;

    // Player at full health — Chomp should NOT fire
    combat.update(state, 0.1);
    expect(state.combat.lastEnemyActionId).not.toBe('chomp');

    // Drop player health below threshold and try again
    state.combat.playerStats.health = 10; // 10% of 100
    state.combat.enemyCooldowns['chomp'] = 0;
    combat.update(state, 0.1);
    expect(state.combat.lastEnemyActionId).toBe('chomp');
  });

  it('is a no-op when combat is inactive', () => {
    state.combat.active = false;
    const healthBefore = state.combat.playerStats.health;
    combat.update(state, 10);
    expect(state.combat.playerStats.health).toBe(healthBefore);
  });
});

describe('Retreat', () => {
  let bus: EventBus<EventMap>;
  let state: GameState;
  let combat: CombatSystem;

  beforeEach(() => {
    bus = new EventBus<EventMap>();
    state = clone(initialGameState);
    const resource = new ResourceSystem();
    combat = new CombatSystem(bus);
    combat.setResourceSystem(resource);

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
