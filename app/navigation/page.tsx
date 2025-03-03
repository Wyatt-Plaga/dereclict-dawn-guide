"use client"

import { NavBar } from "@/components/ui/navbar"
import { Compass, Rocket } from "lucide-react"
import { useSystemStatus } from "@/components/providers/system-status-provider"
import { useGame } from "@/app/game/hooks/useGame"
import Logger, { LogCategory, LogContext } from "@/app/utils/logger"
import GameLoader from '@/app/components/GameLoader'
import { useRouter } from 'next/navigation'
import { useEffect } from "react"

// Region types
interface Region {
  id: string;
  name: string;
  description: string;
}

export default function NavigationPage() {
  const { state, dispatch } = useGame()
  const { shouldFlicker } = useSystemStatus()
  const router = useRouter()
  
  // If combat is active, redirect to battle page
  useEffect(() => {
    // Add safety check for combat state
    if (state.combat && state.combat.active) {
      router.push('/battle');
    }
  }, [state.combat?.active, router]);
  
  // Log component render
  Logger.debug(
    LogCategory.UI,
    `Rendering NavigationPage`,
    LogContext.UI_RENDER
  )
  
  // Default region if navigation state is not initialized
  const defaultRegionId = 'void';
  
  // Current region from game state with safety checks
  const currentRegion: Region = {
    id: state.navigation?.currentRegion || defaultRegionId,
    name: getRegionName(state.navigation?.currentRegion || defaultRegionId),
    description: getRegionDescription(state.navigation?.currentRegion || defaultRegionId)
  }
  
  // Initiate jump to a new region
  const initiateJump = () => {
    Logger.debug(
      LogCategory.COMBAT,
      `Initiating jump from ${currentRegion.id}`,
      LogContext.COMBAT
    );
    
    Logger.debug(
      LogCategory.COMBAT,
      `Navigation state: ${JSON.stringify(state.navigation)}`,
      LogContext.COMBAT
    );
    
    Logger.info(
      LogCategory.GAME_SYSTEMS,
      `Initiating jump from ${currentRegion.id}`,
      LogContext.COMBAT
    );
    
    dispatch({
      type: 'INITIATE_JUMP',
      payload: {
        fromRegion: currentRegion.id
      }
    });
    
    Logger.debug(
      LogCategory.COMBAT,
      `Jump action dispatched. Checking if combat is active: ${state.combat?.active}`,
      LogContext.COMBAT
    );
    
    // If combat is now active, the useEffect will handle redirection
  }
  
  function getRegionName(regionId: string): string {
    switch (regionId) {
      case 'void':
        return 'Void of Space';
      case 'nebula':
        return 'Azure Nebula';
      case 'asteroid-field':
        return 'Shattered Belt';
      case 'radiation-zone':
        return 'Gamma Sector';
      case 'supernova':
        return 'Stellar Graveyard';
      default:
        return 'Unknown Region';
    }
  }
  
  function getRegionDescription(regionId: string): string {
    switch (regionId) {
      case 'void':
        return 'The empty vacuum of space surrounds the Dawn. Long-range sensors detect potential areas of interest, but encounters are rare in this desolate region.';
      case 'nebula':
        return 'A dense cloud of ionized gases that interferes with sensors and shields. The colorful mists hide many secrets and dangers, but also rich energy sources.';
      case 'asteroid-field':
        return 'A dense field of rocky debris from a destroyed planet. Navigation is challenging, but the asteroids are rich in minerals and abandoned mining equipment.';
      case 'radiation-zone':
        return 'An area of space bathed in deadly radiation from an unstable pulsar. Ship systems experience interference, but the exotic particles can be harvested for research.';
      case 'supernova':
        return 'The remains of a massive star that went supernova centuries ago. The area is filled with exotic matter and dangerous anomalies, but also valuable resources.';
      default:
        return 'An uncharted region of space.';
    }
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
                <h2 className="text-lg font-medium">Current Location: {currentRegion.name}</h2>
              </div>
              <p className="text-muted-foreground">
                {currentRegion.description}
              </p>
            </div>
            
            {/* Jump button */}
            <div className="mb-8">
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
            
            {/* Ship status */}
            <div>
              <h2 className="text-lg font-semibold mb-4 terminal-text">Ship Status</h2>
              <div className="system-panel p-4">
                <p className="text-muted-foreground">
                  All systems nominal. Jump drive charged and ready.
                </p>
                <p className="text-muted-foreground mt-2">
                  Hull Integrity: {state.combat?.playerStats?.health || 100}/{state.combat?.playerStats?.maxHealth || 100}
                </p>
                <p className="text-muted-foreground mt-2">
                  Shield Status: {state.combat?.playerStats?.shield || 50}/{state.combat?.playerStats?.maxShield || 50}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </GameLoader>
  )
} 