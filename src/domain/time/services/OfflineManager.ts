import { Resource } from '../../resources/models/ResourceInterfaces';
import { EventEmitter } from '../../../core/events';
import { GameTime } from './GameTime';
import { TimeManager } from './TimeManager';
import { ProgressCalculator, ProgressResult } from '../index';
import {
  OfflineBonusConfig,
  OfflineSpecialEventType,
  OfflineSpecialEvent,
  OfflineProgressResult
} from '../models/TimeInterfaces';

/**
 * OfflineManager handles enhanced offline progress mechanics
 */
export class OfflineManager {
  // Time services
  private gameTime: GameTime;
  private timeManager?: TimeManager;
  
  // Progress calculator
  private progressCalculator: ProgressCalculator;
  
  // Event emitter
  private eventEmitter?: EventEmitter;
  
  // Offline bonus configuration
  private bonusConfig: OfflineBonusConfig = {
    baseMultiplier: 1.0,
    enableTimeScaling: true,
    maxBonusTime: 24 * 60 * 60 * 1000, // 24 hours
    maxTimeMultiplier: 2.0,
    specialEventThreshold: 8 * 60 * 60 * 1000, // 8 hours
    specialEventProbability: 0.25
  };
  
  // Maximum time to process for offline progress (default: 3 days)
  private maxOfflineTime: number = 3 * 24 * 60 * 60 * 1000;
  
  // Last time offline progress was processed
  private lastProcessedTime: number = 0;
  
  // Last special events that occurred
  private lastSpecialEvents: OfflineSpecialEvent[] = [];
  
  /**
   * Create a new offline manager
   * @param gameTime Game time service
   * @param progressCalculator Progress calculator
   * @param timeManager Optional time manager
   * @param eventEmitter Optional event emitter
   */
  constructor(
    gameTime: GameTime,
    progressCalculator: ProgressCalculator,
    timeManager?: TimeManager,
    eventEmitter?: EventEmitter
  ) {
    this.gameTime = gameTime;
    this.progressCalculator = progressCalculator;
    this.timeManager = timeManager;
    this.eventEmitter = eventEmitter;
  }
  
  /**
   * Configure offline bonuses
   * @param config Bonus configuration
   */
  public configureBonuses(config: Partial<OfflineBonusConfig>): void {
    this.bonusConfig = { ...this.bonusConfig, ...config };
  }
  
  /**
   * Set the maximum time to process for offline progress
   * @param maxTimeMs Maximum time in milliseconds
   */
  public setMaxOfflineTime(maxTimeMs: number): void {
    if (maxTimeMs < 0) {
      throw new Error('Max offline time cannot be negative');
    }
    
    this.maxOfflineTime = maxTimeMs;
  }
  
  /**
   * Calculate offline progress
   * @param resources Map of resources
   * @param lastOnlineTime Timestamp when the player was last online
   */
  public calculateOfflineProgress(
    resources: Map<string, Resource>,
    lastOnlineTime: number
  ): OfflineProgressResult {
    const currentTime = this.gameTime.getTime();
    
    // Calculate elapsed time
    let elapsedTime = currentTime - lastOnlineTime;
    
    // Cap elapsed time at maximum
    const processedTime = Math.min(elapsedTime, this.maxOfflineTime);
    
    // Calculate bonus multiplier
    const bonusMultiplier = this.calculateBonusMultiplier(processedTime);
    
    // Calculate resource progress
    const resourceResults = this.progressCalculator.calculateOfflineProgress(
      resources,
      processedTime
    );
    
    // Determine if any special events occurred
    const specialEvents = this.determineSpecialEvents(processedTime, resources);
    
    // Store special events
    this.lastSpecialEvents = specialEvents;
    
    // Store last processed time
    this.lastProcessedTime = currentTime;
    
    // Create result
    const result: OfflineProgressResult = {
      elapsedTime,
      processedTime,
      resourceResults,
      bonusMultiplier,
      specialEvents,
      lastOnlineTime,
      currentTime
    };
    
    // Emit event if event emitter is available
    if (this.eventEmitter) {
      this.eventEmitter.emit({
        id: `offline_progress_${currentTime}`,
        type: 'offline_progress_calculated',
        timestamp: currentTime,
        payload: { result }
      });
    }
    
    return result;
  }
  
