import { useState, useEffect } from 'react';
import { useGameEngine } from '../providers/GameEngineProvider';
import { useGameResources } from './useGameResources';
import { Upgrade } from '../../domain/upgrades/models/UpgradeInterfaces';
import { PurchaseUpgradeCommand } from '../../domain/commands/models/PurchaseUpgradeCommand';
import { Command, CommandResult } from '../../core/game/GameInterfaces';

/**
 * Hook for accessing game upgrades
 */
export const useGameUpgrades = () => {
  const { game, initialized } = useGameEngine();
  const { canAffordCosts } = useGameResources();
  const [upgrades, setUpgrades] = useState<Upgrade[]>([]);
  const [upgradesById, setUpgradesById] = useState<Record<string, Upgrade>>({});
  
  // Load upgrades when game is initialized
  useEffect(() => {
    if (!initialized || !game) {
      return;
    }
    
    // Get all upgrades from the game
    const upgradeList = game.getUpgrades().getAllUpgrades();
    setUpgrades(upgradeList);
    
    // Build a map of upgrades by ID
    const upgradeMap: Record<string, Upgrade> = {};
    upgradeList.forEach(upgrade => {
      upgradeMap[upgrade.properties.id] = upgrade;
    });
    setUpgradesById(upgradeMap);
    
    // Set up listener for upgrade changes
    const handleUpgradeUpdate = () => {
      const updatedList = game.getUpgrades().getAllUpgrades();
      setUpgrades([...updatedList]);
      
      // Update upgrade map
      const updatedMap: Record<string, Upgrade> = {};
      updatedList.forEach(upgrade => {
        updatedMap[upgrade.properties.id] = upgrade;
      });
      setUpgradesById(updatedMap);
    };
    
    // Subscribe to upgrade change events
    game.on('upgrade_purchased', handleUpgradeUpdate);
    game.on('upgrade_added', handleUpgradeUpdate);
    game.on('upgrade_removed', handleUpgradeUpdate);
    game.on('upgrade_updated', handleUpgradeUpdate);
    
    // Cleanup subscription
    return () => {
      game.off('upgrade_purchased', handleUpgradeUpdate);
      game.off('upgrade_added', handleUpgradeUpdate);
      game.off('upgrade_removed', handleUpgradeUpdate);
      game.off('upgrade_updated', handleUpgradeUpdate);
    };
  }, [game, initialized]);
  
  // Get an upgrade by ID
  const getUpgrade = (id: string): Upgrade | undefined => {
    return upgradesById[id];
  };
  
  // Check if an upgrade is purchased
  const isUpgradePurchased = (id: string): boolean => {
    const upgrade = getUpgrade(id);
    return upgrade ? upgrade.isPurchased() : false;
  };
  
  // Check if an upgrade is visible/unlocked
  const isUpgradeVisible = (id: string): boolean => {
    const upgrade = getUpgrade(id);
    return upgrade ? upgrade.isUnlocked() : false;
  };
  
  // Check if an upgrade is available (meets all requirements)
  const isUpgradeAvailable = (id: string): boolean => {
    const upgrade = getUpgrade(id);
    
    if (!upgrade) return false;
    
    // An upgrade is available if it's unlocked and not at max level
    return upgrade.isUnlocked() && 
           (upgrade.properties.level < upgrade.properties.maxLevel);
  };
  
  // Purchase an upgrade
  const purchaseUpgrade = (id: string): boolean => {
    if (!game) return false;
    
    const upgrade = getUpgrade(id);
    if (!upgrade) return false;
    
    // Check if available and can afford
    if (!isUpgradeAvailable(id)) return false;
    if (!canAffordCosts(upgrade.getCost())) return false;
    
    try {
      // Create a purchase command
      const purchaseCommand = new PurchaseUpgradeCommand(
        upgrade.properties.id,
        game.getResources(),
        game.getUpgrades()
      );
      
      // Create a wrapper command that ensures type compatibility
      const command: Command = {
        id: purchaseCommand.id,
        type: purchaseCommand.type,
        execute: () => {
          const result = purchaseCommand.execute();
          return {
            success: result.success,
            message: result.message || `Purchase of ${upgrade.properties.name} ${result.success ? 'succeeded' : 'failed'}`,
            data: result.data
          };
        },
        validate: purchaseCommand.validate ? 
          () => purchaseCommand.validate!() : 
          undefined,
        cost: purchaseCommand.cost
      };
      
      // Execute the command
      const result = game.executeCommand(command);
      return result.success;
    } catch (error) {
      console.error('Error purchasing upgrade:', error);
      return false;
    }
  };
  
  // Get all visible upgrades
  const getVisibleUpgrades = (): Upgrade[] => {
    return upgrades.filter(upgrade => upgrade.isUnlocked());
  };
  
  // Get all available upgrades
  const getAvailableUpgrades = (): Upgrade[] => {
    return upgrades.filter(upgrade => 
      upgrade.isUnlocked() && 
      upgrade.properties.level < upgrade.properties.maxLevel
    );
  };
  
  return {
    upgrades,
    getUpgrade,
    isUpgradePurchased,
    isUpgradeVisible,
    isUpgradeAvailable,
    purchaseUpgrade,
    getVisibleUpgrades,
    getAvailableUpgrades
  };
}; 