import { GameTime } from './GameTime';
import { EventEmitter } from '../interfaces';
import { GameEventType, createGameEvent } from '../events/GameEvents';

/**
 * Types of time-tracked activities
 */
export enum TimeTrackedActivityType {
  RESOURCE_COLLECTION = 'resource_collection',
  RESOURCE_PRODUCTION = 'resource_production',
  UPGRADE_EFFECT = 'upgrade_effect',
  OFFLINE_PROGRESS = 'offline_progress',
  ACHIEVEMENT = 'achievement',
  GAMEPLAY_SESSION = 'gameplay_session',
  MILESTONE = 'milestone'
}

/**
 * Interface for timestamp entries
 */
export interface TimestampEntry {
  id: string;
  type: TimeTrackedActivityType;
  timestamp: number;
  data?: any;
}

/**
 * Interface for time tracking statistics
 */
export interface TimeStatistics {
  totalPlayTime: number;
  sessionStartTime: number;
  currentSessionDuration: number;
  longestSession: number;
  averageSessionLength: number;
  sessionCount: number;
  lastOfflineTime: number;
  lastOfflineDuration: number;
}

/**
 * TimeManager handles timestamp tracking and time-related statistics
 */
export class TimeManager {
  // Game time service
  private gameTime: GameTime;
  
  // Event emitter
  private eventEmitter?: EventEmitter;
  
  // Map of timestamps by ID
  private timestamps: Map<string, TimestampEntry> = new Map();
  
  // Time statistics
  private statistics: TimeStatistics = {
    totalPlayTime: 0,
    sessionStartTime: 0,
    currentSessionDuration: 0,
    longestSession: 0,
    averageSessionLength: 0,
    sessionCount: 0,
    lastOfflineTime: 0,
    lastOfflineDuration: 0
  };
  
  // Session tracking timer
  private sessionTimer?: NodeJS.Timeout;
  
  // Session update interval (ms)
  private readonly SESSION_UPDATE_INTERVAL = 60 * 1000; // 1 minute
  
  /**
   * Create a new time manager
   * @param gameTime GameTime service
   * @param eventEmitter Optional event emitter
   */
  constructor(gameTime: GameTime, eventEmitter?: EventEmitter) {
    this.gameTime = gameTime;
    this.eventEmitter = eventEmitter;
    
    // Start session tracking
    this.startSession();
  }
  
  /**
   * Get the game time service
   */
  public getGameTime(): GameTime {
    return this.gameTime;
  }
  
  /**
   * Set a timestamp
   * @param id Unique identifier for the timestamp
   * @param type Type of activity
   * @param data Optional associated data
   * @param timestamp Optional specific timestamp (defaults to current game time)
   */
  public setTimestamp(
    id: string, 
    type: TimeTrackedActivityType, 
    data?: any, 
    timestamp?: number
  ): void {
    const entry: TimestampEntry = {
      id,
      type,
      timestamp: timestamp ?? this.gameTime.getTime(),
      data
    };
    
    this.timestamps.set(id, entry);
  }
  
  /**
   * Get a timestamp by ID
   * @param id Timestamp identifier
   * @returns Timestamp entry or undefined if not found
   */
  public getTimestamp(id: string): TimestampEntry | undefined {
    return this.timestamps.get(id);
  }
  
  /**
   * Get all timestamps of a specific type
   * @param type Type of timestamps to retrieve
   * @returns Array of timestamp entries
   */
  public getTimestampsByType(type: TimeTrackedActivityType): TimestampEntry[] {
    return Array.from(this.timestamps.values())
      .filter(entry => entry.type === type);
  }
  
  /**
   * Delete a timestamp
   * @param id Timestamp identifier to remove
   * @returns Whether the timestamp was removed
   */
  public deleteTimestamp(id: string): boolean {
    return this.timestamps.delete(id);
  }
  
  /**
   * Get the time elapsed since a timestamp
   * @param id Timestamp identifier
   * @returns Elapsed time in milliseconds, or undefined if timestamp not found
   */
  public getElapsedTime(id: string): number | undefined {
    const entry = this.timestamps.get(id);
    
    if (!entry) {
      return undefined;
    }
    
    return this.gameTime.getElapsedTime(entry.timestamp);
  }
  
  /**
   * Update an existing timestamp to current time
   * @param id Timestamp identifier
   * @returns The updated timestamp entry, or undefined if not found
   */
  public updateTimestamp(id: string): TimestampEntry | undefined {
    const entry = this.timestamps.get(id);
    
    if (!entry) {
      return undefined;
    }
    
    entry.timestamp = this.gameTime.getTime();
    this.timestamps.set(id, entry);
    
    return entry;
  }
  
  /**
   * Get the most recent timestamp of a specific type
   * @param type Activity type
   * @returns The most recent timestamp entry, or undefined if none found
   */
  public getMostRecentTimestamp(type: TimeTrackedActivityType): TimestampEntry | undefined {
    const entries = this.getTimestampsByType(type);
    
    if (entries.length === 0) {
      return undefined;
    }
    
    // Sort by timestamp (newest first)
    entries.sort((a, b) => b.timestamp - a.timestamp);
    
    return entries[0];
  }
  
  /**
   * Get time statistics
   */
  public getStatistics(): TimeStatistics {
    // Update current session duration
    this.statistics.currentSessionDuration = 
      this.gameTime.getElapsedTime(this.statistics.sessionStartTime);
    
    return { ...this.statistics };
  }
  
