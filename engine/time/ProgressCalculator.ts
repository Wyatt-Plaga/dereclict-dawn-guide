import { Resource } from '../interfaces';
import { GameTime } from './GameTime';
import { TimeManager, TimeTrackedActivityType } from './TimeManager';

/**
 * Progress calculation strategies
 */
export enum ProgressStrategy {
  LINEAR = 'linear',          // Continuous production at a constant rate
  CAPPED = 'capped',          // Linear but with a max amount cap
  DIMINISHING = 'diminishing', // Returns diminish over time
  ACCELERATING = 'accelerating', // Returns increase over time
  STEP = 'step',              // Production happens in steps/batches
  PERIODIC = 'periodic'       // Production happens at fixed intervals
}

/**
 * Interface for a progress calculation result
 */
export interface ProgressResult {
  resourceId: string;
  previousAmount: number;
  newAmount: number;
  delta: number;
  elapsedTime: number;
  strategy: ProgressStrategy;
  cappedAt?: number;
  efficiency?: number;
}

/**
 * Options for capped progress
 */
export interface CappedProgressOptions {
  maxAmount: number;    // Maximum amount of progress allowed
  percentOfMax?: number; // Percent of max allowed when offline (0-100)
}

/**
 * Options for diminishing progress
 */
export interface DiminishingProgressOptions {
  halfLifeMs: number;   // Time after which efficiency drops to 50%
  minEfficiency: number; // Minimum efficiency (0-1)
}

/**
 * Options for accelerating progress
 */
export interface AcceleratingProgressOptions {
  rampUpTimeMs: number; // Time to reach full efficiency
  maxMultiplier: number; // Maximum multiplier for production
}

/**
 * Options for step progress
 */
export interface StepProgressOptions {
  batchSize: number;    // How much is produced in each batch
  batchTimeMs: number;  // Time between batches
  maxBatches?: number;  // Maximum number of batches (optional)
}

/**
 * Options for periodic progress
 */
export interface PeriodicProgressOptions {
  intervalMs: number;   // Time between periodic gains
  amountPerInterval: number; // Amount gained each interval
  maxIntervals?: number; // Maximum intervals to calculate
}

/**
 * Configuration for a specific resource's progress calculation
 */
export interface ResourceProgressConfig {
  resourceId: string;
  strategy: ProgressStrategy;
  baseRate: number;
  options?: CappedProgressOptions | DiminishingProgressOptions | 
    AcceleratingProgressOptions | StepProgressOptions | PeriodicProgressOptions;
  activeTimestamp?: string; // ID of timestamp to use for elapsed time (optional)
  upgradeModifiers?: Array<{
    upgradeId: string;
    multiplier: number;
  }>;
}

/**
 * Unified progress calculator for different types of resources
 */
export class ProgressCalculator {
  private gameTime: GameTime;
  private timeManager?: TimeManager;
  
  // Resource configurations
  private resourceConfigs: Map<string, ResourceProgressConfig> = new Map();
  
  // Default offline efficiency (0-1)
  private defaultOfflineEfficiency: number = 0.5;
  
  // Global offline cap in milliseconds (e.g., 8 hours = 8 * 60 * 60 * 1000)
  private globalOfflineCap: number = 8 * 60 * 60 * 1000;
  
  /**
   * Create a new progress calculator
   * @param gameTime Game time service
   * @param timeManager Optional time manager for tracking timestamps
   */
  constructor(gameTime: GameTime, timeManager?: TimeManager) {
    this.gameTime = gameTime;
    this.timeManager = timeManager;
  }
  
  /**
   * Register a resource for progress calculation
   * @param config Resource progress configuration
   */
  public registerResource(config: ResourceProgressConfig): void {
    this.resourceConfigs.set(config.resourceId, config);
  }
  
  /**
   * Update a resource's progress configuration
   * @param resourceId Resource ID
   * @param updates Partial updates to apply
   * @returns Whether the resource was found and updated
   */
  public updateResourceConfig(
    resourceId: string, 
    updates: Partial<ResourceProgressConfig>
  ): boolean {
    const config = this.resourceConfigs.get(resourceId);
    
    if (!config) {
      return false;
    }
    
    // Apply updates
    Object.assign(config, updates);
    this.resourceConfigs.set(resourceId, config);
    
    return true;
  }
  
  /**
   * Get a resource's progress configuration
   * @param resourceId Resource ID
   */
  public getResourceConfig(resourceId: string): ResourceProgressConfig | undefined {
    return this.resourceConfigs.get(resourceId);
  }
  
  /**
   * Remove a resource's progress configuration
   * @param resourceId Resource ID
   */
  public removeResource(resourceId: string): boolean {
    return this.resourceConfigs.delete(resourceId);
  }
  
