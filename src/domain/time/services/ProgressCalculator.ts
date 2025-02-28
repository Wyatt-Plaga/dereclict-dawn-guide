import { Resource } from '../../resources/models/ResourceInterfaces';
import { GameTime } from './GameTime';
import { TimeManager } from './TimeManager';
import { 
  ProgressStrategy, 
  ProgressResult, 
  ResourceProgressConfig,
  CappedProgressOptions,
  DiminishingProgressOptions,
  AcceleratingProgressOptions,
  StepProgressOptions,
  PeriodicProgressOptions
} from '../models/TimeInterfaces';

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
  
  // Global cap for offline time processing (default: 8 hours)
  private globalOfflineCap: number = 8 * 60 * 60 * 1000;
  
  /**
   * Create a new progress calculator
   * @param gameTime Game time service
   * @param timeManager Optional time manager
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
   * @param updates Configuration updates
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
    this.resourceConfigs.set(resourceId, {
      ...config,
      ...updates
    });
    
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
   * Remove a resource from progress calculation
   * @param resourceId Resource ID
   */
  public removeResource(resourceId: string): boolean {
    return this.resourceConfigs.delete(resourceId);
  }
  
  /**
   * Set the default efficiency for offline progress
   * @param efficiency Efficiency factor (0-1)
   */
  public setDefaultOfflineEfficiency(efficiency: number): void {
    this.defaultOfflineEfficiency = Math.max(0, Math.min(1, efficiency));
  }
  
  /**
   * Set the global cap for offline time processing
   * @param milliseconds Maximum time in milliseconds
   */
  public setGlobalOfflineCap(milliseconds: number): void {
    if (milliseconds < 0) {
      throw new Error('Global offline cap cannot be negative');
    }
    
    this.globalOfflineCap = milliseconds;
  }
  
  /**
   * Calculate progress for a single resource
   * @param resource Resource to calculate for
   * @param elapsedMs Elapsed time in milliseconds
   */
  public calculateResourceProgress(
    resource: Resource, 
    elapsedMs: number
  ): ProgressResult {
    const resourceId = resource.getId();
    const config = this.resourceConfigs.get(resourceId);
    
    // Default result with no change
    const defaultResult: ProgressResult = {
      resourceId,
      previousAmount: resource.getAmount(),
      newAmount: resource.getAmount(),
      delta: 0,
      elapsedTime: elapsedMs,
      strategy: ProgressStrategy.LINEAR
    };
    
    // If no config or elapsed time is zero or negative, return default result
    if (!config || elapsedMs <= 0) {
      return defaultResult;
    }
    
    // Get actual elapsed time from timestamp if specified
    let actualElapsedMs = elapsedMs;
    
    if (config.activeTimestamp && this.timeManager) {
      const timestampElapsed = this.timeManager.getElapsedTime(config.activeTimestamp);
      
      if (timestampElapsed !== undefined) {
        actualElapsedMs = timestampElapsed;
      }
    }
    
    // Apply upgrade modifiers to base rate
    let effectiveRate = config.baseRate;
    
    if (config.upgradeModifiers) {
      for (const modifier of config.upgradeModifiers) {
        effectiveRate *= modifier.multiplier;
      }
    }
    
    // Calculate progress based on strategy
    switch (config.strategy) {
      case ProgressStrategy.LINEAR:
        return this.calculateLinearProgress(resource, actualElapsedMs, effectiveRate);
        
      case ProgressStrategy.CAPPED:
        if (!config.options || !('maxAmount' in config.options)) {
          return this.calculateLinearProgress(resource, actualElapsedMs, effectiveRate);
        }
        return this.calculateCappedProgress(
          resource, 
          actualElapsedMs, 
          effectiveRate, 
          config.options as CappedProgressOptions
        );
        
      case ProgressStrategy.DIMINISHING:
        if (!config.options || !('halfLifeMs' in config.options) || !('minEfficiency' in config.options)) {
          return this.calculateLinearProgress(resource, actualElapsedMs, effectiveRate);
        }
        return this.calculateDiminishingProgress(
          resource, 
          actualElapsedMs, 
          effectiveRate, 
          config.options as DiminishingProgressOptions
        );
        
      case ProgressStrategy.ACCELERATING:
        if (!config.options || !('rampUpTimeMs' in config.options) || !('maxMultiplier' in config.options)) {
          return this.calculateLinearProgress(resource, actualElapsedMs, effectiveRate);
        }
        return this.calculateAcceleratingProgress(
          resource, 
          actualElapsedMs, 
          effectiveRate, 
          config.options as AcceleratingProgressOptions
        );
        
      case ProgressStrategy.STEP:
        if (!config.options || !('batchSize' in config.options) || !('batchTimeMs' in config.options)) {
          return this.calculateLinearProgress(resource, actualElapsedMs, effectiveRate);
        }
        return this.calculateStepProgress(
          resource, 
          actualElapsedMs, 
          effectiveRate, 
          config.options as StepProgressOptions
        );
        
      case ProgressStrategy.PERIODIC:
        if (!config.options || !('intervalMs' in config.options) || !('amountPerInterval' in config.options)) {
          return this.calculateLinearProgress(resource, actualElapsedMs, effectiveRate);
        }
        return this.calculatePeriodicProgress(
          resource, 
          actualElapsedMs, 
          effectiveRate, 
          config.options as PeriodicProgressOptions
        );
        
      default:
        return this.calculateLinearProgress(resource, actualElapsedMs, effectiveRate);
    }
  }
  
  /**
   * Calculate offline progress for multiple resources
   * @param resources Map of resources or array of resources
   * @param elapsedMs Elapsed time in milliseconds
   */
  public calculateOfflineProgress(
    resources: Map<string, Resource> | Resource[],
    elapsedMs: number
  ): Map<string, ProgressResult> {
    // Cap elapsed time at global offline cap
    const cappedElapsedMs = Math.min(elapsedMs, this.globalOfflineCap);
    
    // Apply offline efficiency
    const effectiveElapsedMs = cappedElapsedMs * this.defaultOfflineEfficiency;
    
    const results = new Map<string, ProgressResult>();
    
    // Convert array to map if needed
    const resourceMap = Array.isArray(resources) 
      ? new Map(resources.map(r => [r.getId(), r]))
      : resources;
    
    // Calculate progress for each resource
    // Convert Map entries to array before iterating
    const resourceEntries = Array.from(resourceMap.entries());
    
    for (const [resourceId, resource] of resourceEntries) {
      // Skip resources without a config
      if (!this.resourceConfigs.has(resourceId)) {
        continue;
      }
      
      const result = this.calculateResourceProgress(resource, effectiveElapsedMs);
      results.set(resourceId, result);
    }
    
    return results;
  }
  
  /**
   * Apply progress results to resources
   * @param resources Map of resources
   * @param results Progress results
   */
  public applyProgress(
    resources: Map<string, Resource>, 
    results: Map<string, ProgressResult>
  ): void {
    // Convert Map entries to array before iterating
    const resultEntries = Array.from(results.entries());
    
    for (const [resourceId, result] of resultEntries) {
      const resource = resources.get(resourceId);
      
      if (!resource) {
        continue;
      }
      
      // Calculate delta to apply
      const delta = result.newAmount - result.previousAmount;
      
      if (delta > 0) {
        // Add resources
        resource.add(delta);
      } else if (delta < 0) {
        // Subtract resources (if possible)
        try {
          resource.subtract(Math.abs(delta));
        } catch (error) {
          console.warn(`Failed to subtract ${Math.abs(delta)} from ${resourceId}:`, error);
        }
      }
    }
  }
  
  /**
   * Calculate linear progress
   * @param resource Resource
   * @param elapsedMs Elapsed time
   * @param rate Production rate
   */
  private calculateLinearProgress(
    resource: Resource, 
    elapsedMs: number, 
    rate: number
  ): ProgressResult {
    const previousAmount = resource.getAmount();
    const capacity = resource.getCapacity();
    
    // Convert to seconds
    const seconds = elapsedMs / 1000;
    
    // Calculate amount change
    const change = rate * seconds;
    
    // Calculate new amount, capped at capacity
    let newAmount = previousAmount + change;
    newAmount = Math.min(newAmount, capacity);
    newAmount = Math.max(0, newAmount);
    
    return {
      resourceId: resource.getId(),
      previousAmount,
      newAmount,
      delta: newAmount - previousAmount,
      elapsedTime: elapsedMs,
      strategy: ProgressStrategy.LINEAR
    };
  }
  
  /**
   * Calculate capped progress
   * @param resource Resource
   * @param elapsedMs Elapsed time
   * @param rate Production rate
   * @param options Capped progress options
   */
  private calculateCappedProgress(
    resource: Resource, 
    elapsedMs: number, 
    rate: number, 
    options: CappedProgressOptions
  ): ProgressResult {
    const previousAmount = resource.getAmount();
    const capacity = resource.getCapacity();
    
    // Determine effective cap
    let effectiveCap = options.maxAmount;
    
    // If offline and percentOfMax is specified, apply it
    if (options.percentOfMax !== undefined) {
      const percentCap = (options.maxAmount * options.percentOfMax) / 100;
      effectiveCap = Math.min(effectiveCap, percentCap);
    }
    
    // Cap at resource capacity
    effectiveCap = Math.min(effectiveCap, capacity);
    
    // Convert to seconds
    const seconds = elapsedMs / 1000;
    
    // Calculate amount change
    const change = rate * seconds;
    
    // Calculate new amount, capped at effective cap
    let newAmount = previousAmount + change;
    newAmount = Math.min(newAmount, effectiveCap);
    newAmount = Math.max(0, newAmount);
    
    return {
      resourceId: resource.getId(),
      previousAmount,
      newAmount,
      delta: newAmount - previousAmount,
      elapsedTime: elapsedMs,
      strategy: ProgressStrategy.CAPPED,
      cappedAt: effectiveCap
    };
  }
  
  /**
   * Calculate diminishing progress
   * @param resource Resource
   * @param elapsedMs Elapsed time
   * @param rate Production rate
   * @param options Diminishing progress options
   */
  private calculateDiminishingProgress(
    resource: Resource, 
    elapsedMs: number, 
    rate: number, 
    options: DiminishingProgressOptions
  ): ProgressResult {
    const previousAmount = resource.getAmount();
    const capacity = resource.getCapacity();
    
    // Calculate efficiency based on elapsed time
    // Using exponential decay formula: efficiency = minEfficiency + (1 - minEfficiency) * 2^(-t/halfLife)
    const halfLifeFactor = Math.pow(2, -elapsedMs / options.halfLifeMs);
    const efficiency = options.minEfficiency + (1 - options.minEfficiency) * halfLifeFactor;
    
    // Convert to seconds
    const seconds = elapsedMs / 1000;
    
    // Calculate amount change with diminishing returns
    const change = rate * seconds * efficiency;
    
    // Calculate new amount, capped at capacity
    let newAmount = previousAmount + change;
    newAmount = Math.min(newAmount, capacity);
    newAmount = Math.max(0, newAmount);
    
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
   * Calculate accelerating progress
   * @param resource Resource
   * @param elapsedMs Elapsed time
   * @param rate Production rate
   * @param options Accelerating progress options
   */
  private calculateAcceleratingProgress(
    resource: Resource, 
    elapsedMs: number, 
    rate: number, 
    options: AcceleratingProgressOptions
  ): ProgressResult {
    const previousAmount = resource.getAmount();
    const capacity = resource.getCapacity();
    
    // Calculate multiplier based on elapsed time
    // Using a sigmoid-like function that starts at 1.0 and approaches maxMultiplier
    const rampUpFactor = Math.min(1, elapsedMs / options.rampUpTimeMs);
    const multiplier = 1 + (options.maxMultiplier - 1) * rampUpFactor;
    
    // Convert to seconds
    const seconds = elapsedMs / 1000;
    
    // Calculate amount change with acceleration
    const change = rate * seconds * multiplier;
    
    // Calculate new amount, capped at capacity
    let newAmount = previousAmount + change;
    newAmount = Math.min(newAmount, capacity);
    newAmount = Math.max(0, newAmount);
    
    return {
      resourceId: resource.getId(),
      previousAmount,
      newAmount,
      delta: newAmount - previousAmount,
      elapsedTime: elapsedMs,
      strategy: ProgressStrategy.ACCELERATING,
      efficiency: multiplier
    };
  }
  
  /**
   * Calculate step progress
   * @param resource Resource
   * @param elapsedMs Elapsed time
   * @param rate Production rate
   * @param options Step progress options
   */
  private calculateStepProgress(
    resource: Resource, 
    elapsedMs: number, 
    rate: number, 
    options: StepProgressOptions
  ): ProgressResult {
    const previousAmount = resource.getAmount();
    const capacity = resource.getCapacity();
    
    // Calculate number of complete batches
    const batchCount = Math.floor(elapsedMs / options.batchTimeMs);
    
    // Apply max batches limit if specified
    const effectiveBatchCount = options.maxBatches !== undefined
      ? Math.min(batchCount, options.maxBatches)
      : batchCount;
    
    // Calculate amount change
    const change = effectiveBatchCount * options.batchSize * rate;
    
    // Calculate new amount, capped at capacity
    let newAmount = previousAmount + change;
    newAmount = Math.min(newAmount, capacity);
    newAmount = Math.max(0, newAmount);
    
    return {
      resourceId: resource.getId(),
      previousAmount,
      newAmount,
      delta: newAmount - previousAmount,
      elapsedTime: elapsedMs,
      strategy: ProgressStrategy.STEP,
      efficiency: effectiveBatchCount / Math.max(1, batchCount) // Efficiency as ratio of applied batches
    };
  }
  
  /**
   * Calculate periodic progress
   * @param resource Resource
   * @param elapsedMs Elapsed time
   * @param rate Production rate
   * @param options Periodic progress options
   */
  private calculatePeriodicProgress(
    resource: Resource, 
    elapsedMs: number, 
    rate: number, 
    options: PeriodicProgressOptions
  ): ProgressResult {
    const previousAmount = resource.getAmount();
    const capacity = resource.getCapacity();
    
    // Calculate number of complete intervals
    const intervalCount = Math.floor(elapsedMs / options.intervalMs);
    
    // Apply max intervals limit if specified
    const effectiveIntervalCount = options.maxIntervals !== undefined
      ? Math.min(intervalCount, options.maxIntervals)
      : intervalCount;
    
    // Calculate amount change
    const change = effectiveIntervalCount * options.amountPerInterval * rate;
    
    // Calculate new amount, capped at capacity
    let newAmount = previousAmount + change;
    newAmount = Math.min(newAmount, capacity);
    newAmount = Math.max(0, newAmount);
    
    return {
      resourceId: resource.getId(),
      previousAmount,
      newAmount,
      delta: newAmount - previousAmount,
      elapsedTime: elapsedMs,
      strategy: ProgressStrategy.PERIODIC,
      efficiency: effectiveIntervalCount / Math.max(1, intervalCount) // Efficiency as ratio of applied intervals
    };
  }
  
  /**
   * Calculate potential progress without applying it
   * @param resources Map of resources
   * @param elapsedMs Elapsed time
   */
  public calculatePotentialProgress(
    resources: Map<string, Resource>,
    elapsedMs: number
  ): Map<string, ProgressResult> {
    const results = new Map<string, ProgressResult>();
    
    // Convert Map entries to array before iterating
    const resourceEntries = Array.from(resources.entries());
    
    for (const [resourceId, resource] of resourceEntries) {
      // Skip resources without a config
      if (!this.resourceConfigs.has(resourceId)) {
        continue;
      }
      
      const result = this.calculateResourceProgress(resource, elapsedMs);
      results.set(resourceId, result);
    }
    
    return results;
  }
  
  /**
   * Apply potential progress with a bonus factor
   * @param resources Map of resources
   * @param results Progress results
   * @param bonusFactor Bonus multiplier for progress
   */
  public applyPotentialProgress(
    resources: Map<string, Resource>,
    results: Map<string, ProgressResult>,
    bonusFactor: number = 1.0
  ): void {
    // Convert Map entries to array before iterating
    const resultEntries = Array.from(results.entries());
    
    for (const [resourceId, result] of resultEntries) {
      const resource = resources.get(resourceId);
      
      if (!resource) {
        continue;
      }
      
      // Calculate delta to apply with bonus
      const delta = (result.newAmount - result.previousAmount) * bonusFactor;
      
      if (delta > 0) {
        // Add resources
        resource.add(delta);
      } else if (delta < 0) {
        // Subtract resources (if possible)
        try {
          resource.subtract(Math.abs(delta));
        } catch (error) {
          console.warn(`Failed to subtract ${Math.abs(delta)} from ${resourceId}:`, error);
        }
      }
    }
  }
} 