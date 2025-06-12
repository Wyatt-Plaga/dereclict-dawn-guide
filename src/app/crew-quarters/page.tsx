"use client"

import { NavBar } from "@/components/ui/navbar"
import { Users, User, Home, Wrench, Plus } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { useSystemStatus } from "@/components/providers/system-status-provider"
import Logger, { LogCategory, LogContext } from "@/app/utils/logger"
import { useCrewQuarters } from "@/game-engine/hooks/useCrewQuarters"
import GameLoader from '@/app/components/GameLoader';

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
  
  return (
    <GameLoader>
      <main className="flex min-h-screen flex-col">
        <NavBar />
        
        <div className="flex flex-col p-4 md:p-8 md:ml-64">
          <div className="system-panel p-6 mb-6">
            <h1 className={`text-2xl font-bold text-primary mb-4 ${shouldFlicker('crew') ? 'flickering-text' : ''}`}>
              {crewQuarters.texts.title}
            </h1>
            <p className="text-muted-foreground mb-6">
              {crewQuarters.texts.description}
            </p>
            
            {/* Resource display */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <Users className="h-5 w-5 text-chart-3 mr-2" />
                  <span className="terminal-text">{crewQuarters.texts.crewMembersLabel}</span>
                </div>
                <span className="font-mono">{crewQuarters.formattedCrewCount} / {crewQuarters.crewCapacity}</span>
              </div>
              <div className="relative h-2">
                {/* Base progress bar for current crew */}
                <Progress 
                  value={(crewQuarters.crew / crewQuarters.crewCapacity) * 100} 
                  className="h-2 bg-muted" 
                  indicatorClassName="bg-chart-3" 
                />
                
                {/* Overlay bar for awakening progress */}
                {crewQuarters.awakeningProgress > 0 && crewQuarters.canAwaken && (
                  <div 
                    className="absolute top-0 h-2 bg-amber-500" 
                    style={{
                      left: `${(crewQuarters.crew / crewQuarters.crewCapacity) * 100}%`,
                      width: `${crewQuarters.calculateAwakeningProgressWidth()}%`
                    }}
                  ></div>
                )}
              </div>
              <div className="text-xs text-muted-foreground mt-1 flex justify-between">
                {crewQuarters.crewPerSecond > 0 && (
                  <span>+{crewQuarters.crewPerSecond.toFixed(1)} awakening progress per second</span>
                )}
                {crewQuarters.awakeningProgress > 0 && (
                  <span className="font-mono text-amber-400">
                    Awakening: {crewQuarters.awakeningProgress.toFixed(1)}/10
                  </span>
                )}
              </div>
            </div>
            
            {/* Manual button */}
            <button 
              onClick={crewQuarters.awakenCrew} 
              disabled={!crewQuarters.canAwaken}
              className={`system-panel w-full py-8 flex items-center justify-center mb-2 transition-colors ${
                !crewQuarters.canAwaken ? 'opacity-50 cursor-not-allowed' : 'hover:bg-accent/10'
              }`}
            >
              <div className="flex flex-col items-center">
                <User className={`h-12 w-12 text-chart-3 mb-2 ${shouldFlicker('crew') ? 'flickering-text' : ''}`} />
                <span className="terminal-text">{crewQuarters.texts.awakenButton}</span>
                <span className="text-xs text-muted-foreground mt-1">
                  {crewQuarters.awakeningProgress > 0 
                    ? `${crewQuarters.texts.progressLabel}: ${crewQuarters.awakeningProgress.toFixed(1)}/10` 
                    : crewQuarters.texts.awakenHint}
                </span>
              </div>
            </button>
            
            {/* Awakening status texts */}
            <div className="mb-8 flex justify-between text-xs text-muted-foreground">
              <span className="font-mono">{crewQuarters.awakeningStageText}</span>
              {crewQuarters.awakeningFlavor && (
                <span className="font-mono text-amber-400">{crewQuarters.awakeningFlavor}</span>
              )}
            </div>
            
            {/* Upgrades section */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold terminal-text">{crewQuarters.texts.upgradesTitle}</h2>
              
              {/* Quarters upgrade */}
              <div 
                className={`system-panel p-4 ${crewQuarters.canUpgradeQuarters ? 'cursor-pointer hover:bg-accent/10' : 'opacity-60'}`}
                onClick={crewQuarters.upgradeQuarters}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <Home className="h-5 w-5 text-chart-3 mr-2" />
                    <span>Additional Quarters</span>
                  </div>
                  <span className="font-mono text-xs">{crewQuarters.quartersCost} Crew</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {crewQuarters.additionalQuartersDescription}
                </p>
                <div className="mt-2 text-xs">
                  Level: {crewQuarters.quartersLevel}
                </div>
              </div>
              
              {/* Worker crews upgrade */}
              {crewQuarters.workerCrewLevel < crewQuarters.maxWorkerCrews && (
                <div 
                  className={`system-panel p-4 ${crewQuarters.canUpgradeWorkerCrews ? 'cursor-pointer hover:bg-accent/10' : 'opacity-60'}`}
                  onClick={crewQuarters.upgradeWorkerCrews}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <Wrench className="h-5 w-5 text-chart-3 mr-2" />
                      <span>Worker Crew</span>
                    </div>
                    <span className="font-mono text-xs">{crewQuarters.workerCrewCost} Crew</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {crewQuarters.workerCrewsDescription}
                  </p>
                  <div className="mt-2 text-xs">
                    Level: {crewQuarters.workerCrewLevel}
                  </div>
                </div>
              )}
              
              {/* Crew assignments placeholder */}
              <h2 className="text-lg font-semibold terminal-text pt-4 mt-6 border-t border-border">
                {crewQuarters.texts.assignmentsTitle}
              </h2>
              <p className="text-xs text-muted-foreground mb-4">
                {crewQuarters.texts.assignmentsDescription}
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
                  Assign crew to boost reactor efficiency {crewQuarters.texts.comingSoon}
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
                  Assign crew to assist with processing {crewQuarters.texts.comingSoon}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </GameLoader>
  )
} 
