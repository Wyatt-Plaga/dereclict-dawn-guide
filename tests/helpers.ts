/**
 * Shared test helpers.
 *
 * Centralizes the deep-clone of `initialGameState` so individual test files don't
 * each redeclare their own `clone()`. Add small fixture builders here when a setup
 * pattern repeats across files.
 */

import { initialGameState, GameState } from '@/game-engine/types';

/** Deep-clone any JSON-safe value (used for game-state fixtures). */
export const clone = <T>(o: T): T => JSON.parse(JSON.stringify(o));

/** Fresh, fully-isolated copy of the initial game state. */
export const freshState = (): GameState => clone(initialGameState);
