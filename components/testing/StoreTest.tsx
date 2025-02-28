'use client';

import { useGameStore } from '@/store/rootStore';
import { useSupabase } from '@/utils/supabase/context';
import { useState, useEffect } from 'react';

/**
 * Simple test component to verify that our Zustand store works correctly
 * and that the StoreBridge properly syncs data between context and store.
 */
export default function StoreTest() {
  // Get state and actions from store
  const resources = useGameStore((state) => state.resources);
  const upgrades = useGameStore((state) => state.upgrades);
  const unlockedLogs = useGameStore((state) => state.unlockedLogs);
  const version = useGameStore((state) => state.version);
  
  // Get actions from store
  const updateResource = useGameStore((state) => state.updateResource);
  const unlockUpgrade = useGameStore((state) => state.unlockUpgrade);
  const unlockLog = useGameStore((state) => state.unlockLog);
  
  // Get context data for comparison
  const { gameProgress } = useSupabase();
  
  // State for test actions
  const [testResults, setTestResults] = useState<{
    message: string;
    success: boolean;
  }[]>([]);
  
  // Format state for display
  const storeState = {
    resources,
    upgrades,
    unlockedLogs,
    version
  };
  
  // Run tests
  const runTests = () => {
    const results: { message: string; success: boolean }[] = [];
    
    // Test 1: Check store initialization
    results.push({
      message: 'Store initialized with correct version',
      success: version === 1
    });
    
    // Test 2: Update a resource
    if (resources && resources.energy) {
      const initialEnergyAmount = resources.energy.amount;
      updateResource('energy', 'amount', initialEnergyAmount + 5);
      
      // Give time for state to update
      setTimeout(() => {
        const state = useGameStore.getState();
        const newEnergyAmount = state.resources?.energy?.amount;
        
        results.push({
          message: 'Resource update worked correctly',
          success: newEnergyAmount === initialEnergyAmount + 5
        });
        
        // Test 3: Unlock an upgrade
        const testUpgradeId = 'test-upgrade';
        unlockUpgrade(testUpgradeId);
        
        const upgradeUnlocked = useGameStore.getState().upgrades[testUpgradeId];
        results.push({
          message: 'Upgrade unlocked correctly',
          success: upgradeUnlocked === true
        });
        
        // Test 4: Unlock a log
        const testLogId = 42;
        unlockLog(testLogId);
        
        const logUnlocked = useGameStore.getState().unlockedLogs.includes(testLogId);
        results.push({
          message: 'Log unlocked correctly',
          success: logUnlocked
        });
        
        // Update the results
        setTestResults(results);
      }, 100);
    } else {
      results.push({
        message: 'Resources not initialized correctly',
        success: false
      });
      setTestResults(results);
    }
  };
  
  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Zustand Store Test</h1>
      
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Store State</h2>
          <pre className="text-xs overflow-auto">
            {JSON.stringify(storeState, null, 2)}
          </pre>
        </div>
        
        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Context State</h2>
          <pre className="text-xs overflow-auto">
            {JSON.stringify(gameProgress, null, 2)}
          </pre>
        </div>
      </div>
      
      <div className="mt-6">
        <button
          onClick={runTests}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          Run Tests
        </button>
        
        <div className="mt-4">
          <h2 className="text-xl font-semibold mb-2">Test Results</h2>
          {testResults.length > 0 ? (
            <ul className="space-y-2">
              {testResults.map((result, index) => (
                <li 
                  key={index}
                  className={`p-2 rounded ${
                    result.success ? 'bg-green-100 dark:bg-green-800/30' : 'bg-red-100 dark:bg-red-800/30'
                  }`}
                >
                  {result.message}: {result.success ? '✅' : '❌'}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No tests run yet</p>
          )}
        </div>
      </div>
      
      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-2">Manual Tests</h2>
        <div className="space-y-4">
          <div>
            <button
              onClick={() => resources?.energy && updateResource('energy', 'amount', resources.energy.amount + 1)}
              className="px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
            >
              Add Energy
            </button>
            <span className="ml-2">Energy: {resources?.energy?.amount || 0}</span>
          </div>
          
          <div>
            <button
              onClick={() => unlockUpgrade('manual-test-upgrade')}
              className="px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
            >
              Unlock Test Upgrade
            </button>
            <span className="ml-2">
              Status: {upgrades?.['manual-test-upgrade'] ? 'Unlocked' : 'Locked'}
            </span>
          </div>
          
          <div>
            <button
              onClick={() => unlockLog(99)}
              className="px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
            >
              Unlock Test Log
            </button>
            <span className="ml-2">
              Status: {unlockedLogs?.includes(99) ? 'Unlocked' : 'Locked'}
            </span>
          </div>
        </div>
      </div>
      
      <div className="mt-6 text-sm text-gray-500">
        <p>
          Note: Refresh the page to verify persistence is working. The changes you make
          should still be visible after refresh.
        </p>
      </div>
    </div>
  );
} 