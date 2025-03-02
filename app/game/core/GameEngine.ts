import { EventBus } from './EventBus';
import { GameState, initialGameState } from '../types';
import { GameSystemManager } from '../systems';
import { GameAction } from '../types/actions';

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
     * Game systems that handle different aspects of game logic
     */
    private systems: GameSystemManager;
    
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
        
        // Initialize game systems
        this.systems = new GameSystemManager();
        
        // Initialize game stats based on upgrades
        this.systems.upgrade.updateAllStats(this.state);
        
        // Initialize timing variables
        this.lastTick = Date.now();
        this.isRunning = false;
        
        // Set up event handlers
        this.setupEventHandlers();
    }
    
    /**
     * Set up event handlers for the game engine
     */
    private setupEventHandlers() {
        // Listen for action dispatch events
        this.eventBus.on('DISPATCH_ACTION', (action: GameAction) => {
            this.processAction(action);
        });
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
        
        // Update all game systems
        this.systems.update(this.state, delta);
        
        // Let everyone know the state has been updated
        this.eventBus.emit('stateUpdated', this.state);
    }
    
    /**
     * Process an action and update the game state
     * 
     * @param action - The action to process
     */
    private processAction(action: GameAction) {
        console.log('Engine processing action:', action.type);
        
        // Pass the action to game systems
        this.systems.processAction(this.state, action);
        
        // Notify that state has been updated
        this.eventBus.emit('stateUpdated', this.state);
    }
    
    /**
     * Dispatch an action to modify the game state
     * 
     * @param action - The action to dispatch
     */
    dispatch(action: GameAction) {
        this.eventBus.emit('DISPATCH_ACTION', action);
    }

    /**
     * Get the current game state
     */
    getState(): GameState {
        return this.state;
    }
} 