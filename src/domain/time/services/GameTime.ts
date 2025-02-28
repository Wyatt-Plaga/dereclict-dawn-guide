import { TimeEffect } from '../models/TimeInterfaces';

/**
 * GameTime service
 * Handles time-related functionality including current time, time scaling, and time-based effects
 */
export class GameTime {
  // Current server time 
  private currentTime: number;
  
  // Time scale factor (1.0 = normal speed)
  private timeScale: number = 1.0;
  
  // Paused state
  private isPaused: boolean = false;
  
  // Last time the game was updated
  private lastUpdateTime: number;
  
  // Map of time-based effects with their expiry times
  private timeEffects: Map<string, TimeEffect> = new Map();
  
  // Callbacks for time change events
  private timeChangeCallbacks: Array<(delta: number) => void> = [];
  
  /**
   * Create a new game time service
   * @param initialTime Optional initial time (defaults to current time)
   * @param timeScale Optional time scale (defaults to 1.0)
   */
  constructor(initialTime?: number, timeScale: number = 1.0) {
    this.currentTime = initialTime ?? Date.now();
    this.lastUpdateTime = this.currentTime;
    this.timeScale = timeScale;
  }
  
  /**
   * Get the current game time in milliseconds
   */
  public getTime(): number {
    return this.currentTime;
  }
  
  /**
   * Get the current time scale factor
   */
  public getTimeScale(): number {
    return this.timeScale;
  }
  
  /**
   * Set the time scale factor
   * @param scale New time scale factor (1.0 = normal speed)
   */
  public setTimeScale(scale: number): void {
    // Update the time before changing the scale
    this.update();
    this.timeScale = Math.max(0, scale); // Prevent negative time scale
  }
  
  /**
   * Check if the game time is paused
   */
  public isPausedState(): boolean {
    return this.isPaused;
  }
  
  /**
   * Pause the game time
   */
  public pause(): void {
    if (!this.isPaused) {
      // Update the time before pausing
      this.update();
      this.isPaused = true;
    }
  }
  
  /**
   * Resume the game time
   */
  public resume(): void {
    if (this.isPaused) {
      // Set the last update time to now when resuming
      this.lastUpdateTime = Date.now();
      this.isPaused = false;
    }
  }
  
  /**
   * Update the game time based on real time elapsed
   * @param forceTime Optional time to set (for testing)
   * @returns The amount of game time elapsed since the last update
   */
  public update(forceTime?: number): number {
    if (this.isPaused) {
      return 0;
    }
    
    const realNow = forceTime ?? Date.now();
    const realDelta = realNow - this.lastUpdateTime;
    
    // Apply time scale to get game time delta
    const gameDelta = realDelta * this.timeScale;
    
    // Update current time
    this.currentTime += gameDelta;
    this.lastUpdateTime = realNow;
    
    // Update time effects
    this.updateTimeEffects(gameDelta);
    
    // Notify listeners
    this.notifyTimeChange(gameDelta);
    
    return gameDelta;
  }
  
  /**
   * Format a timestamp as a readable string
   * @param timestamp Optional timestamp (defaults to current game time)
   */
  public formatTime(timestamp?: number): string {
    const date = new Date(timestamp ?? this.currentTime);
    return date.toLocaleString();
  }
  
  /**
   * Get elapsed time between a start time and an end time
   * @param startTime Start timestamp
   * @param endTime Optional end timestamp (defaults to current game time)
   */
  public getElapsedTime(startTime: number, endTime?: number): number {
    const end = endTime ?? this.currentTime;
    return end - startTime;
  }
  
