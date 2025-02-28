/**
 * Core Game Engine
 * Central coordination point for the game systems
 */

import { CommandProcessor } from './CommandProcessor';
import { Command, CommandResult, GameEngineState } from './GameInterfaces';
import { EventEmitter, GameEvent } from '../events';

// Import all domain services
import { 
  ResourceManager, 
  ResourceRegistry
} from '../../domain/resources';

import { 
  GameTime, 
  TimeManager, 
  ProgressCalculator, 
  OfflineManager, 
  OfflineProgressResult 
} from '../../domain/time';

import { 
  UpgradeManager 
} from '../../domain/upgrades';

import { 
  LogManager, 
  LogCategory 
} from '../../domain/logs';

/**
 * Main Game Engine class
 * Coordinates resource management, command processing, and event systems
 */
export class Game {
  // Core systems
  private eventEmitter: EventEmitter;
  private commandProcessor: CommandProcessor;
  
  // Domain-specific systems
  private resources: ResourceRegistry;
  private gameTime: GameTime;
  private timeManager: TimeManager;
  private progressCalculator: ProgressCalculator;
  private offlineManager: OfflineManager;
  private upgrades: UpgradeManager;
  private logs: LogManager;
  
  // Game state tracking
  private lastUpdate: number;
  private version: string = '1.0.0';
  
  // Auto-save settings
  private saveInterval: number = 60000; // 1 minute
  private autoSaveTimer?: NodeJS.Timeout;

  /**
   * Initialize the game engine
   * @param initialState Optional initial state to restore from
   */
  constructor(initialState?: Partial<GameEngineState>) {
    // Initialize event emitter first (needed by other systems)
    this.eventEmitter = new EventEmitter();
    
    // Initialize game time service
    this.gameTime = new GameTime();
    
    // Initialize time manager
    this.timeManager = new TimeManager(this.gameTime, this.eventEmitter);
    
    // Initialize resource manager
    this.resources = new ResourceManager();
    
    // Initialize command processor
    this.commandProcessor = new CommandProcessor(this.eventEmitter);
    
    // Initialize upgrade manager
    this.upgrades = new UpgradeManager(this.eventEmitter);
    
    // Initialize log manager
    this.logs = new LogManager(this.eventEmitter);
    
    // Initialize progress calculator
    this.progressCalculator = new ProgressCalculator(
      this.gameTime, 
      this.timeManager
    );
    
    // Initialize offline manager
    this.offlineManager = new OfflineManager(
      this.gameTime,
      this.progressCalculator,
      this.timeManager,
      this.eventEmitter
    );
    
    // Set last update to now
    this.lastUpdate = this.gameTime.getTime();
    
    // Restore state if provided
    if (initialState) {
      this.restoreState(initialState);
    }
    
    // Log initialization
    this.logs.info('Game engine initialized', { version: this.version }, LogCategory.GAME);
    
    // Emit initialization event
    this.emit({
      id: `game_initialized_${Date.now()}`,
      type: 'game_initialized',
      timestamp: this.gameTime.getTime(),
      payload: { 
        version: this.version,
        timestamp: this.gameTime.getTime()
      }
    });
    
    // Setup automatic systems
    this.setupAutoSave();
    this.setupEventLogging();
    this.setupGameTimeUpdates();
  }

  /**
   * Set up event listeners for automatic logging of key events
   */
  private setupEventLogging(): void {
    // Log command execution
    this.on('command_executed', (event) => {
      const payload = event.payload;
      this.logs.info(
        `Command executed: ${payload.commandType}`,
        payload,
        LogCategory.COMMAND
      );
    });
    
    // Log command failures
    this.on('command_failed', (event) => {
      const payload = event.payload;
      this.logs.warning(
        `Command failed: ${payload.commandType} - ${payload.result.message}`,
        payload,
        LogCategory.COMMAND
      );
    });
    
    // Log resource capacity reached
    this.on('resource_capacity_reached', (event) => {
      const payload = event.payload;
      this.logs.info(
        `Resource ${payload.resourceId} reached capacity: ${payload.capacity}`,
        payload,
        LogCategory.RESOURCE
      );
    });
    
    // Log upgrade purchases
    this.on('upgrade_purchased', (event) => {
      const payload = event.payload;
      this.logs.info(
        `Upgrade purchased: ${payload.upgradeId}`,
        payload,
        LogCategory.UPGRADE
      );
    });
  }

