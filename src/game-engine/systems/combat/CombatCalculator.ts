import { GameState, CombatActionDefinition, EnemyActionDefinition, ActionResult } from '../../types';
import { StatusEffectInstance } from '../../types/combat';

/**
 * CombatCalculator
 * 
 * Pure functions for calculating combat effects.
 */
export class CombatCalculator {
  
  /**
   * Apply damage to an entity (player or enemy)
   * 
   * @param currentHealth - Current health
   * @param currentShield - Current shield
   * @param damage - Amount of damage to apply
   * @param damageMultipliers - Active damage multipliers (e.g. from status effects)
   * @returns Object containing new health, new shield, and actual damage dealt
   */
  static calculateDamage(
    currentHealth: number,
    currentShield: number,
    damage: number,
    shieldDamageMultiplier: number = 1,
    hullDamageMultiplier: number = 1,
    armor: number = 0
  ): { newHealth: number; newShield: number; shieldDamage: number; hullDamage: number } {
    // Armor: flat damage reduction per hit, minimum 1 damage
    if (armor > 0) {
      damage = Math.max(1, damage - armor);
    }
    let shieldDamage = 0;
    let hullDamage = 0;
    let newShield = currentShield;
    let newHealth = currentHealth;

    // Calculate effective damage based on multipliers could be added here
    // For now, we assume the input damage is raw, but modifiers might apply
    
    if (newShield > 0) {
      // Damage goes to shield first
      // Shield damage might be boosted by specific weapons (shield disruptors)
      const effectiveShieldDamage = damage * shieldDamageMultiplier;
      
      // But we can only deal as much damage as there is shield, or the attack strength
      // The logic in original CombatSystem was: 
      // min(shield, damage) -> shield -= that
      // remaining = damage - shieldDamage
      // This implies shield mitigation is 1-to-1 unless specified otherwise.
      
      // Let's stick to the original logic but cleaner:
      const damageToShield = Math.min(newShield, damage);
      newShield -= damageToShield;
      shieldDamage = damageToShield;
      
      const remainingDamage = damage - damageToShield;
      
      // Remaining damage goes to hull
      if (remainingDamage > 0) {
        hullDamage = remainingDamage * hullDamageMultiplier; // Hull takes full remaining damage
        newHealth -= hullDamage;
      }
    } else {
      // All damage goes to health
      hullDamage = damage * hullDamageMultiplier;
      newHealth -= hullDamage;
    }

    return {
      newHealth: Math.max(0, newHealth),
      newShield: Math.max(0, newShield),
      shieldDamage,
      hullDamage
    };
  }

  /**
   * Calculate shield repair
   */
  static calculateShieldRepair(
    currentShield: number,
    maxShield: number,
    repairAmount: number
  ): { newShield: number; repairedAmount: number } {
    const missingShield = maxShield - currentShield;
    const actualRepair = Math.min(missingShield, repairAmount);
    
    return {
      newShield: currentShield + actualRepair,
      repairedAmount: actualRepair
    };
  }

  /**
   * Calculate hull repair
   */
  static calculateHullRepair(
    currentHealth: number,
    maxHealth: number,
    repairAmount: number
  ): { newHealth: number; repairedAmount: number } {
    const missingHealth = maxHealth - currentHealth;
    const actualRepair = Math.min(missingHealth, repairAmount);
    
    return {
      newHealth: currentHealth + actualRepair,
      repairedAmount: actualRepair
    };
  }

  /**
   * Split-damage model used for player attacks: shieldDamage hits shields,
   * damage hits hull *directly* (doesn't bleed through shields). Both legs
   * are multiplied by weakenMult and reduced by armor (minimum 1).
   */
  static calculateSplitDamage(
    currentHealth: number,
    currentShield: number,
    hullDamageRaw: number,
    shieldDamageRaw: number,
    weakenMult: number = 1,
    armor: number = 0
  ): { newHealth: number; newShield: number; hullDamage: number; shieldDamage: number } {
    const hullDmg = Math.max(1, Math.floor(hullDamageRaw * weakenMult) - armor);
    // Shield damage falls back to hull damage if not explicitly set (legacy behavior).
    const shieldDmg = Math.max(1, Math.floor((shieldDamageRaw || hullDamageRaw) * weakenMult) - armor);

    const actualShieldDmg = Math.min(currentShield, shieldDmg);
    const actualHullDmg = hullDamageRaw > 0 ? Math.min(currentHealth, hullDmg) : 0;

    return {
      newShield: currentShield - actualShieldDmg,
      newHealth: currentHealth - actualHullDmg,
      shieldDamage: actualShieldDmg,
      hullDamage: actualHullDmg,
    };
  }

  /**
   * Decrement status effect timers by one turn and drop expired effects.
   */
  static processStatusEffects(effects: StatusEffectInstance[]): StatusEffectInstance[] {
    return effects
      .map(effect => ({
        ...effect,
        remainingTurns: effect.remainingTurns - 1
      }))
      .filter(effect => effect.remainingTurns > 0);
  }
}

