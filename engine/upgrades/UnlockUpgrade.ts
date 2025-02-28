import { BaseUpgrade } from './BaseUpgrade';
import { CommandResult, EventEmitter, GameEvent } from '../interfaces';
import { EffectOperation, EffectType, UnlockUpgradeProperties, UpgradeEffect } from './interfaces';

/**
 * Class for upgrades that unlock new content or features
 */
export class UnlockUpgrade extends BaseUpgrade<UnlockUpgradeProperties> {
  /**
   * Event emitter for broadcasting unlock events
   * This should be passed in from an external source that manages events
   */
  private eventEmitter?: EventEmitter;
  
  /**
   * Create a new unlock upgrade
   * @param properties Initial properties
   * @param eventEmitter Optional event emitter for unlock events
   */
  constructor(properties: UnlockUpgradeProperties, eventEmitter?: EventEmitter) {
    super(properties);
    
    // Ensure we have unlock type and key
    if (!this.properties.unlockType) {
      throw new Error('Unlock upgrade must have an unlock type');
    }
    
    if (!this.properties.unlockKey) {
      throw new Error('Unlock upgrade must have an unlock key');
    }
    
    this.eventEmitter = eventEmitter;
    
    // Generate default effect if not provided
    if (this.properties.effects.length === 0) {
      this.generateDefaultEffect();
    }
  }
  
  /**
   * Generate default unlock effect
   */
  private generateDefaultEffect(): void {
    const effect: UpgradeEffect = {
      id: `${this.properties.id}_unlock`,
      type: EffectType.UNLOCK,
      target: this.properties.unlockType,
      value: 1, // Binary unlock (1 = unlocked)
      operation: EffectOperation.SET
    };
    
    this.properties.effects = [effect];
  }
  
  /**
   * Purchase this upgrade
   * Override to emit an unlock event when purchased
   */
  public purchase(): CommandResult {
    const result = super.purchase();
    
    if (result.success) {
      // If purchased successfully, emit an unlock event
      this.emitUnlockEvent();
    }
    
    return result;
  }
  
  /**
   * Apply the effects of this upgrade
   * For unlock upgrades, this typically means setting some game state
   */
  public applyEffects(): void {
    // This is a placeholder
    // In a real implementation, this would be connected to the relevant systems
    // that need to know about the unlocked content
    
    // For example:
    // const gameState = getGameState();
    // gameState.setUnlocked(this.properties.unlockType, this.properties.unlockKey, true);
  }
  
  /**
   * Emit an event that this content has been unlocked
   */
  private emitUnlockEvent(): void {
    if (this.eventEmitter) {
      // Create a proper GameEvent object
      const unlockEvent: GameEvent = {
        id: `unlock_${this.properties.id}_${Date.now()}`,
        type: 'unlock',
        timestamp: Date.now(),
        payload: {
          unlockType: this.properties.unlockType,
          unlockKey: this.properties.unlockKey,
          upgradeId: this.properties.id
        }
      };
      
      // Emit the event
      this.eventEmitter.emit(unlockEvent);
    }
  }
  
  /**
   * Get the type of content this upgrade unlocks
   */
  public getUnlockType(): string {
    return this.properties.unlockType;
  }
  
  /**
   * Get the key of content this upgrade unlocks
   */
  public getUnlockKey(): string {
    return this.properties.unlockKey;
  }
} 