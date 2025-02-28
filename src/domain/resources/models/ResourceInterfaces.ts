/**
 * Resource Domain Interfaces
 * Defines the core interfaces for the resource domain
 */

/**
 * Resource properties
 */
export interface ResourceProperties {
  // Unique identifier
  id: string;
  
  // Resource type
  type: string;
  
  // Display name
  name: string;
  
  // Current amount
  amount: number;
  
  // Maximum capacity
  capacity: number;
  
  // Last updated timestamp
  lastUpdated: string;
  
  // Optional description
  description?: string;
  
  // Optional generation/consumption rate per second
  rate?: number;
  
  // Optional metadata
  metadata?: Record<string, any>;
}

/**
 * Resource interface
 */
export interface Resource {
  // Resource properties
  properties: ResourceProperties;
  
  // Update resource properties
  update: (props: Partial<ResourceProperties>) => void;
  
  // Add amount to resource
  add: (amount: number) => number;
  
  // Subtract amount from resource
  subtract: (amount: number) => number;
  
  // Check if resource can afford an amount
  canAfford: (amount: number) => boolean;
  
  // Calculate amount after time has passed
  calculateAmountAfterTime?: (milliseconds: number) => number;
  
  // Get resource ID
  getId: () => string;
  
  // Get resource type
  getType: () => string;
  
  // Get current amount
  getAmount: () => number;
  
  // Get maximum capacity
  getCapacity: () => number;
  
  // Get generation/consumption rate
  getRate?: () => number;
}

/**
 * Resource costs for commands
 * Maps resource IDs to amount required
 */
export type ResourceCost = Record<string, number>;

/**
 * Resource registry service interface
 * Manages game resources
 */
export interface ResourceRegistry {
  // Get a resource by ID
  getResource: (id: string) => Resource | undefined;
  
  // Register a new resource
  registerResource: (resource: Resource) => void;
  
  // Remove a resource
  removeResource: (id: string) => void;
  
  // Get all resources
  getAllResources: () => Resource[];
  
  // Get resources by type
  getResourcesByType: (type: string) => Resource[];
  
  // Update a resource
  updateResource: (id: string, props: Partial<ResourceProperties>) => Resource | undefined;
  
  // Create a new resource
  createResource: (properties: ResourceProperties) => Resource;
  
  // Check if a resource exists
  hasResource: (id: string) => boolean;
  
  // Create or update a resource
  createOrUpdateResource: (properties: ResourceProperties) => Resource;
  
  // Get the internal map of resources
  getResourceMap: () => Map<string, Resource>;
} 