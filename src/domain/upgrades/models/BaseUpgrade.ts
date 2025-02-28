import { CommandResult } from '../../../core/game/GameInterfaces';
import { Upgrade, UpgradeEffect, UpgradeProperties } from '../interfaces/UpgradeInterfaces';

/**
 * Base class for all upgrades in the game
 */
export class BaseUpgrade<T extends UpgradeProperties = UpgradeProperties> implements Upgrade<T> {
  /**
   * Properties of this upgrade
   */
  public properties: T;

  /**
   * Create a new upgrade
   * @param properties Initial properties
   */
  constructor(properties: T) {
    this.properties = properties;
    
    // Set default values if not provided
    if (this.properties.level === undefined) {
      this.properties.level = 0;
    }
    
    if (this.properties.maxLevel === undefined) {
      this.properties.maxLevel = 1;
    }
    
    if (this.properties.unlocked === undefined) {
      this.properties.unlocked = false;
    }
    
    if (this.properties.purchased === undefined) {
      this.properties.purchased = false;
    }
    
    if (!this.properties.effects) {
      this.properties.effects = [];
    }
    
    if (!this.properties.timestamp) {
      this.properties.timestamp = new Date().toISOString();
    }
  }

  /**
   * Get the cost to purchase/level up this upgrade
   */
  public getCost(): any {
    return this.properties.cost;
  }

  /**
   * Get the effects this upgrade provides
   */
  public getEffects(): UpgradeEffect[] {
    return this.properties.effects;
  }

  /**
   * Check if this upgrade can be purchased
   * @param availableResources Available resources to spend
   */
  public canPurchase(availableResources: Record<string, number>): boolean {
    if (this.isPurchased() && this.properties.level >= this.properties.maxLevel) {
      return false; // Already at max level
    }
    
    // Check if we have enough resources
    const cost = this.getCost();
    for (const resourceId in cost) {
      const required = cost[resourceId];
      const available = availableResources[resourceId] || 0;
      
      if (available < required) {
        return false; // Not enough of this resource
      }
    }
    
    return true;
  }

  /**
   * Purchase this upgrade
   * This should normally be called by a command
   */
  public purchase(): CommandResult {
    if (!this.isUnlocked()) {
      return {
        success: false,
        message: 'Upgrade is not unlocked'
      };
    }
    
    if (this.isPurchased() && this.properties.level >= this.properties.maxLevel) {
      return {
        success: false,
        message: 'Upgrade is already at maximum level'
      };
    }
    
    // Mark as purchased and increment level
    this.properties.purchased = true;
    this.properties.level += 1;
    this.properties.timestamp = new Date().toISOString();
    
    // Return success
    return {
      success: true,
      message: 'Upgrade purchased',
      data: {
        id: this.properties.id,
        level: this.properties.level
      }
    };
  }

  /**
   * Apply the effects of this upgrade
   * Base implementation does nothing, subclasses should override
   */
  public applyEffects(): void {
    // Base implementation does nothing
    // Subclasses should override this
  }

  /**
   * Check if this upgrade is unlocked (visible to the player)
   */
  public isUnlocked(): boolean {
    return this.properties.unlocked;
  }

  /**
   * Check if this upgrade has been purchased
   */
  public isPurchased(): boolean {
    return this.properties.purchased;
  }

  /**
   * Check if the upgrade has met its prerequisites
   * @param purchasedUpgrades List of IDs of purchased upgrades
   */
  public hasMetPrerequisites(purchasedUpgrades: string[]): boolean {
    // If no prerequisites, always returns true
    if (!this.properties.prerequisites || this.properties.prerequisites.length === 0) {
      return true;
    }
    
    // Check if all prerequisites are in the list of purchased upgrades
    return this.properties.prerequisites.every(prereq => 
      purchasedUpgrades.includes(prereq)
    );
  }

  /**
   * Update upgrade properties
   * @param properties Properties to update
   */
  public update(properties: Partial<T>): void {
    // Update properties
    this.properties = {
      ...this.properties,
      ...properties,
      timestamp: new Date().toISOString()
    };
  }
} 