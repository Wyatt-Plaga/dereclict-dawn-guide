import { EventEmitter } from '../interfaces';
import { BaseUpgrade } from './BaseUpgrade';
import { EffectUpgrade } from './EffectUpgrade';
import { ResourceUpgrade } from './ResourceUpgrade';
import { UnlockUpgrade } from './UnlockUpgrade';
import { 
  Upgrade, 
  UpgradeProperties, 
  UpgradeRegistry, 
  UpgradeType, 
  ResourceUpgradeProperties,
  UnlockUpgradeProperties,
  EffectUpgradeProperties
} from './interfaces';

/**
 * Manager class for all upgrades in the game
 * Implements the UpgradeRegistry interface
 */
export class UpgradeManager implements UpgradeRegistry {
  /**
   * Map of all registered upgrades by ID
   */
  private upgrades: Map<string, Upgrade> = new Map();
  
  /**
   * Event emitter for broadcasting upgrade events
   */
  private eventEmitter?: EventEmitter;
  
  /**
   * Create a new upgrade manager
   * @param eventEmitter Optional event emitter for upgrade events
   */
  constructor(eventEmitter?: EventEmitter) {
    this.eventEmitter = eventEmitter;
  }
  
  /**
   * Get an upgrade by ID
   * @param id Upgrade ID
   */
  public getUpgrade(id: string): Upgrade | undefined {
    return this.upgrades.get(id);
  }
  
  /**
   * Get all registered upgrades
   */
  public getAllUpgrades(): Upgrade[] {
    return Array.from(this.upgrades.values());
  }
  
  /**
   * Get all upgrades of a specific type
   * @param type Upgrade type
   */
  public getUpgradesByType(type: UpgradeType): Upgrade[] {
    return this.getAllUpgrades().filter(upgrade => 
      upgrade.properties.type === type
    );
  }
  
  /**
   * Register a new upgrade
   * @param upgrade Upgrade to register
   */
  public registerUpgrade(upgrade: Upgrade): void {
    const id = upgrade.properties.id;
    
    if (this.upgrades.has(id)) {
      console.warn(`Upgrade with ID ${id} already exists. Overwriting.`);
    }
    
    this.upgrades.set(id, upgrade);
  }
  
  /**
   * Remove an upgrade by ID
   * @param id Upgrade ID
   * @returns Whether the upgrade was found and removed
   */
  public removeUpgrade(id: string): boolean {
    return this.upgrades.delete(id);
  }
  
  /**
   * Get all upgrades that are available (unlocked but not purchased)
   */
  public getAvailableUpgrades(): Upgrade[] {
    return this.getAllUpgrades().filter(upgrade => 
      upgrade.isUnlocked() && !upgrade.isPurchased()
    );
  }
  
  /**
   * Get all upgrades that have been purchased
   */
  public getPurchasedUpgrades(): Upgrade[] {
    return this.getAllUpgrades().filter(upgrade => 
      upgrade.isPurchased()
    );
  }
  
  /**
   * Create a new upgrade based on properties
   * @param properties Upgrade properties
   * @returns The created upgrade
   */
  public createUpgrade(properties: UpgradeProperties): Upgrade {
    let upgrade: Upgrade;
    
    switch (properties.type) {
      case UpgradeType.RESOURCE:
        upgrade = new ResourceUpgrade(properties as ResourceUpgradeProperties);
        break;
        
      case UpgradeType.UNLOCK:
        upgrade = new UnlockUpgrade(
          properties as UnlockUpgradeProperties, 
          this.eventEmitter
        );
        break;
        
      case UpgradeType.EFFECT:
        upgrade = new EffectUpgrade(
          properties as EffectUpgradeProperties, 
          this.eventEmitter
        );
        break;
        
      case UpgradeType.MILESTONE:
      default:
        upgrade = new BaseUpgrade(properties);
        break;
    }
    
    // Register the upgrade
    this.registerUpgrade(upgrade);
    
    return upgrade;
  }
  
  /**
   * Update upgrade prerequisites based on what's been unlocked and purchased
   * This should be called whenever the game state changes
   */
  public updateUpgradeAvailability(): void {
    const purchasedIds = this.getPurchasedUpgrades().map(u => u.properties.id);
    
    // Check each upgrade to see if its prerequisites are met
    for (const upgrade of this.getAllUpgrades()) {
      const meetsPrerequisites = upgrade.hasMetPrerequisites(purchasedIds);
      
      // If the upgrade meets prerequisites but isn't unlocked, unlock it
      if (meetsPrerequisites && !upgrade.isUnlocked()) {
        upgrade.update({ unlocked: true });
      }
    }
  }
  
  /**
   * Check if a specific upgrade is available for purchase
   * @param id Upgrade ID
   * @param availableResources Resources available to spend
   */
  public canPurchaseUpgrade(
    id: string, 
    availableResources: Record<string, number>
  ): boolean {
    const upgrade = this.getUpgrade(id);
    
    if (!upgrade) {
      return false;
    }
    
    return upgrade.isUnlocked() && upgrade.canPurchase(availableResources);
  }
  
  /**
   * Apply the effects of all purchased upgrades
   * This should be called when loading the game or after major state changes
   */
  public applyAllUpgradeEffects(): void {
    for (const upgrade of this.getPurchasedUpgrades()) {
      // Skip active effect upgrades that need to be manually activated
      if (
        upgrade instanceof EffectUpgrade && 
        upgrade.properties.isActive
      ) {
        continue;
      }
      
      upgrade.applyEffects();
    }
  }
  
  /**
   * Clean up resources
   */
  public cleanup(): void {
    // Clean up any effect upgrades with timers
    for (const upgrade of this.getAllUpgrades()) {
      if (upgrade instanceof EffectUpgrade) {
        upgrade.cleanup();
      }
    }
    
    // Clear the upgrades map
    this.upgrades.clear();
  }
} 