  /**
   * Set the default offline efficiency
   * @param efficiency Efficiency factor (0-1)
   */
  public setDefaultOfflineEfficiency(efficiency: number): void {
    this.defaultOfflineEfficiency = Math.max(0, Math.min(1, efficiency));
  }
  
  /**
   * Set the global offline progress cap
   * @param milliseconds Maximum offline time in milliseconds
   */
  public setGlobalOfflineCap(milliseconds: number): void {
    this.globalOfflineCap = Math.max(0, milliseconds);
  }
  
  /**
   * Calculate progress for a specific resource
   * @param resource Resource to calculate progress for
   * @param elapsedMs Elapsed time in milliseconds
   * @returns Progress calculation result
   */
  public calculateResourceProgress(
    resource: Resource, 
    elapsedMs: number
  ): ProgressResult {
    // Get configuration for this resource
    const config = this.resourceConfigs.get(resource.getId());
    
    if (!config) {
      // Return a default linear calculation if no config is found
      return this.calculateLinearProgress(resource, elapsedMs, resource.getRate?.() || 0);
    }
    
    // Use active timestamp if provided and timeManager is available
    let effectiveElapsedMs = elapsedMs;
    
    if (config.activeTimestamp && this.timeManager) {
      const elapsed = this.timeManager.getElapsedTime(config.activeTimestamp);
      if (elapsed !== undefined) {
        effectiveElapsedMs = Math.min(elapsed, elapsedMs);
      }
    }
    
    // Apply global offline cap
    effectiveElapsedMs = Math.min(effectiveElapsedMs, this.globalOfflineCap);
    
    // Apply appropriate calculation strategy
    switch (config.strategy) {
      case ProgressStrategy.LINEAR:
        return this.calculateLinearProgress(resource, effectiveElapsedMs, config.baseRate);
        
      case ProgressStrategy.CAPPED:
        return this.calculateCappedProgress(
          resource, 
          effectiveElapsedMs, 
          config.baseRate, 
          config.options as CappedProgressOptions
        );
        
      case ProgressStrategy.DIMINISHING:
        return this.calculateDiminishingProgress(
          resource, 
          effectiveElapsedMs, 
          config.baseRate, 
          config.options as DiminishingProgressOptions
        );
        
      case ProgressStrategy.ACCELERATING:
        return this.calculateAcceleratingProgress(
          resource, 
          effectiveElapsedMs, 
          config.baseRate, 
          config.options as AcceleratingProgressOptions
        );
        
      case ProgressStrategy.STEP:
        return this.calculateStepProgress(
          resource, 
          effectiveElapsedMs, 
          config.baseRate, 
          config.options as StepProgressOptions
        );
        
      case ProgressStrategy.PERIODIC:
        return this.calculatePeriodicProgress(
          resource, 
          effectiveElapsedMs, 
          config.baseRate, 
          config.options as PeriodicProgressOptions
        );
        
      default:
        return this.calculateLinearProgress(resource, effectiveElapsedMs, config.baseRate);
    }
  }
  
  /**
   * Calculate offline progress for all registered resources
   * @param resources Map or array of resources
   * @param elapsedMs Elapsed offline time in milliseconds
   * @returns Map of resource IDs to progress results
   */
  public calculateOfflineProgress(
    resources: Map<string, Resource> | Resource[],
    elapsedMs: number
  ): Map<string, ProgressResult> {
    const results = new Map<string, ProgressResult>();
    
    // Cap elapsed time to global maximum
    const cappedElapsedMs = Math.min(elapsedMs, this.globalOfflineCap);
    
    // Convert resources to array if it's a map
    const resourceArray = Array.isArray(resources) 
      ? resources 
      : Array.from(resources.values());
    
    // Calculate progress for each resource
    for (const resource of resourceArray) {
      // Skip resources without a rate
      if (typeof resource.getRate !== 'function' || !resource.getRate()) {
        continue;
      }
      
      // Calculate progress for this resource
      const result = this.calculateResourceProgress(resource, cappedElapsedMs);
      results.set(resource.getId(), result);
    }
    
    return results;
  }
  
  /**
   * Apply calculated progress to resources
   * @param resources Map of resources
   * @param results Progress calculation results
   */
  public applyProgress(
    resources: Map<string, Resource>, 
    results: Map<string, ProgressResult>
  ): void {
    // Use Array.from to convert the Map entries iterator to an array
    Array.from(results.entries()).forEach(([resourceId, result]) => {
      const resource = resources.get(resourceId);
      
      if (resource && typeof resource.update === 'function') {
        resource.update({ amount: result.newAmount });
      }
    });
  }
  
