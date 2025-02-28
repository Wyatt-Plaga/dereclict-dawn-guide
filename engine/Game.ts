import {
  CommandProcessor,
  Command,
  CommandResult,
  Resource,
  ResourceCost,
  ResourceRegistry,
  GameEvent,
  EventListener,
  EventEmitter,
  GameEngineState
} from './interfaces';
import { ResourceManager } from './ResourceManager';
import { DefaultCommandProcessor } from './CommandProcessor';
import { EventManager } from './events/EventManager';
import { UpgradeManager } from './upgrades/UpgradeManager';
import { Upgrade, UpgradeRegistry } from './upgrades/interfaces';
import { GameEventType, createGameEvent } from './events/GameEvents';
import { LogManager } from './logs/LogManager';
import { Log, LogCategory, LogLevel } from './logs/Log';
import { LogFilter } from './logs/LogManager';
import { GameTime } from './time/GameTime';
import { TimeManager, TimeTrackedActivityType } from './time/TimeManager';
import { ProgressCalculator } from './time/ProgressCalculator';
import { OfflineManager, OfflineProgressResult } from './time/OfflineManager';

/**
 * Main Game Engine class
 * Coordinates resource management, command processing, and event systems
 */
export class Game {
  // Resource management system
  private resources: ResourceRegistry;
  
  // Command processing system
  private commandProcessor: CommandProcessor;
  
  // Event management system
  private eventEmitter: EventEmitter;
  
  // Upgrade manager
  private upgrades: UpgradeRegistry;
  
  // Log manager
  private logs: LogManager;
  
  // Game time service
  private gameTime: GameTime;
  
  // Time manager
  private timeManager: TimeManager;
  
  // Progress calculator
  private progressCalculator: ProgressCalculator;
  
  // Offline manager
  private offlineManager: OfflineManager;
  
  // Timestamp of last update
  private lastUpdate: number;
  
  // Game engine version
  private version: string = '1.0.0';
  
  // Auto-save interval in milliseconds
  private saveInterval: number = 60000; // 1 minute
  
  // Auto-save interval ID
  private autoSaveTimer?: NodeJS.Timeout;

  /**
   * Initialize the game engine
   * @param initialState Optional initial state to restore from
   */
  constructor(initialState?: Partial<GameEngineState>) {
    // Initialize event emitter first (needed by other systems)
    this.eventEmitter = new EventManager();
    
    // Initialize game time service
    this.gameTime = new GameTime();
    
    // Initialize time manager
    this.timeManager = new TimeManager(this.gameTime, this.eventEmitter);
    
    // Initialize resource manager
    this.resources = new ResourceManager();
    
    // Initialize command processor
    this.commandProcessor = new DefaultCommandProcessor();
    
    // Initialize upgrade manager with event emitter
    this.upgrades = new UpgradeManager(this.eventEmitter);
    
    // Initialize log manager with event emitter
    this.logs = new LogManager(this.eventEmitter);
    
    // Initialize progress calculator
    this.progressCalculator = new ProgressCalculator(this.gameTime, this.timeManager);
    
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
    this.emit(createGameEvent(GameEventType.GAME_INITIALIZED, { 
      version: this.version,
      timestamp: this.gameTime.getTime()
    }));
    
    // Start auto-save
    this.setupAutoSave();
    
    // Subscribe to events for logging
    this.setupEventLogging();
    
    // Start game time update interval
    this.setupGameTimeUpdates();
  }
  
  /**
   * Set up event listeners for automatic logging of key events
   */
  private setupEventLogging(): void {
    // Log command execution
    this.on(GameEventType.COMMAND_EXECUTED, (event) => {
      const payload = event.payload;
      this.logs.info(
        `Command executed: ${payload.commandType}`,
        payload,
        LogCategory.COMMAND
      );
    });
    
    // Log command failures
    this.on(GameEventType.COMMAND_FAILED, (event) => {
      const payload = event.payload;
      this.logs.warning(
        `Command failed: ${payload.commandType} - ${payload.result.message}`,
        payload,
        LogCategory.COMMAND
      );
    });
    
    // Log resource capacity reached
    this.on(GameEventType.RESOURCE_CAPACITY_REACHED, (event) => {
      const payload = event.payload;
      this.logs.info(
        `Resource ${payload.resourceId} reached capacity: ${payload.capacity}`,
        payload,
        LogCategory.RESOURCE
      );
    });
    
    // Log upgrade purchases
    this.on(GameEventType.UPGRADE_PURCHASED, (event) => {
      const payload = event.payload;
      this.logs.info(
        `Upgrade purchased: ${payload.upgradeId}`,
        payload,
        LogCategory.UPGRADE
      );
    });
    
    // Log milestones reached
    this.on(GameEventType.MILESTONE_REACHED, (event) => {
      const payload = event.payload;
      this.logs.info(
        `Milestone reached: ${payload.name}`,
        payload,
        LogCategory.MILESTONE
      );
    });
  }
  
