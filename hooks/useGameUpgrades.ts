import { useGameStore } from "@/store/rootStore";

/**
 * Custom hook to access and manage game upgrades from the Zustand store
 */
export function useGameUpgrades() {
  // Get store data and actions
  const unlockUpgrade = useGameStore(state => state.unlockUpgrade);
  const upgrades = useGameStore(state => state.upgrades);
  
  /**
   * Check if a specific upgrade has been unlocked
   * @param upgradeId - The unique identifier of the upgrade to check
   * @returns Boolean indicating if the upgrade is unlocked
   */
  const isUpgradeUnlocked = (upgradeId: string): boolean => {
    return !!upgrades[upgradeId];
  };
  
  /**
   * Get an array of all unlocked upgrade IDs
   * @returns Array of unlocked upgrade IDs
   */
  const getUnlockedUpgrades = (): string[] => {
    return Object.keys(upgrades).filter(id => upgrades[id] === true);
  };
  
  /**
   * Get the unlock timestamp for an upgrade
   * Note: The current implementation does not store timestamps,
   * this is a placeholder for future enhancement
   * @param upgradeId - The unique identifier of the upgrade
   * @returns Always returns null in the current implementation
   */
  const getUpgradeUnlockTime = (upgradeId: string): string | null => {
    // Current implementation doesn't store timestamps for upgrades
    // This is a placeholder for future enhancement
    return null;
  };
  
  /**
   * Check if all required upgrades are unlocked
   * @param requiredUpgradeIds - Array of upgrade IDs that are required
   * @returns Boolean indicating if all required upgrades are unlocked
   */
  const hasRequiredUpgrades = (requiredUpgradeIds: string[]): boolean => {
    if (!requiredUpgradeIds || requiredUpgradeIds.length === 0) return true;
    return requiredUpgradeIds.every(id => isUpgradeUnlocked(id));
  };
  
  /**
   * Unlock a new upgrade and return whether it was newly unlocked
   * @param upgradeId - The unique identifier of the upgrade to unlock
   * @returns Boolean indicating if the upgrade was newly unlocked
   */
  const unlockUpgradeIfNew = (upgradeId: string): boolean => {
    if (isUpgradeUnlocked(upgradeId)) return false;
    
    unlockUpgrade(upgradeId);
    return true;
  };
  
  return {
    // Actions
    unlockUpgrade,
    unlockUpgradeIfNew,
    
    // Selectors
    isUpgradeUnlocked,
    getUnlockedUpgrades,
    getUpgradeUnlockTime,
    hasRequiredUpgrades,
    
    // Direct state access (for advanced use cases)
    upgrades
  };
} 