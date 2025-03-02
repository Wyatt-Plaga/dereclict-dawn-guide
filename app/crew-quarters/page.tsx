"use client"

import { NavBar } from "@/components/ui/navbar"
import { Users, User, Home, Wrench, Plus } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { useSystemStatus } from "@/components/providers/system-status-provider"
import { useGame } from "@/app/game/hooks/useGame"
import Logger, { LogCategory, LogContext } from "@/app/utils/logger"
import { useState, useEffect } from "react"

export default function CrewQuartersPage() {
  const { state, dispatch } = useGame()
  const { shouldFlicker } = useSystemStatus()
  const [awakeningFlavor, setAwakeningFlavor] = useState("")
  
  // Get crew quarters data from game state
  const crewQuarters = state.categories.crewQuarters
  const { crew } = crewQuarters.resources
  const { crewCapacity, crewPerSecond, awakeningProgress } = crewQuarters.stats
  
  // Log component render
  Logger.debug(
    LogCategory.UI, 
    `Crew quarters page rendering with crew: ${crew}`,
    [LogContext.UI_RENDER, LogContext.CREW_LIFECYCLE]
  );
  
  // Get awakening stage text based on progress
  const getAwakeningStageText = (progress: number) => {
    if (progress < 0.5) return "Cryopod dormant";
    if (progress < 3) return "Initiating warmup";
    if (progress < 5) return "Vital signs stabilizing";
    if (progress < 7) return "Neural activity detected";
    if (progress < 9) return "Consciousness returning";
    return "Final wake protocols";
  }
  
  // Random flavor texts for awakening process
  const awakeningFlavorTexts = [
    "Defrosting cryogel",
    "Restarting circulatory system",
    "Stimulating neural pathways",
    "Administering revival compounds",
    "Raising core temperature",
    "Checking cognitive functions", 
    "Clearing cryogenic fog",
    "Restoring memory functions",
    "Calibrating muscle response",
    "Finalizing wake sequence"
  ];
  
  // Generate crew on manual click (awakening)
  const awakenCrew = () => {
    if (crew >= crewCapacity) return;
    
    Logger.debug(
      LogCategory.UI, 
      'Awaken crew button clicked', 
      LogContext.CREW_LIFECYCLE
    );
    
    // Set a random flavor text when clicked
    const randomFlavor = awakeningFlavorTexts[Math.floor(Math.random() * awakeningFlavorTexts.length)];
    setAwakeningFlavor(randomFlavor);
    
    dispatch({
      type: 'CLICK_RESOURCE',
      payload: {
        category: 'crewQuarters'
      }
    })
  }
  
  // Upgrade crew capacity
  const upgradeQuarters = () => {
    Logger.debug(
      LogCategory.UI, 
      'Upgrade crew quarters clicked', 
      [LogContext.UPGRADE_PURCHASE, LogContext.CREW_LIFECYCLE]
    );
    
    dispatch({
      type: 'PURCHASE_UPGRADE',
      payload: {
        category: 'crewQuarters',
        upgradeType: 'additionalQuarters'
      }
    })
  }
  
  // Upgrade auto awakening
  const upgradeWorkerCrews = () => {
    Logger.debug(
      LogCategory.UI, 
      'Upgrade worker crews clicked', 
      [LogContext.UPGRADE_PURCHASE, LogContext.CREW_LIFECYCLE]
    );
    
    dispatch({
      type: 'PURCHASE_UPGRADE',
      payload: {
        category: 'crewQuarters',
        upgradeType: 'workerCrews'
      }
    })
  }
  
  // Calculate upgrade costs
  const quartersCost = Math.floor(crewCapacity * 0.6)
  const workerCrewCost = Math.floor((crewQuarters.upgrades.workerCrews + 1) * 2.5)
  const maxWorkerCrews = 5
  
  // Format crew count (show as integers when whole numbers, 1 decimal when partial)
  const formatCrewCount = (count: number) => {
    return Number.isInteger(count) ? count.toString() : count.toFixed(1)
  }
  
  return (
    <main className="flex min-h-screen flex-col">
      <NavBar />
      
      <div className="flex flex-col p-4 md:p-8 md:ml-64">
        <div className="system-panel p-6 mb-6">
          <h1 className={`text-2xl font-bold text-primary mb-4 ${shouldFlicker('crew') ? 'flickering-text' : ''}`}>Crew Quarters</h1>
          <p className="text-muted-foreground mb-6">
            Awaken and manage the ship's crew from cryostasis. Each crew member can be assigned to help with ship operations.
          </p>
          
          {/* Resource display */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <Users className="h-5 w-5 text-chart-3 mr-2" />
                <span className="terminal-text">Crew Members</span>
              </div>
              <span className="font-mono">{formatCrewCount(crew)} / {crewCapacity}</span>
            </div>
            <div className="relative h-2">
              {/* Base progress bar for current crew */}
              <Progress 
                value={(crew / crewCapacity) * 100} 
                className="h-2 bg-muted" 
                indicatorClassName="bg-chart-3" 
              />
              
              {/* Overlay bar for awakening progress */}
              {awakeningProgress > 0 && crew < crewCapacity && (
                <div 
                  className="absolute top-0 h-2 bg-amber-500" 
                  style={{
                    left: `${(crew / crewCapacity) * 100}%`,
                    width: `${Math.min(
                      // The width of a single unit's progress bar
                      (awakeningProgress / 10) * (100 / crewCapacity),
                      // Don't exceed the remaining space
                      100 - (crew / crewCapacity) * 100
                    )}%`
                  }}
                ></div>
              )}
            </div>
            <div className="text-xs text-muted-foreground mt-1 flex justify-between">
              {crewPerSecond > 0 && <span>+{crewPerSecond.toFixed(1)} awakening progress per second</span>}
              {awakeningProgress > 0 && (
                <span className="font-mono text-amber-400">Awakening: {awakeningProgress.toFixed(1)}/10</span>
              )}
            </div>
          </div>
          
          {/* Manual button */}
          <button 
            onClick={awakenCrew} 
            disabled={crew >= crewCapacity}
            className={`system-panel w-full py-8 flex items-center justify-center mb-2 transition-colors ${
              crew >= crewCapacity ? 'opacity-50 cursor-not-allowed' : 'hover:bg-accent/10'
            }`}
          >
            <div className="flex flex-col items-center">
              <User className={`h-12 w-12 text-chart-3 mb-2 ${shouldFlicker('crew') ? 'flickering-text' : ''}`} />
              <span className="terminal-text">Awaken Crew Member</span>
              <span className="text-xs text-muted-foreground mt-1">
                {awakeningProgress > 0 ? `Progress: ${awakeningProgress.toFixed(1)}/10` : "Click to begin awakening"}
              </span>
            </div>
          </button>
          
          {/* Awakening status texts */}
          <div className="mb-8 flex justify-between text-xs text-muted-foreground">
            <span className="font-mono">{getAwakeningStageText(awakeningProgress)}</span>
            {awakeningFlavor && (
              <span className="font-mono text-amber-400">{awakeningFlavor}</span>
            )}
          </div>
          
          {/* Upgrades section */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold terminal-text">Upgrades</h2>
            
            {/* Quarters upgrade */}
            <div 
              className={`system-panel p-4 ${crew >= quartersCost ? 'cursor-pointer hover:bg-accent/10' : 'opacity-60'}`}
              onClick={upgradeQuarters}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <Home className="h-5 w-5 text-chart-3 mr-2" />
                  <span>Additional Quarters</span>
                </div>
                <span className="font-mono text-xs">{quartersCost} Crew</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Prepare {3} more crew quarters, increasing capacity to {crewCapacity + 3}
              </p>
              <div className="mt-2 text-xs">
                Level: {crewQuarters.upgrades.additionalQuarters}
              </div>
            </div>
            
            {/* Worker crews upgrade */}
            {crewQuarters.upgrades.workerCrews < maxWorkerCrews && (
              <div 
                className={`system-panel p-4 ${crew >= workerCrewCost ? 'cursor-pointer hover:bg-accent/10' : 'opacity-60'}`}
                onClick={upgradeWorkerCrews}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <Wrench className="h-5 w-5 text-chart-3 mr-2" />
                    <span>Worker Crew</span>
                  </div>
                  <span className="font-mono text-xs">{workerCrewCost} Crew</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Dedicate crew to help awaken others (+1.0 awakening progress per second)
                </p>
                <div className="mt-2 text-xs">
                  Level: {crewQuarters.upgrades.workerCrews}
                </div>
              </div>
            )}
            
            {/* Crew assignments placeholder */}
            <h2 className="text-lg font-semibold terminal-text pt-4 mt-6 border-t border-border">Crew Assignments</h2>
            <p className="text-xs text-muted-foreground mb-4">
              Assign crew to boost operations in other ship systems
            </p>
            
            <div className="opacity-60 system-panel p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <Plus className="h-5 w-5 text-chart-3 mr-2" />
                  <span>Reactor Team</span>
                </div>
                <span className="font-mono text-xs">3 Crew</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Assign crew to boost reactor efficiency [Coming Soon]
              </p>
            </div>
            
            <div className="opacity-60 system-panel p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <Plus className="h-5 w-5 text-chart-3 mr-2" />
                  <span>Research Team</span>
                </div>
                <span className="font-mono text-xs">3 Crew</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Assign crew to assist with processing [Coming Soon]
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
} 