  /**
   * Execute a command
   * @param command Command to execute
   */
  public executeCommand(command: Command): CommandResult {
    // Check if the command has a cost
    if (command.cost) {
      // Check if we can afford the cost
      if (!this.canAffordCost(command.cost)) {
        // Emit command failed event
        this.emit(createGameEvent(GameEventType.COMMAND_FAILED, {
          commandId: command.id,
          commandType: command.type,
          result: {
            success: false,
            message: 'Insufficient resources to execute command'
          }
        }));
        
        return {
          success: false,
          message: 'Insufficient resources to execute command'
        };
      }
    }
    
    // Execute the command
    const result = this.commandProcessor.execute(command);
    
    // If successful and has a cost, deduct the resources
    if (result.success && command.cost) {
      this.deductCost(command.cost);
    }
    
    // Update last update time
    this.lastUpdate = this.gameTime.getTime();
    
    // Emit appropriate event
    const eventType = result.success 
      ? GameEventType.COMMAND_EXECUTED 
      : GameEventType.COMMAND_FAILED;
    
    this.emit(createGameEvent(eventType, {
      commandId: command.id,
      commandType: command.type,
      result
    }));
    
    // Return the result
    return result;
  }
  
  /**
   * Undo the last command
   */
  public undoCommand(): CommandResult {
    const result = this.commandProcessor.undo();
    
    // Emit undo event if successful
    if (result.success) {
      this.emit(createGameEvent(GameEventType.COMMAND_UNDONE, {
        result
      }));
      
      // Log undo
      this.logs.info(
        'Command undone',
        { result },
        LogCategory.COMMAND
      );
    }
    
    return result;
  }
  
  /**
   * Subscribe to game events
   * @param eventType Type of event to subscribe to
   * @param listener Listener function to call when event occurs
   */
  public on(eventType: string | GameEventType, listener: EventListener): void {
    this.eventEmitter.on(eventType.toString(), listener);
  }
  
  /**
   * Unsubscribe from game events
   * @param eventType Type of event to unsubscribe from
   * @param listener Listener function to remove
   */
  public off(eventType: string | GameEventType, listener: EventListener): void {
    this.eventEmitter.off(eventType.toString(), listener);
  }
  
  /**
   * Emit a game event
   * @param event Event to emit
   */
  public emit(event: GameEvent): void {
    this.eventEmitter.emit(event);
  }
  
  /**
   * Register a new resource
   * @param resource Resource to register
   */
  public registerResource(resource: Resource): void {
    this.resources.registerResource(resource);
    
    // Emit resource created event
    this.emit(createGameEvent(GameEventType.RESOURCE_CREATED, {
      resourceId: resource.getId(),
      resourceType: resource.getType(),
      amount: resource.getAmount()
    }));
    
    // Log resource creation
    this.logs.info(
      `Resource created: ${resource.getId()} (${resource.getType()})`,
      { 
        resourceId: resource.getId(),
        resourceType: resource.getType(),
        amount: resource.getAmount()
      },
      LogCategory.RESOURCE
    );
  }
  
  /**
   * Get a resource by ID
   * @param id Resource ID
   */
  public getResource(id: string): Resource | undefined {
    return this.resources.getResource(id);
  }
  
  /**
   * Check if we can afford a cost
   * @param cost Resource cost to check
   */
  private canAffordCost(cost: ResourceCost): boolean {
    for (const [resourceId, amount] of Object.entries(cost)) {
      const resource = this.resources.getResource(resourceId);
      
      // If resource doesn't exist or doesn't have enough, we can't afford it
      if (!resource || !resource.canAfford(amount)) {
        return false;
      }
    }
    
    return true;
  }
  
