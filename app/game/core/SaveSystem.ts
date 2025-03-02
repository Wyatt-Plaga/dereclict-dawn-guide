import { v4 as uuidv4 } from 'uuid';
import { LocalForageAdapter, StorageAdapter } from './storage/StorageAdapter';
import { GameState } from '../types';
import Logger, { LogCategory, LogContext } from '@/app/utils/logger';

/**
 * SaveData interface representing the structure of a game save
 */
export interface SaveData {
  id: string;
  version: string;
  timestamp: number;
  state: GameState;
  metadata: {
    playTime: number;
    lastPlayed: string;
    // other metadata can be added here
  };
}

/**
 * SaveSystem handles saving and loading game state
 * with support for multiple save files and cloud sync
 */
export class SaveSystem {
  private storage: StorageAdapter;
  private currentSaveId: string | null = null;
  private autoSaveInterval: NodeJS.Timeout | null = null;
  private version: string = '1.0.0';
  private gameStartTime: number = Date.now();
  private totalPlayTime: number = 0;
  
  constructor(adapter?: StorageAdapter) {
    this.storage = adapter || new LocalForageAdapter();
    Logger.info(LogCategory.ENGINE, "SaveSystem initialized", LogContext.STARTUP);
  }

  /**
   * Initialize the save system and check for existing saves
   */
  public async init(): Promise<void> {
    const mostRecentSave = await this.getMostRecentSave();
    if (mostRecentSave) {
      this.currentSaveId = mostRecentSave.id;
      this.totalPlayTime = mostRecentSave.metadata.playTime || 0;
      Logger.info(
        LogCategory.ENGINE, 
        `Found existing save (${this.currentSaveId})`, 
        LogContext.STARTUP
      );
    } else {
      Logger.info(LogCategory.ENGINE, "No existing saves found", LogContext.STARTUP);
    }
    this.gameStartTime = Date.now();
  }
  
  /**
   * Save game state with metadata
   */
  public async save(state: GameState, metadata: any = {}): Promise<string> {
    // Update play time tracking
    const currentTime = Date.now();
    const sessionTime = (currentTime - this.gameStartTime) / 1000; // in seconds
    this.totalPlayTime += sessionTime;
    this.gameStartTime = currentTime;
    
    // Create or use existing save ID
    const saveId = this.currentSaveId || uuidv4();
    
    // Prepare save data
    const saveData: SaveData = {
      id: saveId,
      version: this.version,
      timestamp: currentTime,
      state,
      metadata: {
        playTime: Math.floor(this.totalPlayTime),
        lastPlayed: new Date().toISOString().split('T')[0],
        ...metadata
      }
    };
    
    const saveKey = `save:${saveId}`;
    
    try {
      // Save the game data
      await this.storage.save(saveKey, saveData);
      
      // Save a pointer to the most recent save
      await this.storage.save('currentSave', saveId);
      
      this.currentSaveId = saveId;
      
      Logger.debug(
        LogCategory.ENGINE, 
        `Game saved successfully (${saveId})`, 
        LogContext.NONE
      );
      
      return saveId;
    } catch (error) {
      Logger.error(
        LogCategory.ENGINE, 
        `Failed to save game: ${error}`, 
        LogContext.SAVE_LOAD
      );
      throw error;
    }
  }
  
  /**
   * Load a game save
   */
  public async load(saveId?: string): Promise<SaveData | null> {
    const idToLoad = saveId || this.currentSaveId;
    
    if (!idToLoad) {
      const mostRecentSave = await this.getMostRecentSave();
      if (mostRecentSave) {
        this.currentSaveId = mostRecentSave.id;
        this.totalPlayTime = mostRecentSave.metadata.playTime || 0;
        return mostRecentSave;
      }
      return null;
    }
    
    const saveKey = `save:${idToLoad}`;
    
    try {
      const saveData = await this.storage.load(saveKey);
      
      if (!saveData) {
        Logger.warn(
          LogCategory.ENGINE, 
          `No save found with ID: ${idToLoad}`, 
          LogContext.SAVE_LOAD
        );
        return null;
      }
      
      // Handle version migrations
      if (saveData.version !== this.version) {
        Logger.info(
          LogCategory.ENGINE, 
          `Migrating save from ${saveData.version} to ${this.version}`, 
          LogContext.STARTUP
        );
        return this.migrateSaveData(saveData);
      }
      
      this.totalPlayTime = saveData.metadata.playTime || 0;
      this.gameStartTime = Date.now();
      
      Logger.info(
        LogCategory.ENGINE, 
        `Game loaded successfully (${idToLoad})`, 
        LogContext.STARTUP
      );
      
      return saveData;
    } catch (error) {
      Logger.error(
        LogCategory.ENGINE, 
        `Failed to load game: ${error}`, 
        LogContext.SAVE_LOAD
      );
      return null;
    }
  }
  
  /**
   * Start autosaving at specified interval
   */
  public startAutoSave(
    getStateCallback: () => GameState, 
    intervalMs: number = 250 // Every quarter second as requested
  ): void {
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
    }
    
    Logger.info(
      LogCategory.ENGINE, 
      `Starting autosave (interval: ${intervalMs}ms)`, 
      LogContext.STARTUP
    );
    
    this.autoSaveInterval = setInterval(() => {
      this.save(getStateCallback());
    }, intervalMs);
  }
  
  /**
   * Stop autosaving
   */
  public stopAutoSave(): void {
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
      this.autoSaveInterval = null;
      
      Logger.info(LogCategory.ENGINE, "Autosave stopped", LogContext.NONE);
    }
  }
  
  /**
   * Get play time in seconds
   */
  public getPlayTime(): number {
    return this.totalPlayTime + (Date.now() - this.gameStartTime) / 1000;
  }
  
  /**
   * Get most recent save
   */
  private async getMostRecentSave(): Promise<SaveData | null> {
    try {
      const currentSaveId = await this.storage.load('currentSave');
      if (currentSaveId) {
        return this.load(currentSaveId);
      }
      return null;
    } catch (error) {
      Logger.error(
        LogCategory.ENGINE, 
        `Error retrieving most recent save: ${error}`, 
        LogContext.SAVE_LOAD
      );
      return null;
    }
  }
  
  /**
   * Migrate save data between versions
   */
  private migrateSaveData(saveData: SaveData): SaveData {
    // Migration logic would be expanded as game evolves
    
    // Example migration from older versions
    if (saveData.version === '0.9.0') {
      // Add new fields or adjust data structure
      // saveData.state.newFeature = defaultValue;
      Logger.debug(
        LogCategory.ENGINE, 
        `Migrated save from version 0.9.0`, 
        LogContext.STARTUP
      );
    }
    
    // Update to current version
    saveData.version = this.version;
    return saveData;
  }
  
  // Future Supabase integration methods
  public async syncToCloud(userId: string): Promise<void> {
    // This will be implemented when Supabase is added
    Logger.info(
      LogCategory.ENGINE, 
      `[Future] Sync to cloud for user: ${userId}`, 
      LogContext.NONE
    );
  }
  
  public async syncFromCloud(userId: string): Promise<boolean> {
    // This will be implemented when Supabase is added
    Logger.info(
      LogCategory.ENGINE, 
      `[Future] Sync from cloud for user: ${userId}`, 
      LogContext.NONE
    );
    return false;
  }
} 