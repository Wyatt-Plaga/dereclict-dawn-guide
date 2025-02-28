import { StateCreator } from 'zustand';
import { GameState, GameActions } from '../types';
import { immer } from 'zustand/middleware/immer';

// Type for this specific slice
export interface UpgradesSlice {
  upgrades: GameState['upgrades'];
  unlockUpgrade: GameActions['unlockUpgrade'];
}

// Create the upgrades slice
export const createUpgradesSlice: StateCreator<
  GameState & GameActions,
  [["zustand/immer", never]],
  [["zustand/immer", never]],
  UpgradesSlice
> = (set) => ({
  upgrades: {},
  
  unlockUpgrade: (upgradeId: string) => {
    set((state) => {
      // Set the upgrade to true (unlocked)
      state.upgrades[upgradeId] = true;
      
      // If this is a wing unlock, add the page to available pages
      if (upgradeId === 'unlock-wing') {
        if (!state.availablePages.includes('processor')) {
          state.availablePages.push('processor');
        }
      } else if (upgradeId === 'unlock-next-wing') {
        if (!state.availablePages.includes('crew-quarters')) {
          state.availablePages.push('crew-quarters');
        }
      } else if (upgradeId === 'unlock-final-wing') {
        if (!state.availablePages.includes('manufacturing')) {
          state.availablePages.push('manufacturing');
        }
      }
    });
  }
}); 