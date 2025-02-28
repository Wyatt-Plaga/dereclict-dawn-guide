"use client"

import { useState, useEffect } from "react"
import { ResourcePage } from "@/components/resources/resource-page"
import { energyConfig } from "@/components/resources/resource-config"
import { useSupabase } from "@/utils/supabase/context"
import { WingSelection } from "@/components/ui/wing-selection"
import { GameEngineLayout } from "@/src/ui/layouts/GameEngineLayout"

export default function ReactorPage() {
  const { gameProgress, unlockLog, unlockUpgrade } = useSupabase();
  const [showWingSelection, setShowWingSelection] = useState(false);
  
  // Check if the wing selection should be shown
  useEffect(() => {
    if (gameProgress?.upgrades && gameProgress.upgrades['unlock-wing']) {
      // Only show if we haven't unlocked any other wings yet
      const hasUnlockedWings = ['processor', 'crew-quarters', 'manufacturing'].some(
        wing => gameProgress.availablePages?.includes(wing)
      );
      
      if (!hasUnlockedWings) {
        setShowWingSelection(true);
      }
    }
  }, [gameProgress]);
  
  return (
    <GameEngineLayout>
      {/* Use the original ResourcePage component for now */}
      <ResourcePage 
        {...energyConfig}
        unlockLog={unlockLog}
        unlockUpgrade={unlockUpgrade}
      />
      {showWingSelection && (
        <WingSelection onClose={() => setShowWingSelection(false)} />
      )}
    </GameEngineLayout>
  );
} 