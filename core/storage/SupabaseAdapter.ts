import { StorageAdapter } from '@/core/storage/StorageAdapter';
import Logger, { LogCategory, LogContext } from '@/app/utils/logger';

export class SupabaseAdapter implements StorageAdapter {
  private userId: string;
  constructor(userId: string) {
    this.userId = userId;
    Logger.info(LogCategory.ENGINE, `Initialized SupabaseAdapter for user: ${userId}`, LogContext.SAVE_LOAD);
  }
  async save(key: string, data: any): Promise<void> { Logger.info(LogCategory.ENGINE, `[Future] Save to Supabase: ${key}`, LogContext.SAVE_LOAD);}  async load(key: string): Promise<any|null>{Logger.info(LogCategory.ENGINE, `[Future] Load ${key}`, LogContext.SAVE_LOAD);return null;}  async delete(key:string):Promise<void>{Logger.info(LogCategory.ENGINE, `[Future] Delete ${key}`, LogContext.SAVE_LOAD);}  async getAllKeys():Promise<string[]>{Logger.info(LogCategory.ENGINE, `[Future] Keys`, LogContext.SAVE_LOAD);return [];}
} 
