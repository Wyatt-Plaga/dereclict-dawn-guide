import { Resource, EventEmitter } from '../interfaces';
import { GameTime } from './GameTime';
import { TimeManager } from './TimeManager';
import { ProgressCalculator, ProgressResult } from './ProgressCalculator';
import { GameEventType, createGameEvent } from '../events/GameEvents';

/**
 * Interface for offline bonus configuration
 */
export interface OfflineBonusConfig {
  // Base multiplier for offline progress (1.0 = 100% of calculated progress)
  baseMultiplier: number;
  
  // Whether to enable time-based bonus scaling
  enableTimeScaling: boolean;
  
  // Maximum time for bonus scaling in milliseconds
  maxBonusTime?: number;
  
  // Maximum bonus multiplier from time scaling
  maxTimeMultiplier?: number;
  
  // Time threshold after which special events can occur
  specialEventThreshold?: number;
  
  // Probability of special events (0-1)
  specialEventProbability?: number;
}

/**
 * Offline special event types
 */
export enum OfflineSpecialEventType {
  RESOURCE_JACKPOT = 'resource_jackpot', // Multiplied gains for a resource
  RESOURCE_BOOST = 'resource_boost',     // Temporary production boost
  NEW_DISCOVERY = 'new_discovery',       // Unlock something special
  RARE_RESOURCE = 'rare_resource',       // Find a rare resource
  MYSTERY_BONUS = 'mystery_bonus'        // Random bonus effect
}

/**
 * Interface for special event results
 */
export interface OfflineSpecialEvent {
  type: OfflineSpecialEventType;
  description: string;
  resourceId?: string;
  multiplier?: number;
  duration?: number;
  data?: any;
}

/**
 * Result of offline progress calculation
 */
export interface OfflineProgressResult {
  // Elapsed offline time in milliseconds
  elapsedTime: number;
  
  // Actual time processed (after caps) in milliseconds
  processedTime: number;
  
  // Resource progress results
  resourceResults: Map<string, ProgressResult>;
  
  // Applied bonus multiplier
  bonusMultiplier: number;
  
  // Any special events that occurred
  specialEvents: OfflineSpecialEvent[];
  
  // Timestamp when the player was last online
  lastOnlineTime: number;
  
