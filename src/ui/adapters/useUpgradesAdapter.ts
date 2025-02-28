import { useEffect, useState } from 'react';
import { useGameEngine } from '../providers/GameEngineProvider';
import { useGameUpgrades } from '../hooks/useGameUpgrades';

type LegacyUpgrade = {
  id: string;
  name: string;
  description: string;
  cost?: number;
  resourceType?: string;
  unlocked: boolean;
  // Any other properties from the old upgrade system
};

/**
 * Adapter hook for connecting the old upgrades system with the new game engine upgrades
 * @param existingUpgrades Array of existing upgrades from the old system
 */
export function useUpgradesAdapter(existingUpgrades: LegacyUpgrade[]) {
  const { game, initialized } = useGameEngine();
  const { upgrades, purchaseUpgrade, isUpgradePurchased } = useGameUpgrades();
  const [upgradesSynced, setUpgradesSynced] = useState(false);
  
  // Synchronize upgrades with the game engine
  useEffect(() => {
    if (!initialized || !game || upgradesSynced) return;
    
    console.log('Synchronizing upgrades with game engine...');
    
    try {
      // Import existing upgrades into the game engine
      existingUpgrades.forEach(upgrade => {
        try {
          // Check if upgrade already exists in the game engine
          const existingUpgrade = game.getUpgrade?.(upgrade.id);
          if (existingUpgrade) {
            console.log(`Upgrade ${upgrade.id} already exists in game engine`);
            
            // If the upgrade is unlocked in the old system, check if it needs to be marked as purchased
            if (upgrade.unlocked && !isUpgradePurchased(upgrade.id)) {
              purchaseUpgrade(upgrade.id);
            }
            
            return;
          }
          
          // Log that we can't create upgrades dynamically yet
          console.log(`Upgrade ${upgrade.id} not found in game engine. Upgrades need to be pre-registered in the game engine.`);
          
          // If we had a proper way to register upgrades, we would do it here
          // For now, we'll rely on upgrades being pre-registered in the game engine
          
        } catch (error) {
          console.error(`Error processing upgrade ${upgrade.id}:`, error);
        }
      });
      
      setUpgradesSynced(true);
      console.log(`${existingUpgrades.length} upgrades synchronized with game engine`);
    } catch (error) {
      console.error('Error synchronizing upgrades:', error);
    }
  }, [initialized, game, existingUpgrades, upgradesSynced, isUpgradePurchased, purchaseUpgrade]);
  
  // Listen for upgrade events from the game engine
  useEffect(() => {
    if (!initialized || !game) return;
    
    const handleUpgradePurchased = (event: any) => {
      const { upgradeId } = event.payload || {};
      if (!upgradeId) return;
      
      console.log(`Upgrade ${upgradeId} purchased in game engine`);
      
      // Here you would update the old system's upgrade state
      // This depends on how your old system tracks unlocked upgrades
    };
    
    // Subscribe to upgrade purchased events
    game.on('upgrade_purchased', handleUpgradePurchased);
    
    return () => {
      game.off('upgrade_purchased', handleUpgradePurchased);
    };
  }, [initialized, game]);
  
  // Provide utility functions for working with upgrades
  return {
    // Returns upgrade from the game engine if available, falls back to old system
    getUpgrade: (id: string) => {
      const engineUpgrade = upgrades.find(u => u.properties && u.properties.id === id);
      if (engineUpgrade) {
        return {
          id: engineUpgrade.properties.id,
          name: engineUpgrade.properties.name,
          description: engineUpgrade.properties.description,
          unlocked: isUpgradePurchased(id)
        };
      }
      
      // Fall back to the old system
      return existingUpgrades.find(u => u.id === id);
    },
    
    // Purchase an upgrade in both systems
    purchaseUpgrade: (id: string) => {
      // Purchase in the new system
      purchaseUpgrade(id);
      
      // Here you would handle the old system's upgrade purchase logic
      // This depends on how your old system handles upgrades
    },
    
    // Check if upgrade is purchased in either system
    isUpgradePurchased: (id: string) => {
      // Check new system first
      if (isUpgradePurchased(id)) {
        return true;
      }
      
      // Fall back to old system
      const oldUpgrade = existingUpgrades.find(u => u.id === id);
      return oldUpgrade?.unlocked || false;
    }
  };
} 