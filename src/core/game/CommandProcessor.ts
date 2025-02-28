/**
 * Command Processor Implementation
 * Handles executing commands and maintaining command history
 */

import { Command, CommandResult } from './GameInterfaces';
import { EventEmitter, GameEvent } from '../events';

/**
 * Command processor for handling game commands
 */
export class CommandProcessor {
  /**
   * History of executed commands
   */
  private commandHistory: Command[] = [];
  
  /**
   * Maximum history size
   */
  private maxHistorySize: number = 100;
  
  /**
   * Event emitter for broadcasting command events
   */
  private eventEmitter?: EventEmitter;
  
  /**
   * Create a new command processor
   * @param eventEmitter Optional event emitter for command events
   */
  constructor(eventEmitter?: EventEmitter) {
    this.eventEmitter = eventEmitter;
  }
  
  /**
   * Execute a command
   * @param command Command to execute
   * @returns Result of the command execution
   */
  public executeCommand(command: Command): CommandResult {
    // Validate the command if it has a validate method
    if (command.validate && !command.validate()) {
      const result: CommandResult = {
        success: false,
        message: `Command validation failed: ${command.type}`
      };
      
      // Emit command failed event
      this.emitCommandEvent('command_failed', command, result);
      
      return result;
    }
    
    // Execute the command
    const result = command.execute();
    
    // If successful, add to history
    if (result.success) {
      this.addToHistory(command);
      
      // Emit command executed event
      this.emitCommandEvent('command_executed', command, result);
    } else {
      // Emit command failed event
      this.emitCommandEvent('command_failed', command, result);
    }
    
    return result;
  }
  
  /**
   * Undo the last command that supports undoing
   * @returns Result of the undo operation
   */
  public undoLastCommand(): CommandResult {
    // Find the last command that supports undo
    for (let i = this.commandHistory.length - 1; i >= 0; i--) {
      const command = this.commandHistory[i];
      
      if (command.undo) {
        // Remove from history
        this.commandHistory.splice(i, 1);
        
        // Execute undo
        const result = command.undo();
        
        // Emit undo event
        if (result.success) {
          this.emitCommandEvent('command_undone', command, result);
        }
        
        return result;
      }
    }
    
    // No undoable command found
    return {
      success: false,
      message: 'No undoable command in history'
    };
  }
  
  /**
   * Get the command history
   * @returns Array of commands
   */
  public getCommandHistory(): Command[] {
    return [...this.commandHistory];
  }
  
  /**
   * Clear the command history
   */
  public clearHistory(): void {
    this.commandHistory = [];
  }
  
  /**
   * Add a command to the history
   * @param command Command to add
   */
  private addToHistory(command: Command): void {
    // Add to history
    this.commandHistory.push(command);
    
    // Trim if too large
    if (this.commandHistory.length > this.maxHistorySize) {
      this.commandHistory.shift();
    }
  }
  
  /**
   * Emit a command event
   * @param eventType Event type
   * @param command Command that was executed
   * @param result Result of the command
   */
  private emitCommandEvent(
    eventType: string, 
    command: Command, 
    result: CommandResult
  ): void {
    if (!this.eventEmitter) {
      return;
    }
    
    const event: GameEvent = {
      id: `${eventType}_${command.id}_${Date.now()}`,
      type: eventType,
      timestamp: Date.now(),
      payload: {
        commandId: command.id,
        commandType: command.type,
        result
      }
    };
    
    this.eventEmitter.emit(event);
  }
} 