  /**
   * Linear progress calculation (simplest case)
   * @param resource Resource
   * @param elapsedMs Elapsed time in milliseconds
   * @param rate Production rate per second
   */
  private calculateLinearProgress(
    resource: Resource, 
    elapsedMs: number, 
    rate: number
  ): ProgressResult {
    const previousAmount = resource.getAmount();
    
    // Convert rate from per second to per millisecond
    const ratePerMs = rate / 1000;
    
    // Apply default efficiency for offline progress
    const effectiveRate = ratePerMs * this.defaultOfflineEfficiency;
    
    // Calculate the amount produced
    const produced = effectiveRate * elapsedMs;
    
    // Calculate new amount with capacity limit if applicable
    let newAmount = previousAmount + produced;
    if (typeof resource.getCapacity === 'function') {
      const capacity = resource.getCapacity();
      if (capacity !== undefined) {
        newAmount = Math.min(newAmount, capacity);
      }
    }
    
    return {
      resourceId: resource.getId(),
      previousAmount,
      newAmount,
      delta: newAmount - previousAmount,
      elapsedTime: elapsedMs,
      strategy: ProgressStrategy.LINEAR,
      efficiency: this.defaultOfflineEfficiency
    };
  }
  
  /**
   * Capped progress calculation
   * @param resource Resource
   * @param elapsedMs Elapsed time in milliseconds
   * @param rate Production rate per second
   * @param options Capped progress options
   */
  private calculateCappedProgress(
    resource: Resource, 
    elapsedMs: number, 
    rate: number, 
    options: CappedProgressOptions
  ): ProgressResult {
    const previousAmount = resource.getAmount();
    
    // Calculate max possible amount based on cap
    const cappedAmount = options.maxAmount;
    
    // Apply percent of max if specified
    let effectiveCap = cappedAmount;
    if (options.percentOfMax !== undefined) {
      effectiveCap = cappedAmount * (options.percentOfMax / 100);
    }
    
    // Calculate linear progress
    const linearResult = this.calculateLinearProgress(resource, elapsedMs, rate);
    
    // Cap the result
    const capped = Math.min(linearResult.newAmount, effectiveCap);
    
    return {
      ...linearResult,
      newAmount: capped,
      delta: capped - previousAmount,
      strategy: ProgressStrategy.CAPPED,
      cappedAt: effectiveCap
    };
  }
  
  /**
   * Diminishing returns progress calculation
   * @param resource Resource
   * @param elapsedMs Elapsed time in milliseconds
   * @param rate Production rate per second
   * @param options Diminishing progress options
   */
  private calculateDiminishingProgress(
    resource: Resource, 
    elapsedMs: number, 
    rate: number, 
    options: DiminishingProgressOptions
  ): ProgressResult {
    const previousAmount = resource.getAmount();
    const ratePerMs = rate / 1000;
    
    // Calculate efficiency decay over time
    // Efficiency = 2^(-t/halfLife) but not less than minEfficiency
    const halfLife = options.halfLifeMs;
    const decayFactor = Math.pow(0.5, elapsedMs / halfLife);
    const efficiency = Math.max(decayFactor, options.minEfficiency);
    
    // Calculate production with variable efficiency
    // This uses an integral of the decay function to get total production
    // Integration of rate * (2^(-t/halfLife)) from 0 to elapsedMs
    const effectiveTimeMs = halfLife * (1 - decayFactor) / Math.log(2);
    const produced = ratePerMs * effectiveTimeMs;
    
    // Apply capacity limit if applicable
    let newAmount = previousAmount + produced;
    if (typeof resource.getCapacity === 'function') {
      const capacity = resource.getCapacity();
      if (capacity !== undefined) {
        newAmount = Math.min(newAmount, capacity);
      }
    }
    
    return {
      resourceId: resource.getId(),
      previousAmount,
      newAmount,
      delta: newAmount - previousAmount,
      elapsedTime: elapsedMs,
      strategy: ProgressStrategy.DIMINISHING,
      efficiency
    };
  }
  
  /**
   * Accelerating progress calculation
   * @param resource Resource
   * @param elapsedMs Elapsed time in milliseconds
   * @param rate Production rate per second
   * @param options Accelerating progress options
   */
  private calculateAcceleratingProgress(
    resource: Resource, 
    elapsedMs: number, 
    rate: number, 
    options: AcceleratingProgressOptions
  ): ProgressResult {
    const previousAmount = resource.getAmount();
    const ratePerMs = rate / 1000;
    
    // Calculate ramp-up factor (0 to maxMultiplier)
    const rampUpPercent = Math.min(1, elapsedMs / options.rampUpTimeMs);
    const multiplier = 1 + (options.maxMultiplier - 1) * rampUpPercent;
    
    // Apply accelerating efficiency
    // This uses an integral of the acceleration curve to get total production
    const averageMultiplier = (1 + multiplier) / 2; // Simple linear ramp
    const produced = ratePerMs * elapsedMs * averageMultiplier * this.defaultOfflineEfficiency;
    
    // Apply capacity limit if applicable
    let newAmount = previousAmount + produced;
    if (typeof resource.getCapacity === 'function') {
      const capacity = resource.getCapacity();
      if (capacity !== undefined) {
        newAmount = Math.min(newAmount, capacity);
      }
    }
    
    return {
      resourceId: resource.getId(),
      previousAmount,
      newAmount,
      delta: newAmount - previousAmount,
      elapsedTime: elapsedMs,
      strategy: ProgressStrategy.ACCELERATING,
      efficiency: this.defaultOfflineEfficiency * multiplier
    };
  }
  
