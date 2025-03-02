/**
 * EventBus: Communication system for the game
 * 
 * Think of this as a messenger that delivers notifications 
 * between different parts of the game.
 */

/**
 * Function that can be called when an event occurs
 */
type EventCallback = (data: any) => void;

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
    emit(event: string, data: any) {
        console.log(`EVENTBUS - Emitting event: "${event}"`);
        
        // Get all listeners for this event (or empty array if none)
        const callbacks = this.listeners.get(event) || [];
        
        if (callbacks.length === 0) {
            console.warn(`EVENTBUS - No listeners registered for event: "${event}"`);
        } else {
            console.log(`EVENTBUS - Found ${callbacks.length} listeners for event: "${event}"`);
        }
        
        // When emitting state updates, clone the data to ensure React detects changes
        let dataToEmit = data;
        if (event === 'stateUpdated') {
            console.log('EVENTBUS - Deep copying state data before emitting');
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
        console.log(`EVENTBUS - Registering listener for event: "${event}"`);
        
        // Initialize listener array if it doesn't exist
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        
        // Add the callback to the listeners
        this.listeners.get(event)?.push(callback);
        
        const currentCount = this.listeners.get(event)?.length || 0;
        console.log(`EVENTBUS - Now have ${currentCount} listeners for event: "${event}"`);

        // Return a function to unsubscribe
        return () => {
            console.log(`EVENTBUS - Removing listener for event: "${event}"`);
            const callbacks = this.listeners.get(event) || [];
            this.listeners.set(
                event,
                callbacks.filter(cb => cb !== callback)
            );
            const newCount = this.listeners.get(event)?.length || 0;
            console.log(`EVENTBUS - Now have ${newCount} listeners for event: "${event}"`);
        };
    }
} 