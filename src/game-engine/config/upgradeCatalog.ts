/**
 * Upgrade catalog — only for SPECIAL upgrades that don't fit the standard
 * wing capacity/efficiency pattern (e.g. shielding, wing unlocks, navigation).
 *
 * Standard wing upgrades (capacity and efficiency) are handled directly by
 * ActionSystem using the wingResources content definitions.
 */

import { GameState } from '../types';
import { GameCategory } from '../types/actions';

export interface UpgradeDef {
  resource: 'energy' | 'insight' | 'scrap' | 'crew' | 'relics';
  cost(state: GameState): number;
  incrementPath: string;
  apply(state: GameState): void;
}

export const UPGRADE_CATALOG: Record<string, Record<string, UpgradeDef>> = {
  reactor: {
    shielding: {
      resource: 'relics',
      cost: () => 50,
      incrementPath: 'categories.reactor.specialUpgrades.shielding',
      apply: (s) => {
        if (s.categories.reactor.specialUpgrades.shielding) {
          s.combat.playerStats.maxShield = 50 + (s.categories.reactor.specialUpgrades.shieldBoosts ?? 0) * 100;
          s.combat.playerStats.shield = s.combat.playerStats.maxShield;
        }
      }
    },
    shieldBoosts: {
      resource: 'relics',
      cost: (s) => {
        const lvl = s.categories.reactor.specialUpgrades.shieldBoosts ?? 0;
        return 100 * Math.pow(lvl + 1, 2);
      },
      incrementPath: 'categories.reactor.specialUpgrades.shieldBoosts',
      apply: (s) => {
        if (s.categories.reactor.specialUpgrades.shielding) {
          const boosts = s.categories.reactor.specialUpgrades.shieldBoosts ?? 0;
          s.combat.playerStats.maxShield = 50 + boosts * 100;
          s.combat.playerStats.shield = Math.min(s.combat.playerStats.shield, s.combat.playerStats.maxShield);
        }
      }
    },
    // Wing unlocks are granted by defeating region bosses, not purchased
    // Navigation auto-unlocks when reactor primary automation is enabled
  },
};
