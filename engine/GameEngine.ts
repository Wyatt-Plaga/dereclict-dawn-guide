import { Game } from './Game';
import { ResourceRegistry, GameEngineState, Resource } from './interfaces';
import { ResourceManager } from './ResourceManager';
import { BaseResource } from './resources/BaseResource';
import { EnergyResource } from './resources/EnergyResource';
import { UpdateResourceCommand } from './commands/UpdateResourceCommand';

/**
 * Game Engine Integration
 * Provides a layer to connect the engine with the application state
 */
export class GameEngine {
  // Core game engine
  private game: Game;
  
  // Singleton instance
  private static instance: GameEngine;
  
  /**
   * Initialize the game engine
   * @param initialState Optional initial state
   */
  private constructor(initialState?: Partial<GameEngineState>) {
    // Create the game engine
    this.game = new Game(initialState);
    
    // Initialize with default resources if no initial state
    if (!initialState) {
      this.initializeDefaultResources();
    }
  }
  
  /**
   * Get the singleton instance
   * @param initialState Optional initial state for first initialization
   */
  public static getInstance(initialState?: Partial<GameEngineState>): GameEngine {
    if (!GameEngine.instance) {
      GameEngine.instance = new GameEngine(initialState);
    }
    return GameEngine.instance;
  }
  
  /**
   * Access the core game engine
   */
  public getGameCore(): Game {
    return this.game;
  }
  
  /**
   * Access the resource registry
   */
  public getResourceRegistry(): ResourceRegistry {
    return this.game['resources']; // Accessing private property
  }
  
  /**
   * Initialize default resources
   */
  private initializeDefaultResources(): void {
    const now = new Date().toISOString();
    
    // Create energy resource
    const energy = new EnergyResource({
      id: 'energy',
      name: 'Energy',
      amount: 50,
      capacity: 100,
      rate: 0.2, // Generate 0.2 energy per second
      description: 'Powers ship systems and activities',
      lastUpdated: now
    });
    
    // Create crew resource
    const crew = new BaseResource({
      id: 'crew',
      type: 'crew',
      name: 'Crew',
      amount: 5,
      capacity: 10,
      rate: 0,
      description: 'Available crew members',
      lastUpdated: now
    });
    
    // Create scrap resource
    const scrap = new BaseResource({
      id: 'scrap',
      type: 'scrap',
      name: 'Scrap',
      amount: 20,
      capacity: 100,
      rate: 0,
      description: 'Raw materials for construction and repairs',
      lastUpdated: now
    });
    
    // Create insight resource
    const insight = new BaseResource({
      id: 'insight',
      type: 'insight',
      name: 'Insight',
      amount: 0,
      capacity: 100,
      rate: 0,
      description: 'Scientific knowledge and discoveries',
      lastUpdated: now
    });
    
    // Register resources
    this.game.registerResource(energy);
    this.game.registerResource(crew);
    this.game.registerResource(scrap);
    this.game.registerResource(insight);
  }
  
  /**
   * Update a resource amount
   * @param resourceId Resource ID to update
   * @param amount Amount to change by
   */
  public updateResource(resourceId: string, amount: number): boolean {
    const command = new UpdateResourceCommand(
      this.getResourceRegistry(),
      resourceId,
      amount
    );
    
    const result = this.game.executeCommand(command);
    return result.success;
  }
  
  /**
   * Get a resource by ID
   * @param resourceId Resource ID
   */
  public getResource(resourceId: string): Resource | undefined {
    return this.getResourceRegistry().getResource(resourceId);
  }
  
  /**
   * Get all resources
   */
  public getAllResources(): Resource[] {
    return this.getResourceRegistry().getAllResources();
  }
  
  /**
   * Get resources by type
   * @param type Resource type
   */
  public getResourcesByType(type: string): Resource[] {
    return this.getResourceRegistry().getResourcesByType(type);
  }
  
  /**
   * Save the current game state
   */
  public saveState(): string {
    return this.game.saveState();
  }
  
  /**
   * Clean up resources
   */
  public cleanup(): void {
    this.game.cleanup();
  }
} 