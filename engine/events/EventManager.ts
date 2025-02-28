import { EventEmitter, EventListener, GameEvent } from '../interfaces';

/**
 * Event manager that implements the EventEmitter interface
 * Handles event subscriptions and dispatching
 */
export class EventManager implements EventEmitter {
  // Map of event types to listener functions
  private listeners: Map<string, Set<EventListener>> = new Map();
  
  // Map to track one-time listeners
  private onceListeners: WeakMap<EventListener, boolean> = new WeakMap();
  
  /**
   * Subscribe to an event type
   * @param eventType Type of event to listen for
   * @param listener Callback function when event is emitted
   */
  public on(eventType: string, listener: EventListener): void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    
    this.listeners.get(eventType)!.add(listener);
  }
  
  /**
   * Unsubscribe from an event type
   * @param eventType Type of event to stop listening for
   * @param listener Callback function to remove
   */
  public off(eventType: string, listener: EventListener): void {
    if (!this.listeners.has(eventType)) {
      return;
    }
    
    const eventListeners = this.listeners.get(eventType)!;
    eventListeners.delete(listener);
    
    // Remove the event type if no listeners remain
    if (eventListeners.size === 0) {
      this.listeners.delete(eventType);
    }
    
    // Clean up once tracking if exists
    if (this.onceListeners.has(listener)) {
      this.onceListeners.delete(listener);
    }
  }
  
  /**
   * Subscribe to an event type for one occurrence only
   * @param eventType Type of event to listen for
   * @param listener Callback function when event is emitted
   */
  public once(eventType: string, listener: EventListener): void {
    // Create a wrapper that will remove itself after execution
    const onceWrapper: EventListener = (event: GameEvent) => {
      // Remove this listener
      this.off(eventType, onceWrapper);
      
      // Call the original listener
      listener(event);
    };
    
    // Mark this as a once listener
    this.onceListeners.set(onceWrapper, true);
    
    // Add the wrapper as a listener
    this.on(eventType, onceWrapper);
  }
  
  /**
   * Emit an event to all subscribed listeners
   * @param event Event object to emit
   */
  public emit(event: GameEvent): void {
    const eventType = event.type;
    
    // Exit early if no listeners for this event type
    if (!this.listeners.has(eventType)) {
      return;
    }
    
    // Get listeners for this event type and convert to array for iteration
    const eventListeners = Array.from(this.listeners.get(eventType)!);
    
    // Call each listener
    for (const listener of eventListeners) {
      try {
        listener(event);
      } catch (error) {
        console.error(`Error in event listener for ${eventType}:`, error);
      }
    }
  }
  
  /**
   * Check if an event type has listeners
   * @param eventType Type of event to check
   */
  public hasListeners(eventType: string): boolean {
    return this.listeners.has(eventType) && this.listeners.get(eventType)!.size > 0;
  }
  
  /**
   * Get the count of listeners for an event type
   * @param eventType Type of event to count listeners for
   */
  public listenerCount(eventType: string): number {
    if (!this.listeners.has(eventType)) {
      return 0;
    }
    
    return this.listeners.get(eventType)!.size;
  }
  
  /**
   * Remove all listeners for a specific event type
   * @param eventType Type of event to clear listeners for
   */
  public removeAllListeners(eventType?: string): void {
    if (eventType) {
      // Remove listeners for specific event type
      this.listeners.delete(eventType);
    } else {
      // Remove all listeners for all event types
      this.listeners.clear();
    }
  }
} 