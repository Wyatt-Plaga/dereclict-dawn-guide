import type { CombatActionDefinition } from '../../types/combat';
import { ALL_PLAYER_ABILITIES } from '@/game-engine/content/playerAbilities';
import { PLAYER_ACTIONS } from '@/game-engine/content/combatActions';

/**
 * A player combat action as consumed by CombatSystem, including the optional
 * shieldDamage field used by the split-damage model.
 */
export type PlayerCombatAction = CombatActionDefinition & { shieldDamage?: number };

/**
 * Resolve a player action id to a unified shape. Prefers the equipment system
 * (ALL_PLAYER_ABILITIES) and falls back to the legacy PLAYER_ACTIONS table.
 */
export function resolvePlayerAction(actionId: string): PlayerCombatAction | undefined {
  const ability = ALL_PLAYER_ABILITIES[actionId];
  if (ability) {
    return {
      id: ability.id,
      name: ability.name,
      description: ability.description,
      category: ability.category,
      cost: ability.cost ?? { type: 'energy', amount: 0 },
      damage: ability.damage,
      shieldRepair: ability.shieldRepair,
      hullRepair: ability.hullRepair,
      statusEffect: ability.statusEffect,
      apCost: ability.apCost,
      cooldown: ability.cooldown,
      shieldDamage: ability.shieldDamage,
    };
  }
  return PLAYER_ACTIONS[actionId];
}
