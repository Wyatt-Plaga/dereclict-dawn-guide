/**
 * EventBus: Communication system for the game
 * 
 * Think of this as a messenger that delivers notifications 
 * between different parts of the game.
 */

import Logger, { LogCategory, LogContext } from '@/app/utils/logger';
import { getLogContextForEvent } from '../utils/logContextMapper';
import { GameState } from '../types';
import { GameAction } from '../types/actions';

/**
 * Event data can be GameState, GameAction, or unknown for other event types
 */
type EventData = GameState | GameAction | unknown;

/**
 * Function that can be called when an event occurs
 */
type EventCallback = (data: EventData) => void;

/**
 * The EventBus manages communication between game systems
 * and UI components without them needing to know about each other.
 */
export class EventBus<M extends Record<string, any>> {
    /**
     * Map of event names to arrays of callback functions
     * Like a phonebook of who wants to receive which messages
     */
    private listeners: { [K in keyof M]?: Array<(payload: M[K]) => void> } = {} as any;

    private lastStateUpdateTime = 0;

    constructor() {
        // listeners object already initialised
    }

    /**
     * Broadcast an event to all listeners
     * Like announcing a message over a loudspeaker
     * 
     * @param event - The name of the event
     * @param data - Data to send with the event
     */
    emit<K extends keyof M>(event: K, data: M[K]) {
        // Add throttling for state updates
        if (event === 'stateUpdated') {
            const now = Date.now();
            
            // Skip if we've emitted a state update too recently
            if (this.lastStateUpdateTime && now - this.lastStateUpdateTime < 50) {
                return;
            }
            
            this.lastStateUpdateTime = now;
        }
        
        // Determine context using centralised mapper
        const context = getLogContextForEvent(String(event), data);
        
        Logger.debug(LogCategory.EVENT_BUS, `Emitting event: "${String(event)}"`, context);
        
        // Get all listeners for this event (or empty array if none)
        const callbacks = this.listeners[event] || [];
        
        if (callbacks.length === 0) {
            Logger.warn(LogCategory.EVENT_BUS, `No listeners registered for event: "${String(event)}"`, context);
        } else {
            Logger.debug(LogCategory.EVENT_BUS, `Found ${callbacks.length} listeners for event: "${String(event)}"`, context);
        }
        
        // Clone stateUpdated payload to prevent accidental mutations hitting React equality
        let dataToEmit = data;
        if (event === 'stateUpdated') {
            Logger.trace(LogCategory.EVENT_BUS, 'Deep copying state data before emitting', context);
            dataToEmit = JSON.parse(JSON.stringify(data));
        }
        
        // Call each listener with the event data
        callbacks.forEach(cb => (cb as any)(dataToEmit));
    }

    /**
     * Register to listen for an event
     * Like signing up for a newsletter
     * 
     * @param event - The name of the event to listen for
     * @param callback - Function to call when event happens
     * @returns A function to remove this listener
     */
    on<K extends keyof M>(event: K, callback: (payload: M[K]) => void) {
        // Log with appropriate context based on event type
        let context = LogContext.NONE;
        
        if (event === 'stateUpdated') {
            context = LogContext.UI_RENDER;
        }
        
        Logger.debug(LogCategory.EVENT_BUS, `Registering listener for event: "${String(event)}"`, context);
        
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        (this.listeners[event] as Array<(p: M[K]) => void>).push(callback);

        const currentCount = this.listeners[event]!.length;
        Logger.debug(LogCategory.EVENT_BUS, `Now have ${currentCount} listeners for event: "${String(event)}"`, context);

        return () => {
            Logger.debug(LogCategory.EVENT_BUS, `Removing listener for event: "${String(event)}"`, context);
            const existing = this.listeners[event] || [];
            this.listeners[event] = existing.filter(cb => cb !== callback);
            const newCount = this.listeners[event]!.length;
            Logger.debug(LogCategory.EVENT_BUS, `Now have ${newCount} listeners for event: "${String(event)}"`, context);
        };
    }
} 