  /**
   * Step progress calculation
   * @param resource Resource
   * @param elapsedMs Elapsed time in milliseconds
   * @param rate Base rate per second (used for certain calculations)
   * @param options Step progress options
   */
  private calculateStepProgress(
    resource: Resource, 
    elapsedMs: number, 
    rate: number, 
    options: StepProgressOptions
  ): ProgressResult {
    const previousAmount = resource.getAmount();
    
    // Calculate how many batches were completed
    const batchCount = Math.floor(elapsedMs / options.batchTimeMs);
    
    // Apply max batches limit if specified
    const effectiveBatchCount = options.maxBatches !== undefined 
      ? Math.min(batchCount, options.maxBatches) 
      : batchCount;
    
    // Calculate total production
    const produced = effectiveBatchCount * options.batchSize;
    
    // Apply capacity limit if applicable
    let newAmount = previousAmount + produced;
    if (typeof resource.getCapacity === 'function') {
      const capacity = resource.getCapacity();
      if (capacity !== undefined) {
        newAmount = Math.min(newAmount, capacity);
      }
    }
    
    return {
      resourceId: resource.getId(),
      previousAmount,
      newAmount,
      delta: newAmount - previousAmount,
      elapsedTime: elapsedMs,
      strategy: ProgressStrategy.STEP,
      efficiency: effectiveBatchCount / batchCount || 0
    };
  }
  
  /**
   * Periodic progress calculation
   * @param resource Resource
   * @param elapsedMs Elapsed time in milliseconds
   * @param rate Base rate per second (used for certain calculations)
   * @param options Periodic progress options
   */
  private calculatePeriodicProgress(
    resource: Resource, 
    elapsedMs: number, 
    rate: number, 
    options: PeriodicProgressOptions
  ): ProgressResult {
    const previousAmount = resource.getAmount();
    
    // Calculate how many intervals were completed
    const intervalCount = Math.floor(elapsedMs / options.intervalMs);
    
    // Apply max intervals limit if specified
    const effectiveIntervalCount = options.maxIntervals !== undefined 
      ? Math.min(intervalCount, options.maxIntervals) 
      : intervalCount;
    
    // Calculate total production
    const produced = effectiveIntervalCount * options.amountPerInterval;
    
    // Apply capacity limit if applicable
    let newAmount = previousAmount + produced;
    if (typeof resource.getCapacity === 'function') {
      const capacity = resource.getCapacity();
      if (capacity !== undefined) {
        newAmount = Math.min(newAmount, capacity);
      }
    }
    
    return {
      resourceId: resource.getId(),
      previousAmount,
      newAmount,
      delta: newAmount - previousAmount,
      elapsedTime: elapsedMs,
      strategy: ProgressStrategy.PERIODIC,
      efficiency: effectiveIntervalCount / intervalCount || 0
    };
  }
  
  /**
   * Calculate potential progress before applying
   * @param resources Resources to calculate for
   * @param elapsedMs Elapsed time
   * @returns Progress calculation results
   */
  public calculatePotentialProgress(
    resources: Map<string, Resource>,
    elapsedMs: number
  ): Map<string, ProgressResult> {
    return this.calculateOfflineProgress(resources, elapsedMs);
  }
  
  /**
   * Apply potential progress calculated earlier
   * @param resources Resources to apply progress to
   * @param results Progress calculation results
   * @param bonusFactor Optional bonus multiplier (1.0 = 100%)
   */
  public applyPotentialProgress(
    resources: Map<string, Resource>,
    results: Map<string, ProgressResult>,
    bonusFactor: number = 1.0
  ): void {
    // Use Array.from to convert the Map entries iterator to an array
    Array.from(results.entries()).forEach(([resourceId, result]) => {
      const resource = resources.get(resourceId);
      
      if (resource && typeof resource.update === 'function') {
        let delta = result.delta;
        
        // Apply bonus factor if provided
        if (bonusFactor !== 1.0) {
          delta *= bonusFactor;
        }
        
        // Calculate new amount with bonus
        const newAmount = result.previousAmount + delta;
        
        // Update the resource
        resource.update({ amount: newAmount });
      }
    });
  }
} 