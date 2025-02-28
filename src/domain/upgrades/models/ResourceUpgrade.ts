import { BaseUpgrade } from './BaseUpgrade';
import { EffectOperation, EffectType, ResourceUpgradeProperties, UpgradeEffect } from '../interfaces/UpgradeInterfaces';

/**
 * Class for upgrades that affect resource production or capacity
 */
export class ResourceUpgrade extends BaseUpgrade<ResourceUpgradeProperties> {
  /**
   * Create a new resource upgrade
   * @param properties Initial properties
   */
  constructor(properties: ResourceUpgradeProperties) {
    super(properties);
    
    // Ensure we have a resource type
    if (!this.properties.resourceType) {
      throw new Error('Resource upgrade must have a resource type');
    }
    
    // Generate default effects if not provided
    if (this.properties.effects.length === 0) {
      this.generateDefaultEffects();
    }
  }
  
  /**
   * Generate default effects based on rate and capacity bonus values
   */
  private generateDefaultEffects(): void {
    const effects: UpgradeEffect[] = [];
    
    // Add rate effect if provided
    if (this.properties.rateBonus !== undefined && this.properties.rateBonus !== 0) {
      effects.push({
        id: `${this.properties.id}_rate`,
        type: EffectType.PRODUCTION_RATE,
        target: this.properties.resourceType,
        value: this.properties.rateBonus,
        operation: this.properties.rateBonus < 1 
          ? EffectOperation.ADD  // Small values are usually flat bonuses
          : EffectOperation.MULTIPLY // Larger values are usually multipliers
      });
    }
    
    // Add capacity effect if provided
    if (this.properties.capacityBonus !== undefined && this.properties.capacityBonus !== 0) {
      effects.push({
        id: `${this.properties.id}_capacity`,
        type: EffectType.CAPACITY,
        target: this.properties.resourceType,
        value: this.properties.capacityBonus,
        operation: this.properties.capacityBonus < 10 
          ? EffectOperation.ADD  // Small values are usually flat bonuses
          : EffectOperation.MULTIPLY // Larger values are usually multipliers
      });
    }
    
    // Set the effects
    this.properties.effects = effects;
  }
  
  /**
   * Apply the effects of this upgrade to a resource
   * Specialized implementation that knows how to modify resources
   */
  public applyEffects(): void {
    // This is a placeholder
    // In a real implementation, this would be connected to a resource registry
    // and apply the effects to the actual resource objects
    
    // The actual implementation will depend on how your resource system is structured
    // For example, you might have:
    //   const resourceRegistry = getResourceRegistry();
    //   const resource = resourceRegistry.getResource(this.properties.resourceType);
    //   
    //   for (const effect of this.getEffects()) {
    //     if (effect.type === EffectType.PRODUCTION_RATE) {
    //       // Apply production rate effect
    //       resource.modifyProductionRate(effect.value, effect.operation);
    //     } else if (effect.type === EffectType.CAPACITY) {
    //       // Apply capacity effect
    //       resource.modifyCapacity(effect.value, effect.operation);
    //     }
    //   }
  }
  
  /**
   * Calculate the scaled cost for the next level
   * Cost increases with level for multi-level upgrades
   */
  public getCost(): Record<string, number> {
    const baseCost = this.properties.cost;
    const nextLevel = this.properties.level + 1;
    
    // If already at or above max level, return an impossibly high cost
    if (this.properties.level >= this.properties.maxLevel) {
      return Object.entries(baseCost).reduce((acc, [resource, cost]) => {
        acc[resource] = Number.MAX_SAFE_INTEGER;
        return acc;
      }, {} as Record<string, number>);
    }
    
    // Scale cost based on level
    // Using a simple exponential scaling formula: base_cost * (scaling_factor ^ level)
    const scalingFactor = 1.5; // Each level is 50% more expensive
    
    return Object.entries(baseCost).reduce((acc, [resource, cost]) => {
      acc[resource] = Math.round(cost * Math.pow(scalingFactor, this.properties.level));
      return acc;
    }, {} as Record<string, number>);
  }
} 