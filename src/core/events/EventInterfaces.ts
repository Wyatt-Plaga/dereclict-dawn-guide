/**
 * Core Event Interfaces
 * Defines the core interfaces for the event system
 */

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
} 