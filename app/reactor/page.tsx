"use client"

import { useState, useEffect } from "react"
import { ResourcePage } from "@/components/resources/resource-page"
import { energyConfig } from "@/components/resources/resource-config"
import { useSupabase } from "@/utils/supabase/context"
import { WingSelection } from "@/components/ui/wing-selection"
import { AlertCircle, Zap } from "lucide-react"

export default function ReactorPage() {
  const { gameProgress, unlockLog, unlockUpgrade, resetGameProgress, godMode, toggleGodMode } = useSupabase();
  const [showWingSelection, setShowWingSelection] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  
  // Check if the wing selection should be shown
  useEffect(() => {
    if (!gameProgress?.upgrades) return;
    
    // First wing unlock - show selection if first wing is unlocked but no wing is selected yet
    const hasFirstWingUnlock = gameProgress.upgrades['unlock-wing-1'];
    const hasSecondWingUnlock = gameProgress.upgrades['unlock-wing-2'];
    const hasThirdWingUnlock = gameProgress.upgrades['unlock-wing-3'];
    
    // Check if any wing is already selected
    const hasSelectedProcessor = gameProgress.upgrades['selected-wing-processor'];
    const hasSelectedCrewQuarters = gameProgress.upgrades['selected-wing-crew-quarters'];
    const hasSelectedManufacturing = gameProgress.upgrades['selected-wing-manufacturing'];
    
    // Count how many wings are selected
    const selectedWingCount = [
      hasSelectedProcessor,
      hasSelectedCrewQuarters,
      hasSelectedManufacturing
    ].filter(Boolean).length;
    
    // Count how many wings should be unlocked based on milestones
    let totalWingsUnlocked = 0;
    if (hasFirstWingUnlock) totalWingsUnlocked = 1;
    if (hasSecondWingUnlock) totalWingsUnlocked = 2;
    if (hasThirdWingUnlock) totalWingsUnlocked = 3;
    
    // Show wing selection if we have unlocked wings pending selection
    if (hasFirstWingUnlock && selectedWingCount < totalWingsUnlocked) {
      setShowWingSelection(true);
    } else {
      setShowWingSelection(false);
    }
  }, [gameProgress]);
  
  // Handle reset button click
  const handleResetClick = () => {
    setShowResetConfirm(true);
  };
  
  // Handle reset confirmation
  const handleResetConfirm = async () => {
    try {
      await resetGameProgress();
      setShowResetConfirm(false);
    } catch (error) {
      console.error("Error resetting game progress:", error);
    }
  };
  
  // Development Controls UI Component
  const DevControls = () => (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col space-y-2">
      {/* God Mode Toggle Button */}
      <button 
        onClick={toggleGodMode}
        className={`${
          godMode ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-gray-600 hover:bg-gray-700'
        } text-white px-4 py-2 rounded-md flex items-center space-x-2 shadow-lg transition-colors`}
      >
        <Zap className={`h-5 w-5 ${godMode ? 'text-white animate-pulse' : ''}`} />
        <span>God Mode {godMode ? 'ON' : 'OFF'}</span>
      </button>
      
      {/* Debug Button */}
      <button 
        onClick={() => {
          console.log('======= GAME STATE DEBUG =======');
          console.log('Wing Unlocks:');
          console.log('- Wing 1:', gameProgress?.upgrades['unlock-wing-1'] ? 'UNLOCKED' : 'Locked');
          console.log('- Wing 2:', gameProgress?.upgrades['unlock-wing-2'] ? 'UNLOCKED' : 'Locked');
          console.log('- Wing 3:', gameProgress?.upgrades['unlock-wing-3'] ? 'UNLOCKED' : 'Locked');
          console.log('Selected Wings:');
          console.log('- Processor:', gameProgress?.upgrades['selected-wing-processor'] ? 'SELECTED' : 'Not Selected');
          console.log('- Crew Quarters:', gameProgress?.upgrades['selected-wing-crew-quarters'] ? 'SELECTED' : 'Not Selected');
          console.log('- Manufacturing:', gameProgress?.upgrades['selected-wing-manufacturing'] ? 'SELECTED' : 'Not Selected');
          console.log('Energy Amount:', gameProgress?.resources.energy?.amount);
          console.log('All Upgrades:', gameProgress?.upgrades);
          console.log('==============================');
        }}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center space-x-2 shadow-lg"
      >
        <AlertCircle className="h-5 w-5" />
        <span>Debug State</span>
      </button>
      
      {/* Reset Button */}
      <button 
        onClick={handleResetClick}
        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md flex items-center space-x-2 shadow-lg"
      >
        <AlertCircle className="h-5 w-5" />
        <span>Reset Game</span>
      </button>
      
      {showResetConfirm && (
        <div className="absolute bottom-full right-0 mb-2 p-4 bg-black border border-red-600 rounded-md shadow-lg w-64">
          <h3 className="text-red-500 font-bold mb-2">Reset All Progress?</h3>
          <p className="text-white text-sm mb-4">This will reset your entire game state back to default. This cannot be undone!</p>
          <div className="flex space-x-2">
            <button 
              onClick={() => setShowResetConfirm(false)}
              className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded-md text-sm"
            >
              Cancel
            </button>
            <button 
              onClick={handleResetConfirm}
              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md text-sm"
            >
              Yes, Reset
            </button>
          </div>
        </div>
      )}
    </div>
  );
  
  return (
    <>
      <ResourcePage 
        {...energyConfig} 
        unlockLog={unlockLog}
        unlockUpgrade={unlockUpgrade}
      />
      {showWingSelection && (
        <WingSelection onClose={() => setShowWingSelection(false)} />
      )}
      {/* Developer controls */}
      <DevControls />
    </>
  );
} 