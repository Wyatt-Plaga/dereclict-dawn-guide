"use client"

import { useState, useEffect } from "react"
import { NavBar } from "@/components/ui/navbar"
import { Battery, Zap, ArrowUpCircle } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { useSystemStatus } from "@/components/providers/system-status-provider"
import { useSearchParams } from "next/navigation"

export default function ReactorPage() {
  const [energy, setEnergy] = useState(0)
  const [energyCapacity, setEnergyCapacity] = useState(100)
  const [autoGeneration, setAutoGeneration] = useState(0)
  const { shouldFlicker } = useSystemStatus()
  
  // Auto-generate energy based on autoGeneration rate (per second)
  useEffect(() => {
    if (autoGeneration <= 0) return
    
    const interval = setInterval(() => {
      setEnergy(current => {
        const newValue = current + autoGeneration
        return newValue > energyCapacity ? energyCapacity : newValue
      })
    }, 1000)
    
    return () => clearInterval(interval)
  }, [autoGeneration, energyCapacity])
  
  // Generate energy on manual click
  const generateEnergy = () => {
    setEnergy(current => {
      const newValue = current + 1
      return newValue > energyCapacity ? energyCapacity : newValue
    })
  }
  
  // Upgrade energy capacity
  const upgradeCapacity = () => {
    if (energy >= energyCapacity * 0.8) {
      setEnergy(current => current - energyCapacity * 0.8)
      setEnergyCapacity(current => current * 1.5)
    }
  }
  
  // Upgrade auto generation
  const upgradeAutoGeneration = () => {
    const upgradeCost = (autoGeneration + 1) * 20
    
    if (energy >= upgradeCost) {
      setEnergy(current => current - upgradeCost)
      setAutoGeneration(current => current + 1)
    }
  }
  
  return (
    <main className="flex min-h-screen flex-col">
      <NavBar />
      
      <div className="flex flex-col p-4 md:p-8 md:ml-64">
        <div className="system-panel p-6 mb-6">
          <h1 className={`text-2xl font-bold text-primary mb-4 ${shouldFlicker('reactor') ? 'flickering-text' : ''}`}>Reactor Core</h1>
          <p className="text-muted-foreground mb-6">
            The ship's primary energy generation system. Repair and enhance to power all ship functions.
          </p>
          
          {/* Resource display */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <Battery className="h-5 w-5 text-chart-1 mr-2" />
                <span className="terminal-text">Energy</span>
              </div>
              <span className="font-mono">{Math.floor(energy)} / {energyCapacity}</span>
            </div>
            <Progress value={(energy / energyCapacity) * 100} className="h-2 bg-muted" indicatorClassName="bg-chart-1" />
            <div className="text-xs text-muted-foreground mt-1">
              {autoGeneration > 0 && <span>+{autoGeneration} per second</span>}
            </div>
          </div>
          
          {/* Manual button */}
          <button 
            onClick={generateEnergy} 
            className="system-panel w-full py-8 flex items-center justify-center mb-8 hover:bg-accent/10 transition-colors"
          >
            <div className="flex flex-col items-center">
              <Zap className={`h-12 w-12 text-chart-1 mb-2 ${shouldFlicker('reactor') ? 'flickering-text' : ''}`} />
              <span className="terminal-text">Generate Energy</span>
              <span className="text-xs text-muted-foreground mt-1">+1 Energy per click</span>
            </div>
          </button>
          
          {/* Upgrades section */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold terminal-text">Upgrades</h2>
            
            {/* Capacity upgrade */}
            <div className={`system-panel p-4 ${energy >= energyCapacity * 0.8 ? 'cursor-pointer hover:bg-accent/10' : 'opacity-60'}`}
                 onClick={upgradeCapacity}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <ArrowUpCircle className="h-5 w-5 text-chart-1 mr-2" />
                  <span>Reactor Expansion</span>
                </div>
                <span className="font-mono text-xs">{Math.floor(energyCapacity * 0.8)} Energy</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Expand energy storage capacity to {Math.floor(energyCapacity * 1.5)}
              </p>
            </div>
            
            {/* Auto generation upgrade */}
            <div className={`system-panel p-4 ${energy >= (autoGeneration + 1) * 20 ? 'cursor-pointer hover:bg-accent/10' : 'opacity-60'}`}
                 onClick={upgradeAutoGeneration}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <Zap className="h-5 w-5 text-chart-1 mr-2" />
                  <span>Energy Converter</span>
                </div>
                <span className="font-mono text-xs">{(autoGeneration + 1) * 20} Energy</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Add +1 automatic energy generation per second
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
} 