  /**
   * Format elapsed time in a human-readable format
   * @param milliseconds Elapsed time in milliseconds
   */
  public formatElapsedTime(milliseconds: number): string {
    if (milliseconds < 0) {
      return '0s';
    }
    
    const seconds = Math.floor(milliseconds / 1000) % 60;
    const minutes = Math.floor(milliseconds / (1000 * 60)) % 60;
    const hours = Math.floor(milliseconds / (1000 * 60 * 60)) % 24;
    const days = Math.floor(milliseconds / (1000 * 60 * 60 * 24));
    
    const parts: string[] = [];
    
    if (days > 0) {
      parts.push(`${days}d`);
    }
    
    if (hours > 0 || days > 0) {
      parts.push(`${hours}h`);
    }
    
    if (minutes > 0 || hours > 0 || days > 0) {
      parts.push(`${minutes}m`);
    }
    
    if (seconds > 0 || minutes > 0 || hours > 0 || days > 0) {
      parts.push(`${seconds}s`);
    }
    
    if (parts.length === 0) {
      return '<1s';
    }
    
    return parts.join(' ');
  }
  
  /**
   * Add a time-based effect
   * @param id Unique identifier for the effect
   * @param duration Duration in milliseconds
   * @param onExpire Callback to execute when the effect expires
   * @param data Optional data to associate with the effect
   */
  public addTimeEffect(id: string, duration: number, onExpire: () => void, data?: any): void {
    const expireTime = this.currentTime + duration;
    
    this.timeEffects.set(id, {
      id,
      expireTime,
      onExpire,
      data
    });
  }
  
  /**
   * Remove a time-based effect
   * @param id Effect ID
   */
  public removeTimeEffect(id: string): boolean {
    return this.timeEffects.delete(id);
  }
  
  /**
   * Check if a time effect exists
   * @param id Effect ID
   */
  public hasTimeEffect(id: string): boolean {
    return this.timeEffects.has(id);
  }
  
  /**
   * Get remaining time for an effect
   * @param id Effect ID
   * @returns Remaining time in milliseconds, or undefined if effect doesn't exist
   */
  public getTimeEffectRemaining(id: string): number | undefined {
    const effect = this.timeEffects.get(id);
    
    if (!effect) {
      return undefined;
    }
    
    return Math.max(0, effect.expireTime - this.currentTime);
  }
  
  /**
   * Update time effects based on elapsed time
   * @param delta Elapsed game time in milliseconds
   */
  private updateTimeEffects(delta: number): void {
    if (delta <= 0 || this.timeEffects.size === 0) {
      return;
    }
    
    // Find expired effects
    const expiredEffects: TimeEffect[] = [];
    
    // Convert Map values to array before iterating
    const effectsArray = Array.from(this.timeEffects.values());
    
    for (const effect of effectsArray) {
      if (effect.expireTime <= this.currentTime) {
        expiredEffects.push(effect);
      }
    }
    
    // Process expired effects
    for (const effect of expiredEffects) {
      try {
        // Execute expiry callback
        effect.onExpire();
      } catch (error) {
        console.error(`Error in time effect expiry callback for ${effect.id}:`, error);
      }
      
      // Remove the effect
      this.timeEffects.delete(effect.id);
    }
  }
  
  /**
   * Register a callback for time change events
   * @param callback Function to call when time changes
   */
  public onTimeChange(callback: (delta: number) => void): void {
    if (!this.timeChangeCallbacks.includes(callback)) {
      this.timeChangeCallbacks.push(callback);
    }
  }
  
  /**
   * Remove a time change callback
   * @param callback Callback to remove
   */
  public offTimeChange(callback: (delta: number) => void): void {
    const index = this.timeChangeCallbacks.indexOf(callback);
    
    if (index !== -1) {
      this.timeChangeCallbacks.splice(index, 1);
    }
  }
  
  /**
   * Notify all registered callbacks about a time change
   * @param delta Time elapsed in milliseconds
   */
  private notifyTimeChange(delta: number): void {
    if (delta <= 0 || this.timeChangeCallbacks.length === 0) {
      return;
    }
    
    for (const callback of this.timeChangeCallbacks) {
      try {
        callback(delta);
      } catch (error) {
        console.error('Error in time change callback:', error);
      }
    }
  }
} 