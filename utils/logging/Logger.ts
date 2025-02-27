/**
 * Logging levels enum
 */
export enum LogLevel {
  TRACE = 0,
  DEBUG = 1,
  INFO = 2,
  WARN = 3,
  ERROR = 4,
  NONE = 5
}

/**
 * Logger configuration interface
 */
export interface LoggerConfig {
  level: LogLevel;
  includeTimestamps: boolean;
  outputToConsole: boolean;
}

/**
 * Default logger configuration based on environment
 */
const defaultConfig: LoggerConfig = {
  level: process.env.NODE_ENV === 'production' 
    ? LogLevel.ERROR  // Only log errors in production
    : LogLevel.DEBUG, // Log debug and above in development
  includeTimestamps: true,
  outputToConsole: process.env.NODE_ENV !== 'production'
};

/**
 * Centralized Logger utility for consistent logging across the application
 */
export class Logger {
  private static config: LoggerConfig = defaultConfig;
  private static logs: string[] = [];
  private moduleName: string;
  
  /**
   * Create a new logger instance for a specific module
   * @param moduleName Name of the module using this logger
   */
  constructor(moduleName: string) {
    this.moduleName = moduleName;
  }
  
  /**
   * Configure the logger
   * @param config New logger configuration
   */
  static configure(config: Partial<LoggerConfig>): void {
    Logger.config = { ...Logger.config, ...config };
  }
  
  /**
   * Get the current log level
   */
  static getLevel(): LogLevel {
    return Logger.config.level;
  }
  
  /**
   * Get all stored logs
   */
  static getLogs(): string[] {
    return [...Logger.logs];
  }
  
  /**
   * Clear all stored logs
   */
  static clearLogs(): void {
    Logger.logs = [];
  }
  
  /**
   * Format a log message
   */
  private formatMessage(level: string, message: string): string {
    const timestamp = Logger.config.includeTimestamps ? new Date().toISOString() + ' ' : '';
    return `${timestamp}[${level}] [${this.moduleName}] ${message}`;
  }
  
  /**
   * Log at trace level
   */
  trace(message: string, ...args: any[]): void {
    if (Logger.config.level <= LogLevel.TRACE) {
      const formattedMessage = this.formatMessage('TRACE', message);
      Logger.logs.push(formattedMessage);
      if (Logger.config.outputToConsole) {
        console.log(formattedMessage, ...args);
      }
    }
  }
  
  /**
   * Log at debug level
   */
  debug(message: string, ...args: any[]): void {
    if (Logger.config.level <= LogLevel.DEBUG) {
      const formattedMessage = this.formatMessage('DEBUG', message);
      Logger.logs.push(formattedMessage);
      if (Logger.config.outputToConsole) {
        console.log(formattedMessage, ...args);
      }
    }
  }
  
  /**
   * Log at info level
   */
  info(message: string, ...args: any[]): void {
    if (Logger.config.level <= LogLevel.INFO) {
      const formattedMessage = this.formatMessage('INFO', message);
      Logger.logs.push(formattedMessage);
      if (Logger.config.outputToConsole) {
        console.info(formattedMessage, ...args);
      }
    }
  }
  
  /**
   * Log at warn level
   */
  warn(message: string, ...args: any[]): void {
    if (Logger.config.level <= LogLevel.WARN) {
      const formattedMessage = this.formatMessage('WARN', message);
      Logger.logs.push(formattedMessage);
      if (Logger.config.outputToConsole) {
        console.warn(formattedMessage, ...args);
      }
    }
  }
  
  /**
   * Log at error level
   */
  error(message: string, ...args: any[]): void {
    if (Logger.config.level <= LogLevel.ERROR) {
      const formattedMessage = this.formatMessage('ERROR', message);
      Logger.logs.push(formattedMessage);
      if (Logger.config.outputToConsole) {
        console.error(formattedMessage, ...args);
      }
    }
  }
} 