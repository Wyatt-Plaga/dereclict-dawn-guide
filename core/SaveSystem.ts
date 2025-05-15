import { v4 as uuidv4 } from 'uuid';
import { LocalForageAdapter, StorageAdapter } from 'core/storage/StorageAdapter';
import { GameState } from '@/app/game/types';
import { createWorldFromGameState } from '@/app/game/ecs/factory';
import { World } from 'core/ecs/World';
import Logger, { LogCategory, LogContext } from '@/app/utils/logger';

export interface SaveData {
  id: string;
  version: string;
  timestamp: number;
  state: GameState;
  metadata: { playTime: number; lastPlayed: string };
}

export class SaveSystem {
  private storage: StorageAdapter;
  private currentSaveId: string | null = null;
  private autoSaveInterval: NodeJS.Timeout | null = null;
  private version = '2.0.0';
  private gameStartTime = Date.now();
  private totalPlayTime = 0;

  constructor(adapter?: StorageAdapter) {
    this.storage = adapter || new LocalForageAdapter();
    Logger.info(LogCategory.ENGINE, 'SaveSystem initialized', LogContext.STARTUP);
  }

  async init() {
    const recent = await this.getMostRecentSave();
    if (recent) {
      this.currentSaveId = recent.id;
      this.totalPlayTime = recent.metadata.playTime || 0;
      Logger.info(LogCategory.ENGINE, `Found existing save (${recent.id})`, LogContext.STARTUP);
    }
    this.gameStartTime = Date.now();
  }

  async save(state: GameState, metadata: any = {}): Promise<string> {
    const now = Date.now();
    this.totalPlayTime += (now - this.gameStartTime) / 1000;
    this.gameStartTime = now;

    const id = this.currentSaveId || uuidv4();
    const worldSnapshot = (state.world as any)?.toJSON ? (state.world as any).toJSON() : state.world;
    const save: SaveData = {
      id,
      version: this.version,
      timestamp: now,
      state: { ...state, world: worldSnapshot } as GameState,
      metadata: { playTime: Math.floor(this.totalPlayTime), lastPlayed: new Date(now).toISOString().split('T')[0], ...metadata }
    };
    const key = `save:${id}`;
    await this.storage.save(key, save);
    await this.storage.save('currentSave', id);
    this.currentSaveId = id;
    Logger.debug(LogCategory.ENGINE, `Game saved (${id})`, LogContext.NONE);
    return id;
  }

  async load(saveId?: string) {
    const id = saveId || this.currentSaveId || (await this.getMostRecentSave())?.id;
    if (!id) return null;
    const key = `save:${id}`;
    const data = await this.storage.load(key);
    if (!data) return null;
    if (data.version !== this.version) data.state = this.migrateSaveData(data).state;

    // Revive World instance if serialized as plain object
    if (data.state.world && !(data.state.world instanceof World)) {
      try {
        data.state.world = World.fromJSON(data.state.world as any);
      } catch (err) {
        Logger.error(LogCategory.ENGINE, 'Failed to revive World from save – rebuilding from game state', LogContext.SAVE_LOAD);
        data.state.world = createWorldFromGameState(data.state);
      }
    }

    this.totalPlayTime = data.metadata.playTime || 0;
    this.gameStartTime = Date.now();
    this.currentSaveId = id;
    return data;
  }

  startAutoSave(getState: () => GameState, intervalMs = 250) {
    this.stopAutoSave();
    this.autoSaveInterval = setInterval(() => this.save(getState()), intervalMs);
  }
  stopAutoSave() { if (this.autoSaveInterval) clearInterval(this.autoSaveInterval); }

  private async getMostRecentSave(): Promise<SaveData | null> {
    const id = await this.storage.load('currentSave');
    if (!id) return null;
    return this.storage.load(`save:${id}`);
  }

  private migrateSaveData(data: SaveData): SaveData {
    Logger.warn(LogCategory.ENGINE, `Migrating save ${data.id} from version ${data.version} → ${this.version}`, LogContext.SAVE_LOAD);

    // Example: add ECS world snapshot if missing
    if (!data.state.world) {
      data.state.world = createWorldFromGameState(data.state);
    }

    // You could chain more migrations based on data.version here.

    data.version = this.version;
    data.state.version = 2; // bump game-state level too
    return data;
  }
} 