  /**
   * Set up auto-save functionality
   */
  private setupAutoSave(): void {
    // Clear any existing timer
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer);
    }
    
    // Set up new timer
    this.autoSaveTimer = setInterval(() => {
      this.saveState();
    }, this.saveInterval);
  }
  
  /**
   * Set up game time update interval
   */
  private setupGameTimeUpdates(): void {
    // Update game time every second
    setInterval(() => {
      const now = Date.now();
      const deltaTime = (now - this.lastUpdate) / 1000; // Convert to seconds
      
      // Update game time
      this.gameTime.update(deltaTime);
      
      // Update resources based on time passed
      this.updateResources(deltaTime);
      
      // Update last update time
      this.lastUpdate = now;
    }, 1000); // Update every second
  }
  
  /**
   * Update resources based on time passed
   * @param deltaTime Time passed in seconds
   */
  private updateResources(deltaTime: number): void {
    // Get all resources
    const resources = this.resources.getAllResources();
    
    // Update each resource
    for (const resource of resources) {
      // Skip resources with no production rate (check if the method exists and returns a value)
      if (!resource.getRate || !resource.getRate()) {
        continue;
      }
      
      // Calculate amount to add based on production rate and time passed
      const amount = resource.getRate() * deltaTime;
      
      // Add the amount if positive
      if (amount > 0) {
        resource.add(amount);
      }
    }
  }
  
  /**
   * Execute a command
   * @param command Command to execute
   */
  public executeCommand(command: Command): CommandResult {
    return this.commandProcessor.executeCommand(command);
  }
  
  /**
   * Subscribe to an event
   * @param eventType Event type to listen for
   * @param listener Function to call when event occurs
   */
  public on(eventType: string, listener: (event: GameEvent) => void): void {
    this.eventEmitter.on(eventType, listener);
  }
  
  /**
   * Unsubscribe from an event
   * @param eventType Event type to stop listening for
   * @param listener Function to remove
   */
  public off(eventType: string, listener: (event: GameEvent) => void): void {
    this.eventEmitter.off(eventType, listener);
  }
  
  /**
   * Emit an event
   * @param event Event to emit
   */
  public emit(event: GameEvent): void {
    this.eventEmitter.emit(event);
  }
  
  /**
   * Get the resource registry
   */
  public getResources(): ResourceRegistry {
    return this.resources;
  }
  
  /**
   * Get the upgrade manager
   */
  public getUpgrades(): UpgradeManager {
    return this.upgrades;
  }
  
  /**
   * Get the log manager
   */
  public getLogs(): LogManager {
    return this.logs;
  }
  
  /**
   * Get the game time service
   */
  public getGameTime(): GameTime {
    return this.gameTime;
  }
  
  /**
   * Get the time manager
   */
  public getTimeManager(): TimeManager {
    return this.timeManager;
  }
  
  /**
   * Process offline progress
   * @param offlineTime Time in milliseconds that the game was offline
   * @returns Offline progress result
   */
  public processOfflineProgress(offlineTime: number): OfflineProgressResult {
    // Get the resources as a Map
    const resourcesMap = this.resources.getResourceMap();
    
    // Call with both required parameters
    return this.offlineManager.calculateOfflineProgress(resourcesMap, offlineTime);
  }
  
  /**
   * Save the current game state
   * @returns Current game state
   */
  public saveState(): GameEngineState {
    // Create state object
    const state: GameEngineState = {
      resources: {},
      upgrades: {},
      logs: {},
      gameTime: this.gameTime.getTime(),
      version: this.version
    };
    
    // Save resources
    const resources = this.resources.getAllResources();
    for (const resource of resources) {
      if (typeof resource.properties === 'object') {
        state.resources[resource.getId()] = resource.properties;
      } else {
        // Fallback if properties not available
        state.resources[resource.getId()] = {
          id: resource.getId(),
          type: resource.getType(),
          name: resource.getId(),
          amount: resource.getAmount(),
          capacity: resource.getCapacity(),
          lastUpdated: new Date().toISOString()
        };
      }
    }
    
    // Save upgrades
    const upgrades = this.upgrades.getAllUpgrades();
    for (const upgrade of upgrades) {
      state.upgrades[upgrade.properties.id] = upgrade.properties;
    }
    
    // Save logs (only player-visible ones)
    const logs = this.logs.getAllLogs();
    for (const log of logs) {
      state.logs[log.getId()] = log.toJSON();
    }
    
    // Emit save event
    this.emit({
      id: `game_saved_${Date.now()}`,
      type: 'game_saved',
      timestamp: this.gameTime.getTime(),
      payload: { timestamp: this.gameTime.getTime() }
    });
    
    return state;
  }
  
  /**
   * Restore game state
   * @param state State to restore from
   */
  private restoreState(state: Partial<GameEngineState>): void {
    // Restore game time if provided
    if (state.gameTime !== undefined) {
      // Update the current time value
      this.gameTime.update(state.gameTime);
    }
    
    // Restore resources if provided
    if (state.resources) {
      for (const [id, data] of Object.entries(state.resources)) {
        const resource = this.resources.getResource(id);
        if (resource) {
          if (typeof resource.update === 'function') {
            resource.update(data);
          }
        } else {
          // Create resource if it doesn't exist
          this.resources.createResource(data);
        }
      }
    }
    
    // Restore upgrades if provided
    if (state.upgrades) {
      for (const [id, data] of Object.entries(state.upgrades)) {
        const upgrade = this.upgrades.getUpgrade(id);
        if (upgrade) {
          upgrade.update(data);
        } else {
          // Create upgrade if it doesn't exist
          this.upgrades.createUpgrade(data);
        }
      }
    }
    
    // Apply all upgrade effects
    this.upgrades.applyAllUpgradeEffects();
    
    // Update upgrade availability
    this.upgrades.updateUpgradeAvailability();
    
    // Log restoration
    this.logs.info('Game state restored', { version: state.version }, LogCategory.GAME);
  }
  
  /**
   * Clean up resources
   */
  public cleanup(): void {
    // Clear auto-save timer
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer);
    }
    
    // Clean up domain systems
    this.upgrades.cleanup();
    
    // Log shutdown
    this.logs.info('Game engine shut down', { version: this.version }, LogCategory.GAME);
  }
} 