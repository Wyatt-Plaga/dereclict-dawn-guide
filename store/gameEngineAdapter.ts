import { GameEngine } from '@/engine/GameEngine';
import { ResourceProperties } from '@/engine/interfaces';
import { GameStore } from './types';
import { StoreApi } from 'zustand';
import { ResourceType } from '@/types/game.types';

/**
 * Game Engine Adapter
 * Connects the Game Engine with Zustand store for state management
 */
export class GameEngineAdapter {
  // The game engine instance
  private engine: GameEngine;

  // Flag to prevent recursive updates
  private updating: boolean = false;

  /**
   * Create a new Game Engine Adapter
   * @param store Zustand store to connect with
   */
  constructor(private store: StoreApi<GameStore>) {
    // Initialize the game engine
    this.engine = GameEngine.getInstance();

    // Set up initial sync from engine to store
    this.syncEngineToStore();

    // Set up event listeners for changes
    this.setupEventListeners();
  }

  /**
   * Synchronize engine state to the Zustand store
   */
  private syncEngineToStore(): void {
    if (this.updating) return;

    try {
      this.updating = true;

      // Get all resources from the engine
      const resources = this.engine.getAllResources();

      // Get store state and methods
      const state = this.store.getState();

      // Update resources in the store
      resources.forEach(resource => {
        const { id, type, amount, capacity } = resource.properties;
        
        // Map engine resource type to store resource type
        const resourceType = id as ResourceType;
        
        // Update the resource amount and capacity
        if (resourceType === 'energy' || 
            resourceType === 'crew' || 
            resourceType === 'scrap' || 
            resourceType === 'insight') {
          
          // Update amount
          state.updateResource(resourceType, 'amount', amount);
          
          // Update capacity
          state.updateResource(resourceType, 'capacity', capacity);
        }
      });

      // After syncing, save the state to persistence
      // Note: If your store doesn't have a saveState method, use a middleware 
      // or handle persistence differently
      if ('saveState' in state) {
        (state as any).saveState();
      }
    } finally {
      this.updating = false;
    }
  }

  /**
   * Synchronize store state to the game engine
   */
  private syncStoreToEngine(): void {
    if (this.updating) return;

    try {
      this.updating = true;

      // Get store state
      const state = this.store.getState();
      const { resources } = state;

      // Update each resource in the engine if it exists
      if (resources.energy) {
        this.updateEngineResource('energy', resources.energy.amount, resources.energy.capacity);
      }
      
      if (resources.crew) {
        this.updateEngineResource('crew', resources.crew.amount, resources.crew.capacity);
      }
      
      if (resources.scrap) {
        this.updateEngineResource('scrap', resources.scrap.amount, resources.scrap.capacity);
      }
      
      if (resources.insight) {
        this.updateEngineResource('insight', resources.insight.amount, resources.insight.capacity);
      }
    } finally {
      this.updating = false;
    }
  }

  /**
   * Helper method to update an engine resource
   */
  private updateEngineResource(id: string, amount: number, capacity: number): void {
    const resource = this.engine.getResource(id);
    if (resource) {
      // Only update if values are different to avoid loops
      if (resource.getAmount() !== amount || resource.getCapacity() !== capacity) {
        resource.update({
          amount,
          capacity,
          lastUpdated: new Date().toISOString()
        });
      }
    }
  }

  /**
   * Set up event listeners for changes in the engine and store
   */
  private setupEventListeners(): void {
    // Listen for resource changes in the engine
    this.engine.getGameCore().on('resource:updated', () => {
      this.syncEngineToStore();
    });

    // Subscribe to store changes
    const unsubscribe = this.store.subscribe(
      (state: GameStore, prevState: GameStore) => {
        // Check if resources have changed
        if (state.resources !== prevState.resources) {
          this.syncStoreToEngine();
        }
      }
    );
  }

  /**
   * Update a resource amount through the engine
   * @param resourceId Resource ID to update
   * @param amount Amount to change by
   */
  public updateResource(resourceId: string, amount: number): boolean {
    return this.engine.updateResource(resourceId, amount);
  }

  /**
   * Get a resource by ID
   * @param resourceId Resource ID
   */
  public getResource(resourceId: string): ResourceProperties | undefined {
    const resource = this.engine.getResource(resourceId);
    return resource?.properties;
  }

  /**
   * Process offline progress
   * @param elapsedTime Time elapsed in milliseconds
   */
  public processOfflineProgress(elapsedTime: number): void {
    // The engine will automatically calculate resource changes based on rates
    // Just need to sync after processing
    this.syncEngineToStore();
  }

  /**
   * Clean up resources
   */
  public cleanup(): void {
    this.engine.cleanup();
  }
} 