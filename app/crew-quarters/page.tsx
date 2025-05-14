"use client"

import { NavBar } from "@/components/ui/navbar"
import { Users, User, Home, Wrench, Plus, UserPlus, ArrowUpCircle, MinusCircle, PlusCircle } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { useSystemStatus } from "@/components/providers/system-status-provider"
import Logger, { LogCategory, LogContext } from "@/app/utils/logger"
import { useCrewQuarters } from "@/app/game/hooks/useCrewQuarters"
import GameLoader from '@/app/components/GameLoader';
import { Button } from "@/components/ui/button"

export default function CrewQuartersPage() {
  const { shouldFlicker } = useSystemStatus()
  
  // Use our specialized hook instead of directly using useGame
  const crewQuarters = useCrewQuarters()
  
  // Log component render
  Logger.debug(
    LogCategory.UI, 
    `Crew quarters page rendering with crew: ${crewQuarters.crew}`,
    [LogContext.UI_RENDER, LogContext.CREW_LIFECYCLE]
  );
  
  // Early exit or loading state if crewQuarters data isn't ready
  if (!crewQuarters) {
    return <GameLoader><p>Loading Crew Quarters...</p></GameLoader>;
  }
  
  return (
    <GameLoader>
      <main className="flex min-h-screen flex-col">
        <NavBar />
        
        <div className="flex flex-col p-4 md:p-8 md:ml-64">
          <div className="system-panel p-6 mb-6">
            <h1 className={`text-2xl font-bold text-primary mb-4 ${shouldFlicker('crew') ? 'flickering-text' : ''}`}>
              Crew Quarters
            </h1>
            <p className="text-muted-foreground mb-6">
              Manage your crew and their quarters.
            </p>
            
            {/* Resource display and automation controls */}
            <div className="mb-8">
              <div className="flex flex-col md:flex-row md:items-center md:gap-4">
                {crewQuarters.workerCrews > 0 && (
                  <div className="order-2 md:order-1 mt-3 md:mt-0 mb-3 md:mb-0 bg-background/30 rounded-md p-2 md:min-w-[140px]">
                    <div className="text-center mb-1">
                      <span className="text-xs text-muted-foreground">Active Crews</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={(e: React.MouseEvent) => { e.stopPropagation(); crewQuarters.adjustActiveCrews('decrease'); }} 
                        disabled={!crewQuarters.canDecreaseCrews}
                        className="h-7 w-7 rounded-md"
                      >
                        <MinusCircle className="h-4 w-4" />
                      </Button>
                      <span className="font-mono text-sm font-semibold mx-2">
                        {crewQuarters.activeWorkerCrews}/{crewQuarters.workerCrews}
                      </span>
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={(e: React.MouseEvent) => { e.stopPropagation(); crewQuarters.adjustActiveCrews('increase'); }} 
                        disabled={!crewQuarters.canIncreaseCrews}
                        className="h-7 w-7 rounded-md"
                      >
                        <PlusCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
                
                <div className="order-1 md:order-2 flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <Users className="h-5 w-5 text-chart-3 mr-2" />
                      <span className="terminal-text">Crew</span>
                    </div>
                    <span className="font-mono">{crewQuarters.crew.toFixed(0)} / {crewQuarters.crewCapacity.toFixed(0)}</span>
                  </div>
                  <Progress value={(crewQuarters.crew / crewQuarters.crewCapacity) * 100} className="h-2 bg-muted" indicatorClassName="bg-chart-3" />
                  <div className="text-xs text-muted-foreground mt-1">
                    {crewQuarters.crewPerSecond > 0 && <span>+{crewQuarters.crewPerSecond.toFixed(1)} per second</span>}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Manual button - Simplified */}
            <button 
              onClick={crewQuarters.awakenCrew}
              disabled={!crewQuarters.canAwaken}
              className={`system-panel w-full py-8 flex items-center justify-center mb-8 transition-colors ${!crewQuarters.canAwaken ? 'opacity-60 cursor-not-allowed' : 'hover:bg-accent/10'}`}
            >
              <div className="flex flex-col items-center">
                <UserPlus className={`h-12 w-12 text-chart-3 mb-2 ${shouldFlicker('crew') ? 'flickering-text' : ''}`} />
                <span className="terminal-text">Awaken Crew</span>
              </div>
            </button>
            
            {/* Upgrades section */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold terminal-text">Upgrades</h2>
              
              {/* Additional Quarters upgrade */}
              <div className={`system-panel p-4 ${crewQuarters.canUpgradeQuarters ? 'cursor-pointer hover:bg-accent/10' : 'opacity-60'}`}
                   onClick={crewQuarters.upgradeQuarters}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <Home className="h-5 w-5 text-chart-3 mr-2" />
                    <span>Additional Quarters</span>
                  </div>
                  <span className="font-mono text-xs">{crewQuarters.quarterCost}</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {crewQuarters.quarterDescription}
                </p>
                <div className="mt-2 text-xs">
                  Level: {crewQuarters.additionalQuarters}
                </div>
              </div>
              
              {/* Worker Crews upgrade */}
              <div className={`system-panel p-4 ${crewQuarters.canUpgradeWorkerCrews ? 'cursor-pointer hover:bg-accent/10' : 'opacity-60'}`}
                   onClick={crewQuarters.upgradeWorkerCrews}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <UserPlus className="h-5 w-5 text-chart-3 mr-2" />
                    <span>Worker Crews</span>
                  </div>
                  <span className="font-mono text-xs">{crewQuarters.workerCrewCost}</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {crewQuarters.workerCrewDescription}
                </p>
                <div className="mt-2 text-xs">
                  Level: {crewQuarters.workerCrews}
                </div>
              </div>
              
              {/* Crew assignments placeholder */}
              <h2 className="text-lg font-semibold terminal-text pt-4 mt-6 border-t border-border">
                Crew Assignments
              </h2>
              <p className="text-xs text-muted-foreground mb-4">
                Assign your crew to various tasks to boost efficiency.
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
                  Assign crew to boost reactor efficiency (Coming Soon)
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
                  Assign crew to assist with processing (Coming Soon)
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </GameLoader>
  )
} 