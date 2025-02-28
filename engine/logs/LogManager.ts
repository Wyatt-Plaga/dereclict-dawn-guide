import { EventEmitter, GameEvent } from '../interfaces';
import { GameEventType, createGameEvent } from '../events/GameEvents';
import { Log, LogCategory, LogLevel, LogProperties, LogVisibility } from './Log';

/**
 * Interface for log filtering
 */
export interface LogFilter {
  level?: LogLevel | LogLevel[];
  category?: LogCategory | LogCategory[];
  visibility?: LogVisibility | LogVisibility[];
  traceId?: string;
  relatedEntityId?: string;
  relatedEntityType?: string;
  fromTimestamp?: number;
  toTimestamp?: number;
  search?: string;
  tags?: string[];
  read?: boolean;
}

/**
 * Log manager for creating, storing, and querying logs
 */
export class LogManager {
  /**
   * All logs in the system
   */
  private logs: Map<string, Log> = new Map();
  
  /**
   * Event emitter for broadcasting log events
   */
  private eventEmitter?: EventEmitter;
  
  /**
   * Maximum number of logs to keep
   */
  private maxLogs: number = 1000;
  
  /**
   * Create a new log manager
   * @param eventEmitter Optional event emitter for log events
   * @param options Configuration options
   */
  constructor(
    eventEmitter?: EventEmitter, 
    options?: { maxLogs?: number }
  ) {
    this.eventEmitter = eventEmitter;
    
    if (options?.maxLogs) {
      this.maxLogs = options.maxLogs;
    }
  }
  
  /**
   * Create a new log entry
   * @param properties Log properties
   * @returns The created log
   */
  public createLog(properties: Partial<LogProperties> & { message: string }): Log {
    const log = new Log(properties);
    this.logs.set(log.getId(), log);
    
    // Trim logs if we have too many
    this.trimLogs();
    
    // Emit log created event
    this.emitLogEvent(log);
    
    return log;
  }
  
  /**
   * Create a debug log
   * @param message Log message
   * @param data Additional data
   * @param category Log category
   * @returns The created log
   */
  public debug(
    message: string, 
    data?: any, 
    category: LogCategory = LogCategory.DEBUG
  ): Log {
    return this.createLog({
      message,
      level: LogLevel.DEBUG,
      category,
      visibility: LogVisibility.DEVELOPER,
      data
    });
  }
  
  /**
   * Create an info log
   * @param message Log message
   * @param data Additional data
   * @param category Log category
   * @returns The created log
   */
  public info(
    message: string, 
    data?: any, 
    category: LogCategory = LogCategory.GAME
  ): Log {
    return this.createLog({
      message,
      level: LogLevel.INFO,
      category,
      visibility: LogVisibility.PLAYER,
      data
    });
  }
  
  /**
   * Create a warning log
   * @param message Log message
   * @param data Additional data
   * @param category Log category
   * @returns The created log
   */
  public warning(
    message: string, 
    data?: any, 
    category: LogCategory = LogCategory.GAME
  ): Log {
    return this.createLog({
      message,
      level: LogLevel.WARNING,
      category,
      visibility: LogVisibility.PLAYER,
      data
    });
  }
  
  /**
   * Create an error log
   * @param message Log message
   * @param data Additional data
   * @param category Log category
   * @returns The created log
   */
  public error(
    message: string, 
    data?: any, 
    category: LogCategory = LogCategory.SYSTEM
  ): Log {
    return this.createLog({
      message,
      level: LogLevel.ERROR,
      category,
      visibility: LogVisibility.PLAYER,
      data
    });
  }
  
  /**
   * Create a critical log
   * @param message Log message
   * @param data Additional data
   * @param category Log category
   * @returns The created log
   */
  public critical(
    message: string, 
    data?: any, 
    category: LogCategory = LogCategory.SYSTEM
  ): Log {
    return this.createLog({
      message,
      level: LogLevel.CRITICAL,
      category,
      visibility: LogVisibility.PLAYER,
      data
    });
  }
  