  /**
   * Deduct resources for a cost
   * @param cost Cost to deduct
   */
  private deductCost(cost: ResourceCost): void {
    for (const [resourceId, amount] of Object.entries(cost)) {
      const resource = this.resources.getResource(resourceId);
      
      if (resource) {
        const previousAmount = resource.getAmount();
        resource.subtract(amount);
        
        // Emit resource updated event
        this.emit(createGameEvent(GameEventType.RESOURCE_UPDATED, {
          resourceId: resource.getId(),
          resourceType: resource.getType(),
          amount: resource.getAmount(),
          delta: -amount,
          previousAmount,
          reason: 'command_cost'
        }));
      }
    }
  }
  
  /**
   * Get the current game state
   */
  public getState(): GameEngineState {
    return {
      version: this.version,
      lastUpdate: this.lastUpdate,
      resources: this.resources.getAllResources().map(r => r.properties)
    };
  }
  
  /**
   * Save game state
   */
  public saveState(): string {
    const state = this.getState();
    
    // Log save
    this.logs.info(
      'Game state saved',
      { timestamp: this.gameTime.getTime(), version: this.version },
      LogCategory.GAME
    );
    
    // Emit save event
    this.emit(createGameEvent(GameEventType.GAME_SAVED, {
      timestamp: this.gameTime.getTime(),
      version: this.version
    }));
    
    return JSON.stringify(state);
  }
  
  /**
   * Restore game state
   * @param state State to restore
   */
  private restoreState(state: Partial<GameEngineState>): void {
    // Update version if present
    if (state.version) {
      this.version = state.version;
    }
    
    // Update lastUpdate if present
    if (state.lastUpdate) {
      this.lastUpdate = state.lastUpdate;
    }
    
    // Restore resources if present
    if (state.resources) {
      for (const resourceProps of state.resources) {
        this.resources.createOrUpdateResource(resourceProps);
      }
      
      // Process any offline progress
      this.processOfflineProgress();
    }
    
    // Log loading
    this.logs.info(
      'Game state loaded',
      { timestamp: this.gameTime.getTime(), version: this.version },
      LogCategory.GAME
    );
    
    // Emit game loaded event
    this.emit(createGameEvent(GameEventType.GAME_LOADED, {
      timestamp: this.gameTime.getTime(),
      version: this.version
    }));
  }
  
  /**
   * Set up game time updates
   */
  private setupGameTimeUpdates(): void {
    // Update game time every second
    setInterval(() => {
      const delta = this.gameTime.update();
      
      // If meaningful time has passed, update resources
      if (delta > 0) {
        this.updateResources(delta);
      }
    }, 1000);
  }
  
  /**
   * Update resources based on elapsed time
   * @param deltaMs Elapsed time in milliseconds
   */
  private updateResources(deltaMs: number): void {
    // Track resource changes for event
    const resourceChanges: Record<string, { 
      id: string, 
      type: string,
      previousAmount: number, 
      newAmount: number,
      delta: number 
    }> = {};
    
    // Process resources with rates
    for (const resource of this.resources.getAllResources()) {
      const rate = resource.getRate?.();
      
      if (rate && rate !== 0) {
        // Calculate amount to add based on rate and time delta
        const ratePerMs = rate / 1000;
        const amountToAdd = ratePerMs * deltaMs;
        
        // Skip if amount is negligible
        if (Math.abs(amountToAdd) < 0.00001) {
          continue;
        }
        
        // Update resource
        const previousAmount = resource.getAmount();
        resource.add(amountToAdd);
        const newAmount = resource.getAmount();
        
        // Track change for event
        resourceChanges[resource.getId()] = {
          id: resource.getId(),
          type: resource.getType(),
          previousAmount,
          newAmount,
          delta: newAmount - previousAmount
        };
        
        // Emit resource capacity reached event if at capacity
        if (typeof resource.getCapacity === 'function') {
          const capacity = resource.getCapacity();
          if (capacity !== undefined && newAmount >= capacity) {
            this.emit(createGameEvent(GameEventType.RESOURCE_CAPACITY_REACHED, {
              resourceId: resource.getId(),
              resourceType: resource.getType(),
              amount: newAmount,
              capacity
            }));
          }
        }
      }
    }
    
    // Emit resource update event if any resources changed
    if (Object.keys(resourceChanges).length > 0) {
      this.emit(createGameEvent(GameEventType.RESOURCE_UPDATED, {
        resources: resourceChanges,
        deltaTime: deltaMs
      }));
    }
  }
  
