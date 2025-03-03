/**
 * EventBus: Communication system for the game
 * 
 * Think of this as a messenger that delivers notifications 
 * between different parts of the game.
 */

import Logger, { LogCategory, LogContext } from '@/app/utils/logger';
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
export class EventBus {
    /**
     * Map of event names to arrays of callback functions
     * Like a phonebook of who wants to receive which messages
     */
    private listeners: Map<string, EventCallback[]>;

    private lastStateUpdateTime: number = 0;

    constructor() {
        this.listeners = new Map();
    }

    /**
     * Broadcast an event to all listeners
     * Like announcing a message over a loudspeaker
     * 
     * @param event - The name of the event
     * @param data - Data to send with the event
     */
    emit(event: string, data: EventData) {
        // Add throttling for state updates
        if (event === 'stateUpdated') {
            const now = Date.now();
            
            // Skip if we've emitted a state update too recently
            if (this.lastStateUpdateTime && now - this.lastStateUpdateTime < 50) {
                return;
            }
            
            this.lastStateUpdateTime = now;
        }
        
        // Determine context based on event type
        let context = LogContext.NONE;
        
        // Detect specific workflows based on event and data
        if (event === 'stateUpdated') {
            // Keep NONE context for general state updates
            context = LogContext.NONE;
        } else if (event === 'DISPATCH_ACTION' && typeof data === 'object' && data !== null) {
            const action = data as GameAction;
            // Set context based on action type
            if (action.type === 'CLICK_RESOURCE' && action.payload?.category === 'reactor') {
                context = LogContext.REACTOR_LIFECYCLE;
            } else if (action.type === 'CLICK_RESOURCE' && action.payload?.category === 'processor') {
                context = LogContext.PROCESSOR_LIFECYCLE;
            } else if (action.type === 'PURCHASE_UPGRADE') {
                context = LogContext.UPGRADE_PURCHASE;
            }
        }
        
        Logger.debug(LogCategory.EVENT_BUS, `Emitting event: "${event}"`, context);
        
        // Get all listeners for this event (or empty array if none)
        const callbacks = this.listeners.get(event) || [];
        
        if (callbacks.length === 0) {
            Logger.warn(LogCategory.EVENT_BUS, `No listeners registered for event: "${event}"`, context);
        } else {
            Logger.debug(LogCategory.EVENT_BUS, `Found ${callbacks.length} listeners for event: "${event}"`, context);
        }
        
        // When emitting state updates, clone the data to ensure React detects changes
        let dataToEmit = data;
        if (event === 'stateUpdated') {
            Logger.trace(LogCategory.EVENT_BUS, 'Deep copying state data before emitting', context);
            dataToEmit = JSON.parse(JSON.stringify(data));
        }
        
        // Call each listener with the event data
        callbacks.forEach(callback => callback(dataToEmit));
    }

    /**
     * Register to listen for an event
     * Like signing up for a newsletter
     * 
     * @param event - The name of the event to listen for
     * @param callback - Function to call when event happens
     * @returns A function to remove this listener
     */
    on(event: string, callback: EventCallback) {
        // Log with appropriate context based on event type
        let context = LogContext.NONE;
        
        if (event === 'stateUpdated') {
            context = LogContext.UI_RENDER;
        }
        
        Logger.debug(LogCategory.EVENT_BUS, `Registering listener for event: "${event}"`, context);
        
        // Initialize listener array if it doesn't exist
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        
        // Add the callback to the listeners
        this.listeners.get(event)?.push(callback);
        
        const currentCount = this.listeners.get(event)?.length || 0;
        Logger.debug(LogCategory.EVENT_BUS, `Now have ${currentCount} listeners for event: "${event}"`, context);

        // Return a function to unsubscribe
        return () => {
            Logger.debug(LogCategory.EVENT_BUS, `Removing listener for event: "${event}"`, context);
            
            const callbacks = this.listeners.get(event) || [];
            this.listeners.set(
                event,
                callbacks.filter(cb => cb !== callback)
            );
            
            const newCount = this.listeners.get(event)?.length || 0;
            Logger.debug(LogCategory.EVENT_BUS, `Now have ${newCount} listeners for event: "${event}"`, context);
        };
    }
} 