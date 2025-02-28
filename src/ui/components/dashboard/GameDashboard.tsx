import React, { useEffect } from 'react';
import { GameEngineProvider, useGameEngine } from '../../providers/GameEngineProvider';
import { ResourceList } from '../resources/ResourceDisplay';
import { UpgradeList } from '../upgrades/UpgradeCard';
import { LogDisplay } from '../logs/LogDisplay';

/**
 * Main game dashboard component
 * Includes resources, upgrades, and logs sections
 */
export const GameDashboard: React.FC = () => {
  return (
    <GameEngineProvider>
      <div className="game-dashboard">
        <header className="dashboard-header">
          <h1>Derelict Dawn</h1>
        </header>
        
        <div className="dashboard-content">
          <div className="dashboard-column resources-column">
            <ResourceList />
          </div>
          
          <div className="dashboard-column upgrades-column">
            <UpgradeList />
          </div>
          
          <div className="dashboard-column logs-column">
            <LogDisplay />
          </div>
        </div>
      </div>
    </GameEngineProvider>
  );
};

/**
 * Dashboard content with auto-saving capability
 */
interface DashboardContentWithAutoSaveProps {
  saveKey: string;
  autoSaveInterval: number;
}

const DashboardContentWithAutoSave: React.FC<DashboardContentWithAutoSaveProps> = ({
  saveKey,
  autoSaveInterval
}) => {
  const { game } = useGameEngine();
  
  // Setup auto-save function
  useEffect(() => {
    if (!game) return;
    
    const saveInterval = setInterval(() => {
      try {
        const state = game.saveState();
        localStorage.setItem(saveKey, JSON.stringify(state));
        console.log('Game auto-saved');
      } catch (error) {
        console.error('Failed to auto-save game:', error);
      }
    }, autoSaveInterval);
    
    // Cleanup on unmount
    return () => clearInterval(saveInterval);
  }, [game, saveKey, autoSaveInterval]);
  
  return (
    <div className="game-dashboard">
      <header className="dashboard-header">
        <h1>Derelict Dawn</h1>
      </header>
      
      <div className="dashboard-content">
        <div className="dashboard-column resources-column">
          <ResourceList />
        </div>
        
        <div className="dashboard-column upgrades-column">
          <UpgradeList />
        </div>
        
        <div className="dashboard-column logs-column">
          <LogDisplay />
        </div>
      </div>
    </div>
  );
};

/**
 * Game dashboard with persistent state loading/saving
 */
interface PersistentGameDashboardProps {
  saveKey?: string;
  autoSaveInterval?: number;
}

export const PersistentGameDashboard: React.FC<PersistentGameDashboardProps> = ({
  saveKey = 'derelict_dawn_save',
  autoSaveInterval = 60000 // 1 minute
}) => {
  // Load initial state from localStorage
  const loadInitialState = () => {
    try {
      const savedState = localStorage.getItem(saveKey);
      if (savedState) {
        return JSON.parse(savedState);
      }
    } catch (error) {
      console.error('Failed to load saved game:', error);
    }
    return undefined;
  };

  return (
    <GameEngineProvider initialState={loadInitialState()}>
      <DashboardContentWithAutoSave 
        saveKey={saveKey}
        autoSaveInterval={autoSaveInterval}
      />
    </GameEngineProvider>
  );
}; 