import localforage from 'localforage';

/**
 * Interface for all storage adapters (local and cloud)
 */
export interface StorageAdapter {
  save(key: string, data: any): Promise<void>;
  load(key: string): Promise<any | null>;
  delete(key: string): Promise<void>;
  getAllKeys(): Promise<string[]>;
}

/**
 * LocalForage implementation of storage adapter
 * Uses IndexedDB with localStorage fallback
 */
export class LocalForageAdapter implements StorageAdapter {
  private store: LocalForage;
  
  constructor(storeName: string = 'derelictDawn') {
    this.store = localforage.createInstance({
      name: storeName,
      description: 'Derelict Dawn game saves',
      driver: [
        localforage.INDEXEDDB,
        localforage.LOCALSTORAGE
      ]
    });
  }
  
  async save(key: string, data: any): Promise<void> {
    await this.store.setItem(key, data);
  }
  
  async load(key: string): Promise<any | null> {
    return await this.store.getItem(key);
  }
  
  async delete(key: string): Promise<void> {
    await this.store.removeItem(key);
  }
  
  async getAllKeys(): Promise<string[]> {
    return await this.store.keys();
  }
} 