  /**
   * Start a new gameplay session
   */
  private startSession(): void {
    // Record session start time
    this.statistics.sessionStartTime = this.gameTime.getTime();
    this.statistics.sessionCount++;
    
    // Create a timestamp for this session
    const sessionId = `session_${this.statistics.sessionCount}`;
    this.setTimestamp(sessionId, TimeTrackedActivityType.GAMEPLAY_SESSION);
    
    // Start session timer to periodically update statistics
    this.startSessionTimer();
    
    // If we have a recorded offline time, calculate the offline duration
    if (this.statistics.lastOfflineTime > 0) {
      this.statistics.lastOfflineDuration = 
        this.statistics.sessionStartTime - this.statistics.lastOfflineTime;
        
      // Log offline duration
      if (this.eventEmitter && this.statistics.lastOfflineDuration > 0) {
        this.eventEmitter.emit(createGameEvent(GameEventType.OFFLINE_PROGRESS_CALCULATED, {
          offlineDuration: this.statistics.lastOfflineDuration,
          offlineStart: this.statistics.lastOfflineTime,
          offlineEnd: this.statistics.sessionStartTime
        }));
      }
    }
  }
  
  /**
   * End the current gameplay session
   */
  public endSession(): void {
    // Stop the session timer
    this.stopSessionTimer();
    
    // Update session stats
    const sessionDuration = this.gameTime.getElapsedTime(this.statistics.sessionStartTime);
    this.statistics.totalPlayTime += sessionDuration;
    
    // Update longest session if this one was longer
    if (sessionDuration > this.statistics.longestSession) {
      this.statistics.longestSession = sessionDuration;
    }
    
    // Update average session length
    this.statistics.averageSessionLength = 
      this.statistics.totalPlayTime / this.statistics.sessionCount;
    
    // Record when we went offline
    this.statistics.lastOfflineTime = this.gameTime.getTime();
  }
  
  /**
   * Process offline time when starting a new session
   * @param callback Function to process offline progress
   */
  public processOfflineTime(callback: (offlineDuration: number) => void): void {
    if (this.statistics.lastOfflineDuration > 0) {
      // Call the offline progress callback
      callback(this.statistics.lastOfflineDuration);
      
      // Reset the offline duration
      this.statistics.lastOfflineDuration = 0;
    }
  }
  
  /**
   * Start the session timer
   */
  private startSessionTimer(): void {
    // Clear any existing timer
    this.stopSessionTimer();
    
    // Start a new timer to update session stats periodically
    this.sessionTimer = setInterval(() => {
      // Update current session duration
      this.statistics.currentSessionDuration = 
        this.gameTime.getElapsedTime(this.statistics.sessionStartTime);
        
      // Update total play time
      this.statistics.totalPlayTime += this.SESSION_UPDATE_INTERVAL;
    }, this.SESSION_UPDATE_INTERVAL);
  }
  
  /**
   * Stop the session timer
   */
  private stopSessionTimer(): void {
    if (this.sessionTimer) {
      clearInterval(this.sessionTimer);
      this.sessionTimer = undefined;
    }
  }
  
  /**
   * Format a timestamp entry to a human-readable string
   * @param entry Timestamp entry to format
   * @returns Formatted string
   */
  public formatTimestampEntry(entry: TimestampEntry): string {
    const time = this.gameTime.formatTime(entry.timestamp);
    return `${entry.type} (${entry.id}): ${time}`;
  }
  
  /**
   * Format an activity duration
   * @param type Activity type
   * @param id Optional specific activity ID
   * @returns Formatted duration string or undefined if not found
   */
  public formatActivityDuration(type: TimeTrackedActivityType, id?: string): string | undefined {
    let entry: TimestampEntry | undefined;
    
    if (id) {
      // Get specific activity
      entry = this.getTimestamp(id);
      if (!entry || entry.type !== type) {
        return undefined;
      }
    } else {
      // Get most recent of this type
      entry = this.getMostRecentTimestamp(type);
      if (!entry) {
        return undefined;
      }
    }
    
    const duration = this.gameTime.getElapsedTime(entry.timestamp);
    return this.gameTime.formatElapsedTime(duration);
  }
  
  /**
   * Clean up resources
   */
  public cleanup(): void {
    this.stopSessionTimer();
  }
  
  /**
   * Reset time statistics
   */
  public resetStatistics(): void {
    this.statistics = {
      totalPlayTime: 0,
      sessionStartTime: this.gameTime.getTime(),
      currentSessionDuration: 0,
      longestSession: 0,
      averageSessionLength: 0,
      sessionCount: 1,
      lastOfflineTime: 0,
      lastOfflineDuration: 0
    };
  }
  
  /**
   * Save time manager state
   * @returns Serialized state
   */
  public saveState(): string {
    // Update session duration before saving
    this.statistics.currentSessionDuration = 
      this.gameTime.getElapsedTime(this.statistics.sessionStartTime);
    
    const state = {
      timestamps: Array.from(this.timestamps.entries()),
      statistics: this.statistics
    };
    
    return JSON.stringify(state);
  }
  
  /**
   * Restore time manager state
   * @param serializedState Serialized state string
   * @returns Whether the state was successfully restored
   */
  public restoreState(serializedState: string): boolean {
    try {
      const state = JSON.parse(serializedState);
      
      // Restore timestamps
      if (state.timestamps) {
        this.timestamps = new Map(state.timestamps);
      }
      
      // Restore statistics
      if (state.statistics) {
        this.statistics = state.statistics;
        
        // Update the session start time to now
        this.statistics.sessionStartTime = this.gameTime.getTime();
      }
      
      return true;
    } catch (error) {
      console.error('Failed to restore TimeManager state:', error);
      return false;
    }
  }
} 