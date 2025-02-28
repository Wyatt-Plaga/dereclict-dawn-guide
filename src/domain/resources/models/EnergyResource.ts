import { ResourceProperties } from './ResourceInterfaces';
import { BaseResource } from './BaseResource';

/**
 * Energy-specific resource type
 * Extends BaseResource with energy-specific functionality
 */
export class EnergyResource extends BaseResource {
  /**
   * Resource type identifier for energy
   */
  static readonly TYPE = 'energy';
  
  /**
   * Default capacity for energy resource
   */
  static readonly DEFAULT_CAPACITY = 100;
  
  /**
   * Create a new energy resource
   * @param properties Initial resource properties
   */
  constructor(properties: Partial<ResourceProperties>) {
    // Ensure energy-specific properties are set
    super({
      id: properties.id || 'energy',
      type: EnergyResource.TYPE,
      name: properties.name || 'Energy',
      amount: properties.amount || 0,
      capacity: properties.capacity || EnergyResource.DEFAULT_CAPACITY,
      rate: properties.rate || 0,
      description: properties.description || 'Powers ship systems and activities',
      lastUpdated: properties.lastUpdated || new Date().toISOString(),
      metadata: properties.metadata || {}
    });
  }
  
  /**
   * Check if energy levels are critical (below 20%)
   */
  public isCritical(): boolean {
    return this.getAmount() < (this.getCapacity() * 0.2);
  }
  
  /**
   * Check if energy levels are low (below 50%)
   */
  public isLow(): boolean {
    return this.getAmount() < (this.getCapacity() * 0.5);
  }
  
  /**
   * Get energy percentage
   */
  public getPercentage(): number {
    return (this.getAmount() / this.getCapacity()) * 100;
  }
  
  /**
   * Boost energy temporarily (for use with upgrades or special actions)
   * @param amount Amount to boost
   * @param duration Duration in milliseconds
   * @returns Promise that resolves when the boost ends
   */
  public async boost(amount: number, duration: number): Promise<void> {
    // Store original capacity
    const originalCapacity = this.getCapacity();
    
    // Increase capacity
    this.update({ capacity: originalCapacity + amount });
    
    // Also add the energy
    this.add(amount);
    
    // Return to normal after duration
    return new Promise((resolve) => {
      setTimeout(() => {
        // Revert capacity
        this.update({ capacity: originalCapacity });
        
        // Ensure amount is not over capacity
        if (this.getAmount() > originalCapacity) {
          this.update({ amount: originalCapacity });
        }
        
        resolve();
      }, duration);
    });
  }
  
  /**
   * Calculate expected regeneration over time
   * @param milliseconds Time to calculate for
   * @returns Amount that would be generated
   */
  public calculateRegeneration(milliseconds: number): number {
    if (this.getRate() <= 0) {
      return 0;
    }
    
    // Convert to seconds
    const seconds = milliseconds / 1000;
    
    // Calculate amount change based on rate
    return this.getRate() * seconds;
  }
  
  /**
   * Get formatted description with percentage
   */
  public toString(): string {
    return `Energy: ${this.getAmount().toFixed(1)}/${this.getCapacity()} (${this.getPercentage().toFixed(1)}%)`;
  }
} 