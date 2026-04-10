import { describe, it, expect, beforeEach } from 'vitest';
import { getResourceAccessor } from '@/game-engine/utils/resourceAccessor';
import { initialGameState, GameState } from '@/game-engine/types';

const clone = <T>(o: T): T => JSON.parse(JSON.stringify(o));

describe('getResourceAccessor', () => {
  let state: GameState;

  beforeEach(() => {
    state = clone(initialGameState);
  });

  it('maps energy to reactor primary resource', () => {
    const accessor = getResourceAccessor(state, 'energy');
    expect(accessor).not.toBeNull();
    expect(accessor!.key).toBe('primary');
    expect(accessor!.obj).toBe(state.categories.reactor.resources as unknown as Record<string, number>);
  });

  it('maps insight to processor primary resource', () => {
    const accessor = getResourceAccessor(state, 'insight');
    expect(accessor).not.toBeNull();
    expect(accessor!.key).toBe('primary');
    expect(accessor!.obj).toBe(state.categories.processor.resources as unknown as Record<string, number>);
  });

  it('maps crew to crewQuarters primary resource', () => {
    const accessor = getResourceAccessor(state, 'crew');
    expect(accessor).not.toBeNull();
    expect(accessor!.key).toBe('primary');
    expect(accessor!.obj).toBe(state.categories.crewQuarters.resources as unknown as Record<string, number>);
  });

  it('maps scrap to manufacturing primary resource', () => {
    const accessor = getResourceAccessor(state, 'scrap');
    expect(accessor).not.toBeNull();
    expect(accessor!.key).toBe('primary');
    expect(accessor!.obj).toBe(state.categories.manufacturing.resources as unknown as Record<string, number>);
  });

  it('maps secondary resources (e.g. fuelRods)', () => {
    const accessor = getResourceAccessor(state, 'fuelRods');
    expect(accessor).not.toBeNull();
    expect(accessor!.key).toBe('secondary');
    expect(accessor!.obj).toBe(state.categories.reactor.resources as unknown as Record<string, number>);
  });

  it('maps tertiary resources (e.g. thermalCores)', () => {
    const accessor = getResourceAccessor(state, 'thermalCores');
    expect(accessor).not.toBeNull();
    expect(accessor!.key).toBe('tertiary');
    expect(accessor!.obj).toBe(state.categories.reactor.resources as unknown as Record<string, number>);
  });

  it('maps relics to top-level state', () => {
    const accessor = getResourceAccessor(state, 'relics');
    expect(accessor).not.toBeNull();
    expect(accessor!.key).toBe('relics');
  });

  it('returns null for unknown types', () => {
    expect(getResourceAccessor(state, 'bogus')).toBeNull();
  });

  it('allows mutation through accessor', () => {
    state.categories.reactor.resources.primary = 50;
    const accessor = getResourceAccessor(state, 'energy')!;
    accessor.obj[accessor.key] -= 30;
    expect(state.categories.reactor.resources.primary).toBe(20);
  });
});
