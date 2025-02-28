import { EventEmitter, GameEvent } from '../../../core/events';
import { Log, LogCategory, LogLevel, LogProperties, LogVisibility } from '../models/Log';

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
   * Start a new trace for related logs
   * @param traceId Optional trace ID (auto-generated if not provided)
   * @returns The trace ID
   */
  public startTrace(traceId: string = `trace_${Date.now()}`): string {
    this.debug(`Trace started: ${traceId}`, { traceId }, LogCategory.SYSTEM);
    return traceId;
  }
  
  /**
   * Add a log to an existing trace
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
   */
  public getLog(id: string): Log | undefined {
    return this.logs.get(id);
  }
  
  /**
   * Get all logs
   */
  public getAllLogs(): Log[] {
    return Array.from(this.logs.values());
  }
  
  /**
   * Get logs by trace ID
   * @param traceId Trace ID
   */
  public getLogsByTrace(traceId: string): Log[] {
    return this.getAllLogs().filter(log => log.getTraceId() === traceId);
  }
  
  /**
   * Filter logs by various criteria
   * @param filter Filter criteria
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
        const categories = Array.isArray(filter.category) 
          ? filter.category 
          : [filter.category];
        if (!categories.includes(log.getCategory())) {
          return false;
        }
      }
      
      // Filter by visibility
      if (filter.visibility) {
        const visibilities = Array.isArray(filter.visibility) 
          ? filter.visibility 
          : [filter.visibility];
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
      
      // Filter by search text
      if (filter.search) {
        const searchLower = filter.search.toLowerCase();
        const messageMatches = log.getMessage().toLowerCase().includes(searchLower);
        const formattedMessageMatches = log.getFormattedMessage().toLowerCase().includes(searchLower);
        
        if (!messageMatches && !formattedMessageMatches) {
          return false;
        }
      }
      
      // Filter by tags
      if (filter.tags && filter.tags.length > 0) {
        if (!filter.tags.some(tag => log.hasTag(tag))) {
          return false;
        }
      }
      
      // Filter by read status
      if (filter.read !== undefined && log.isRead() !== filter.read) {
        return false;
      }
      
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
      this.emitLogEvent(log, 'log_updated');
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
    
    // Get all logs sorted by timestamp (oldest first)
    const sortedLogs = this.getAllLogs()
      .sort((a, b) => a.getTimestamp() - b.getTimestamp());
    
    // Calculate how many logs to remove
    const logsToRemove = this.logs.size - this.maxLogs;
    
    // Remove the oldest logs
    for (let i = 0; i < logsToRemove; i++) {
      if (i < sortedLogs.length) {
        this.logs.delete(sortedLogs[i].getId());
      }
    }
  }
  
  /**
   * Emit a log event
   * @param log Log to emit event for
   * @param eventType Type of event
   */
  private emitLogEvent(log: Log, eventType: string = 'log_created'): void {
    if (!this.eventEmitter) {
      return;
    }
    
    const event: GameEvent = {
      id: `${eventType}_${log.getId()}`,
      type: eventType,
      timestamp: Date.now(),
      payload: log.toJSON()
    };
    
    this.eventEmitter.emit(event);
  }
  
  /**
   * Emit a batch log event
   * @param logs Logs to emit event for
   */
  private emitBatchLogEvent(logs: Log[]): void {
    if (!this.eventEmitter || logs.length === 0) {
      return;
    }
    
    const event: GameEvent = {
      id: `logs_updated_${Date.now()}`,
      type: 'logs_updated',
      timestamp: Date.now(),
      payload: {
        logs: logs.map(log => log.toJSON())
      }
    };
    
    this.eventEmitter.emit(event);
  }
  
  /**
   * Clear all logs
   */
  public clearLogs(): void {
    this.logs.clear();
  }
  
  /**
   * Get the count of unread logs
   * @param visibility Optional visibility filter
   */
  public getUnreadCount(visibility?: LogVisibility): number {
    return this.getAllLogs().filter(log => {
      // Filter by read status
      if (log.isRead()) {
        return false;
      }
      
      // Filter by visibility if provided
      if (visibility !== undefined) {
        return log.isVisibleTo(visibility);
      }
      
      return true;
    }).length;
  }
  
  /**
   * Convert logs to game events
   * @param logs Logs to convert
   */
  public logsToEvents(logs: Log[]): GameEvent[] {
    return logs.map(log => ({
      id: `log_event_${log.getId()}`,
      type: 'log',
      timestamp: log.getTimestamp(),
      payload: log.toJSON()
    }));
  }
} 