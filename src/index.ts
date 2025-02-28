/**
 * Main Game Engine Export
 * Provides a single point of entry for all game engine components
 */

// Main Game class
export { Game } from './core/game/Game';

// Core components - selectively export to avoid conflicts
export { EventEmitter } from './core/events';
export type { IEventEmitter, GameEvent } from './core/events';
export { CommandProcessor } from './core/game';

// Selective exports from domains to avoid conflicts
export * from './domain/resources';
export * from './domain/time';
export * from './domain/upgrades';

// Re-export commands domain without ResourceCost (already from resources)
export { 
  BaseCommand,
  UpdateResourceCommand,
  PurchaseUpgradeCommand
} from './domain/commands';
export type { Command, CommandResult } from './domain/commands';

// Log domain
export * from './domain/logs'; 