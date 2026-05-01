/**
 * Tests for the full primary→secondary→tertiary→quaternary chain.
 *
 * Coverage focus: behaviour added by the quaternary tier and the per-slot
 * worker cap, plus end-to-end gating of tier unlocks. The lower tiers are
 * already exercised in resourceSystem.test.ts and upgradeSystem.test.ts.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ResourceSystem } from '@/game-engine/systems/ResourceSystem';
import { UpgradeSystem } from '@/game-engine/systems/UpgradeSystem';
import { ActionSystem } from '@/game-engine/systems/ActionSystem';
import { EventBus } from '@/game-engine/core/EventBus';
import { EventMap } from '@/game-engine/types/events';
import { GameState } from '@/game-engine/types';
import {
  WING_DEFS,
  SLOT_ORDER,
  SLOT_CONSUMES,
  INITIAL_MAX_WORKERS_PER_SLOT,
  maxWorkersUpgradeCost,
} from '@/game-engine/content/wingResources';
import { freshState } from './helpers';

/* -------------------------------------------------------------------------- */
/* Quaternary slot — production & consumption                                 */
/* -------------------------------------------------------------------------- */

describe('Quaternary slot — production', () => {
  let system: ResourceSystem;
  let state: GameState;

  beforeEach(() => {
    system = new ResourceSystem();
    state = freshState();
  });

  it('produces from tertiary input when automated and staffed', () => {
    const reactor = state.categories.reactor;
    reactor.automated.quaternary = true;
    reactor.workers.quaternary = 1;
    reactor.resources.tertiary = 10;

    system.update(state, 1);

    const def = WING_DEFS.reactor.resources.quaternary;
    // Net production = baseRate × workers × delta (no eff upgrades)
    expect(reactor.resources.quaternary).toBeCloseTo(def.baseRate, 5);
    // Should have consumed tertiary at consumeRate
    expect(reactor.resources.tertiary).toBeCloseTo(10 - def.consumeRate, 5);
  });

  it('partial production when tertiary input is depleted', () => {
    const reactor = state.categories.reactor;
    const def = WING_DEFS.reactor.resources.quaternary;
    reactor.automated.quaternary = true;
    reactor.workers.quaternary = 1;
    // Only enough tertiary for half a tick
    reactor.resources.tertiary = def.consumeRate / 2;

    system.update(state, 1);

    expect(reactor.resources.tertiary).toBeCloseTo(0, 5);
    // Production scales by the same ratio (0.5)
    expect(reactor.resources.quaternary).toBeCloseTo(def.baseRate * 0.5, 5);
  });

  it('does not exceed quaternary capacity', () => {
    const reactor = state.categories.reactor;
    const def = WING_DEFS.reactor.resources.quaternary;
    reactor.automated.quaternary = true;
    reactor.workers.quaternary = 100; // hugely overproduce
    reactor.resources.tertiary = 9999;

    system.update(state, 1);

    expect(reactor.resources.quaternary).toBe(def.baseCapacity);
  });
});

/* -------------------------------------------------------------------------- */
/* SLOT_CONSUMES is the source of truth for the chain                         */
/* -------------------------------------------------------------------------- */

describe('SLOT_CONSUMES configuration', () => {
  it('declares an input for every non-primary slot', () => {
    for (const slot of SLOT_ORDER) {
      if (slot === 'primary') continue;
      expect(SLOT_CONSUMES[slot]).toBeDefined();
    }
  });

  it('chains each slot back to the immediately preceding tier', () => {
    expect(SLOT_CONSUMES.secondary).toBe('primary');
    expect(SLOT_CONSUMES.tertiary).toBe('secondary');
    expect(SLOT_CONSUMES.quaternary).toBe('tertiary');
  });
});

/* -------------------------------------------------------------------------- */
/* Tier unlock progression                                                    */
/* -------------------------------------------------------------------------- */

