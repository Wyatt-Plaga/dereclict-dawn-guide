import { Command, CommandResult, ResourceCost } from '../interfaces';

/**
 * Base Command class 
 * Provides a foundation for implementing game commands
 */
export abstract class BaseCommand implements Command {
  /**
   * Unique identifier for this command
   */
  public id: string;
  
  /**
   * The type of command
   */
  public type: string;
  
  /**
   * Optional resource cost for the command
   */
  public cost?: ResourceCost;
  
  /**
   * Initialize a new command
   * @param id Unique command ID
   * @param type Command type
   * @param cost Optional resource cost
   */
  constructor(id: string, type: string, cost?: ResourceCost) {
    this.id = id;
    this.type = type;
    this.cost = cost;
  }
  
  /**
   * Execute the command
   * Must be implemented by subclasses
   */
  public abstract execute(): CommandResult;
  
  /**
   * Validate if command can be executed
   * Can be overridden by subclasses
   */
  public validate(): boolean {
    return true;
  }
  
  /**
   * Get a successful command result
   * @param message Optional message
   * @param data Optional data
   */
  protected success(message?: string, data?: any): CommandResult {
    return {
      success: true,
      message,
      data
    };
  }
  
  /**
   * Get a failed command result
   * @param message Error message
   * @param data Optional data
   */
  protected failure(message: string, data?: any): CommandResult {
    return {
      success: false,
      message,
      data
    };
  }
  
  /**
   * Generate a new command ID
   * @param prefix Optional prefix for the ID
   */
  public static generateId(prefix: string = 'cmd'): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    return `${prefix}_${timestamp}_${random}`;
  }
} 