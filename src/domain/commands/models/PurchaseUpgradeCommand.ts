import { ResourceRegistry } from '../../../domain/resources';
import { Upgrade, UpgradeRegistry } from '../../../domain/upgrades';
import { Command, CommandResult } from '../interfaces/CommandInterfaces';

/**
 * Command to purchase an upgrade
 */
export class PurchaseUpgradeCommand implements Command {
  /**
   * Command ID
   */
  public id: string;
  
  /**
   * Command type
   */
  public type: string = 'purchase_upgrade';
  
  /**
   * Upgrade ID to purchase
   */
  private upgradeId: string;
  
  /**
   * Resource registry for checking and spending resources
   */
  private resourceRegistry: ResourceRegistry;
  
  /**
   * Upgrade registry for accessing upgrades
   */
  private upgradeRegistry: UpgradeRegistry;
  
  /**
   * Create a new purchase upgrade command
   * @param upgradeId ID of the upgrade to purchase
   * @param resourceRegistry Resource registry for spending resources
   * @param upgradeRegistry Upgrade registry for accessing upgrades
   */
  constructor(
    upgradeId: string,
    resourceRegistry: ResourceRegistry,
    upgradeRegistry: UpgradeRegistry
  ) {
    this.id = `purchase_upgrade_${upgradeId}_${Date.now()}`;
    this.upgradeId = upgradeId;
    this.resourceRegistry = resourceRegistry;
    this.upgradeRegistry = upgradeRegistry;
  }
  
  /**
   * Validate if the command can be executed
   * @returns Whether the command can be executed
   */
  public validate(): boolean {
    const upgrade = this.upgradeRegistry.getUpgrade(this.upgradeId);
    
    if (!upgrade) {
      return false;
    }
    
    if (!upgrade.isUnlocked()) {
      return false;
    }
    
    // Check if already purchased and at max level
    if (
      upgrade.isPurchased() && 
      upgrade.properties.level >= upgrade.properties.maxLevel
    ) {
      return false;
    }
    
    // Get available resources
    const availableResources: Record<string, number> = {};
    
    // Get all resources and their amounts
    this.resourceRegistry.getAllResources().forEach(resource => {
      availableResources[resource.getId()] = resource.getAmount();
    });
    
    // Check if we can afford the upgrade
    return upgrade.canPurchase(availableResources);
  }
  
  /**
   * Execute the command
   * @returns Command result
   */
  public execute(): CommandResult {
    // Make sure we can execute
    if (!this.validate()) {
      return {
        success: false,
        message: 'Cannot purchase upgrade, validation failed'
      };
    }
    
    const upgrade = this.upgradeRegistry.getUpgrade(this.upgradeId);
    
    if (!upgrade) {
      return {
        success: false,
        message: `Upgrade with ID ${this.upgradeId} not found`
      };
    }
    
    // Get the cost
    const cost = upgrade.getCost();
    
    // Spend the resources
    for (const [resourceId, amount] of Object.entries(cost)) {
      const resource = this.resourceRegistry.getResource(resourceId);
      
      if (!resource) {
        return {
          success: false,
          message: `Resource ${resourceId} not found`
        };
      }
      
      // Make sure we have enough
      if (resource.getAmount() < amount) {
        return {
          success: false,
          message: `Not enough ${resourceId}`
        };
      }
      
      // Spend the resource
      resource.subtract(amount);
    }
    
    // Purchase the upgrade
    const result = upgrade.purchase();
    
    // If purchased successfully, update availability of other upgrades
    if (result.success) {
      this.upgradeRegistry.updateUpgradeAvailability();
    }
    
    return result;
  }
  
  /**
   * Get the cost of the command
   * @returns Resource cost
   */
  public get cost() {
    const upgrade = this.upgradeRegistry.getUpgrade(this.upgradeId);
    
    if (!upgrade) {
      return {};
    }
    
    return upgrade.getCost();
  }
} 