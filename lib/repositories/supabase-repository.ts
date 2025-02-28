import { AbstractRepository } from "./base-repository";
import { PostgrestError } from "@supabase/supabase-js";

/**
 * Options for the Supabase repository
 */
export interface SupabaseRepositoryOptions<T> {
  /**
   * The table name in the Supabase database
   */
  tableName: string;
  
  /**
   * Columns to select when fetching data
   * Default is '*' for all columns
   */
  columns?: string;
  
  /**
   * Function to transform database entities to domain entities
   * If not provided, the database entity is returned as-is
   */
  toDomain?: (dbEntity: any) => T;
  
  /**
   * Function to transform domain entities to database entities
   * If not provided, the domain entity is stored as-is
   */
  toDatabase?: (domainEntity: any) => any;
  
  /**
   * Column to use for ordering results
   */
  orderBy?: string;
  
  /**
   * Whether to order in ascending order
   * Default is true
   */
  ascending?: boolean;
}

/**
 * Type for Supabase database operations
 */
export interface SupabaseDatabaseOperations {
  select: (
    tableName: string,
    columns: string,
    eq?: Record<string, any>,
    options?: {
      limit?: number;
      offset?: number;
      orderBy?: string;
      ascending?: boolean;
    }
  ) => Promise<{ data: any[] | null; error: PostgrestError | null; count: number | null }>;
  
  insert: (
    tableName: string,
    data: any
  ) => Promise<{ data: any[] | null; error: PostgrestError | null }>;
  
  update: (
    tableName: string,
    data: any,
    eq: Record<string, any>
  ) => Promise<{ data: any[] | null; error: PostgrestError | null }>;
  
  delete: (
    tableName: string,
    eq: Record<string, any>
  ) => Promise<{ data: any[] | null; error: PostgrestError | null }>;
}

/**
 * A generic repository implementation that uses Supabase for persistence
 */
export class SupabaseRepository<T extends { id: ID }, ID = string> extends AbstractRepository<T, ID> {
  protected tableName: string;
  protected columns: string;
  protected toDomain: (dbEntity: any) => T;
  protected toDatabase: (domainEntity: Partial<T>) => any;
  protected orderBy?: string;
  protected ascending: boolean;
  
  constructor(
    protected readonly db: SupabaseDatabaseOperations,
    options: SupabaseRepositoryOptions<T>
  ) {
    super();
    
    this.tableName = options.tableName;
    this.columns = options.columns || '*';
    this.toDomain = options.toDomain || ((entity) => entity as T);
    this.toDatabase = options.toDatabase || ((entity) => entity);
    this.orderBy = options.orderBy;
    this.ascending = options.ascending ?? true;
  }
  
  /**
   * Find a single entity by its ID
   */
  async findById(id: ID): Promise<T | null> {
    const { data, error } = await this.db.select(
      this.tableName,
      this.columns,
      { id }
    );
    
    if (error) {
      throw new Error(`Failed to find entity by ID: ${error.message}`);
    }
    
    if (!data || data.length === 0) {
      return null;
    }
    
    return this.toDomain(data[0]);
  }
  
  /**
   * Find all entities matching the given filters
   */
  async findAll(filters?: Partial<T>): Promise<T[]> {
    // Convert domain filters to database filters
    const dbFilters = filters ? this.toDatabase(filters) : undefined;
    
    const options = {
      orderBy: this.orderBy,
      ascending: this.ascending
    };
    
    const { data, error } = await this.db.select(
      this.tableName,
      this.columns,
      dbFilters,
      options
    );
    
    if (error) {
      throw new Error(`Failed to find entities: ${error.message}`);
    }
    
    if (!data || data.length === 0) {
      return [];
    }
    
    return data.map(entity => this.toDomain(entity));
  }
  
  /**
   * Create a new entity
   */
  async create(data: Omit<T, 'id'>): Promise<T> {
    // Convert domain entity to database entity
    const dbEntity = this.toDatabase(data as Partial<T>);
    
    const { data: createdData, error } = await this.db.insert(
      this.tableName,
      dbEntity
    );
    
    if (error) {
      throw new Error(`Failed to create entity: ${error.message}`);
    }
    
    if (!createdData || createdData.length === 0) {
      throw new Error('Failed to create entity: No data returned');
    }
    
    return this.toDomain(createdData[0]);
  }
  
  /**
   * Update an existing entity
   */
  async update(id: ID, data: Partial<T>): Promise<T> {
    // Convert domain entity to database entity
    const dbEntity = this.toDatabase(data);
    
    const { data: updatedData, error } = await this.db.update(
      this.tableName,
      dbEntity,
      { id }
    );
    
    if (error) {
      throw new Error(`Failed to update entity: ${error.message}`);
    }
    
    if (!updatedData || updatedData.length === 0) {
      throw new Error(`Failed to update entity with ID ${String(id)}: Entity not found`);
    }
    
    return this.toDomain(updatedData[0]);
  }
  
  /**
   * Delete an entity by its ID
   */
  async delete(id: ID): Promise<boolean> {
    const { error } = await this.db.delete(
      this.tableName,
      { id }
    );
    
    if (error) {
      throw new Error(`Failed to delete entity: ${error.message}`);
    }
    
    return true;
  }
}

/**
 * Factory function to create a Supabase repository
 */
export function createSupabaseRepository<T extends { id: ID }, ID = string>(
  db: SupabaseDatabaseOperations,
  options: SupabaseRepositoryOptions<T>
): SupabaseRepository<T, ID> {
  return new SupabaseRepository<T, ID>(db, options);
} 