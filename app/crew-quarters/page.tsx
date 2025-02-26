"use client"

import { useState, useEffect } from "react"
import { NavBar } from "@/components/ui/navbar"
import { Users, User, Home, Wrench, Plus } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { useSystemStatus } from "@/components/providers/system-status-provider"
import { useSupabase } from "@/utils/supabase/context"
import { updateResource } from "@/utils/game-helpers"

export default function CrewQuartersPage() {
  const [crew, setCrew] = useState(0)
  const [crewCapacity, setCrewCapacity] = useState(5)
  const [awakening, setAwakening] = useState(0)
  const [workerCrews, setWorkerCrews] = useState(0)
  const { shouldFlicker } = useSystemStatus()
  
  // Supabase integration
  const { gameProgress, triggerSave } = useSupabase()
  
  // Synchronize local state with gameProgress from context
  useEffect(() => {
    if (gameProgress?.resources?.crew) {
      console.log("Initializing crew quarters state from gameProgress:", gameProgress.resources.crew);
      setCrew(gameProgress.resources.crew.amount || 0);
      setCrewCapacity(gameProgress.resources.crew.capacity || 5);
      setWorkerCrews(gameProgress.resources.crew.workerCrews || 0);
    }
  }, [gameProgress]);
  
  // Auto-generate crew based on workerCrews rate (per 10 seconds)
  useEffect(() => {
    if (workerCrews <= 0 || !gameProgress) return
    
    const interval = setInterval(() => {
      // Get current values from gameProgress to stay in sync
      const currentAmount = gameProgress.resources.crew?.amount || 0;
      const currentCapacity = gameProgress.resources.crew?.capacity || 5;
      const currentWorkerCrews = gameProgress.resources.crew?.workerCrews || 0;
      
      // Only proceed if we have worker crews and haven't reached capacity
      if (currentWorkerCrews <= 0 || currentAmount >= currentCapacity) return;
      
      // Calculate new crew value respecting capacity
      const newValue = Math.min(currentAmount + currentWorkerCrews * 0.1, currentCapacity);
      
      // Use updateResource to handle state update and trigger save
      updateResource(
        gameProgress,
        'crew',
        'amount',
        newValue,
        triggerSave
      );
      
      // Update local state for UI
      setCrew(newValue);
    }, 1000)
    
    return () => clearInterval(interval)
  }, [workerCrews, crewCapacity, gameProgress, triggerSave])
  
  // Generate crew on manual click (awakening)
  const awakenCrew = () => {
    if (!gameProgress) return;
    
    // Get current values from gameProgress
    const currentAmount = gameProgress.resources.crew?.amount || 0;
    const currentCapacity = gameProgress.resources.crew?.capacity || 5;
    
    // Only proceed if we haven't reached capacity
    if (currentAmount >= currentCapacity) return;
    
    // Add 0.1 to crew for each click (it takes 10 clicks to awaken 1 crew member)
    const newValue = Math.min(currentAmount + 0.1, currentCapacity);
    
    console.log(`Awakening crew: ${currentAmount} -> ${newValue}`);
    
    // Update and save automatically using helper function
    updateResource(
      gameProgress,
      'crew',
      'amount',
      newValue,
      triggerSave
    );
    
    // Update local state for UI
    setCrew(newValue);
    
    // Increment awakening counter
    setAwakening(current => current + 1);
  }
  
  // Upgrade crew capacity
  const upgradeQuarters = () => {
    if (!gameProgress) return;
    
    const currentAmount = gameProgress.resources.crew?.amount || 0;
    const currentCapacity = gameProgress.resources.crew?.capacity || 5;
    const upgradeCost = Math.floor(currentCapacity * 0.6);
    
    if (currentAmount >= upgradeCost) {
      // Calculate new values
      const newAmount = currentAmount - upgradeCost;
      const newCapacity = currentCapacity + 3;
      
      // Update crew amount first
      const updatedProgress1 = updateResource(
        gameProgress,
        'crew',
        'amount',
        newAmount,
        () => {} // Don't trigger save yet to batch updates
      );
      
      // Then update capacity and trigger save
      updateResource(
        updatedProgress1,
        'crew',
        'capacity',
        newCapacity,
        triggerSave
      );
      
      // Update local state for UI
      setCrew(newAmount);
      setCrewCapacity(newCapacity);
    }
  }
  
  // Upgrade auto awakening
  const upgradeWorkerCrews = () => {
    if (!gameProgress) return;
    
    const currentAmount = gameProgress.resources.crew?.amount || 0;
    const currentWorkerCrews = gameProgress.resources.crew?.workerCrews || 0;
    const upgradeCost = Math.floor((currentWorkerCrews + 1) * 2.5);
    
    if (currentAmount >= upgradeCost && currentWorkerCrews < 5) { // max 5 worker crews
      // Calculate new values
      const newAmount = currentAmount - upgradeCost;
      const newWorkerCrews = currentWorkerCrews + 1;
      
      // Update crew amount first
      const updatedProgress1 = updateResource(
        gameProgress,
        'crew',
        'amount',
        newAmount,
        () => {} // Don't trigger save yet to batch updates
      );
      
      // Then update worker crews and trigger save
      updateResource(
        updatedProgress1,
        'crew',
        'workerCrews',
        newWorkerCrews,
        triggerSave
      );
      
      // Update local state for UI
      setCrew(newAmount);
      setWorkerCrews(newWorkerCrews);
    }
  }
  
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
            <Progress value={(crew / crewCapacity) * 100} className="h-2 bg-muted" indicatorClassName="bg-chart-3" />
            <div className="text-xs text-muted-foreground mt-1">
              {workerCrews > 0 && <span>+{(workerCrews * 0.1).toFixed(1)} per second (auto-awakening)</span>}
            </div>
          </div>
          
          {/* Manual button */}
          <button 
            onClick={awakenCrew} 
            disabled={crew >= crewCapacity}
            className={`system-panel w-full py-8 flex items-center justify-center mb-8 transition-colors ${
              crew >= crewCapacity ? 'opacity-50 cursor-not-allowed' : 'hover:bg-accent/10'
            }`}
          >
            <div className="flex flex-col items-center">
              <User className={`h-12 w-12 text-chart-3 mb-2 ${shouldFlicker('crew') ? 'flickering-text' : ''}`} />
              <span className="terminal-text">Awaken Crew Member</span>
              <span className="text-xs text-muted-foreground mt-1">
                {awakening % 10 === 0 ? 
                  "Initiate awakening sequence" : 
                  `Awakening progress: ${awakening % 10}/10`
                }
              </span>
            </div>
          </button>
          
          {/* Upgrades section */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold terminal-text">Upgrades</h2>
            
            {/* Quarters upgrade */}
            <div 
              className={`system-panel p-4 ${crew >= Math.floor(crewCapacity * 0.6) ? 'cursor-pointer hover:bg-accent/10' : 'opacity-60'}`}
              onClick={upgradeQuarters}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <Home className="h-5 w-5 text-chart-3 mr-2" />
                  <span>Additional Quarters</span>
                </div>
                <span className="font-mono text-xs">{Math.floor(crewCapacity * 0.6)} Crew</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Prepare {3} more crew quarters, increasing capacity to {crewCapacity + 3}
              </p>
            </div>
            
            {/* Worker crews upgrade */}
            {workerCrews < 5 && (
              <div 
                className={`system-panel p-4 ${crew >= Math.floor((workerCrews + 1) * 2.5) ? 'cursor-pointer hover:bg-accent/10' : 'opacity-60'}`}
                onClick={upgradeWorkerCrews}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <Wrench className="h-5 w-5 text-chart-3 mr-2" />
                    <span>Worker Crew</span>
                  </div>
                  <span className="font-mono text-xs">{Math.floor((workerCrews + 1) * 2.5)} Crew</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Dedicate crew to help awaken others (+0.1 crew per second)
                </p>
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