/**
 * Logger utility for game development
 * Provides structured logging with levels, categories, contexts, and runtime configuration
 */

// Log levels from most critical to most verbose
export enum LogLevel {
  ERROR = 0,   // Critical errors that prevent game operation
  WARN = 1,    // Potential issues that don't stop functionality
  INFO = 2,    // General operational information
  DEBUG = 3,   // Detailed information for debugging
  TRACE = 4    // Extremely detailed tracing information
}

// Define the categories for logging
export enum LogCategory {
  ENGINE = 'engine',         // Core game engine operations
  EVENT_BUS = 'eventBus',    // Event emission and handling
  STATE = 'state',           // State updates and transitions
  ACTIONS = 'actions',       // User actions and their processing
  RESOURCES = 'resources',   // Resource management
  UPGRADES = 'upgrades',     // Upgrade system
  UI = 'ui',                 // UI interactions
  LIFECYCLE = 'lifecycle',   // Component/system lifecycle
  PERFORMANCE = 'performance' // Performance measurements
}

// Common context tags for cross-category workflows
export enum LogContext {
  NONE = 'none',                     // No specific context
  REACTOR_LIFECYCLE = 'reactor',     // Reactor click through state update
  PROCESSOR_LIFECYCLE = 'processor', // Processor interaction lifecycle
  CREW_LIFECYCLE = 'crew',           // Crew related workflow
  MANUFACTURING_LIFECYCLE = 'manufacturing', // Manufacturing workflow
  UPGRADE_PURCHASE = 'upgrade',      // Upgrade purchase workflow
  STARTUP = 'startup',               // Game initialization
  SAVE_LOAD = 'saveload',            // Save/load operations
  UI_RENDER = 'render'               // UI rendering workflow
}

// Type for context parameter - can be a single context or an array of contexts
export type ContextParam = LogContext | LogContext[];

// Logger configuration
export class LoggerConfig {
  // Current log level
  static level: LogLevel = process.env.NODE_ENV === 'development' 
    ? LogLevel.DEBUG 
    : LogLevel.ERROR;
  
  // Enabled categories
  static enabledCategories: Record<LogCategory, boolean> = Object.values(LogCategory)
    .reduce((acc, category) => ({
      ...acc,
      [category]: process.env.NODE_ENV === 'development'
    }), {} as Record<LogCategory, boolean>);
    
  // Enabled context tags
  static enabledContexts: Record<LogContext, boolean> = Object.values(LogContext)
    .reduce((acc, context) => ({
      ...acc,
      [context]: process.env.NODE_ENV === 'development'
    }), {} as Record<LogContext, boolean>);
  
  // Color coding for different categories
  static categoryColors: Record<LogCategory, string> = {
    [LogCategory.ENGINE]: 'blue',
    [LogCategory.EVENT_BUS]: 'purple',
    [LogCategory.STATE]: 'orange',
    [LogCategory.ACTIONS]: 'green',
    [LogCategory.RESOURCES]: 'teal',
    [LogCategory.UPGRADES]: 'brown',
    [LogCategory.UI]: 'magenta',
    [LogCategory.LIFECYCLE]: 'gray',
    [LogCategory.PERFORMANCE]: 'red'
  };
  
  // Background colors for context tags
  static contextColors: Record<LogContext, string> = {
    [LogContext.NONE]: '',
    [LogContext.REACTOR_LIFECYCLE]: '#ffe6e6',
    [LogContext.PROCESSOR_LIFECYCLE]: '#e6f7ff',
    [LogContext.CREW_LIFECYCLE]: '#e6ffe6',
    [LogContext.MANUFACTURING_LIFECYCLE]: '#fff2e6',
    [LogContext.UPGRADE_PURCHASE]: '#f2e6ff',
    [LogContext.STARTUP]: '#ffffcc',
    [LogContext.SAVE_LOAD]: '#e6e6e6',
    [LogContext.UI_RENDER]: '#f9f9f9'
  };
  
  // Enable/disable a category
  static enableCategory(category: LogCategory, enabled: boolean = true): void {
    this.enabledCategories[category] = enabled;
    console.log(`Logging for category ${category} ${enabled ? 'enabled' : 'disabled'}`);
  }
  
  // Enable/disable a context tag
  static enableContext(context: LogContext, enabled: boolean = true): void {
    this.enabledContexts[context] = enabled;
    console.log(`Logging for context ${context} ${enabled ? 'enabled' : 'disabled'}`);
  }
  
  // Set the log level
  static setLevel(level: LogLevel): void {
    this.level = level;
    console.log(`Log level set to ${LogLevel[level]}`);
  }
}

// The main Logger class
export class Logger {
  /**
   * Log an error message
   */
  static error(
    category: LogCategory, 
    message: string, 
    contexts: ContextParam = LogContext.NONE,
    ...data: any[]
  ): void {
    this.log(LogLevel.ERROR, category, message, contexts, data);
  }
  
  /**
   * Log a warning message
   */
  static warn(
    category: LogCategory, 
    message: string, 
    contexts: ContextParam = LogContext.NONE,
    ...data: any[]
  ): void {
    this.log(LogLevel.WARN, category, message, contexts, data);
  }
  
  /**
   * Log an info message
   */
  static info(
    category: LogCategory, 
    message: string, 
    contexts: ContextParam = LogContext.NONE,
    ...data: any[]
  ): void {
    this.log(LogLevel.INFO, category, message, contexts, data);
  }
  
