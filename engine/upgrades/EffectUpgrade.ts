import { BaseUpgrade } from './BaseUpgrade';
import { CommandResult, EventEmitter, GameEvent } from '../interfaces';
import { EffectOperation, EffectType, EffectUpgradeProperties, UpgradeEffect } from './interfaces';

/**
 * Class for upgrades that provide special effects
 */
export class EffectUpgrade extends BaseUpgrade<EffectUpgradeProperties> {
  /**
   * Event emitter for broadcasting effect events
   */
  private eventEmitter?: EventEmitter;
  
  /**
   * Timer for temporary effects
   */
  private effectTimer?: NodeJS.Timeout;
  
  /**
   * Create a new effect upgrade
   * @param properties Initial properties
   * @param eventEmitter Optional event emitter for effect events
   */
  constructor(properties: EffectUpgradeProperties, eventEmitter?: EventEmitter) {
    super(properties);
    
    this.eventEmitter = eventEmitter;
    
    // Ensure we have required properties
    if (this.properties.isActive && this.properties.duration === undefined) {
      // Active effects should have a duration
      this.properties.duration = 60; // Default 60 seconds
    }
    
    if (this.properties.isActive && this.properties.cooldown === undefined) {
      // Active effects should have a cooldown
      this.properties.cooldown = 300; // Default 5 minutes
    }
  }
  
  /**
   * Purchase this upgrade
   * Override to handle active vs. passive effects
   */
  public purchase(): CommandResult {
    const result = super.purchase();
    
    if (result.success) {
      // If this is not an active effect, apply immediately
      if (!this.properties.isActive) {
        this.applyEffects();
      }
    }
    
    return result;
  }
  
  /**
   * Activate the effect (for active effects only)
   */
  public activate(): CommandResult {
    if (!this.properties.isActive) {
      return {
        success: false,
        message: 'This is not an active effect'
      };
    }
    
    if (!this.isPurchased()) {
      return {
        success: false,
        message: 'Effect has not been purchased'
      };
    }
    
    // Apply the effects
    this.applyEffects();
    
    // Emit activation event
    this.emitEffectEvent('effect_activated');
    
    // If the effect has a duration, set up a timer to remove it
    if (this.properties.duration && this.properties.duration > 0) {
      // Clear any existing timer
      if (this.effectTimer) {
        clearTimeout(this.effectTimer);
      }
      
      // Set a new timer
      this.effectTimer = setTimeout(() => {
        this.deactivate();
      }, this.properties.duration * 1000);
    }
    
    return {
      success: true,
      message: 'Effect activated',
      data: {
        id: this.properties.id,
        duration: this.properties.duration
      }
    };
  }
  
  /**
   * Deactivate the effect (for active effects only)
   */
  public deactivate(): CommandResult {
    if (!this.properties.isActive) {
      return {
        success: false,
        message: 'This is not an active effect'
      };
    }
    
    // Clear any existing timer
    if (this.effectTimer) {
      clearTimeout(this.effectTimer);
      this.effectTimer = undefined;
    }
    
    // Remove the effects
    this.removeEffects();
    
    // Emit deactivation event
    this.emitEffectEvent('effect_deactivated');
    
    return {
      success: true,
      message: 'Effect deactivated',
      data: {
        id: this.properties.id
      }
    };
  }
  
  /**
   * Apply the effects of this upgrade
   * For effect upgrades, this might modify various game systems
   */
  public applyEffects(): void {
    // This is a placeholder
    // In a real implementation, this would be connected to the relevant systems
    // that need to be affected by the effect
    
    // For example:
    // const gameState = getGameState();
    // 
    // for (const effect of this.getEffects()) {
    //   gameState.applyEffect(effect);
    // }
  }
  
  /**
   * Remove the effects of this upgrade
   * Inverse of applyEffects
   */
  public removeEffects(): void {
    // This is a placeholder
    // In a real implementation, this would remove the effects
    
    // For example:
    // const gameState = getGameState();
    // 
    // for (const effect of this.getEffects()) {
    //   gameState.removeEffect(effect);
    // }
  }
  
  /**
   * Emit an event related to this effect
   * @param eventType Type of event to emit
   */
  private emitEffectEvent(eventType: string): void {
    if (this.eventEmitter) {
      const effectEvent: GameEvent = {
        id: `${eventType}_${this.properties.id}_${Date.now()}`,
        type: eventType,
        timestamp: Date.now(),
        payload: {
          upgradeId: this.properties.id,
          effects: this.getEffects(),
          duration: this.properties.duration,
          isActive: this.properties.isActive
        }
      };
      
      this.eventEmitter.emit(effectEvent);
    }
  }
  
  /**
   * Check if the effect is currently active
   */
  public isActive(): boolean {
    // For passive effects, "active" is the same as "purchased"
    if (!this.properties.isActive) {
      return this.isPurchased();
    }
    
    // For active effects, check if the timer is running
    return !!this.effectTimer;
  }
  
  /**
   * Get the remaining duration of the effect in seconds
   * @returns Remaining duration or 0 if not active or infinite
   */
  public getRemainingDuration(): number {
    if (!this.isActive() || !this.properties.duration) {
      return 0;
    }
    
    // If not an active effect or no timer, return the full duration
    if (!this.properties.isActive || !this.effectTimer) {
      return this.properties.duration;
    }
    
    // TODO: Calculate remaining time from timer
    // This is a placeholder that would need a proper implementation
    // For now, just return the full duration
    return this.properties.duration;
  }
  
  /**
   * Cleanup resources when this upgrade is destroyed
   */
  public cleanup(): void {
    if (this.effectTimer) {
      clearTimeout(this.effectTimer);
      this.effectTimer = undefined;
    }
  }
} 