"use client"

import { NavBar } from "@/components/ui/navbar"
import { Compass, Rocket, Lock, ArrowLeftRight } from "lucide-react"
import { useSystemStatus } from "@/components/providers/system-status-provider"
import { useGame } from "@/game-engine/hooks/useGame"
import Logger, { LogCategory, LogContext } from "@/app/utils/logger"
import GameLoader from '@/app/components/GameLoader'
import { useRouter } from "next/navigation"
import { Progress } from "@/components/ui/progress"
import { REGION_DEFINITIONS } from "@/game-engine/content/regions"
import { REGION_TYPE_STYLES } from "@/game-engine/content/regionStyles"
import { RegionType } from "@/game-engine/types/combat"
import { useState } from "react"
import { useDevMode } from "@/components/providers/dev-mode-provider"

// Constants
const JUMPS_PER_REGION = 6;

// Sub-region labels shown sequentially
const SUB_LABELS = ['α','β','γ'];

// Fallback names for region types that don't yet have full definitions
const REGION_TYPE_FALLBACK_NAMES: Record<RegionType, string> = {
  [RegionType.SUPERNOVA]: "Black Hole",
  [RegionType.RADIATION_ZONE]: "Inhabited Zone",
  [RegionType.ASTEROID_FIELD]: "Asteroid Belt",
  [RegionType.VOID]: "Void",
  [RegionType.NEBULA]: "Nebula",
};

export default function NavigationPage() {
  const { state, dispatch } = useGame()
  const { shouldFlicker } = useSystemStatus()
  const router = useRouter()
  const [showVoidView, setShowVoidView] = useState(true)
  const { devMode } = useDevMode()
  
  // Log component render
  Logger.debug(
    LogCategory.UI,
    `Rendering NavigationPage`,
    LogContext.UI_RENDER
  )
  
  // Derive current region from game state
  const currentRegionId = state?.navigation?.currentRegion ?? 'void';
  const currentRegionDef = REGION_DEFINITIONS[currentRegionId as keyof typeof REGION_DEFINITIONS];

  const currentRegionName = currentRegionDef?.name ?? REGION_TYPE_FALLBACK_NAMES[currentRegionId as RegionType] ?? currentRegionId;
  const currentRegionDescription = currentRegionDef?.description ?? '';

  const currentRegionType = currentRegionDef?.type ?? (currentRegionId as RegionType);
  const currentRegionConfig = REGION_TYPE_STYLES[currentRegionType] ?? REGION_TYPE_STYLES[RegionType.VOID];

  // All regions unlocked for testing
  const unlocked = (_regionId: string) => true;
  
  // Show regions based on toggle state
  const visibleRegions = showVoidView ? [RegionType.VOID] : [RegionType.NEBULA, RegionType.SUPERNOVA, RegionType.RADIATION_ZONE, RegionType.ASTEROID_FIELD];
  
  // Helper to get human-readable region name
  const getRegionName = (regionId: RegionType) => {
    return REGION_DEFINITIONS[regionId as keyof typeof REGION_DEFINITIONS]?.name ?? REGION_TYPE_FALLBACK_NAMES[regionId] ?? regionId;
  }

  // Dev helper – jump straight to a region
  const devSetRegion = (regionId: string) => {
    dispatch({ type: 'SELECT_REGION', payload: { region: regionId } });
  }
  
  // Dispatch INITIATE_JUMP action and navigate to encounter page
  const initiateJump = () => {
    Logger.info(
      LogCategory.ACTIONS, 
      'Initiating jump sequence', 
      LogContext.NONE
    );
    
    // Dispatch the action to generate an encounter
    dispatch({ type: 'INITIATE_JUMP' });
    
    // Give a small delay to ensure the state is updated before navigating
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
                <Compass className={`h-5 w-5 ${currentRegionConfig.colorClass}`} />
                <h2 className="text-lg font-medium">Current Location: {currentRegionName}</h2>
              </div>
              <p className="text-muted-foreground">
                {currentRegionDescription}
              </p>
            </div>
            
            {/* Region Progress / Selection */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold terminal-text">
                  {showVoidView ? "Current Region" : "Available Regions"}
                </h2>
                {devMode && (
                  <button
                    onClick={() => setShowVoidView(!showVoidView)}
                    className="flex items-center gap-2 px-3 py-1 text-sm border rounded-md hover:bg-accent/10 transition-colors"
                  >
                    <ArrowLeftRight className="h-4 w-4" />
                    {showVoidView ? "Show Main Regions" : "Show Void"}
                  </button>
                )}
              </div>
              <div className={`grid gap-4 ${showVoidView ? 'md:grid-cols-1' : 'grid-cols-2 md:grid-cols-4'}`}>
                {visibleRegions.map((regionId) => {
                  const jumps = state?.encounters?.history?.filter((h) => h.region === regionId).length || 0;
                  const progressValue = Math.min((jumps / JUMPS_PER_REGION) * 100, 100);
                  const isUnlocked = unlocked(regionId);
                  const isActive = currentRegionId === regionId;
                  const config = REGION_TYPE_STYLES[regionId as RegionType];
                  const IconComponent = config.icon;

                  return (
                    <div key={regionId} className={`system-panel p-4 flex flex-col gap-3 ${config.bgClass} border-2 ${isActive ? 'border-primary' : 'border-border'}`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <IconComponent className={`h-5 w-5 ${config.colorClass}`} />
                          <span className="font-medium">{getRegionName(regionId as RegionType)}</span>
                        </div>
                        {isActive && <span className="text-xs text-primary">Active</span>}
                        {!isUnlocked && <Lock className="h-4 w-4 text-muted-foreground" />}
                      </div>

                      {/* Sequential sub-region progress (skip for void) */}
                      {regionId !== 'void' && (
                        <div className="mt-4 flex flex-col gap-2">
                          {SUB_LABELS.map((label, idx) => {
                            const subUnlocked = Math.floor(jumps / JUMPS_PER_REGION) > idx;
                            const isCurrent = Math.floor(jumps / JUMPS_PER_REGION) === idx;
                            const progressInSub = isCurrent ? (jumps % JUMPS_PER_REGION) : 0;
                            const value = subUnlocked ? 100 : isCurrent ? (progressInSub / JUMPS_PER_REGION) * 100 : 0;
                            return (
                              <div key={label}>
                                <div className="flex items-center gap-1 text-sm font-medium mb-1">
                                  <span>{`Sub-region ${label}`}</span>
                                  {!subUnlocked && !isCurrent && <Lock className="h-3 w-3 text-muted-foreground" />}
                                </div>
                                <Progress value={value} indicatorClassName={subUnlocked || isCurrent ? config.barClass : 'bg-muted-foreground'} />
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {isUnlocked && !isActive && (
                        <button
                          onClick={() => dispatch({ type: 'SELECT_REGION', payload: { region: regionId } })}
                          className="mt-2 px-2 py-1 text-xs border rounded-md hover:bg-accent/10"
                        >
                          Travel ({regionId === 'void' ? 0 : 10} Energy)
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* Ship status */}
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
                  <Rocket className={`h-12 w-12 ${currentRegionConfig.colorClass} ${shouldFlicker('navigation') ? 'flickering-text' : ''}`} />
                  <span className={`font-mono tracking-wider ${currentRegionConfig.colorClass}`}>Initiate Jump</span>
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