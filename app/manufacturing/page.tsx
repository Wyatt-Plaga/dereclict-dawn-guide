"use client"

import { useState, useEffect } from "react"
import { NavBar } from "@/components/ui/navbar"
import { Package, Cog, Warehouse, Factory } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { useSystemStatus } from "@/components/providers/system-status-provider"
import { useSupabase } from "@/utils/supabase/context"
import { updateResource } from "@/utils/game-helpers"

export default function ManufacturingPage() {
  const [scrap, setScrap] = useState(0)
  const [cargoCapacity, setCargoCapacity] = useState(100)
  const [manufacturingBays, setManufacturingBays] = useState(0)
  const { shouldFlicker } = useSystemStatus()
  
  // Supabase integration
  const { gameProgress, triggerSave } = useSupabase()
  
  // Synchronize local state with gameProgress from context
  useEffect(() => {
    if (gameProgress?.resources?.scrap) {
      console.log("Initializing manufacturing state from gameProgress:", gameProgress.resources.scrap);
      setScrap(gameProgress.resources.scrap.amount || 0);
      setCargoCapacity(gameProgress.resources.scrap.capacity || 100);
      setManufacturingBays(gameProgress.resources.scrap.manufacturingBays || 0);
    }
  }, [gameProgress]);
  
  // Auto-generate scrap based on manufacturingBays rate (per second)
  useEffect(() => {
    if (manufacturingBays <= 0 || !gameProgress) return
    
    const interval = setInterval(() => {
      // Get current values from gameProgress to stay in sync
      const currentAmount = gameProgress.resources.scrap?.amount || 0;
      const currentCapacity = gameProgress.resources.scrap?.capacity || 100;
      const currentBays = gameProgress.resources.scrap?.manufacturingBays || 0;
      
      // Only proceed if we have manufacturing bays
      if (currentBays <= 0) return;
      
      // Calculate new scrap value respecting capacity
      const newValue = Math.min(currentAmount + currentBays * 0.5, currentCapacity);
      
      // Use updateResource to handle state update and trigger save
      updateResource(
        gameProgress,
        'scrap',
        'amount',
        newValue,
        triggerSave
      );
      
      // Update local state for UI
      setScrap(newValue);
    }, 1000)
    
    return () => clearInterval(interval)
  }, [manufacturingBays, cargoCapacity, gameProgress, triggerSave])
  
  // Collect scrap on manual click
  const collectScrap = () => {
    if (!gameProgress) return;
    
    // Get current values from gameProgress
    const currentAmount = gameProgress.resources.scrap?.amount || 0;
    const currentCapacity = gameProgress.resources.scrap?.capacity || 100;
    
    // Calculate new scrap value with +1 increment, respecting capacity
    const newValue = Math.min(currentAmount + 1, currentCapacity);
    
    console.log(`Collecting scrap: ${currentAmount} -> ${newValue}`);
    
    // Update and save automatically using helper function
    updateResource(
      gameProgress,
      'scrap',
      'amount',
      newValue,
      triggerSave
    );
    
    // Update local state for UI
    setScrap(newValue);
  }
  
  // Upgrade cargo capacity
  const upgradeCargoHold = () => {
    if (!gameProgress) return;
    
    const currentAmount = gameProgress.resources.scrap?.amount || 0;
    const currentCapacity = gameProgress.resources.scrap?.capacity || 100;
    const upgradeCost = Math.floor(currentCapacity * 0.5);
    
    if (currentAmount >= upgradeCost) {
      // Calculate new values
      const newAmount = currentAmount - upgradeCost;
      const newCapacity = currentCapacity * 1.5;
      
      // Update scrap amount first
      const updatedProgress1 = updateResource(
        gameProgress,
        'scrap',
        'amount',
        newAmount,
        () => {} // Don't trigger save yet to batch updates
      );
      
      // Then update capacity and trigger save
      updateResource(
        updatedProgress1,
        'scrap',
        'capacity',
        newCapacity,
        triggerSave
      );
      
      // Update local state for UI
      setScrap(newAmount);
      setCargoCapacity(newCapacity);
    }
  }
  
  // Upgrade manufacturing bay
  const upgradeManufacturingBay = () => {
    if (!gameProgress) return;
    
    const currentAmount = gameProgress.resources.scrap?.amount || 0;
    const currentBays = gameProgress.resources.scrap?.manufacturingBays || 0;
    const upgradeCost = (currentBays + 1) * 25;
    
    if (currentAmount >= upgradeCost) {
      // Calculate new values
      const newAmount = currentAmount - upgradeCost;
      const newBays = currentBays + 1;
      
      // Update scrap amount first
      const updatedProgress1 = updateResource(
        gameProgress,
        'scrap',
        'amount',
        newAmount,
        () => {} // Don't trigger save yet to batch updates
      );
      
      // Then update manufacturing bays and trigger save
      updateResource(
        updatedProgress1,
        'scrap',
        'manufacturingBays',
        newBays,
        triggerSave
      );
      
      // Update local state for UI
      setScrap(newAmount);
      setManufacturingBays(newBays);
    }
  }
  
  return (
    <main className="flex min-h-screen flex-col">
      <NavBar />
      
      <div className="flex flex-col p-4 md:p-8 md:ml-64">
        <div className="system-panel p-6 mb-6">
          <h1 className={`text-2xl font-bold text-primary mb-4 ${shouldFlicker('manufacturing') ? 'flickering-text' : ''}`}>Manufacturing Bay</h1>
          <p className="text-muted-foreground mb-6">
            Salvage and process ship materials. Collect Scrap to construct upgrades and repair systems.
          </p>
          
          {/* Resource display */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <Package className="h-5 w-5 text-chart-4 mr-2" />
                <span className="terminal-text">Scrap</span>
              </div>
              <span className="font-mono">{Math.floor(scrap)} / {Math.floor(cargoCapacity)}</span>
            </div>
            <Progress value={(scrap / cargoCapacity) * 100} className="h-2 bg-muted" indicatorClassName="bg-chart-4" />
            <div className="text-xs text-muted-foreground mt-1">
              {manufacturingBays > 0 && <span>+{manufacturingBays * 0.5} per second</span>}
            </div>
          </div>
          
          {/* Manual button */}
          <button 
            onClick={collectScrap} 
            disabled={scrap >= cargoCapacity}
            className={`system-panel w-full py-8 flex items-center justify-center mb-8 transition-colors ${
              scrap >= cargoCapacity ? 'opacity-50 cursor-not-allowed' : 'hover:bg-accent/10'
            }`}
          >
            <div className="flex flex-col items-center">
              <Cog className={`h-12 w-12 text-chart-4 mb-2 ${shouldFlicker('manufacturing') ? 'flickering-text' : ''}`} />
              <span className="terminal-text">Collect Scrap</span>
              <span className="text-xs text-muted-foreground mt-1">+1 Scrap per click</span>
            </div>
          </button>
          
          {/* Upgrades section */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold terminal-text">Upgrades</h2>
            
            {/* Cargo hold upgrade */}
            <div 
              className={`system-panel p-4 ${scrap >= Math.floor(cargoCapacity * 0.5) ? 'cursor-pointer hover:bg-accent/10' : 'opacity-60'}`}
              onClick={upgradeCargoHold}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <Warehouse className="h-5 w-5 text-chart-4 mr-2" />
                  <span>Cargo Hold Expansion</span>
                </div>
                <span className="font-mono text-xs">{Math.floor(cargoCapacity * 0.5)} Scrap</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Expand cargo storage capacity to {Math.floor(cargoCapacity * 1.5)}
              </p>
            </div>
            
            {/* Manufacturing bay upgrade */}
            <div 
              className={`system-panel p-4 ${scrap >= (manufacturingBays + 1) * 25 ? 'cursor-pointer hover:bg-accent/10' : 'opacity-60'}`}
              onClick={upgradeManufacturingBay}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <Factory className="h-5 w-5 text-chart-4 mr-2" />
                  <span>Manufacturing Bay</span>
                </div>
                <span className="font-mono text-xs">{(manufacturingBays + 1) * 25} Scrap</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Automated scrap collection (+0.5 per second)
              </p>
            </div>
            
            {/* Manufacturing projects placeholder */}
            <h2 className="text-lg font-semibold terminal-text pt-4 mt-6 border-t border-border">Projects</h2>
            <p className="text-xs text-muted-foreground mb-4">
              Use scrap to manufacture special components
            </p>
            
            <div className="opacity-60 system-panel p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <Cog className="h-5 w-5 text-chart-4 mr-2" />
                  <span>Hull Plating</span>
                </div>
                <span className="font-mono text-xs">200 Scrap</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Reinforce ship's hull integrity [Coming Soon]
              </p>
            </div>
            
            <div className="opacity-60 system-panel p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <Cog className="h-5 w-5 text-chart-4 mr-2" />
                  <span>Navigation System</span>
                </div>
                <span className="font-mono text-xs">300 Scrap</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Repair ship's navigation capabilities [Coming Soon]
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
} 