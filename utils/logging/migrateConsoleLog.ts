import { Logger } from './Logger';

/**
 * A utility module to assist with migrating from console.log to the Logger system
 * This provides a drop-in replacement with the same API as console but uses
 * our structured Logger system underneath.
 */

// Create a Logger instance that will be used by this console adapter
const consoleLogger = new Logger('ConsoleAdapter');

/**
 * A drop-in replacement for console.log that uses our Logger
 * Usage: Replace `import console from '../logging/migrateConsoleLog';` 
 * at the top of files that still use console.log
 */
export default {
  log: (...args: any[]) => {
    consoleLogger.info(args.map(arg => 
      typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
    ).join(' '));
  },
  
  info: (...args: any[]) => {
    consoleLogger.info(args.map(arg => 
      typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
    ).join(' '));
  },
  
  warn: (...args: any[]) => {
    consoleLogger.warn(args.map(arg => 
      typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
    ).join(' '));
  },
  
  error: (...args: any[]) => {
    consoleLogger.error(args.map(arg => 
      typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
    ).join(' '));
  },
  
  debug: (...args: any[]) => {
    consoleLogger.debug(args.map(arg => 
      typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
    ).join(' '));
  },
  
  trace: (...args: any[]) => {
    consoleLogger.trace(args.map(arg => 
      typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
    ).join(' '));
  }
}; 