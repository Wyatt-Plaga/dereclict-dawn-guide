"use client"

import { useState, useEffect } from "react"
import { ResourcePage } from "@/components/resources/resource-page"
import { energyConfig } from "@/components/resources/resource-config"
import { useSupabase } from "@/utils/supabase/context"
import { WingSelection } from "@/components/ui/wing-selection"

export default function ReactorPage() {
  const { gameProgress, unlockLog, unlockUpgrade } = useSupabase();
  const [showWingSelection, setShowWingSelection] = useState(false);
  
  // Check if the wing selection should be shown
  useEffect(() => {
    if (gameProgress?.upgrades && gameProgress.upgrades['unlock-wing']) {
      // Only show if we haven't unlocked any other wings yet
      const hasUnlockedWings = 
        gameProgress.upgrades['selected-wing-processor'] || 
        gameProgress.upgrades['selected-wing-crew-quarters'] || 
        gameProgress.upgrades['selected-wing-manufacturing'];
      
      if (!hasUnlockedWings) {
        setShowWingSelection(true);
      }
    }
  }, [gameProgress]);
  
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
    </>
  );
} 