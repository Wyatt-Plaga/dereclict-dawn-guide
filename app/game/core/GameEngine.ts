import { EventBus } from './EventBus';
import { GameState, initialGameState } from '../types';

/**
 * GameEngine: The heart of the game
 * 
 * Think of this as the central clock of the game.
 * It keeps track of time, updates all systems, and 
 * makes sure everything stays in sync.
 */
export class GameEngine {
    /**
     * Current state of the game (resources, upgrades, etc.)
     */
    private state: GameState;
    
    /**
     * Communication system to notify about changes
     */
    public eventBus: EventBus;
    
    /**
     * Timestamp of the last update
     */
    private lastTick: number;
    
    /**
     * Whether the game loop is currently running
     */
    private isRunning: boolean;

    constructor() {
        // Start with a fresh game state
        this.state = JSON.parse(JSON.stringify(initialGameState));
        
        // Create our communication system
        this.eventBus = new EventBus();
        
        // Initialize timing variables
        this.lastTick = Date.now();
        this.isRunning = false;
    }

    /**
     * Start the game loop
     * Like turning on the clock
     */
    start() {
        if (this.isRunning) return;
        
        console.log('Game engine started');
        this.isRunning = true;
        this.lastTick = Date.now();
        this.gameLoop();
    }

    /**
     * Stop the game loop
     * Like pausing the clock
     */
    stop() {
        console.log('Game engine stopped');
        this.isRunning = false;
    }

    /**
     * The main game loop that runs continuously
     * Like the ticking of a clock
     */
    private gameLoop() {
        // Exit if we're no longer running
        if (!this.isRunning) return;

        // Calculate time since last update
        const now = Date.now();
        const delta = (now - this.lastTick) / 1000; // Convert to seconds
        
        // Update game state
        this.tick(delta);
        
        // Remember when we did this update
        this.lastTick = now;

        // Schedule the next update
        // This is like scheduling the next tick of the clock
        requestAnimationFrame(() => this.gameLoop());
    }

    /**
     * Update the game state for a single frame
     * This is where all the game logic happens
     * 
     * @param delta - Time in seconds since last update
     */
    private tick(delta: number) {
        // Update the last update timestamp
        this.state.lastUpdate = Date.now();
        
        // Update each category's resources based on their production rates
        this.updateResources(delta);
        
        // Let everyone know the state has been updated
        this.eventBus.emit('stateUpdated', this.state);
    }

    /**
     * Update resources based on production rates and delta time
     */
    private updateResources(delta: number) {
        // Update reactor energy
        const reactor = this.state.categories.reactor;
        const energyProduced = reactor.stats.energyPerSecond * delta;
        if (energyProduced > 0) {
            reactor.resources.energy = Math.min(
                reactor.resources.energy + energyProduced,
                reactor.stats.energyCapacity
            );
        }
        
        // Update processor insight
        const processor = this.state.categories.processor;
        const insightProduced = processor.stats.insightPerSecond * delta;
        if (insightProduced > 0) {
            processor.resources.insight = Math.min(
                processor.resources.insight + insightProduced,
                processor.stats.insightCapacity
            );
        }
        
        // Update crew quarters
        const crewQuarters = this.state.categories.crewQuarters;
        const crewProduced = crewQuarters.stats.crewPerSecond * delta;
        if (crewProduced > 0) {
            crewQuarters.resources.crew = Math.min(
                crewQuarters.resources.crew + crewProduced,
                crewQuarters.stats.crewCapacity
            );
        }
        
        // Update manufacturing scrap
        const manufacturing = this.state.categories.manufacturing;
        const scrapProduced = manufacturing.stats.scrapPerSecond * delta;
        if (scrapProduced > 0) {
            manufacturing.resources.scrap = Math.min(
                manufacturing.resources.scrap + scrapProduced,
                manufacturing.stats.scrapCapacity
            );
        }
    }

    /**
     * Get the current game state
     */
    getState(): GameState {
        return this.state;
    }
} 