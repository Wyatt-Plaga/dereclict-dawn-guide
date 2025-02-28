/**
 * Core Event Emitter Implementation
 * Provides the event system implementation
 */

import { EventListener, GameEvent } from './EventInterfaces';

/**
 * Event emitter implementation
 * Handles event subscription and distribution in the game
 */
export class EventEmitter {
  /**
   * Map of event types to listeners
   */
  private listeners: Map<string, Set<EventListener>> = new Map();
  
  /**
   * Map of event types to one-time listeners
   */
  private onceListeners: Map<string, Set<EventListener>> = new Map();
  
  /**
   * Subscribe to events of a specific type
   * @param eventType Event type to listen for
   * @param listener Function to call when event occurs
   */
  public on(eventType: string, listener: EventListener): void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    
    this.listeners.get(eventType)?.add(listener);
  }
  
  /**
   * Subscribe to an event once
   * After the event occurs, the listener is automatically removed
   * @param eventType Event type to listen for
   * @param listener Function to call when event occurs
   */
  public once(eventType: string, listener: EventListener): void {
    if (!this.onceListeners.has(eventType)) {
      this.onceListeners.set(eventType, new Set());
    }
    
    this.onceListeners.get(eventType)?.add(listener);
  }
  
  /**
   * Unsubscribe from events of a specific type
   * @param eventType Event type to stop listening for
   * @param listener Function to remove
   */
  public off(eventType: string, listener: EventListener): void {
    // Remove from regular listeners
    this.listeners.get(eventType)?.delete(listener);
    
    // Remove from once listeners
    this.onceListeners.get(eventType)?.delete(listener);
  }
  
  /**
   * Emit an event to all registered listeners
   * @param event Event to emit
   */
  public emit(event: GameEvent): void {
    const eventType = event.type;
    
    // Notify regular listeners
    if (this.listeners.has(eventType)) {
      // Convert to array to avoid linter issues with Set iteration
      Array.from(this.listeners.get(eventType) || []).forEach(listener => {
        try {
          listener(event);
        } catch (error) {
          console.error(`Error in event listener for ${eventType}:`, error);
        }
      });
    }
    
    // Notify once listeners
    if (this.onceListeners.has(eventType)) {
      // Store listeners to remove
      const listenersToExecute = Array.from(this.onceListeners.get(eventType) || []);
      
      // Clear the once listeners for this event
      this.onceListeners.set(eventType, new Set());
      
      // Execute the listeners
      listenersToExecute.forEach(listener => {
        try {
          listener(event);
        } catch (error) {
          console.error(`Error in once event listener for ${eventType}:`, error);
        }
      });
    }
  }
  
  /**
   * Remove all listeners for a specific event type
   * @param eventType Event type to clear listeners for
   */
  public clearListeners(eventType?: string): void {
    if (eventType) {
      // Clear specific event type
      this.listeners.delete(eventType);
      this.onceListeners.delete(eventType);
    } else {
      // Clear all event types
      this.listeners.clear();
      this.onceListeners.clear();
    }
  }
  
  /**
   * Get the count of listeners for a specific event type
   * @param eventType Event type to count listeners for
   */
  public listenerCount(eventType: string): number {
    const regularCount = this.listeners.get(eventType)?.size || 0;
    const onceCount = this.onceListeners.get(eventType)?.size || 0;
    return regularCount + onceCount;
  }
} 