  /**
   * Apply offline progress to resources
   * @param resources Map of resources
   * @param result Offline progress result
   */
  public applyOfflineProgress(
    resources: Map<string, Resource>,
    result: OfflineProgressResult
  ): void {
    // Apply resource progress with bonus multiplier
    this.progressCalculator.applyPotentialProgress(
      resources,
      result.resourceResults,
      result.bonusMultiplier
    );
    
    // Apply special event effects
    for (const event of result.specialEvents) {
      if (event.type === OfflineSpecialEventType.RESOURCE_JACKPOT && 
          event.resourceId && 
          event.multiplier) {
        const resource = resources.get(event.resourceId);
        
        if (resource) {
          const progressResult = result.resourceResults.get(event.resourceId);
          
          if (progressResult) {
            const bonus = progressResult.delta * (event.multiplier - 1);
            resource.add(bonus);
          }
        }
      }
    }
    
    // Emit event if event emitter is available
    if (this.eventEmitter) {
      this.eventEmitter.emit({
        id: `offline_progress_applied_${this.gameTime.getTime()}`,
        type: 'offline_progress_applied',
        timestamp: this.gameTime.getTime(),
        payload: { result }
      });
    }
  }
  
  /**
   * Calculate bonus multiplier based on offline time
   * @param offlineTimeMs Offline time in milliseconds
   */
  private calculateBonusMultiplier(offlineTimeMs: number): number {
    // Start with base multiplier
    let multiplier = this.bonusConfig.baseMultiplier;
    
    // Apply time scaling if enabled
    if (this.bonusConfig.enableTimeScaling && 
        this.bonusConfig.maxBonusTime && 
        this.bonusConfig.maxTimeMultiplier) {
      // Calculate scaling factor (0-1)
      const scalingFactor = Math.min(1, offlineTimeMs / this.bonusConfig.maxBonusTime);
      
      // Calculate additional multiplier
      const additionalMultiplier = 
        (this.bonusConfig.maxTimeMultiplier - this.bonusConfig.baseMultiplier) * 
        scalingFactor;
      
      // Add to base multiplier
      multiplier += additionalMultiplier;
    }
    
    return multiplier;
  }
  
