/**
 * Core Game Engine Interfaces for Derelict Dawn
 * These interfaces define the structure and contracts for the game engine components
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

/**
 * Game engine state for serialization
 */
export interface GameEngineState {
  // Engine version
  version: string;
  
  // Last update timestamp in milliseconds
  lastUpdate: number;
  
  // Resource properties
  resources: ResourceProperties[];
}

/**
 * Resource registry
 * Manages game resources
 */
export interface ResourceRegistry {
  // Get a resource by ID
  getResource: (id: string) => Resource | undefined;
  
  // Register a new resource
  registerResource: (resource: Resource) => void;
  
  // Remove a resource
  removeResource: (id: string) => void;
  
  // Get all resources
  getAllResources: () => Resource[];
  
  // Get resources by type
  getResourcesByType: (type: string) => Resource[];
  
  // Update a resource
  updateResource: (id: string, props: Partial<ResourceProperties>) => Resource | undefined;
  
  // Create a new resource
  createResource: (properties: ResourceProperties) => Resource;
  
  // Check if a resource exists
  hasResource: (id: string) => boolean;
  
  // Create or update a resource
  createOrUpdateResource: (properties: ResourceProperties) => Resource;
  
  // Get the internal map of resources
  getResourceMap: () => Map<string, Resource>;
}

/**
 * Resource properties
 */
export interface ResourceProperties {
  // Unique identifier
  id: string;
  
  // Resource type
  type: string;
  
  // Display name
  name: string;
  
  // Current amount
  amount: number;
  
  // Maximum capacity
  capacity: number;
  
  // Last updated timestamp
  lastUpdated: string;
  
  // Optional description
  description?: string;
  
  // Optional generation/consumption rate per second
  rate?: number;
  
  // Optional metadata
  metadata?: Record<string, any>;
}

/**
 * Resource interface
 */
export interface Resource {
  // Resource properties
  properties: ResourceProperties;
  
  // Update resource properties
  update: (props: Partial<ResourceProperties>) => void;
  
  // Add amount to resource
  add: (amount: number) => number;
  
  // Subtract amount from resource
  subtract: (amount: number) => number;
  
  // Check if resource can afford an amount
  canAfford: (amount: number) => boolean;
  
  // Calculate amount after time has passed
  calculateAmountAfterTime?: (milliseconds: number) => number;
  
  // Get resource ID
  getId: () => string;
  
  // Get resource type
  getType: () => string;
  
  // Get current amount
  getAmount: () => number;
  
  // Get maximum capacity
  getCapacity: () => number;
  
  // Get generation/consumption rate
  getRate?: () => number;
}

/**
 * Game event
 */
export interface GameEvent {
  // Unique identifier
  id: string;
  
  // Event type
  type: string;
  
  // Event timestamp
  timestamp: number;
  
  // Event payload data
  payload: any;
}

/**
 * Event listener function type
 */
export type EventListener = (event: GameEvent) => void;

/**
 * Event emitter interface
 */
export interface EventEmitter {
  // Subscribe to events
  on: (eventType: string, listener: EventListener) => void;
  
  // Subscribe to an event once
  once?: (eventType: string, listener: EventListener) => void;
  
  // Unsubscribe from events
  off: (eventType: string, listener: EventListener) => void;
  
  // Emit an event
  emit: (event: GameEvent) => void;
  
  // Check if event has listeners
  hasListeners?: (eventType: string) => boolean;
  
  // Count listeners for an event type
  listenerCount?: (eventType: string) => number;
  
  // Remove all listeners
  removeAllListeners?: (eventType?: string) => void;
}

/**
 * Command processor interface
 */
export interface CommandProcessor {
  // Execute a command
  execute: (command: Command) => CommandResult;
  
  // Undo the last command
  undo: () => CommandResult;
  
  // Redo a previously undone command
  redo?: () => CommandResult;
  
  // Check if there are commands that can be undone
  canUndo?: () => boolean;
  
  // Check if there are commands that can be redone
  canRedo?: () => boolean;
  
  // Get command history
  getHistory?: () => Command[];
  
  // Clear command history
  clearHistory?: () => void;
} 