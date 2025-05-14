import { EventBus } from 'core/EventBus';
import { GameState, initialGameState } from '../types';
import { GameSystemManager } from '../systems';
import { GameActions } from '../types/actions';
import Logger, { LogCategory, LogContext } from '@/app/utils/logger';
import { SaveSystem } from 'core/SaveSystem';
import { getCachedState, cacheState } from 'core/memoryCache';
import { AutomationConstants } from '../config/gameConstants';
import { GameEventMap } from 'core/events';
import { createWorldFromGameState } from '../ecs/factory';

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
    public eventBus: EventBus<GameEventMap>;
    
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
        
        // Create our communication system
        this.eventBus = new EventBus<GameEventMap>();
        
        // Build initial ECS world snapshot
        this.state.world = createWorldFromGameState(this.state);
        
        // Initialize game systems
        this.systems = new GameSystemManager(this.eventBus);
        
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
     * Set up event handlers for the game engine
     */
    private setupEventHandlers() {
        // No generic dispatch listener needed – UI calls processAction via dispatch().
        
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
            Logger.debug(LogCategory.ENGINE, "🔄 Game loop running - timestamp: " + new Date().toLocaleTimeString(), LogContext.NONE);
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
        
        // --- Calculate energy cost for automation ---
        let totalAutomationEnergyCost = 0;
        
        const activeThreads = this.state.categories.processor?.stats?.activeProcessingThreads ?? 0;
        const activeCrews = this.state.categories.crewQuarters?.stats?.activeWorkerCrews ?? 0;
        const activeBays = this.state.categories.manufacturing?.stats?.activeManufacturingBays ?? 0;
        
        totalAutomationEnergyCost += activeThreads * AutomationConstants.ENERGY_COST_PER_ACTIVE_UNIT_PER_SECOND;
        totalAutomationEnergyCost += activeCrews * AutomationConstants.ENERGY_COST_PER_ACTIVE_UNIT_PER_SECOND;
        totalAutomationEnergyCost += activeBays * AutomationConstants.ENERGY_COST_PER_ACTIVE_UNIT_PER_SECOND;

        const energyCostPerTick = totalAutomationEnergyCost * delta;
        const currentEnergy = this.state.categories.reactor?.resources?.energy ?? 0;
        let automationHasPower = true;

        if (energyCostPerTick > 0) {
          if (currentEnergy >= energyCostPerTick) {
            // Consume energy
            if (this.state.categories.reactor) {
               this.eventBus.emit('resourceChange', {
                 state: this.state,
                 resourceType: 'energy',
                 amount: -energyCostPerTick,
                 source: 'automation'
               });
            }
          } else {
            // Not enough energy, automation stops
            automationHasPower = false;
          }
        }
        // --- End of energy cost calculation ---

        // Update all game systems, passing power status
        this.systems.update(this.state, delta, automationHasPower);
        
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
    private processAction(action: GameActions) {
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
        
        // Map each action to a domain-specific event so individual systems handle their own logic.
        switch (action.type) {
          case 'CLICK_RESOURCE':
            this.eventBus.emit('resourceClick', {
              state: this.state,
              category: (action as any).payload.category,
            });
            break;

          case 'PURCHASE_UPGRADE':
            this.eventBus.emit('purchaseUpgrade', {
              state: this.state,
              category: (action as any).payload.category,
              upgradeType: (action as any).payload.upgradeType,
            });
            break;

          case 'MARK_LOG_READ':
            this.eventBus.emit('markLogRead', {
              state: this.state,
              logId: (action as any).payload.logId,
            });
            break;

          case 'MARK_ALL_LOGS_READ':
            this.eventBus.emit('markAllLogsRead', { state: this.state });
            break;

          case 'INITIATE_JUMP':
            this.eventBus.emit('initiateJump', { state: this.state });
            break;

          case 'MAKE_STORY_CHOICE':
            this.eventBus.emit('storyChoice', {
              state: this.state,
              choiceId: (action as any).payload.choiceId,
            });
            break;

          case 'COMBAT_ACTION':
            this.eventBus.emit('combatAction', {
              state: this.state,
              actionId: (action as any).payload.actionId,
            });
            break;

          case 'RETREAT_FROM_BATTLE':
            this.eventBus.emit('retreatFromBattle', { state: this.state });
            break;

          case 'ADJUST_AUTOMATION': {
            const p = (action as any).payload;
            this.eventBus.emit('adjustAutomation', {
              state: this.state,
              category: p.category,
              automationType: p.automationType,
              direction: p.direction,
            });
            break;
          }

          case 'COMPLETE_ENCOUNTER': {
            // For story encounters without explicit choice (e.g., empty) we pass choiceId if present.
            const choiceId = (action as any).payload?.choiceId;
            this.eventBus.emit('storyChoice', { state: this.state, choiceId });
            break; }

          case 'SELECT_REGION': {
            // simple state mutation – handled here for now
            const region = (action as any).payload.region;
            this.state.navigation.currentRegion = region as any;
            // future: emit navigation change event if needed
            break; }

          default:
            Logger.warn(LogCategory.ENGINE, `Unhandled action type: ${(action as any).type}`, context);
        }
         
        // No direct state mutation here; listeners mutate this.state reference
        // Log state after processing
        const afterEnergy = this.state.categories.reactor.resources.energy;
        Logger.debug(
            LogCategory.ENGINE, 
            `State AFTER action: ${action.type} - Energy: ${afterEnergy} (Changed: ${afterEnergy !== beforeEnergy})`, 
            context
        );
        
        // Cache the state for in-app navigation
        cacheState(this.state);
        
        // Notify that state has been updated
        Logger.debug(LogCategory.ENGINE, "Emitting stateUpdated event", context);
        this.eventBus.emit('stateUpdated', this.state);
    }
    
    /**
     * Dispatch an action to modify the game state
     * 
     * @param action - The action to dispatch
     */
    dispatch(action: GameActions) {
        this.processAction(action);
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
        // Recreate ECS world
        this.state.world = createWorldFromGameState(this.state);
        
        // ** Add migration/check for missing regionProgress **
        if (this.state && this.state.navigation && !this.state.navigation.regionProgress) {
            Logger.warn(LogCategory.ENGINE, "Loaded state missing navigation.regionProgress, initializing to {}.", LogContext.SAVE_LOAD);
            this.state.navigation.regionProgress = {};
        }
        // ** End migration check **
        
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