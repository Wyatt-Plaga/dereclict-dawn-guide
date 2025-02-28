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
      
      // Special handling for wing unlock upgrades
      if (upgradeId === 'unlock-wing') {
        // Wing selection will be handled by the UI component
        console.log('Wing selection upgrade unlocked');
      } else if (upgradeId === 'unlock-next-wing') {
        // Directly set the crew-quarters wing as selected
        state.upgrades['selected-wing-crew-quarters'] = true;
      } else if (upgradeId === 'unlock-final-wing') {
        // Directly set the manufacturing wing as selected
        state.upgrades['selected-wing-manufacturing'] = true;
      }
    });
  }
}); 