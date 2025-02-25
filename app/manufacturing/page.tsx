"use client"

import { useState, useEffect } from "react"
import { NavBar } from "@/components/ui/navbar"
import { Package, Cog, Warehouse, Factory } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { useSystemStatus } from "@/components/providers/system-status-provider"

export default function ManufacturingPage() {
  const [scrap, setScrap] = useState(0)
  const [cargoCapacity, setCargoCapacity] = useState(100)
  const [manufacturingBays, setManufacturingBays] = useState(0)
  const { shouldFlicker } = useSystemStatus()
  
  // Auto-generate scrap based on manufacturingBays rate (per second)
  useEffect(() => {
    if (manufacturingBays <= 0) return
    
    const interval = setInterval(() => {
      setScrap(current => {
        const newValue = current + manufacturingBays * 0.5
        return newValue > cargoCapacity ? cargoCapacity : newValue
      })
    }, 1000)
    
    return () => clearInterval(interval)
  }, [manufacturingBays, cargoCapacity])
  
  // Collect scrap on manual click
  const collectScrap = () => {
    setScrap(current => {
      const newValue = current + 1
      return newValue > cargoCapacity ? cargoCapacity : newValue
    })
  }
  
  // Upgrade cargo capacity
  const upgradeCargoHold = () => {
    const upgradeCost = Math.floor(cargoCapacity * 0.5)
    
    if (scrap >= upgradeCost) {
      setScrap(current => current - upgradeCost)
      setCargoCapacity(current => current * 1.5)
    }
  }
  
  // Upgrade manufacturing bay
  const upgradeManufacturingBay = () => {
    const upgradeCost = (manufacturingBays + 1) * 25
    
    if (scrap >= upgradeCost) {
      setScrap(current => current - upgradeCost)
      setManufacturingBays(current => current + 1)
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