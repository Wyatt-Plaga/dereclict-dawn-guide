/**
 * Base repository interface that defines common CRUD operations
 * This will be implemented by domain-specific repositories
 */
export interface BaseRepository<T, ID = string> {
  /**
   * Find an entity by its unique identifier
   * @param id The entity's unique identifier
   * @returns The entity if found, null otherwise
   */
  findById(id: ID): Promise<T | null>;
  
  /**
   * Find all entities that match the given filter criteria
   * @param filters Optional filter criteria
   * @returns Array of matching entities
   */
  findAll(filters?: Partial<T>): Promise<T[]>;
  
  /**
   * Create a new entity
   * @param data The entity data to create
   * @returns The created entity with its ID
   */
  create(data: Omit<T, 'id'>): Promise<T>;
  
  /**
   * Update an existing entity
   * @param id The entity's unique identifier
   * @param data The properties to update
   * @returns The updated entity
   */
  update(id: ID, data: Partial<T>): Promise<T>;
  
  /**
   * Delete an entity by its unique identifier
   * @param id The entity's unique identifier
   * @returns true if deleted, false otherwise
   */
  delete(id: ID): Promise<boolean>;
  
  /**
   * Check if an entity exists
   * @param id The entity's unique identifier
   * @returns true if exists, false otherwise
   */
  exists(id: ID): Promise<boolean>;
  
  /**
   * Count the number of entities matching the filter criteria
   * @param filters Optional filter criteria
   * @returns The count of matching entities
   */
  count(filters?: Partial<T>): Promise<number>;
}

/**
 * Base abstract repository class that implements common functionality
 * Domain-specific repositories will extend this class
 */
export abstract class AbstractRepository<T extends { id: ID }, ID = string> implements BaseRepository<T, ID> {
  /**
   * Find an entity by its unique identifier
   * This is an abstract method that must be implemented by subclasses
   */
  abstract findById(id: ID): Promise<T | null>;
  
  /**
   * Find all entities that match the given filter criteria
   * This is an abstract method that must be implemented by subclasses
   */
  abstract findAll(filters?: Partial<T>): Promise<T[]>;
  
  /**
   * Create a new entity
   * This is an abstract method that must be implemented by subclasses
   */
  abstract create(data: Omit<T, 'id'>): Promise<T>;
  
  /**
   * Update an existing entity
   * This is an abstract method that must be implemented by subclasses
   */
  abstract update(id: ID, data: Partial<T>): Promise<T>;
  
  /**
   * Delete an entity by its unique identifier
   * This is an abstract method that must be implemented by subclasses
   */
  abstract delete(id: ID): Promise<boolean>;
  
  /**
   * Check if an entity exists
   * Default implementation uses findById
   */
  async exists(id: ID): Promise<boolean> {
    const entity = await this.findById(id);
    return entity !== null;
  }
  
  /**
   * Count the number of entities matching the filter criteria
   * Default implementation uses findAll and counts the results
   */
  async count(filters?: Partial<T>): Promise<number> {
    const entities = await this.findAll(filters);
    return entities.length;
  }
}

/**
 * Repository factory type for creating repositories with dependencies
 */
export type RepositoryFactory<T extends BaseRepository<any, any>> = (
  dependencies: Record<string, any>
) => T; 