  /**
   * Log a debug message
   */
  static debug(
    category: LogCategory, 
    message: string, 
    contexts: ContextParam = LogContext.NONE,
    ...data: any[]
  ): void {
    this.log(LogLevel.DEBUG, category, message, contexts, data);
  }
  
  /**
   * Log a trace message (very detailed)
   */
  static trace(
    category: LogCategory, 
    message: string, 
    contexts: ContextParam = LogContext.NONE,
    ...data: any[]
  ): void {
    this.log(LogLevel.TRACE, category, message, contexts, data);
  }
  
  /**
   * Create a performance measurement with automatic duration logging
   */
  static measure(
    name: string, 
    category: LogCategory = LogCategory.PERFORMANCE,
    contexts: ContextParam = LogContext.NONE
  ): () => void {
    const start = performance.now();
    return () => {
      const duration = performance.now() - start;
      this.debug(category, `${name} took ${duration.toFixed(2)}ms`, contexts);
    };
  }
  
  /**
   * Internal log method that handles formatting and filtering
   */
  private static log(
    level: LogLevel, 
    category: LogCategory, 
    message: string, 
    contextParam: ContextParam,
    data: any[]
  ): void {
    // Normalize contexts to array
    const contexts = Array.isArray(contextParam) 
      ? contextParam 
      : [contextParam];
    
    // Check if this message should be logged based on level and category
    if (level > LoggerConfig.level || !LoggerConfig.enabledCategories[category]) {
      return;
    }
    
    // Check if at least one context is enabled
    // If contexts only contains NONE, or if any of the specified contexts is enabled
    const hasEnabledContext = 
      (contexts.length === 1 && contexts[0] === LogContext.NONE) ||
      contexts.some(ctx => LoggerConfig.enabledContexts[ctx]);
      
    if (!hasEnabledContext) {
      return;
    }
    
    // Format the log message
    const timestamp = new Date().toISOString().split('T')[1].replace('Z', '');
    const levelName = LogLevel[level].padEnd(5);
    const categoryColor = LoggerConfig.categoryColors[category] || 'black';
    
    // Choose appropriate console method
    const logMethod = 
      level === LogLevel.ERROR ? console.error :
      level === LogLevel.WARN ? console.warn :
      console.log;
    
    // Build the style string for category
    let styleString = `color: ${categoryColor}; font-weight: ${level <= LogLevel.WARN ? 'bold' : 'normal'};`;
    
    // Format the prefix (without contexts at this point)
    let prefix = `[${timestamp}][${levelName}][${category}]`;
    
    // Process context tags (if not NONE)
    if (!(contexts.length === 1 && contexts[0] === LogContext.NONE)) {
      // Create a string with each enabled context
      const enabledContexts = contexts.filter(ctx => 
        ctx !== LogContext.NONE && LoggerConfig.enabledContexts[ctx]);
        
      // If we have enabled contexts, add them to the prefix
      if (enabledContexts.length > 0) {
        const contextTags = enabledContexts.map(ctx => `[${ctx}]`).join('');
        prefix += contextTags;
      }
    }
    
    // Log with styling
    if (data && data.length > 0) {
      logMethod(`%c${prefix} ${message}`, styleString, ...data);
    } else {
      logMethod(`%c${prefix} ${message}`, styleString);
    }
  }
}

// Expose logging controls to browser console in development only
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).logging = {
    // Category controls
    enableCategory: (category: LogCategory, enabled: boolean = true) => 
      LoggerConfig.enableCategory(category, enabled),
      
    // Context controls
    enableContext: (context: LogContext, enabled: boolean = true) => 
      LoggerConfig.enableContext(context, enabled),
      
    // Level controls  
    setLevel: (level: keyof typeof LogLevel) => 
      LoggerConfig.setLevel(LogLevel[level as keyof typeof LogLevel]),
    
    // Bulk controls  
    disableAllCategories: () => {
      Object.values(LogCategory).forEach(cat => 
        LoggerConfig.enableCategory(cat as LogCategory, false));
    },
    
    enableAllCategories: () => {
      Object.values(LogCategory).forEach(cat => 
        LoggerConfig.enableCategory(cat as LogCategory, true));
    },
    
    disableAllContexts: () => {
      Object.values(LogContext).forEach(ctx => 
        LoggerConfig.enableContext(ctx as LogContext, false));
    },
    
    enableAllContexts: () => {
      Object.values(LogContext).forEach(ctx => 
        LoggerConfig.enableContext(ctx as LogContext, true));
    },
    
    // Focus on specific contexts
    focusContexts: (contexts: LogContext | LogContext[]) => {
      const contextArray = Array.isArray(contexts) ? contexts : [contexts];
      
      // Always enable NONE context
      LoggerConfig.enabledContexts[LogContext.NONE] = true;
      
      // Disable all other contexts
      Object.values(LogContext).forEach(ctx => {
        if (ctx !== LogContext.NONE && !contextArray.includes(ctx as LogContext)) {
          LoggerConfig.enableContext(ctx as LogContext, false);
        }
      });
      
      // Enable specified contexts
      contextArray.forEach(ctx => {
        LoggerConfig.enableContext(ctx, true);
      });
      
      console.log(`Now focusing on contexts: ${contextArray.join(', ')}`);
    },
    
    // Current configuration
    getConfig: () => ({
      level: LogLevel[LoggerConfig.level],
      enabledCategories: {...LoggerConfig.enabledCategories},
      enabledContexts: {...LoggerConfig.enabledContexts}
    })
  };
  
  console.log('Game logging initialized. Control with window.logging methods.');
}

// Export a default instance for convenience
export default Logger; 