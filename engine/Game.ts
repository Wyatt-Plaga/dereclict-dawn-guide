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
  
  // Timestamp of last update
  private lastUpdate: number;
  
  // Game engine version
  private version: string = '1.0.0';
  
  // Auto-save interval in milliseconds
  private saveInterval: number = 60000; // 1 minute
  
  // Auto-save interval ID
  private saveIntervalId?: ReturnType<typeof setInterval>;

  /**
   * Initialize the game engine
   * @param initialState Optional initial state to restore from
   */
  constructor(initialState?: Partial<GameEngineState>) {
    // Initialize resource manager
    this.resources = new ResourceManager();
    
    // Initialize command processor
    this.commandProcessor = new DefaultCommandProcessor();
    
    // Initialize event emitter
    this.eventEmitter = new EventManager();
    
    // Set last update to now
    this.lastUpdate = Date.now();
    
    // Restore state if provided
    if (initialState) {
      this.restoreState(initialState);
    }
    
    // Start auto-save
    this.startAutoSave();
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
    this.lastUpdate = Date.now();
    
    // Return the result
    return result;
  }
  
  /**
   * Undo the last command
   */
  public undoCommand(): CommandResult {
    return this.commandProcessor.undo();
  }
  
  /**
   * Subscribe to game events
   * @param eventType Type of event to subscribe to
   * @param listener Listener function to call when event occurs
   */
  public on(eventType: string, listener: EventListener): void {
    this.eventEmitter.on(eventType, listener);
  }
  
  /**
   * Unsubscribe from game events
   * @param eventType Type of event to unsubscribe from
   * @param listener Listener function to remove
   */
  public off(eventType: string, listener: EventListener): void {
    this.eventEmitter.off(eventType, listener);
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
        resource.subtract(amount);
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
  }
  
  /**
   * Process offline progress since last update
   */
  private processOfflineProgress(): void {
    // Calculate time since last update
    const now = Date.now();
    const elapsed = now - this.lastUpdate;
    
    // Skip if no time has passed
    if (elapsed <= 0) {
      return;
    }
    
    // Process resources with rates
    for (const resource of this.resources.getAllResources()) {
      const rate = resource.getRate?.();
      
      if (rate && rate !== 0) {
        // Calculate amount after time has passed
        const newAmount = resource.calculateAmountAfterTime?.(elapsed);
        
        if (newAmount !== undefined) {
          resource.update({ amount: newAmount });
        }
      }
    }
    
    // Update last update
    this.lastUpdate = now;
  }
  
  /**
   * Start auto-saving
   */
  private startAutoSave(): void {
    if (this.saveIntervalId) {
      clearInterval(this.saveIntervalId);
    }
    
    this.saveIntervalId = setInterval(() => {
      // Emit save event
      this.emit({
        id: `save-${Date.now()}`,
        type: 'save',
        timestamp: Date.now(),
        payload: this.saveState()
      });
      
    }, this.saveInterval);
  }
  
  /**
   * Set auto-save interval
   * @param interval Interval in milliseconds
   */
  public setSaveInterval(interval: number): void {
    this.saveInterval = interval;
    this.startAutoSave();
  }
  
  /**
   * Clean up resources
   */
  public cleanup(): void {
    // Stop auto-save
    if (this.saveIntervalId) {
      clearInterval(this.saveIntervalId);
    }
  }
} 