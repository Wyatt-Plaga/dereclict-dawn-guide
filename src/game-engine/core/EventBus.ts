import Logger, { LogCategory, LogContext } from '@/app/utils/logger';

/**
 * The EventBus manages communication between game systems
 * and UI components without them needing to know about each other.
 */
export class EventBus<M extends Record<string, any>> {
    private listeners: { [K in keyof M]?: Array<(payload: M[K]) => void> } = {} as any;
    private lastStateUpdateTime = 0;

    emit<K extends keyof M>(event: K, data: M[K]) {
        // Throttle stateUpdated to avoid excessive re-renders
        if (event === 'stateUpdated') {
            const now = Date.now();
            if (this.lastStateUpdateTime && now - this.lastStateUpdateTime < 50) {
                return;
            }
            this.lastStateUpdateTime = now;
        }

        const callbacks = this.listeners[event] || [];

        if (callbacks.length === 0) {
            Logger.warn(LogCategory.EVENT_BUS, `No listeners for event: "${String(event)}"`, LogContext.NONE);
        }

        callbacks.forEach(cb => cb(data));
    }

    on<K extends keyof M>(event: K, callback: (payload: M[K]) => void) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        (this.listeners[event] as Array<(p: M[K]) => void>).push(callback);

        return () => {
            const existing = this.listeners[event] || [];
            this.listeners[event] = existing.filter(cb => cb !== callback);
        };
    }
}