describe('Tier unlock chain', () => {
  let state: GameState;

  beforeEach(() => {
    state = freshState();
  });

  it('reports canUnlockTier === true only when threshold + prereqs met', () => {
    const reactor = state.categories.reactor;
    const t = WING_DEFS.reactor.unlockThresholds;

    // Reactor tertiary additionally requires worker hiring + a free worker
    state.laboratory.workerHiring = true;
    state.workers.total = 1;
    state.workers.max = 1;

    // Nothing unlocked, no resources
    expect(ResourceSystem.canUnlockTier(state, reactor, 'reactor', 'secondary')).toBe(false);
    expect(ResourceSystem.canUnlockTier(state, reactor, 'reactor', 'tertiary')).toBe(false);
    expect(ResourceSystem.canUnlockTier(state, reactor, 'reactor', 'quaternary')).toBe(false);

    // Secondary becomes available with enough primary
    reactor.resources.primary = t.secondary;
    expect(ResourceSystem.canUnlockTier(state, reactor, 'reactor', 'secondary')).toBe(true);

    // Tertiary needs secondary unlocked AND enough PRIMARY resource
    reactor.resources.primary = t.tertiary;
    expect(ResourceSystem.canUnlockTier(state, reactor, 'reactor', 'tertiary')).toBe(false); // not unlocked yet
    reactor.secondaryUnlocked = true;
    expect(ResourceSystem.canUnlockTier(state, reactor, 'reactor', 'tertiary')).toBe(true);

    // Quaternary needs tertiary unlocked AND enough PRIMARY resource
    reactor.resources.primary = t.quaternary;
    expect(ResourceSystem.canUnlockTier(state, reactor, 'reactor', 'quaternary')).toBe(false);
    reactor.tertiaryUnlocked = true;
    expect(ResourceSystem.canUnlockTier(state, reactor, 'reactor', 'quaternary')).toBe(true);
  });

  it('UNLOCK_TIER action gates on prereqs and threshold', () => {
    const action = new ActionSystem();
    const reactor = state.categories.reactor;
    const t = WING_DEFS.reactor.unlockThresholds;

    // Reactor tertiary consumes a free worker, so satisfy that prereq up front
    state.laboratory.workerHiring = true;
    state.workers.total = 1;
    state.workers.max = 1;

    // Not enough primary → no-op
    action.processAction(state, { type: 'UNLOCK_TIER', payload: { wing: 'reactor', tier: 'secondary' } });
    expect(reactor.secondaryUnlocked).toBe(false);

    reactor.resources.primary = t.secondary;
    action.processAction(state, { type: 'UNLOCK_TIER', payload: { wing: 'reactor', tier: 'secondary' } });
    expect(reactor.secondaryUnlocked).toBe(true);
    // Unlock consumes the threshold cost
    expect(reactor.resources.primary).toBe(0);

    // Try to skip tertiary → quaternary
    reactor.resources.primary = t.quaternary;
    action.processAction(state, { type: 'UNLOCK_TIER', payload: { wing: 'reactor', tier: 'quaternary' } });
    expect(reactor.quaternaryUnlocked).toBe(false); // tertiary not unlocked yet

    // Walk the chain — tertiary additionally consumes one free worker
    reactor.resources.primary = t.tertiary;
    action.processAction(state, { type: 'UNLOCK_TIER', payload: { wing: 'reactor', tier: 'tertiary' } });
    expect(reactor.tertiaryUnlocked).toBe(true);
    expect(state.workers.total).toBe(0);

    reactor.resources.primary = t.quaternary;
    action.processAction(state, { type: 'UNLOCK_TIER', payload: { wing: 'reactor', tier: 'quaternary' } });
    expect(reactor.quaternaryUnlocked).toBe(true);
  });

  it('UNLOCK_TIER blocks reactor tertiary without a free worker', () => {
    const action = new ActionSystem();
    const reactor = state.categories.reactor;
    const t = WING_DEFS.reactor.unlockThresholds;
    reactor.secondaryUnlocked = true;
    reactor.resources.primary = t.tertiary;

    // No worker hiring research, no workers
    action.processAction(state, { type: 'UNLOCK_TIER', payload: { wing: 'reactor', tier: 'tertiary' } });
    expect(reactor.tertiaryUnlocked).toBe(false);

    // Research done but no workers hired yet
    state.laboratory.workerHiring = true;
    action.processAction(state, { type: 'UNLOCK_TIER', payload: { wing: 'reactor', tier: 'tertiary' } });
    expect(reactor.tertiaryUnlocked).toBe(false);

    // One free worker → unlock succeeds and consumes it
    state.workers.total = 1;
    state.workers.max = 1;
    action.processAction(state, { type: 'UNLOCK_TIER', payload: { wing: 'reactor', tier: 'tertiary' } });
    expect(reactor.tertiaryUnlocked).toBe(true);
    expect(state.workers.total).toBe(0);
  });
});

