/**
 * Log levels for categorizing the importance of logs
 */
export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical'
}

/**
 * Log categories for organizing logs by functional area
 */
export enum LogCategory {
  RESOURCE = 'resource',
  COMMAND = 'command',
  UPGRADE = 'upgrade',
  MILESTONE = 'milestone',
  GAME = 'game',
  UI = 'ui',
  ACHIEVEMENT = 'achievement',
  SYSTEM = 'system',
  OFFLINE = 'offline',
  NETWORK = 'network',
  DEBUG = 'debug'
}

/**
 * Visibility of logs to different audiences
 */
export enum LogVisibility {
  PLAYER = 'player',   // Visible to players in the game UI
  DEVELOPER = 'dev',   // Only visible to developers (debugging)
  INTERNAL = 'internal' // Only stored internally, not displayed
}

/**
 * Interface defining properties of a log entry
 */
export interface LogProperties {
  id: string;                    // Unique identifier
  message: string;               // Human-readable message
  level: LogLevel;               // Importance level
  category: LogCategory;         // Functional category
  timestamp: number;             // When the log was created
  visibility: LogVisibility;     // Who should see this log
  data?: any;                    // Additional structured data
  traceId?: string;              // ID for grouping related logs
  formattedMessage?: string;     // Message with variables replaced
  relatedEntityId?: string;      // ID of a game entity this log relates to
  relatedEntityType?: string;    // Type of game entity this log relates to
  read?: boolean;                // Whether the player has seen this log
  tags?: string[];               // Optional tags for filtering
}

/**
 * Class representing a log entry in the game
 */
export class Log {
  /**
   * Properties of this log
   */
  public readonly properties: LogProperties;
  
  /**
   * Create a new log entry
   * @param properties Log properties
   */
  constructor(properties: Partial<LogProperties> & { message: string }) {
    this.properties = {
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      message: properties.message,
      level: properties.level || LogLevel.INFO,
      category: properties.category || LogCategory.GAME,
      timestamp: properties.timestamp || Date.now(),
      visibility: properties.visibility || LogVisibility.PLAYER,
      data: properties.data,
      traceId: properties.traceId,
      formattedMessage: this.formatMessage(properties.message, properties.data),
      relatedEntityId: properties.relatedEntityId,
      relatedEntityType: properties.relatedEntityType,
      read: properties.read || false,
      tags: properties.tags || []
    };
  }
  
  /**
   * Format the message by replacing variables
   * @param message Message template with {variable} placeholders
   * @param data Data to use for variable replacement
   * @returns Formatted message
   */
  private formatMessage(message: string, data?: any): string {
    if (!data) {
      return message;
    }
    
    // Replace {variable} with data.variable
    return message.replace(/{(\w+)}/g, (match, key) => {
      return data[key] !== undefined ? String(data[key]) : match;
    });
  }
  
  /**
   * Get the log ID
   */
  public getId(): string {
    return this.properties.id;
  }
  
  /**
   * Get the raw message
   */
  public getMessage(): string {
    return this.properties.message;
  }
  
  /**
   * Get the formatted message with variables replaced
   */
  public getFormattedMessage(): string {
    return this.properties.formattedMessage || this.properties.message;
  }
  
  /**
   * Get the log level
   */
  public getLevel(): LogLevel {
    return this.properties.level;
  }
  
  /**
   * Get the log category
   */
  public getCategory(): LogCategory {
    return this.properties.category;
  }
  
  /**
   * Get the timestamp when the log was created
   */
  public getTimestamp(): number {
    return this.properties.timestamp;
  }
  
  /**
   * Get the visibility setting
   */
  public getVisibility(): LogVisibility {
    return this.properties.visibility;
  }
  
  /**
   * Check if this log is visible to a specific audience
   * @param visibility The visibility level to check against
   */
  public isVisibleTo(visibility: LogVisibility): boolean {
    // Internal logs are only visible to internal
    if (this.properties.visibility === LogVisibility.INTERNAL) {
      return visibility === LogVisibility.INTERNAL;
    }
    
    // Developer logs are visible to developers and internal
    if (this.properties.visibility === LogVisibility.DEVELOPER) {
      return visibility === LogVisibility.DEVELOPER || 
             visibility === LogVisibility.INTERNAL;
    }
    
    // Player logs are visible to everyone
    return true;
  }
  
  /**
   * Get the additional data
   */
  public getData(): any {
    return this.properties.data;
  }
  
  /**
   * Get the trace ID
   */
  public getTraceId(): string | undefined {
    return this.properties.traceId;
  }
  
  /**
   * Get the related entity ID
   */
  public getRelatedEntityId(): string | undefined {
    return this.properties.relatedEntityId;
  }
  
  /**
   * Get the related entity type
   */
  public getRelatedEntityType(): string | undefined {
    return this.properties.relatedEntityType;
  }
  
  /**
   * Check if the log has been read
   */
  public isRead(): boolean {
    return this.properties.read || false;
  }
  
  /**
   * Mark the log as read
   */
  public markAsRead(): void {
    (this.properties as any).read = true;
  }
  
  /**
   * Check if the log has a specific tag
   * @param tag Tag to check for
   */
  public hasTag(tag: string): boolean {
    return this.properties.tags?.includes(tag) || false;
  }
  
  /**
   * Convert the log to a plain object
   */
  public toJSON(): LogProperties {
    return { ...this.properties };
  }
} 