  /**
   * Process offline progress since last update
   */
  private processOfflineProgress(): void {
    // Calculate time since last update
    const now = this.gameTime.getTime();
    const elapsed = now - this.lastUpdate;
    
    // Skip if no time has passed
    if (elapsed <= 0) {
      return;
    }
    
    // Track when this offline processing was done
    this.timeManager.setTimestamp(
      'last_offline_processing',
      TimeTrackedActivityType.OFFLINE_PROGRESS,
      { elapsed }
    );
    
    // Calculate and apply offline progress
    const offlineResult = this.offlineManager.calculateOfflineProgress(
      this.resources.getResourceMap(),
      this.lastUpdate
    );
    
    // Apply the offline progress
    this.offlineManager.applyOfflineProgress(
      this.resources.getResourceMap(),
      offlineResult
    );
    
    // Log offline progress
    this.logOfflineProgress(offlineResult);
    
    // Update last update
    this.lastUpdate = now;
  }
  
  /**
   * Log offline progress results
   * @param result Offline progress result
   */
  private logOfflineProgress(result: OfflineProgressResult): void {
    // Skip logging if no resources changed
    if (result.resourceResults.size === 0) {
      return;
    }
    
    // Log offline progress summary
    const elapsedSeconds = Math.round(result.elapsedTime / 1000);
    this.logs.info(
      `Offline progress calculated for ${elapsedSeconds} seconds`,
      {
        elapsed: result.elapsedTime,
        processed: result.processedTime,
        bonusMultiplier: result.bonusMultiplier,
        specialEventsCount: result.specialEvents.length
      },
      LogCategory.OFFLINE
    );
    
    // Log special events individually
    for (const event of result.specialEvents) {
      this.logs.info(
        event.description,
        { type: event.type, data: event.data },
        LogCategory.OFFLINE
      );
    }
  }
  
  /**
   * Get offline summary message for display
   * @returns Formatted offline summary message
   */
  public getOfflineSummaryMessage(): string | undefined {
    // Get the last offline processing timestamp
    const lastOfflineTimestamp = this.timeManager.getTimestamp('last_offline_processing');
    
    // If no timestamp or it's too old, return undefined
    if (!lastOfflineTimestamp || 
        this.gameTime.getElapsedTime(lastOfflineTimestamp.timestamp) > 60000) {
      return undefined;
    }
    
    // Get the offline progress result from the offline manager
    // In a real implementation, we would store the last result
    // This is a placeholder since we don't have access to the last result
    const lastSpecialEvents = this.offlineManager.getLastSpecialEvents();
    
    // Create a simple message
    let message = 'Welcome back! ';
    
    if (lastOfflineTimestamp.data?.elapsed) {
      const elapsedTime = this.gameTime.formatElapsedTime(lastOfflineTimestamp.data.elapsed);
      message += `You were away for ${elapsedTime}. `;
    }
    
    if (lastSpecialEvents.length > 0) {
      message += 'Special events occurred while you were away!';
    } else {
      message += 'Your resources have continued to accumulate.';
    }
    
    return message;
  }
  
