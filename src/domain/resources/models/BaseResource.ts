import { Resource, ResourceProperties } from './ResourceInterfaces';

/**
 * Base Resource class that implements the Resource interface
 * Provides common functionality for all resource types
 */
export class BaseResource implements Resource {
  /**
   * Resource properties
   */
  public properties: ResourceProperties;
  
  /**
   * Create a new resource
   * @param properties Initial resource properties
   */
  constructor(properties: ResourceProperties) {
    // Ensure required properties exist
    this.properties = {
      id: properties.id,
      type: properties.type,
      name: properties.name,
      amount: properties.amount || 0,
      capacity: properties.capacity || Infinity,
      lastUpdated: properties.lastUpdated || new Date().toISOString(),
      
      // Optional properties
      description: properties.description,
      rate: properties.rate || 0,
      metadata: properties.metadata || {}
    };
    
    // Validate properties
    this.validateProperties();
  }
  
  /**
   * Validate resource properties
   */
  private validateProperties(): void {
    if (!this.properties.id) {
      throw new Error('Resource must have an ID');
    }
    
    if (!this.properties.type) {
      throw new Error('Resource must have a type');
    }
    
    if (!this.properties.name) {
      throw new Error('Resource must have a name');
    }
    
    if (this.properties.amount < 0) {
      throw new Error('Resource amount cannot be negative');
    }
    
    if (this.properties.capacity < 0) {
      throw new Error('Resource capacity cannot be negative');
    }
    
    if (this.properties.amount > this.properties.capacity) {
      this.properties.amount = this.properties.capacity;
    }
  }
  
  /**
   * Update resource properties
   * @param props Properties to update
   */
  public update(props: Partial<ResourceProperties>): void {
    // Copy current properties
    const newProps = { ...this.properties, ...props };
    
    // Ensure amount doesn't exceed capacity
    if (newProps.amount > newProps.capacity) {
      newProps.amount = newProps.capacity;
    }
    
    // Update last updated timestamp if not explicitly provided
    if (!props.lastUpdated) {
      newProps.lastUpdated = new Date().toISOString();
    }
    
    // Apply updates
    this.properties = newProps;
    
    // Validate after update
    this.validateProperties();
  }
  
  /**
   * Add amount to resource
   * @param amount Amount to add
   * @returns New amount
   */
  public add(amount: number): number {
    if (amount < 0) {
      throw new Error('Cannot add negative amount, use subtract() instead');
    }
    
    // Calculate new amount, capped at capacity
    const newAmount = Math.min(
      this.properties.amount + amount,
      this.properties.capacity
    );
    
    // Update properties
    this.update({
      amount: newAmount,
      lastUpdated: new Date().toISOString()
    });
    
    return this.properties.amount;
  }
  
  /**
   * Subtract amount from resource
   * @param amount Amount to subtract
   * @returns New amount
   */
  public subtract(amount: number): number {
    if (amount < 0) {
      throw new Error('Cannot subtract negative amount, use add() instead');
    }
    
    if (!this.canAfford(amount)) {
      throw new Error(`Insufficient resources: ${this.properties.name}`);
    }
    
    // Calculate new amount, ensuring it doesn't go below zero
    const newAmount = Math.max(0, this.properties.amount - amount);
    
    // Update properties
    this.update({
      amount: newAmount,
      lastUpdated: new Date().toISOString()
    });
    
    return this.properties.amount;
  }
  
  /**
   * Check if resource has at least the specified amount
   * @param amount Amount to check
   */
  public canAfford(amount: number): boolean {
    return this.properties.amount >= amount;
  }
  
  /**
   * Calculate amount after time has passed (for resources with rates)
   * @param milliseconds Milliseconds elapsed
   */
  public calculateAmountAfterTime(milliseconds: number): number {
    if (!this.properties.rate || this.properties.rate === 0) {
      return this.properties.amount;
    }
    
    // Convert to seconds
    const seconds = milliseconds / 1000;
    
    // Calculate amount change based on rate
    const change = this.properties.rate * seconds;
    
    // Calculate new amount
    let newAmount = this.properties.amount + change;
    
    // Cap at capacity and ensure not below zero
    newAmount = Math.min(newAmount, this.properties.capacity);
    newAmount = Math.max(0, newAmount);
    
    return newAmount;
  }
  
  /**
   * Get resource ID
   */
  public getId(): string {
    return this.properties.id;
  }
  
  /**
   * Get resource type
   */
  public getType(): string {
    return this.properties.type;
  }
  
  /**
   * Get current amount
   */
  public getAmount(): number {
    return this.properties.amount;
  }
  
  /**
   * Get maximum capacity
   */
  public getCapacity(): number {
    return this.properties.capacity;
  }
  
  /**
   * Get generation/consumption rate
   */
  public getRate(): number {
    return this.properties.rate || 0;
  }
  
  /**
   * Get formatted description of the resource
   */
  public toString(): string {
    return `${this.properties.name}: ${this.properties.amount}/${this.properties.capacity}`;
  }
} 