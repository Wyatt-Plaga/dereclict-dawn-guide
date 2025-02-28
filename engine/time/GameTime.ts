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
    
    // Calculate scaled delta
    const scaledDelta = realDelta * this.timeScale;
    
    // Update times
    this.lastUpdateTime = realNow;
    this.currentTime += scaledDelta;
    
    // Update time effects
    this.updateTimeEffects(scaledDelta);
    
    // Notify time change listeners
    this.notifyTimeChange(scaledDelta);
    
    return scaledDelta;
  }
  
  /**
   * Format a timestamp into a human-readable string
   * @param timestamp Timestamp to format (defaults to current game time)
   * @returns Formatted time string
   */
  public formatTime(timestamp?: number): string {
    const date = new Date(timestamp ?? this.currentTime);
    return date.toLocaleString();
  }
  
  /**
   * Calculate elapsed time between two timestamps
   * @param startTime Start timestamp
   * @param endTime End timestamp (defaults to current game time)
   * @returns Elapsed time in milliseconds
   */
  public getElapsedTime(startTime: number, endTime?: number): number {
    return (endTime ?? this.currentTime) - startTime;
  }
  
  /**
   * Format an elapsed time into a human-readable string
   * @param milliseconds Time in milliseconds
   * @returns Formatted duration string (e.g. "2h 30m 15s")
   */
  public formatElapsedTime(milliseconds: number): string {
    if (milliseconds < 1000) {
      return `${milliseconds}ms`;
    }
    
    const seconds = Math.floor(milliseconds / 1000) % 60;
    const minutes = Math.floor(milliseconds / (1000 * 60)) % 60;
    const hours = Math.floor(milliseconds / (1000 * 60 * 60)) % 24;
    const days = Math.floor(milliseconds / (1000 * 60 * 60 * 24));
    
    let result = '';
    
    if (days > 0) {
      result += `${days}d `;
    }
    
    if (hours > 0 || days > 0) {
      result += `${hours}h `;
    }
    
    if (minutes > 0 || hours > 0 || days > 0) {
      result += `${minutes}m `;
    }
    
    result += `${seconds}s`;
    
    return result;
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
   * @param id Effect identifier
   * @returns Whether the effect was removed
   */
  public removeTimeEffect(id: string): boolean {
    return this.timeEffects.delete(id);
  }
  
  /**
   * Check if a time effect exists
   * @param id Effect identifier
   */
  public hasTimeEffect(id: string): boolean {
    return this.timeEffects.has(id);
  }
  
  /**
   * Get time remaining for a specific effect
   * @param id Effect identifier
   * @returns Time remaining in milliseconds, or undefined if the effect doesn't exist
   */
  public getTimeEffectRemaining(id: string): number | undefined {
    const effect = this.timeEffects.get(id);
    
    if (effect) {
      return Math.max(0, effect.expireTime - this.currentTime);
    }
    
    return undefined;
  }
  
  /**
   * Update all time effects based on elapsed game time
   * @param delta Elapsed game time in milliseconds
   */
  private updateTimeEffects(delta: number): void {
    if (delta <= 0 || this.timeEffects.size === 0) {
      return;
    }
    
    // Check which effects have expired
    const expiredEffects: TimeEffect[] = [];
    
    // Use Array.from to convert the Map values iterator to an array
    Array.from(this.timeEffects.values()).forEach(effect => {
      if (this.currentTime >= effect.expireTime) {
        expiredEffects.push(effect);
      }
    });
    
    // Process expired effects
    for (const effect of expiredEffects) {
      try {
        // Call the expire callback
        effect.onExpire();
      } catch (e) {
        console.error(`Error in time effect expiry callback for ${effect.id}:`, e);
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
    this.timeChangeCallbacks.push(callback);
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
   * Notify all time change listeners
   * @param delta Elapsed game time
   */
  private notifyTimeChange(delta: number): void {
    for (const callback of this.timeChangeCallbacks) {
      try {
        callback(delta);
      } catch (e) {
        console.error('Error in time change callback:', e);
      }
    }
  }
}

/**
 * Interface for a time-based effect
 */
interface TimeEffect {
  id: string;
  expireTime: number;
  onExpire: () => void;
  data?: any;
} 