  /**
   * Start auto-saving
   */
  private setupAutoSave(): void {
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer);
    }
    
    this.autoSaveTimer = setInterval(() => {
      // Save and emit event
      const saveData = this.saveState();
      
    }, this.saveInterval);
  }
  
  /**
   * Set auto-save interval
   * @param interval Interval in milliseconds
   */
  public setSaveInterval(interval: number): void {
    this.saveInterval = interval;
    this.setupAutoSave();
  }
  
  /**
   * Clean up resources
   */
  public cleanup(): void {
    // Stop auto-save
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer);
    }
    
    // Clean up upgrades
    this.upgrades.cleanup();
    
    // Clean up time manager
    this.timeManager.cleanup();
    
    // End the session
    this.timeManager.endSession();
  }
  
  /**
   * Get the upgrade registry
   * @returns Upgrade registry
   */
  public getUpgradeRegistry(): UpgradeRegistry {
    return this.upgrades;
  }
  
  /**
   * Get an upgrade by ID
   * @param id Upgrade ID
   * @returns Upgrade or undefined
   */
  public getUpgrade(id: string): Upgrade | undefined {
    return this.upgrades.getUpgrade(id);
  }
  
  /**
   * Register an upgrade
   * @param upgrade Upgrade to register
   */
  public registerUpgrade(upgrade: Upgrade): void {
    this.upgrades.registerUpgrade(upgrade);
    
    // Emit event
    this.emit(createGameEvent(GameEventType.UPGRADE_REGISTERED, {
      upgradeId: upgrade.properties.id,
      upgradeType: upgrade.properties.type,
      name: upgrade.properties.name,
      description: upgrade.properties.description
    }));
    
    // Log upgrade registration
    this.logs.info(
      `Upgrade registered: ${upgrade.properties.name} (${upgrade.properties.id})`,
      {
        upgradeId: upgrade.properties.id,
        upgradeType: upgrade.properties.type
      },
      LogCategory.UPGRADE
    );
  }
  
  /**
   * Update upgrade availability based on the current game state
   */
  public updateUpgradeAvailability(): void {
    this.upgrades.updateUpgradeAvailability();
  }
  
  /**
   * Apply all upgrade effects
   * This should be called after loading a saved game or when the game state changes
   */
  public applyAllUpgradeEffects(): void {
    this.upgrades.applyAllUpgradeEffects();
  }
  
  /**
   * Get event history for debugging
   * @param limit Maximum number of events to return
   * @param eventTypes Optional filter for specific event types
   */
  public getEventHistory(limit?: number, eventTypes?: string[]): GameEvent[] {
    return (this.eventEmitter as EventManager).getEventHistory(limit, eventTypes);
  }
  
  /**
   * Clear event history
   */
  public clearEventHistory(): void {
    (this.eventEmitter as EventManager).clearEventHistory();
  }
  
  /**
   * Get the log manager
   */
  public getLogManager(): LogManager {
    return this.logs;
  }
  
  /**
   * Create a new log entry
   * @param message Log message
   * @param level Log level
   * @param data Additional data
   * @param category Log category
   * @returns Created log
   */
  public log(
    message: string,
    level: LogLevel = LogLevel.INFO,
    data?: any,
    category: LogCategory = LogCategory.GAME
  ): Log {
    return this.logs.createLog({
      message,
      level,
      category,
      data
    });
  }
  
  /**
   * Create a debug log
   * @param message Log message
   * @param data Additional data
   * @param category Log category
   */
  public debug(
    message: string,
    data?: any,
    category: LogCategory = LogCategory.DEBUG
  ): Log {
    return this.logs.debug(message, data, category);
  }
  
  /**
   * Create an info log
   * @param message Log message
   * @param data Additional data
   * @param category Log category
   */
  public info(
    message: string,
    data?: any,
    category: LogCategory = LogCategory.GAME
  ): Log {
    return this.logs.info(message, data, category);
  }
  
  /**
   * Create a warning log
   * @param message Log message
   * @param data Additional data
   * @param category Log category
   */
  public warning(
    message: string,
    data?: any,
    category: LogCategory = LogCategory.GAME
  ): Log {
    return this.logs.warning(message, data, category);
  }
  
  /**
   * Create an error log
   * @param message Log message
   * @param data Additional data
   * @param category Log category
   */
  public error(
    message: string,
    data?: any,
    category: LogCategory = LogCategory.SYSTEM
  ): Log {
    return this.logs.error(message, data, category);
  }
  
  /**
   * Get filtered logs for UI display
   * @param filter Optional filter criteria
   * @param limit Maximum number of logs to return
   */
  public getLogs(filter?: Partial<LogFilter>, limit?: number): Log[] {
    let logs = filter 
      ? this.logs.filterLogs(filter as LogFilter) 
      : this.logs.getAllLogs();
    
    // Sort by timestamp (newest first)
    logs = logs.sort((a, b) => b.getTimestamp() - a.getTimestamp());
    
    // Apply limit if specified
    if (limit && limit > 0) {
      logs = logs.slice(0, limit);
    }
    
    return logs;
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
   * Get the progress calculator
   */
  public getProgressCalculator(): ProgressCalculator {
    return this.progressCalculator;
  }
  
  /**
   * Get the offline manager
   */
  public getOfflineManager(): OfflineManager {
    return this.offlineManager;
  }
  
  /**
   * Pause the game
   */
  public pause(): void {
    this.gameTime.pause();
  }
  
  /**
   * Resume the game
   */
  public resume(): void {
    this.gameTime.resume();
  }
  
  /**
   * Check if the game is paused
   */
  public isPaused(): boolean {
    return this.gameTime.isPausedState();
  }
  
  /**
   * Set the game time scale
   * @param scale Time scale factor (1.0 = normal speed)
   */
  public setTimeScale(scale: number): void {
    this.gameTime.setTimeScale(scale);
  }
  
  /**
   * Get the current game time scale
   */
  public getTimeScale(): number {
    return this.gameTime.getTimeScale();
  }
} 