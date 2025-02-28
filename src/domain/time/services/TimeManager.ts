import { GameTime } from './GameTime';
import { TimeStatistics, TimestampEntry, TimeTrackedActivityType } from '../models/TimeInterfaces';
import { EventEmitter, GameEvent } from '../../../core/events';

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
    
    // Emit event if event emitter is available
    if (this.eventEmitter) {
      this.eventEmitter.emit({
        id: `timestamp_set_${id}`,
        type: 'timestamp_set',
        timestamp: this.gameTime.getTime(),
        payload: { entry }
      });
    }
  }
  
  /**
   * Get a timestamp by ID
   * @param id Timestamp ID
   */
  public getTimestamp(id: string): TimestampEntry | undefined {
    return this.timestamps.get(id);
  }
  
  /**
   * Get all timestamps of a specific type
   * @param type Activity type
   */
  public getTimestampsByType(type: TimeTrackedActivityType): TimestampEntry[] {
    return Array.from(this.timestamps.values())
      .filter(entry => entry.type === type);
  }
  
  /**
   * Delete a timestamp
   * @param id Timestamp ID
   */
  public deleteTimestamp(id: string): boolean {
    return this.timestamps.delete(id);
  }
  
  /**
   * Get elapsed time since a timestamp
   * @param id Timestamp ID
   * @returns Elapsed time in milliseconds, or undefined if timestamp doesn't exist
   */
  public getElapsedTime(id: string): number | undefined {
    const entry = this.getTimestamp(id);
    
    if (!entry) {
      return undefined;
    }
    
    return this.gameTime.getElapsedTime(entry.timestamp);
  }
  
  /**
   * Update a timestamp to the current time
   * @param id Timestamp ID
   */
  public updateTimestamp(id: string): TimestampEntry | undefined {
    const entry = this.getTimestamp(id);
    
    if (!entry) {
      return undefined;
    }
    
    // Update timestamp to current time
    entry.timestamp = this.gameTime.getTime();
    this.timestamps.set(id, entry);
    
    return entry;
  }
  
  /**
   * Get the most recent timestamp of a specific type
   * @param type Activity type
   */
  public getMostRecentTimestamp(type: TimeTrackedActivityType): TimestampEntry | undefined {
    const entries = this.getTimestampsByType(type);
    
    if (entries.length === 0) {
      return undefined;
    }
    
    // Sort by timestamp (descending) and get the first one
    return entries.sort((a, b) => b.timestamp - a.timestamp)[0];
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
   * Start a new session
   */
  private startSession(): void {
    const now = this.gameTime.getTime();
    
    // Increment session count
    this.statistics.sessionCount++;
    
    // Set session start time
    this.statistics.sessionStartTime = now;
    
    // Reset current session duration
    this.statistics.currentSessionDuration = 0;
    
    // Start session timer
    this.startSessionTimer();
    
    // Set timestamp for session start
    this.setTimestamp(
      `session_${this.statistics.sessionCount}`,
      TimeTrackedActivityType.GAMEPLAY_SESSION,
      { sessionNumber: this.statistics.sessionCount }
    );
    
    // Emit event if event emitter is available
    if (this.eventEmitter) {
      this.eventEmitter.emit({
        id: `session_start_${this.statistics.sessionCount}`,
        type: 'session_start',
        timestamp: now,
        payload: { 
          sessionNumber: this.statistics.sessionCount,
          statistics: this.getStatistics()
        }
      });
    }
  }
  
  /**
   * End the current session
   */
  public endSession(): void {
    // Stop session timer
    this.stopSessionTimer();
    
    // Calculate final session duration
    const sessionDuration = this.gameTime.getElapsedTime(this.statistics.sessionStartTime);
    
    // Update total play time
    this.statistics.totalPlayTime += sessionDuration;
    
    // Update longest session if this one was longer
    if (sessionDuration > this.statistics.longestSession) {
      this.statistics.longestSession = sessionDuration;
    }
    
    // Update average session length
    this.statistics.averageSessionLength = 
      this.statistics.totalPlayTime / this.statistics.sessionCount;
    
    // Set last offline time
    this.statistics.lastOfflineTime = this.gameTime.getTime();
    
    // Emit event if event emitter is available
    if (this.eventEmitter) {
      this.eventEmitter.emit({
        id: `session_end_${this.statistics.sessionCount}`,
        type: 'session_end',
        timestamp: this.gameTime.getTime(),
        payload: { 
          sessionNumber: this.statistics.sessionCount,
          duration: sessionDuration,
          statistics: this.getStatistics()
        }
      });
    }
  }
  
  /**
   * Process offline time since last session
   * @param callback Function to call with offline duration
   */
  public processOfflineTime(callback: (offlineDuration: number) => void): void {
    if (this.statistics.lastOfflineTime === 0) {
      return;
    }
    
    const now = this.gameTime.getTime();
    const offlineDuration = now - this.statistics.lastOfflineTime;
    
    // Store offline duration
    this.statistics.lastOfflineDuration = offlineDuration;
    
    // Call callback with offline duration
    callback(offlineDuration);
  }
  
  /**
   * Start the session tracking timer
   */
  private startSessionTimer(): void {
    // Clear any existing timer
    this.stopSessionTimer();
    
    // Start a new timer
    this.sessionTimer = setInterval(() => {
      // Update current session duration
      this.statistics.currentSessionDuration = 
        this.gameTime.getElapsedTime(this.statistics.sessionStartTime);
      
      // Update total play time
      this.statistics.totalPlayTime += this.SESSION_UPDATE_INTERVAL;
      
      // Emit event if event emitter is available
      if (this.eventEmitter) {
        this.eventEmitter.emit({
          id: `session_update_${Date.now()}`,
          type: 'session_update',
          timestamp: this.gameTime.getTime(),
          payload: { statistics: this.getStatistics() }
        });
      }
    }, this.SESSION_UPDATE_INTERVAL);
  }
  
  /**
   * Stop the session tracking timer
   */
  private stopSessionTimer(): void {
    if (this.sessionTimer) {
      clearInterval(this.sessionTimer);
      this.sessionTimer = undefined;
    }
  }
  
  /**
   * Format a timestamp entry as a readable string
   * @param entry Timestamp entry
   */
  public formatTimestampEntry(entry: TimestampEntry): string {
    const timeString = this.gameTime.formatTime(entry.timestamp);
    return `${entry.type} (${entry.id}): ${timeString}`;
  }
  
  /**
   * Format the duration of an activity
   * @param type Activity type
   * @param id Optional specific timestamp ID
   */
  public formatActivityDuration(type: TimeTrackedActivityType, id?: string): string | undefined {
    let timestamp: TimestampEntry | undefined;
    
    if (id) {
      // Get specific timestamp
      timestamp = this.getTimestamp(id);
    } else {
      // Get most recent timestamp of the type
      timestamp = this.getMostRecentTimestamp(type);
    }
    
    if (!timestamp) {
      return undefined;
    }
    
    const elapsedTime = this.gameTime.getElapsedTime(timestamp.timestamp);
    return this.gameTime.formatElapsedTime(elapsedTime);
  }
  
  /**
   * Clean up resources
   */
  public cleanup(): void {
    this.stopSessionTimer();
  }
  
  /**
   * Reset statistics
   */
  public resetStatistics(): void {
    this.statistics = {
      totalPlayTime: 0,
      sessionStartTime: this.gameTime.getTime(),
      currentSessionDuration: 0,
      longestSession: 0,
      averageSessionLength: 0,
      sessionCount: 0,
      lastOfflineTime: 0,
      lastOfflineDuration: 0
    };
    
    // Clear timestamps
    this.timestamps.clear();
    
    // Start a new session
    this.startSession();
  }
  
  /**
   * Serialize state to JSON
   */
  public saveState(): string {
    return JSON.stringify({
      statistics: this.statistics,
      timestamps: Array.from(this.timestamps.entries())
    });
  }
  
  /**
   * Restore state from JSON
   * @param serializedState Serialized state
   */
  public restoreState(serializedState: string): boolean {
    try {
      const state = JSON.parse(serializedState);
      
      // Restore statistics
      if (state.statistics) {
        this.statistics = state.statistics;
      }
      
      // Restore timestamps
      if (state.timestamps && Array.isArray(state.timestamps)) {
        this.timestamps = new Map(state.timestamps);
      }
      
      return true;
    } catch (error) {
      console.error('Error restoring TimeManager state:', error);
      return false;
    }
  }
} 