  /**
   * Determine if any special events occurred during offline time
   * @param offlineTimeMs Offline time in milliseconds
   * @param resources Map of resources
   */
  private determineSpecialEvents(
    offlineTimeMs: number,
    resources: Map<string, Resource>
  ): OfflineSpecialEvent[] {
    const events: OfflineSpecialEvent[] = [];
    
    // Check if special events are possible
    if (!this.bonusConfig.specialEventThreshold || 
        !this.bonusConfig.specialEventProbability ||
        offlineTimeMs < this.bonusConfig.specialEventThreshold) {
      return events;
    }
    
    // Calculate probability based on time
    const timeFactor = Math.min(
      3, 
      offlineTimeMs / this.bonusConfig.specialEventThreshold
    );
    const effectiveProbability = 
      this.bonusConfig.specialEventProbability * timeFactor;
    
    // Determine if a special event occurs
    if (Math.random() > effectiveProbability) {
      return events;
    }
    
    // Determine event type
    const eventTypes = Object.values(OfflineSpecialEventType);
    const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
    
    // Create event based on type
    switch (eventType) {
      case OfflineSpecialEventType.RESOURCE_JACKPOT: {
        // Get resources with non-zero progress
        const resourceEntries = Array.from(resources.entries());
        const eligibleResources = resourceEntries.filter(([id, resource]) => {
          const config = this.progressCalculator.getResourceConfig(id);
          return config && config.baseRate > 0;
        });
        
        if (eligibleResources.length === 0) {
          break;
        }
        
        // Select a random resource
        const [resourceId, resource] = 
          eligibleResources[Math.floor(Math.random() * eligibleResources.length)];
        
        // Determine multiplier (2x-5x)
        const multiplier = 2 + Math.floor(Math.random() * 4);
        
        events.push({
          type: OfflineSpecialEventType.RESOURCE_JACKPOT,
          description: `${multiplier}x ${resource.properties.name} jackpot!`,
          resourceId,
          multiplier
        });
        break;
      }
      
      case OfflineSpecialEventType.RESOURCE_BOOST: {
        // Get resources with non-zero progress
        const resourceEntries = Array.from(resources.entries());
        const eligibleResources = resourceEntries.filter(([id, resource]) => {
          const config = this.progressCalculator.getResourceConfig(id);
          return config && config.baseRate > 0;
        });
        
        if (eligibleResources.length === 0) {
          break;
        }
        
        // Select a random resource
        const [resourceId, resource] = 
          eligibleResources[Math.floor(Math.random() * eligibleResources.length)];
        
        // Determine boost duration (1-24 hours)
        const duration = (1 + Math.floor(Math.random() * 24)) * 60 * 60 * 1000;
        
        // Determine multiplier (1.5x-3x)
        const multiplier = 1.5 + Math.random() * 1.5;
        
        events.push({
          type: OfflineSpecialEventType.RESOURCE_BOOST,
          description: `${multiplier.toFixed(1)}x ${resource.properties.name} production boost for ${this.formatOfflineTime(duration)}!`,
          resourceId,
          multiplier,
          duration,
          data: {
            startTime: this.gameTime.getTime()
          }
        });
        break;
      }
      
      case OfflineSpecialEventType.NEW_DISCOVERY: {
        events.push({
          type: OfflineSpecialEventType.NEW_DISCOVERY,
          description: 'You discovered something special while you were away!',
          data: {
            discoveryId: `discovery_${Date.now()}`
          }
        });
        break;
      }
      
      case OfflineSpecialEventType.RARE_RESOURCE: {
        events.push({
          type: OfflineSpecialEventType.RARE_RESOURCE,
          description: 'You found a rare resource while you were away!',
          data: {
            rareResourceId: `rare_${Date.now()}`
          }
        });
        break;
      }
      
      case OfflineSpecialEventType.MYSTERY_BONUS: {
        // Determine bonus type (1-5)
        const bonusType = Math.floor(Math.random() * 5) + 1;
        
        let description = 'A mysterious bonus occurred while you were away!';
        
        switch (bonusType) {
          case 1:
            description = 'A mysterious energy surge occurred while you were away!';
            break;
          case 2:
            description = 'Strange cosmic rays affected your ship while you were away!';
            break;
          case 3:
            description = 'Your ship systems optimized themselves while you were away!';
            break;
          case 4:
            description = 'A beneficial anomaly passed through your ship while you were away!';
            break;
          case 5:
            description = 'Your crew made an important discovery while you were away!';
            break;
        }
        
        events.push({
          type: OfflineSpecialEventType.MYSTERY_BONUS,
          description,
          data: {
            bonusType,
            bonusId: `mystery_${Date.now()}`
          }
        });
        break;
      }
    }
    
    return events;
  }
  
  /**
   * Get a summary message for offline progress
   * @param result Offline progress result
   */
  public getOfflineSummaryMessage(result: OfflineProgressResult): string {
    const lines: string[] = [];
    
    // Add header
    lines.push(`Welcome back! You were away for ${this.formatOfflineTime(result.elapsedTime)}.`);
    
    // Add processed time if different from elapsed time
    if (result.processedTime < result.elapsedTime) {
      lines.push(`Processed ${this.formatOfflineTime(result.processedTime)} of offline time.`);
    }
    
    // Add bonus multiplier
    if (result.bonusMultiplier !== 1.0) {
      lines.push(`Applied a ${result.bonusMultiplier.toFixed(2)}x bonus to your offline progress.`);
    }
    
    // Add resource progress
    const resourceEntries = Array.from(result.resourceResults.entries());
    if (resourceEntries.length > 0) {
      lines.push('');
      lines.push('Resources gained:');
      
      for (const [resourceId, progress] of resourceEntries) {
        if (progress.delta > 0) {
          lines.push(`- ${progress.delta.toFixed(2)} ${resourceId}`);
        }
      }
    }
    
    // Add special events
    if (result.specialEvents.length > 0) {
      lines.push('');
      lines.push('Special events:');
      
      for (const event of result.specialEvents) {
        lines.push(`- ${event.description}`);
      }
    }
    
    return lines.join('\n');
  }
  
  /**
   * Format offline time in a human-readable format
   * @param milliseconds Time in milliseconds
   */
  private formatOfflineTime(milliseconds: number): string {
    return this.gameTime.formatElapsedTime(milliseconds);
  }
  
  /**
   * Get the last special events that occurred
   */
  public getLastSpecialEvents(): OfflineSpecialEvent[] {
    return [...this.lastSpecialEvents];
  }
} 