/**
 * Command Domain Interfaces
 * Defines the core interfaces for the command system
 */

/**
 * Command interface
 * Represents actions that can be executed in the game
 */
export interface Command {
  // Unique identifier
  id: string;
  
  // Command type
  type: string;
  
  // Execute the command
  execute: () => CommandResult;
  
  // Undo the command (optional)
  undo?: () => CommandResult;
  
  // Validate if command can be executed (optional)
  validate?: () => boolean;
  
  // Resource costs to execute this command (optional)
  cost?: ResourceCost;
}

/**
 * Result of command execution
 */
export interface CommandResult {
  // Whether the command was successful
  success: boolean;
  
  // Optional message
  message?: string;
  
  // Optional data
  data?: any;
}

/**
 * Resource costs for commands
 * Maps resource IDs to amount required
 */
export type ResourceCost = Record<string, number>; 