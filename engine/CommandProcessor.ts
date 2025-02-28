import { Command, CommandProcessor, CommandResult } from './interfaces';

/**
 * Default implementation of CommandProcessor
 * Manages command execution, history, undo, and redo capabilities
 */
export class DefaultCommandProcessor implements CommandProcessor {
  // Command history
  private history: Command[] = [];
  
  // Current position in history (for undo/redo)
  private historyIndex: number = -1;
  
  // Maximum size of command history
  private maxHistorySize: number = 100;
  
  /**
   * Execute a command
   * @param command Command to execute
   */
  public execute(command: Command): CommandResult {
    // Execute the command
    const result = command.execute();
    
    // If command execution was successful
    if (result.success) {
      // If we're not at the end of history, truncate
      if (this.historyIndex < this.history.length - 1) {
        this.history = this.history.slice(0, this.historyIndex + 1);
      }
      
      // Add command to history
      this.history.push(command);
      this.historyIndex = this.history.length - 1;
      
      // Trim history if it exceeds max size
      if (this.history.length > this.maxHistorySize) {
        this.history.shift();
        this.historyIndex--;
      }
    }
    
    return result;
  }
  
  /**
   * Undo the most recent command
   */
  public undo(): CommandResult {
    // Check if we can undo
    if (!this.canUndo()) {
      return {
        success: false,
        message: 'Nothing to undo'
      };
    }
    
    // Get the command to undo
    const command = this.history[this.historyIndex];
    
    // Check if command has undo method
    if (!command.undo) {
      return {
        success: false,
        message: `Command ${command.type} cannot be undone`
      };
    }
    
    // Execute undo
    const result = command.undo();
    
    // If undo was successful, decrement history index
    if (result.success) {
      this.historyIndex--;
    }
    
    return result;
  }
  
  /**
   * Redo a previously undone command
   */
  public redo(): CommandResult {
    // Check if we can redo
    if (!this.canRedo()) {
      return {
        success: false,
        message: 'Nothing to redo'
      };
    }
    
    // Get the command to redo
    const command = this.history[this.historyIndex + 1];
    
    // Execute command
    const result = command.execute();
    
    // If execution was successful, increment history index
    if (result.success) {
      this.historyIndex++;
    }
    
    return result;
  }
  
  /**
   * Check if commands can be undone
   */
  public canUndo(): boolean {
    return this.historyIndex >= 0 && this.history.length > 0;
  }
  
  /**
   * Check if commands can be redone
   */
  public canRedo(): boolean {
    return this.historyIndex < this.history.length - 1;
  }
  
  /**
   * Get command history
   */
  public getHistory(): Command[] {
    return [...this.history];
  }
  
  /**
   * Clear command history
   */
  public clearHistory(): void {
    this.history = [];
    this.historyIndex = -1;
  }
  
  /**
   * Set maximum history size
   * @param size Maximum number of commands to keep in history
   */
  public setMaxHistorySize(size: number): void {
    if (size < 1) {
      throw new Error('History size must be at least 1');
    }
    
    this.maxHistorySize = size;
    
    // Trim history if needed
    if (this.history.length > this.maxHistorySize) {
      const excess = this.history.length - this.maxHistorySize;
      this.history = this.history.slice(excess);
      this.historyIndex = Math.max(0, this.historyIndex - excess);
    }
  }
} 