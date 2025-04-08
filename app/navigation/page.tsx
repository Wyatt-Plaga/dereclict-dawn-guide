"use client"

import { NavBar } from "@/components/ui/navbar"
import { Compass, Rocket, Skull } from "lucide-react"
import { useSystemStatus } from "@/components/providers/system-status-provider"
import { useGame } from "@/app/game/hooks/useGame"
import Logger, { LogCategory, LogContext } from "@/app/utils/logger"
import GameLoader from '@/app/components/GameLoader'
import { useRouter } from "next/navigation"
import { REGION_DEFINITIONS } from "@/app/game/content/regions"
import { RegionType } from "@/app/game/types/combat"

// Region type removed, using definitions directly

export default function NavigationPage() {
  const { state, dispatch } = useGame()
  const { shouldFlicker } = useSystemStatus()
  const router = useRouter()
  
  Logger.debug(
    LogCategory.UI,
    `Rendering NavigationPage`,
    LogContext.UI_RENDER
  )
  
  // Get current region info from state and definitions
  const currentRegionId = state.navigation.currentRegion;
  const currentRegion = REGION_DEFINITIONS[currentRegionId];
  
  // Get boss progress
  const currentProgress = state.navigation.regionProgress[currentRegionId] || 0;
  const bossThreshold = currentRegion?.bossDefeatThreshold || 0; // Default to 0 if undefined
  const showBossProgress = currentRegion && bossThreshold > 0; // Only show if there is a threshold

  const initiateJump = () => {
    Logger.info(
      LogCategory.ACTIONS, 
      'Initiating jump sequence', 
      LogContext.NONE
    );
    dispatch({ type: 'INITIATE_JUMP' });
    setTimeout(() => {
      router.push('/encounter');
    }, 100);
  }
  
  return (
    <GameLoader>
      <main className="flex min-h-screen flex-col">
        <NavBar />
        
        <div className="flex flex-col p-4 md:p-8 md:ml-64">
          <div className="system-panel p-6 mb-6">
            <h1 className={`text-2xl font-bold text-primary mb-4 ${shouldFlicker('navigation') ? 'flickering-text' : ''}`}>Navigation</h1>
            
            {/* Current region display */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-3">
                <Compass className="h-5 w-5 text-chart-1" />
                <h2 className="text-lg font-medium">Current Location: {currentRegion?.name || 'Unknown Region'}</h2>
              </div>
              <p className="text-muted-foreground">
                {currentRegion?.description || 'No description available.'}
              </p>
              {/* Boss Progress Display */}
              {showBossProgress && (
                <div className="mt-4 pt-4 border-t border-accent/20 flex items-center gap-2 text-sm text-orange-400">
                  <Skull className="h-4 w-4" />
                  <span>Boss Encounter Progress: {currentProgress} / {bossThreshold}</span>
                  {/* Optional: Add a progress bar */}
                  {/* <div className="w-full bg-orange-900/50 rounded-full h-1.5 ml-2">
                    <div className="bg-orange-500 h-1.5 rounded-full" style={{ width: `${Math.min(100, (currentProgress / bossThreshold) * 100)}%` }}></div>
                  </div> */}
                </div>
              )}
            </div>
            
            {/* Ship status - moved above ship controls */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold mb-4 terminal-text">Ship Status</h2>
              <div className="system-panel p-4">
                <p className="text-muted-foreground">
                  All systems nominal. Jump drive charged and ready.
                </p>
              </div>
            </div>
            
            {/* Jump button */}
            <div>
              <h2 className="text-lg font-semibold mb-4 terminal-text">Ship Controls</h2>
              
              <button 
                onClick={initiateJump}
                className="system-panel w-full py-8 flex items-center justify-center hover:bg-accent/10 transition-colors"
              >
                <div className="flex flex-col items-center">
                  <Rocket className={`h-12 w-12 text-chart-1 mb-2 ${shouldFlicker('navigation') ? 'flickering-text' : ''}`} />
                  <span className="terminal-text">Initiate Jump</span>
                  <span className="text-xs text-muted-foreground mt-1">Engage engines and prepare for potential encounters</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </main>
    </GameLoader>
  )
} 