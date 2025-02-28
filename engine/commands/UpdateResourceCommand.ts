import { ResourceRegistry, CommandResult, ResourceCost } from '../interfaces';
import { BaseCommand } from './BaseCommand';

/**
 * Command to update a resource's amount
 * Provides functionality to modify a resource and undo the change
 */
export class UpdateResourceCommand extends BaseCommand {
  // Resource registry to access resources
  private resources: ResourceRegistry;
  
  // Resource ID to update
  private resourceId: string;
  
  // Amount to change by (positive for addition, negative for subtraction)
  private amount: number;
  
  // Previous amount (for undo)
  private previousAmount?: number;
  
  /**
   * Create a new update resource command
   * @param resources Resource registry
   * @param resourceId ID of the resource to update
   * @param amount Amount to change by
   * @param cost Optional resource cost
   * @param id Optional command ID (auto-generated if not provided)
   */
  constructor(
    resources: ResourceRegistry,
    resourceId: string,
    amount: number,
    cost?: ResourceCost,
    id?: string
  ) {
    super(
      id || BaseCommand.generateId(`update_${resourceId}`),
      'update_resource',
      cost
    );
    
    this.resources = resources;
    this.resourceId = resourceId;
    this.amount = amount;
  }
  
  /**
   * Execute the command
   */
  public execute(): CommandResult {
    // Get the resource
    const resource = this.resources.getResource(this.resourceId);
    
    // Check if resource exists
    if (!resource) {
      return this.failure(`Resource ${this.resourceId} not found`);
    }
    
    // Store previous amount for undo
    this.previousAmount = resource.getAmount();
    
    try {
      // Update the resource
      if (this.amount > 0) {
        resource.add(this.amount);
      } else if (this.amount < 0) {
        resource.subtract(Math.abs(this.amount));
      }
      
      return this.success(
        `Updated ${resource.properties.name} by ${this.amount}`,
        { resourceId: this.resourceId, amount: resource.getAmount() }
      );
    } catch (error) {
      // If an error occurs (e.g., insufficient resources)
      return this.failure(
        error instanceof Error ? error.message : 'Unknown error updating resource'
      );
    }
  }
  
  /**
   * Undo the command
   */
  public undo(): CommandResult {
    // Get the resource
    const resource = this.resources.getResource(this.resourceId);
    
    // Check if resource exists
    if (!resource) {
      return this.failure(`Resource ${this.resourceId} not found`);
    }
    
    // Check if we have the previous amount
    if (this.previousAmount === undefined) {
      return this.failure('Cannot undo: previous state unknown');
    }
    
    try {
      // Restore the previous amount
      const currentAmount = resource.getAmount();
      const difference = currentAmount - this.previousAmount;
      
      if (difference > 0) {
        // Need to subtract to get back to previous amount
        resource.subtract(difference);
      } else if (difference < 0) {
        // Need to add to get back to previous amount
        resource.add(Math.abs(difference));
      }
      
      return this.success(
        `Reverted ${resource.properties.name} back to ${this.previousAmount}`,
        { resourceId: this.resourceId, amount: resource.getAmount() }
      );
    } catch (error) {
      return this.failure(
        error instanceof Error ? error.message : 'Unknown error undoing resource update'
      );
    }
  }
  
  /**
   * Validate if the command can be executed
   */
  public validate(): boolean {
    // Get the resource
    const resource = this.resources.getResource(this.resourceId);
    
    // Check if resource exists
    if (!resource) {
      return false;
    }
    
    // If we're subtracting, check if there's enough to subtract
    if (this.amount < 0) {
      return resource.canAfford(Math.abs(this.amount));
    }
    
    return true;
  }
}