import React from 'react';
import { useGameUpgrades } from '../../hooks/useGameUpgrades';
import { useGameResources } from '../../hooks/useGameResources';
import { Upgrade } from '../../../domain/upgrades/interfaces/UpgradeInterfaces';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';

interface UpgradeCardProps {
  upgradeId: string;
}

/**
 * Upgrade card component
 * Shows information about an upgrade and allows purchasing it
 */
export const UpgradeCard: React.FC<UpgradeCardProps> = ({ upgradeId }) => {
  const { getUpgrade, isUpgradeAvailable, purchaseUpgrade } = useGameUpgrades();
  const { canAffordCosts } = useGameResources();
  
  const upgrade = getUpgrade(upgradeId);
  
  if (!upgrade) {
    return <div>Upgrade not found: {upgradeId}</div>;
  }
  
  const isAvailable = isUpgradeAvailable(upgradeId);
  const cost = upgrade.getCost();
  const canAfford = canAffordCosts(cost);
  
  // Format cost display
  const formatCost = () => {
    return Object.entries(cost).map(([resourceId, amount]) => (
      <div key={resourceId} className="cost-item">
        {resourceId}: {amount.toFixed(0)}
      </div>
    ));
  };
  
  // Handle purchase button click
  const handlePurchase = () => {
    purchaseUpgrade(upgradeId);
  };
  
  return (
    <div className={`upgrade-card ${!isAvailable ? 'unavailable' : ''} ${!canAfford ? 'cannot-afford' : ''}`}>
      <div className="upgrade-header">
        <h3>{upgrade.properties.name}</h3>
        <div className="upgrade-level">
          Level: {upgrade.properties.level}
        </div>
      </div>
      
      <div className="upgrade-description">
        {upgrade.properties.description}
      </div>
      
      <div className="upgrade-cost">
        <h4>Cost:</h4>
        {formatCost()}
      </div>
      
      <button 
        onClick={handlePurchase}
        disabled={!isAvailable || !canAfford}
        className="purchase-button"
      >
        {upgrade.properties.level > 0 ? 'Upgrade' : 'Purchase'}
      </button>
    </div>
  );
};

/**
 * Component that displays a list of available upgrades
 */
export const UpgradeList: React.FC = () => {
  const { getAvailableUpgrades } = useGameUpgrades();
  const availableUpgrades = getAvailableUpgrades();
  
  return (
    <div className="upgrade-list">
      <h2>Available Upgrades</h2>
      {availableUpgrades.length === 0 ? (
        <p>No upgrades available.</p>
      ) : (
        <div className="upgrade-grid">
          {availableUpgrades.map(upgrade => (
            <UpgradeCard 
              key={upgrade.properties.id} 
              upgradeId={upgrade.properties.id} 
            />
          ))}
        </div>
      )}
    </div>
  );
}; 