  // Timestamp when the player came back online
  currentTime: number;
}

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
  
  // Maximum offline time to process (default: 3 days)
  private maxOfflineTime: number = 3 * 24 * 60 * 60 * 1000;
  
  // Last processed time
  private lastProcessedTime: number = 0;
  
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
   * Set the maximum offline time to process
   * @param maxTimeMs Maximum time in milliseconds
   */
  public setMaxOfflineTime(maxTimeMs: number): void {
    this.maxOfflineTime = Math.max(0, maxTimeMs);
  }
  
  /**
   * Calculate offline progress
   * @param resources Map of resources
   * @param lastOnlineTime Timestamp when player was last online
   * @returns Offline progress calculation results
   */
  public calculateOfflineProgress(
    resources: Map<string, Resource>,
    lastOnlineTime: number
  ): OfflineProgressResult {
    const currentTime = this.gameTime.getTime();
    
    // Calculate elapsed time
    let elapsedTime = currentTime - lastOnlineTime;
    
    // Apply maximum offline time cap
    const processedTime = Math.min(elapsedTime, this.maxOfflineTime);
    
    // Calculate base resource progress
    const resourceResults = this.progressCalculator.calculateOfflineProgress(
      resources,
      processedTime
    );
    
    // Calculate bonus multiplier
    const bonusMultiplier = this.calculateBonusMultiplier(processedTime);
    
    // Determine if special events should occur
    const specialEvents = this.determineSpecialEvents(processedTime, resources);
    
    // Save last processed time
    this.lastProcessedTime = currentTime;
    
    // Construct result
    const result: OfflineProgressResult = {
      elapsedTime,
      processedTime,
      resourceResults,
      bonusMultiplier,
      specialEvents,
      lastOnlineTime,
      currentTime
    };
    
    // Emit offline progress calculated event
    if (this.eventEmitter) {
      this.eventEmitter.emit(createGameEvent(GameEventType.OFFLINE_PROGRESS_CALCULATED, {
        elapsedTime,
        processedTime,
        bonusMultiplier,
        specialEventsCount: specialEvents.length,
        timestamp: currentTime
      }));
    }
    
    return result;
  }
  
  /**
   * Apply calculated offline progress to resources
   * @param resources Resources to update
   * @param result Offline progress calculation result
   */
  public applyOfflineProgress(
    resources: Map<string, Resource>,
    result: OfflineProgressResult
  ): void {
    // Apply progress with bonus multiplier
    this.progressCalculator.applyPotentialProgress(
      resources,
      result.resourceResults,
      result.bonusMultiplier
    );
    
    // Emit offline progress applied event
    if (this.eventEmitter) {
      this.eventEmitter.emit(createGameEvent(GameEventType.OFFLINE_PROGRESS_APPLIED, {
        elapsedTime: result.elapsedTime,
        processedTime: result.processedTime,
        bonusMultiplier: result.bonusMultiplier,
        specialEvents: result.specialEvents.map(e => ({
          type: e.type,
          description: e.description,
          resourceId: e.resourceId
        })),
        resourceChanges: Array.from(result.resourceResults.entries()).map(([id, progress]) => ({
          resourceId: id,
          previousAmount: progress.previousAmount,
          newAmount: progress.newAmount,
          delta: progress.delta * result.bonusMultiplier,
          strategy: progress.strategy
        })),
        timestamp: this.gameTime.getTime()
      }));
    }
  }
  
  /**
   * Calculate the bonus multiplier based on offline time
   * @param offlineTimeMs Offline time in milliseconds
   * @returns Bonus multiplier
   */
  private calculateBonusMultiplier(offlineTimeMs: number): number {
    // Start with base multiplier
    let multiplier = this.bonusConfig.baseMultiplier;
    
    // Apply time-based scaling if enabled
    if (this.bonusConfig.enableTimeScaling && this.bonusConfig.maxBonusTime) {
      // Calculate time factor (0-1 based on time)
      const timeFactor = Math.min(1, offlineTimeMs / this.bonusConfig.maxBonusTime);
      
      // Calculate additional multiplier from time
      const timeMultiplier = this.bonusConfig.maxTimeMultiplier || 1.0;
      const additionalMultiplier = timeFactor * (timeMultiplier - 1.0);
      
      // Apply additional multiplier
      multiplier += additionalMultiplier;
    }
    
    return multiplier;
  }
  
  /**
   * Determine if special events should occur based on offline time
   * @param offlineTimeMs Offline time in milliseconds
   * @param resources Available resources
   * @returns Array of special events
   */
  private determineSpecialEvents(
    offlineTimeMs: number,
    resources: Map<string, Resource>
  ): OfflineSpecialEvent[] {
    const events: OfflineSpecialEvent[] = [];
    
    // Check if we're past the threshold for special events
    if (!this.bonusConfig.specialEventThreshold || 
        offlineTimeMs < this.bonusConfig.specialEventThreshold) {
      return events;
    }
    
    // Determine if a special event should occur based on probability
    const probability = this.bonusConfig.specialEventProbability || 0;
    if (Math.random() > probability) {
      return events;
    }
    
    // Get array of resources
    const resourceArray = Array.from(resources.values());
    
    // If no resources, can't create resource-specific events
    if (resourceArray.length === 0) {
      return events;
    }
    
    // Choose a random event type
    const eventTypeKeys = Object.keys(OfflineSpecialEventType);
    const randomTypeKey = eventTypeKeys[Math.floor(Math.random() * eventTypeKeys.length)];
    const eventType = OfflineSpecialEventType[randomTypeKey as keyof typeof OfflineSpecialEventType];
    
    // Choose a random resource
    const randomResource = resourceArray[Math.floor(Math.random() * resourceArray.length)];
    
    // Generate the special event based on type
    switch (eventType) {
      case OfflineSpecialEventType.RESOURCE_JACKPOT: {
        // Generate a random multiplier between 2x and 5x
        const multiplier = 2 + Math.floor(Math.random() * 4);
        
        events.push({
          type: eventType,
          description: `Jackpot! Your ${randomResource.getId()} gains are multiplied by ${multiplier}x!`,
          resourceId: randomResource.getId(),
          multiplier
        });
        break;
      }
        
      case OfflineSpecialEventType.RESOURCE_BOOST: {
        // Generate a random duration between 1 and 4 hours
        const duration = (1 + Math.floor(Math.random() * 4)) * 60 * 60 * 1000;
        
        events.push({
          type: eventType,
          description: `Production boost! ${randomResource.getId()} production is doubled for the next ${Math.floor(duration / (60 * 60 * 1000))} hours.`,
          resourceId: randomResource.getId(),
          multiplier: 2,
          duration
        });
        break;
      }
        
      case OfflineSpecialEventType.NEW_DISCOVERY: {
        events.push({
          type: eventType,
          description: "While you were away, your team made a new discovery!",
          data: {
            discoveryType: "research_boost",
            discoveryValue: 100 + Math.floor(Math.random() * 900)
          }
        });
        break;
      }
        
      case OfflineSpecialEventType.RARE_RESOURCE: {
        // Generate a random amount between 10 and 100
        const amount = 10 + Math.floor(Math.random() * 91);
        
        events.push({
          type: eventType,
          description: `During your absence, your team found ${amount} rare materials!`,
          data: {
            resourceType: "rare_material",
            amount
          }
        });
        break;
      }
        
      case OfflineSpecialEventType.MYSTERY_BONUS: {
        events.push({
          type: eventType,
          description: "A mysterious event occurred while you were away... what could it mean?",
          data: {
            mysteryType: Math.floor(Math.random() * 5),
            mysteryValue: Math.floor(Math.random() * 100)
          }
        });
        break;
      }
    }
    
    return events;
  }
  
  /**
   * Get the formatted offline summary message
   * @param result Offline progress result
   * @returns Formatted summary message
   */
  public getOfflineSummaryMessage(result: OfflineProgressResult): string {
    let message = '';
    
    // Format the offline time
    const formattedTime = this.formatOfflineTime(result.elapsedTime);
    message += `You were offline for ${formattedTime}.\n`;
    
    // Add processed time if different from elapsed time
    if (result.processedTime < result.elapsedTime) {
      const processedPercent = Math.round(
        (result.processedTime / result.elapsedTime) * 100
      );
      message += `Progress was calculated for ${processedPercent}% of your absence.\n`;
    }
    
    // Add bonus information
    if (result.bonusMultiplier !== 1.0) {
      const bonusPercent = Math.round((result.bonusMultiplier - 1.0) * 100);
      message += `You received a ${bonusPercent}% offline bonus!\n`;
    }
    
    // Add resource summaries
    if (result.resourceResults.size > 0) {
      message += '\nResource progress:\n';
      
      Array.from(result.resourceResults.entries())
        .filter(([_, progress]) => progress.delta > 0)
        .forEach(([resourceId, progress]) => {
          const bonusAmount = progress.delta * result.bonusMultiplier;
          message += `- ${resourceId}: +${Math.floor(bonusAmount)}\n`;
        });
    }
    
    // Add special events
    if (result.specialEvents.length > 0) {
      message += '\nSpecial events:\n';
      
      result.specialEvents.forEach(event => {
        message += `- ${event.description}\n`;
      });
    }
    
    return message;
  }
  
  /**
   * Format offline time into a readable string
   * @param milliseconds Time in milliseconds
   * @returns Formatted time string
   */
  private formatOfflineTime(milliseconds: number): string {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''} and ${hours % 24} hour${hours % 24 !== 1 ? 's' : ''}`;
    } else if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''} and ${minutes % 60} minute${minutes % 60 !== 1 ? 's' : ''}`;
    } else if (minutes > 0) {
      return `${minutes} minute${minutes > 1 ? 's' : ''} and ${seconds % 60} second${seconds % 60 !== 1 ? 's' : ''}`;
    } else {
      return `${seconds} second${seconds !== 1 ? 's' : ''}`;
    }
  }
  
  /**
   * Get special events from the last offline calculation
   * @returns Array of special events
   */
  public getLastSpecialEvents(): OfflineSpecialEvent[] {
    // This would be enhanced in a real implementation to store and retrieve the events
    return [];
  }
} 