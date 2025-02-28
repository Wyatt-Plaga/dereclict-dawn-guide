/**
 * Core Game Interfaces
 * Defines the core interfaces for the game engine
 */

import { GameEvent } from '../events';

/**
 * Command result interface
 */
export interface CommandResult {
  success: boolean;
  message: string;
  data?: Record<string, unknown>;
}

/**
 * Command interface
 */
export interface Command {
  id: string;
  type: string;
  execute(): CommandResult;
  undo?(): CommandResult;
  validate?(): boolean;
  cost?: Record<string, number>;
}

/**
 * Game engine state
 */
export interface GameEngineState {
  resources: Record<string, Record<string, unknown>>;
  upgrades: Record<string, Record<string, unknown>>;
  logs: Record<string, Record<string, unknown>>;
  gameTime: number;
  version: string;
}

/**
 * Command processor interface
 */
export interface CommandProcessor {
  executeCommand(command: Command): CommandResult;
  undoLastCommand(): CommandResult;
  getCommandHistory(): Command[];
  clearHistory(): void;
} 