/* -------------------------------------------------------------------------- */
/* Per-slot worker cap                                                         */
/* -------------------------------------------------------------------------- */

describe('Per-slot worker cap', () => {
  let state: GameState;
  let action: ActionSystem;

  beforeEach(() => {
    state = freshState();
    action = new ActionSystem();
    // Plenty of free workers in the global pool
    state.workers.total = 50;
    state.workers.max = 50;
    state.laboratory.workerHiring = true;
  });

  it('caps assignments at INITIAL_MAX_WORKERS_PER_SLOT before any upgrades', () => {
    const reactor = state.categories.reactor;
    expect(ResourceSystem.getMaxWorkersForSlot(reactor, 'primary')).toBe(INITIAL_MAX_WORKERS_PER_SLOT);

    // Try to assign one more than the cap allows
    for (let i = 0; i < INITIAL_MAX_WORKERS_PER_SLOT + 3; i++) {
      action.processAction(state, { type: 'ASSIGN_WORKER', payload: { wing: 'reactor', slot: 'primary' } });
    }
    expect(reactor.workers.primary).toBe(INITIAL_MAX_WORKERS_PER_SLOT);
  });

  it('max-workers upgrade raises the per-slot cap by exactly one level', () => {
    const upgrade = new UpgradeSystem();
    const reactor = state.categories.reactor;
    const cost = maxWorkersUpgradeCost(0);
    reactor.resources.quaternary = cost;

    const ok = upgrade.buyMaxWorkersUpgrade(state, 'reactor', 'primary');

    expect(ok).toBe(true);
    expect(reactor.upgrades.primaryMaxWorkers).toBe(1);
    expect(reactor.resources.quaternary).toBe(0);
    expect(ResourceSystem.getMaxWorkersForSlot(reactor, 'primary'))
      .toBe(INITIAL_MAX_WORKERS_PER_SLOT + 1);
  });

  it('refuses the upgrade when quaternary is insufficient', () => {
    const upgrade = new UpgradeSystem();
    state.categories.reactor.resources.quaternary = 0;

    const ok = upgrade.buyMaxWorkersUpgrade(state, 'reactor', 'primary');

    expect(ok).toBe(false);
    expect(state.categories.reactor.upgrades.primaryMaxWorkers).toBe(0);
  });
});

/* -------------------------------------------------------------------------- */
/* Quaternary purchase routes through the EventBus                             */
/* -------------------------------------------------------------------------- */

describe('BUY_MAX_WORKERS_UPGRADE event bus integration', () => {
  it('routes the action through the bus into UpgradeSystem', () => {
    const bus = new EventBus<EventMap>();
    const action = new ActionSystem(bus);
    // The constructor wires the listener — we just need an instance.
    new UpgradeSystem(bus);

    const state = freshState();
    state.categories.reactor.resources.quaternary = maxWorkersUpgradeCost(0);
    state.laboratory.maxWorkersUpgrades = true;

    action.processAction(state, {
      type: 'BUY_MAX_WORKERS_UPGRADE',
      payload: { wing: 'reactor', slot: 'secondary' },
    });

    expect(state.categories.reactor.upgrades.secondaryMaxWorkers).toBe(1);
    expect(state.categories.reactor.resources.quaternary).toBe(0);
  });
});
