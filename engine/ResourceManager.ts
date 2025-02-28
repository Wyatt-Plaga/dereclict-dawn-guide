import { Resource, ResourceProperties, ResourceRegistry } from './interfaces';
import { BaseResource } from './resources/BaseResource';

/**
 * Resource Manager class that implements ResourceRegistry
 * Manages all game resources
 */
export class ResourceManager implements ResourceRegistry {
  // Map of resource IDs to resources
  private resources: Map<string, Resource> = new Map();
  
  /**
   * Get a resource by ID
   * @param id Resource ID
   */
  public getResource(id: string): Resource | undefined {
    return this.resources.get(id);
  }
  
  /**
   * Register a new resource
   * @param resource Resource to register
   */
  public registerResource(resource: Resource): void {
    // Validate resource has an ID
    if (!resource.getId()) {
      throw new Error('Cannot register a resource without an ID');
    }
    
    // Check for duplicates
    if (this.resources.has(resource.getId())) {
      throw new Error(`Resource with ID ${resource.getId()} already exists`);
    }
    
    // Add to registry
    this.resources.set(resource.getId(), resource);
  }
  
  /**
   * Remove a resource by ID
   * @param id Resource ID
   */
  public removeResource(id: string): void {
    if (!this.resources.has(id)) {
      return;
    }
    
    this.resources.delete(id);
  }
  
  /**
   * Get all resources
   */
  public getAllResources(): Resource[] {
    return Array.from(this.resources.values());
  }
  
  /**
   * Get resources of a specific type
   * @param type Resource type
   */
  public getResourcesByType(type: string): Resource[] {
    return this.getAllResources().filter(resource => resource.getType() === type);
  }
  
  /**
   * Update a resource with new properties
   * @param id Resource ID
   * @param update New properties
   */
  public updateResource(id: string, update: Partial<ResourceProperties>): Resource | undefined {
    const resource = this.getResource(id);
    
    if (!resource) {
      return undefined;
    }
    
    resource.update(update);
    return resource;
  }
  
  /**
   * Create and register a new resource
   * @param properties Properties for the new resource
   */
  public createResource(properties: ResourceProperties): Resource {
    // Create the resource
    const resource = new BaseResource(properties);
    
    // Register it
    this.registerResource(resource);
    
    return resource;
  }
  
  /**
   * Check if a resource exists
   * @param id Resource ID
   */
  public hasResource(id: string): boolean {
    return this.resources.has(id);
  }
  
  /**
   * Get the count of all resources
   */
  public getResourceCount(): number {
    return this.resources.size;
  }
  
  /**
   * Initialize with a set of resources
   * @param resources Resources to initialize with
   */
  public initializeResources(resources: Resource[]): void {
    // Clear existing resources
    this.resources.clear();
    
    // Register all new resources
    for (const resource of resources) {
      this.registerResource(resource);
    }
  }
  
  /**
   * Create or update a resource
   * @param properties Resource properties
   */
  public createOrUpdateResource(properties: ResourceProperties): Resource {
    const { id } = properties;
    
    if (this.hasResource(id)) {
      // Update existing resource
      const resource = this.getResource(id)!;
      resource.update(properties);
      return resource;
    } else {
      // Create new resource
      return this.createResource(properties);
    }
  }
  
  /**
   * Get the internal map of resources
   * @returns Map of resource IDs to resources
   */
  public getResourceMap(): Map<string, Resource> {
    return this.resources;
  }
} 