  /**
   * Create a trace (a group of related logs)
   * @param traceId Unique ID for the trace
   */
  public startTrace(traceId: string): string {
    return traceId || `trace_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }
  
  /**
   * Add a log to a trace
   * @param traceId Trace ID
   * @param message Log message
   * @param level Log level
   * @param data Additional data
   * @param category Log category
   * @returns The created log
   */
  public addToTrace(
    traceId: string,
    message: string,
    level: LogLevel = LogLevel.INFO,
    data?: any,
    category: LogCategory = LogCategory.GAME
  ): Log {
    return this.createLog({
      message,
      level,
      category,
      traceId,
      data
    });
  }
  
  /**
   * Get a log by ID
   * @param id Log ID
   * @returns The log, or undefined if not found
   */
  public getLog(id: string): Log | undefined {
    return this.logs.get(id);
  }
  
  /**
   * Get all logs
   * @returns Array of all logs
   */
  public getAllLogs(): Log[] {
    return Array.from(this.logs.values());
  }
  
  /**
   * Get logs by trace ID
   * @param traceId Trace ID
   * @returns Array of logs in the trace
   */
  public getLogsByTrace(traceId: string): Log[] {
    return this.getAllLogs().filter(log => log.getTraceId() === traceId);
  }
  
  /**
   * Get logs by filter criteria
   * @param filter Filter criteria
   * @returns Array of matching logs
   */
  public filterLogs(filter: LogFilter): Log[] {
    return this.getAllLogs().filter(log => {
      // Filter by level
      if (filter.level) {
        const levels = Array.isArray(filter.level) ? filter.level : [filter.level];
        if (!levels.includes(log.getLevel())) {
          return false;
        }
      }
      
      // Filter by category
      if (filter.category) {
        const categories = Array.isArray(filter.category) ? filter.category : [filter.category];
        if (!categories.includes(log.getCategory())) {
          return false;
        }
      }
      
      // Filter by visibility
      if (filter.visibility) {
        const visibilities = Array.isArray(filter.visibility) ? filter.visibility : [filter.visibility];
        if (!visibilities.some(v => log.isVisibleTo(v))) {
          return false;
        }
      }
      
      // Filter by trace ID
      if (filter.traceId && log.getTraceId() !== filter.traceId) {
        return false;
      }
      
      // Filter by related entity ID
      if (filter.relatedEntityId && log.getRelatedEntityId() !== filter.relatedEntityId) {
        return false;
      }
      
      // Filter by related entity type
      if (filter.relatedEntityType && log.getRelatedEntityType() !== filter.relatedEntityType) {
        return false;
      }
      
      // Filter by timestamp range
      if (filter.fromTimestamp && log.getTimestamp() < filter.fromTimestamp) {
        return false;
      }
      
      if (filter.toTimestamp && log.getTimestamp() > filter.toTimestamp) {
        return false;
      }
      
      // Filter by read status
      if (filter.read !== undefined && log.isRead() !== filter.read) {
        return false;
      }
      
      // Filter by search term
      if (filter.search) {
        const searchLower = filter.search.toLowerCase();
        const messageMatches = log.getFormattedMessage().toLowerCase().includes(searchLower);
        let dataMatches = false;
        
        if (log.getData()) {
          try {
            const dataString = JSON.stringify(log.getData()).toLowerCase();
            dataMatches = dataString.includes(searchLower);
          } catch (e) {
            // Ignore JSON stringify errors
          }
        }
        
        if (!messageMatches && !dataMatches) {
          return false;
        }
      }
      
      // Filter by tags (all tags must match)
      if (filter.tags && filter.tags.length > 0) {
        if (!filter.tags.every(tag => log.hasTag(tag))) {
          return false;
        }
      }
      
      // Log passed all filters
      return true;
    });
  }
  
  /**
   * Mark a log as read
   * @param id Log ID
   */
  public markAsRead(id: string): void {
    const log = this.getLog(id);
    if (log) {
      log.markAsRead();
      
      // Emit log updated event
      this.emitLogEvent(log, GameEventType.LOG_UPDATED);
    }
  }
  
  /**
   * Mark multiple logs as read
   * @param ids Log IDs
   */
  public markMultipleAsRead(ids: string[]): void {
    const updatedLogs: Log[] = [];
    
    for (const id of ids) {
      const log = this.getLog(id);
      if (log && !log.isRead()) {
        log.markAsRead();
        updatedLogs.push(log);
      }
    }
    
    // Emit batch update event if any logs were updated
    if (updatedLogs.length > 0) {
      this.emitBatchLogEvent(updatedLogs);
    }
  }
  
  /**
   * Trim logs if we have too many
   */
  private trimLogs(): void {
    if (this.logs.size <= this.maxLogs) {
      return;
    }
    
    // Sort logs by timestamp (oldest first)
    const sortedLogs = this.getAllLogs()
      .sort((a, b) => a.getTimestamp() - b.getTimestamp());
    
    // Remove oldest logs until we're under the limit
    const logsToRemove = sortedLogs.slice(0, this.logs.size - this.maxLogs);
    
    for (const log of logsToRemove) {
      this.logs.delete(log.getId());
    }
  }
  
  /**
   * Emit a log event
   * @param log Log to emit event for
   * @param eventType Type of event to emit
   */
  private emitLogEvent(log: Log, eventType: GameEventType = GameEventType.LOG_CREATED): void {
    if (this.eventEmitter) {
      this.eventEmitter.emit(createGameEvent(eventType, {
        logId: log.getId(),
        category: log.getCategory(),
        level: log.getLevel(),
        message: log.getFormattedMessage(),
        timestamp: log.getTimestamp(),
        visibility: log.getVisibility(),
        traceId: log.getTraceId(),
        data: log.getData()
      }));
    }
  }
  
  /**
   * Emit a batch log event
   * @param logs Logs to emit event for
   */
  private emitBatchLogEvent(logs: Log[]): void {
    if (this.eventEmitter) {
      this.eventEmitter.emit(createGameEvent(GameEventType.LOG_BATCH_CREATED, {
        count: logs.length,
        logs: logs.map(log => ({
          logId: log.getId(),
          category: log.getCategory(),
          level: log.getLevel(),
          message: log.getFormattedMessage(),
          timestamp: log.getTimestamp(),
          visibility: log.getVisibility(),
          traceId: log.getTraceId()
        }))
      }));
    }
  }
  
  /**
   * Clear all logs
   */
  public clearLogs(): void {
    this.logs.clear();
  }
  
  /**
   * Get a count of unread logs
   * @param visibility Filter by visibility
   */
  public getUnreadCount(visibility?: LogVisibility): number {
    let count = 0;
    
    for (const log of this.getAllLogs()) {
      if (!log.isRead()) {
        if (!visibility || log.isVisibleTo(visibility)) {
          count++;
        }
      }
    }
    
    return count;
  }
  
  /**
   * Generate game events from logs for UI display
   * @param logs Logs to convert to events
   * @returns Array of game events
   */
  public logsToEvents(logs: Log[]): GameEvent[] {
    return logs.map(log => ({
      id: log.getId(),
      type: `log:${log.getLevel()}`,
      timestamp: log.getTimestamp(),
      payload: {
        logId: log.getId(),
        message: log.getFormattedMessage(),
        level: log.getLevel(),
        category: log.getCategory(),
        data: log.getData(),
        relatedEntityId: log.getRelatedEntityId(),
        relatedEntityType: log.getRelatedEntityType()
      }
    }));
  }
} 