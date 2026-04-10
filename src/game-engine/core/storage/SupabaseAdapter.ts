import { StorageAdapter } from './StorageAdapter';

/**
 * SupabaseAdapter implements the StorageAdapter interface for cloud storage.
 * TODO: Implement when Supabase is integrated.
 */
export class SupabaseAdapter implements StorageAdapter {
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  async save(_key: string, _data: any): Promise<void> {
    // TODO: implement Supabase save
  }

  async load(_key: string): Promise<any | null> {
    // TODO: implement Supabase load
    return null;
  }

  async delete(_key: string): Promise<void> {
    // TODO: implement Supabase delete
  }

  async getAllKeys(): Promise<string[]> {
    // TODO: implement Supabase key listing
    return [];
  }
}
