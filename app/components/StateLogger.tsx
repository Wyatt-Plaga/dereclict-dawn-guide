"use client";

import React from 'react';
import { useGame } from '@/app/game/hooks/useGame';
import Logger, { LogCategory, LogContext } from '@/app/utils/logger';
import { Bug } from 'lucide-react';

/**
 * StateLogger component
 * 
 * Renders a debug button in the bottom right corner that logs the current
 * game state to the console when clicked.
 */
export function StateLogger() {
  const { state } = useGame();
  
  const logState = () => {
    // Log to console
    console.log('Current game state:', state);
    
    // Also log using the Logger utility for consistency
    Logger.info(
      LogCategory.STATE,
      'State logged to console via debug button',
      LogContext.NONE
    );
    
    // Create a downloadable JSON file with the current state
    const stateJson = JSON.stringify(state, null, 2);
    const blob = new Blob([stateJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `game-state-${new Date().toISOString()}.json`;
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  };
  
  return (
    <button
      onClick={logState}
      className="fixed bottom-4 right-4 z-50 bg-gray-800 p-2 rounded-full shadow-lg hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      title="Log game state to console"
    >
      <Bug className="h-5 w-5 text-blue-400" />
    </button>
  );
}

export default StateLogger; 