import { EventBus } from './EventBus';
import { GameState, initialGameState } from '../types';
import { GameSystemManager } from '../systems';
import { GameAction } from '../types/actions';
import Logger, { LogCategory, LogContext } from '@/app/utils/logger';
import { SaveSystem } from './SaveSystem';
import { getCachedState, cacheState } from './memoryCache';

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

    /**
     * Save system for persisting game state
     */
    private saveSystem: SaveSystem;

    constructor() {
        // Check for cached state from in-app navigation
        const cachedState = getCachedState();
        if (cachedState) {
            Logger.info(
                LogCategory.ENGINE, 
                "Using cached state from in-app navigation", 
                LogContext.STARTUP
            );
            this.state = JSON.parse(JSON.stringify(cachedState));
        } else {
            // Start with a fresh game state if no cached state
            this.state = JSON.parse(JSON.stringify(initialGameState));
        }
        
        // Ensure critical state components are initialized
        this.ensureCriticalStateComponents();
        
        // Create our communication system
        this.eventBus = new EventBus();
        
        // Initialize game systems
        this.systems = new GameSystemManager();
        
        // Initialize save system
        this.saveSystem = new SaveSystem();
        
        // Initialize game stats based on upgrades
        this.systems.upgrade.updateAllStats(this.state);
        
        // Initialize timing variables
        this.lastTick = Date.now();
        this.isRunning = false;
        
        // Set up event handlers
        this.setupEventHandlers();
        
        Logger.info(LogCategory.ENGINE, "Game engine initialized", LogContext.STARTUP);
    }
    
    /**
     * Ensure critical components of the state are initialized
     * This prevents crashes when accessing required state properties
     */
    private ensureCriticalStateComponents(): void {
        // Ensure categories exist
        if (!this.state.categories) {
            Logger.warn(
                LogCategory.ENGINE,
                "Categories state was missing - initializing with default values",
                LogContext.STARTUP
            );
            
            this.state.categories = {
                reactor: {
                    resources: {
                        energy: 10,
                    },
                    stats: {
                        energyPerSecond: 0.1,
                        energyCapacity: 100
                    },
                    upgrades: {
                        reactorExpansions: 0,
                        energyConverters: 0
                    }
                },
                processor: {
                    resources: {
                        insight: 0,
                    },
                    stats: {
                        insightPerSecond: 0,
                        insightCapacity: 100,
                        insightPerClick: 1
                    },
                    upgrades: {
                        mainframeExpansions: 0,
                        processingThreads: 0
                    }
                },
                crewQuarters: {
                    resources: {
                        crew: 1,
                    },
                    stats: {
                        crewPerSecond: 0,
                        crewCapacity: 10,
                        awakeningProgress: 0
                    },
                    upgrades: {
                        additionalQuarters: 0,
                        workerCrews: 0
                    }
                },
                manufacturing: {
                    resources: {
                        scrap: 0,
                    },
                    stats: {
                        scrapCapacity: 100,
                        scrapPerSecond: 0
                    },
                    upgrades: {
                        cargoHoldExpansions: 0,
                        manufacturingBays: 0
                    }
                }
            };
        }
        
        // Ensure navigation state is initialized
        if (!this.state.navigation) {
            Logger.warn(
                LogCategory.ENGINE,
                "Navigation state was missing - initializing with default values",
                LogContext.STARTUP
            );
            
            this.state.navigation = {
                currentRegion: 'void',
                exploredRegions: ['void'],
                availableRegions: ['void', 'nebula']
            };
        }
        
        // Ensure combat state is initialized
        if (!this.state.combat) {
            Logger.warn(
                LogCategory.ENGINE,
                "Combat state was missing - initializing with default values",
                LogContext.STARTUP
            );
            
            this.state.combat = {
                active: false,
                battleLog: [],
                turn: 0,
                playerStats: {
                    health: 100,
                    maxHealth: 100,
                    shield: 50,
                    maxShield: 50,
                    statusEffects: []
                },
                enemyStats: {
                    health: 0,
                    maxHealth: 0,
                    shield: 0,
                    maxShield: 0,
                    statusEffects: []
                },
                availableActions: [],
                cooldowns: {},
                encounterCompleted: false,
                currentEnemy: null,
                currentRegion: null,
                enemyIntentions: null,
                rewards: {
                    energy: 0,
                    insight: 0,
                    crew: 0,
                    scrap: 0
                }
            };
        }
        
        // Ensure logs are initialized
        if (!this.state.logs) {
            Logger.warn(
                LogCategory.ENGINE,
                "Logs state was missing - initializing with default values",
                LogContext.STARTUP
            );
            
            this.state.logs = {
                discovered: {},
                unread: []
            };
        }
        
        // Set timestamp if missing
        if (!this.state.lastUpdate) {
            this.state.lastUpdate = Date.now();
        }
        
        // Set version if missing
        if (!this.state.version) {
            this.state.version = 1;
        }
    }
    
    /**
     * Set up event handlers for the game engine
     */
    private setupEventHandlers() {
        // Listen for action dispatch events
        this.eventBus.on('DISPATCH_ACTION', (action: GameAction) => {
            this.processAction(action);
        });
        
        Logger.debug(LogCategory.ENGINE, "Event handlers configured", LogContext.STARTUP);
    }

    /**
     * Initialize game state - load save or start fresh
     * 
     * This method will:
     * 1. First try to use the cached state for immediate display
     * 2. Then attempt to load from persistent storage
     * 3. Fall back to initial state if nothing is available
     */
    public async initialize(): Promise<void> {
        // If we already have a cached state, use it for immediate display
        const cachedState = getCachedState();
        if (cachedState) {
            // We're using the cached state we loaded in the constructor
            // No need to update this.state again
            Logger.info(
                LogCategory.ENGINE, 
                "Already using cached state, continuing initialization", 
                LogContext.STARTUP
            );
        }
        
        // Initialize save system
        await this.saveSystem.init();
        
        // Try to load the most recent save
        const savedGame = await this.loadGame();
        
        if (!savedGame) {
            // If no save, start the game fresh
            Logger.info(
                LogCategory.ENGINE, 
                "No saved game found, starting fresh", 
                LogContext.STARTUP
            );
            this.start();
        } else {
            Logger.info(
                LogCategory.ENGINE, 
                "Game initialized with saved state", 
                LogContext.STARTUP
            );
        }
    }

    /**
     * Start the game loop
     * Like turning on the clock
     */
    start() {
        if (this.isRunning) return;
        
        Logger.info(LogCategory.ENGINE, "Game engine started", LogContext.STARTUP);
        this.isRunning = true;
        this.lastTick = Date.now();
        
        // Start autosave
        this.saveSystem.startAutoSave(() => this.getState(), 250); // Save every 250ms (quarter second)
        
        // Start the game loop
        this.gameLoop();
    }

    /**
     * Stop the game loop
     * Like pausing the clock
     */
    stop() {
        // Save game state before stopping
        this.saveGame();
        
        // Stop autosave
        this.saveSystem.stopAutoSave();
        
        Logger.info(LogCategory.ENGINE, "Game engine stopped", LogContext.NONE);
        this.isRunning = false;
    }

    /**
     * The main game loop that runs continuously
     * Like the ticking of a clock
     */
    private gameLoop() {
        // Exit if we're no longer running
        if (!this.isRunning) {
            console.error("🛑 Game loop stopped: isRunning=false");
            return;
        }

        // Log once every 5 seconds to avoid flooding the console
        const now = Date.now();
        if (Math.floor(now / 5000) !== Math.floor(this.lastTick / 5000)) {
            console.log("🔄 Game loop running - timestamp:", new Date().toLocaleTimeString());
        }

        // Calculate time since last update
        const delta = (now - this.lastTick) / 1000; // Convert to seconds
        
        // Performance tracking for game loop
        const endMeasure = Logger.measure("Game loop cycle", LogCategory.PERFORMANCE);
        
        // Update game state
        this.tick(delta);
        
        // Remember when we did this update
        this.lastTick = now;
        
        // End performance measurement
        endMeasure();

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
        // Store the previous state for comparison
        const prevState = JSON.stringify(this.state);
        
        // Update the last update timestamp
        this.state.lastUpdate = Date.now();
        
        // Trace level logging for game ticks
        Logger.trace(LogCategory.ENGINE, `Tick with delta: ${delta.toFixed(5)}s`, LogContext.NONE);
        
        // Update all game systems
        this.systems.update(this.state, delta);
        
        // Only emit state updates if something actually changed
        const currentState = JSON.stringify(this.state);
        if (currentState !== prevState) {
            // Cache the state whenever it changes
            cacheState(this.state);
            
            this.eventBus.emit('stateUpdated', this.state);
        }
    }
    
    /**
     * Process an action and update the game state
     * 
     * @param action - The action to process
     */
    private processAction(action: GameAction) {
        // Determine the context based on action type
        let context = LogContext.NONE;
        if (action.type === 'CLICK_RESOURCE') {
            const category = action.payload?.category;
            if (category === 'reactor') {
                context = LogContext.REACTOR_LIFECYCLE;
            } else if (category === 'processor') {
                context = LogContext.PROCESSOR_LIFECYCLE;
            } else if (category === 'crewQuarters') {
                context = LogContext.CREW_LIFECYCLE;
            } else if (category === 'manufacturing') {
                context = LogContext.MANUFACTURING_LIFECYCLE;
            }
        } else if (action.type === 'PURCHASE_UPGRADE') {
            context = LogContext.UPGRADE_PURCHASE;
        }
        
        Logger.debug(LogCategory.ENGINE, `Processing action: ${action.type}`, context);
        
        // Log state before processing
        const beforeEnergy = this.state.categories.reactor.resources.energy;
        Logger.debug(
            LogCategory.ENGINE, 
            `State BEFORE action: ${action.type} - Energy: ${beforeEnergy}`, 
            context
        );
        
        // Pass the action to game systems
        this.systems.processAction(this.state, action);
        
        // Log state after processing
        const afterEnergy = this.state.categories.reactor.resources.energy;
        Logger.debug(
            LogCategory.ENGINE, 
            `State AFTER action: ${action.type} - Energy: ${afterEnergy} (Changed: ${afterEnergy !== beforeEnergy})`, 
            context
        );
        
        // Notify that state has been updated
        Logger.debug(LogCategory.ENGINE, "Emitting stateUpdated event", context);
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
     * Returns a deep copy to prevent direct state mutation
     */
    getState(): GameState {
        // Return a deep copy of the state to prevent accidental mutations
        return JSON.parse(JSON.stringify(this.state));
    }
    
    /**
     * Save the current game state
     * @returns Promise<string> - The save ID
     */
    public async saveGame(): Promise<string> {
        // Cache the state as we save
        cacheState(this.state);
        return await this.saveSystem.save(this.getState());
    }
    
    /**
     * Load a game state
     * @returns Promise<boolean> - Whether a save was loaded
     */
    public async loadGame(): Promise<boolean> {
        const saveData = await this.saveSystem.load();
        
        if (!saveData) {
            return false;
        }
        
        // Replace current state with saved state
        this.state = saveData.state;
        
        // Cache the newly loaded state
        cacheState(this.state);
        
        // Notify about state update
        this.eventBus.emit('stateUpdated', this.state);
        
        // Start the game if not already running
        if (!this.isRunning) {
            this.start();
        }
        
        return true;
    }
} 