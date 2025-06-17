"use client"

import { NavBar } from "@/components/ui/navbar"
import { Battery, Zap, ArrowUpCircle, Shield, Gauge, CpuIcon, Users, Package, Rocket } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { useSystemStatus } from "@/components/providers/system-status-provider"
import { useGame } from "@/game-engine/hooks/useGame"
import { useDevMode } from "@/components/providers/dev-mode-provider"
import Logger, { LogCategory, LogContext } from "@/app/utils/logger"
import GameLoader from '@/app/components/GameLoader'

export default function ReactorPage() {
  const { state, dispatch } = useGame()
  const { shouldFlicker } = useSystemStatus()
  const { devMode } = useDevMode()
  
  // Get reactor data from game state
  const reactor = state.categories.reactor
  const { energy } = reactor.resources
  const { energyCapacity, energyPerSecond } = reactor.stats
  const relics = state.relics
  
  // Wing unlock states
  const processorUnlocked = (state.categories.processor.upgrades.unlocked || 0) > 0
  const crewUnlocked = (state.categories.crewQuarters.upgrades.unlocked || 0) > 0
  const manufacturingUnlocked = (state.categories.manufacturing.upgrades.unlocked || 0) > 0
  
  const unlockCost = 1
  const navUnlockCost = 200
  
  const navigationUnlocked = (state.categories.reactor.upgrades.navigationUnlocked || 0) > 0
  
  const unlockWing = (upgradeType: string) => {
    dispatch({
      type: 'PURCHASE_UPGRADE',
      payload: { category: 'reactor', upgradeType }
    })
  }
  
  const unlockNavigationSystem = () => {
    dispatch({
      type: 'PURCHASE_UPGRADE',
      payload: { category: 'reactor', upgradeType: 'unlockNavigation' }
    })
  }
  
  // Log component render
  Logger.debug(
    LogCategory.UI,
    `Rendering ReactorPage: Energy: ${energy}/${energyCapacity}`,
    LogContext.UI_RENDER
  )
  
  // Handle reactor click
  const generateEnergy = () => {
    Logger.debug(LogCategory.ACTIONS, "Manual energy generation clicked", LogContext.REACTOR_LIFECYCLE)
    dispatch({
      type: 'CLICK_RESOURCE',
      payload: { category: 'reactor' }
    })
  }
  
  // Upgrade energy capacity
  const upgradeCapacity = () => {
    Logger.debug(
      LogCategory.UI, 
      'Upgrade reactor capacity clicked', 
      [LogContext.UPGRADE_PURCHASE, LogContext.REACTOR_LIFECYCLE]
    );
    
    dispatch({
      type: 'PURCHASE_UPGRADE',
      payload: {
        category: 'reactor',
        upgradeType: 'reactorExpansions'
      }
    })
  }
  
  // Upgrade auto generation
  const upgradeAutoGeneration = () => {
    Logger.debug(
      LogCategory.UI, 
      'Upgrade energy converters clicked', 
      [LogContext.UPGRADE_PURCHASE, LogContext.REACTOR_LIFECYCLE]
    );
    
    dispatch({
      type: 'PURCHASE_UPGRADE',
      payload: {
        category: 'reactor',
        upgradeType: 'energyConverters'
      }
    })
  }
  
  // Upgrade shielding
  const purchaseShielding = () => {
    dispatch({
      type: 'PURCHASE_UPGRADE',
      payload: { category: 'reactor', upgradeType: 'shielding' }
    })
  }
  
  // Upgrade converter efficiency
  const upgradeEfficiency = () => {
    dispatch({
      type: 'PURCHASE_UPGRADE',
      payload: { category: 'reactor', upgradeType: 'converterEfficiency' }
    })
  }
  
  const shieldingPurchased = reactor.upgrades.shielding === 1
  const shieldCost = 50 // matches catalog
  
  const efficiencyLevel = reactor.upgrades.converterEfficiency || 0
  const efficiencyCost = 10 * Math.pow(efficiencyLevel + 1, 2)
  
  // Calculate upgrade costs
  const expansionCost = Math.floor(energyCapacity * 0.8)
  const converterCost = (reactor.upgrades.energyConverters + 1) * 20
  
  return (
    <GameLoader>
      <main className="flex min-h-screen flex-col">
        <NavBar />
        
        <div className="flex flex-col p-4 md:p-8 md:ml-64">
          <div className="system-panel p-6 mb-6">
            <h1 className={`text-2xl font-bold text-primary mb-4 ${shouldFlicker('reactor') ? 'flickering-text' : ''}`}>Reactor Core</h1>
            <p className="text-muted-foreground mb-6">
              The ship&apos;s primary energy generation system. Repair and enhance to power all ship functions.
            </p>
            
            {/* Resource display */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <Battery className="h-5 w-5 text-chart-1 mr-2" />
                  <span className="terminal-text">Energy</span>
                </div>
                <span className="font-mono">{Math.floor(energy)} / {Math.floor(energyCapacity)}</span>
              </div>
              <Progress value={(energy / energyCapacity) * 100} className="h-2 bg-muted" indicatorClassName="bg-chart-1" />
              <div className="text-xs text-muted-foreground mt-1">
                {energyPerSecond > 0 && <span>+{energyPerSecond} per second</span>}
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
              <div className={`system-panel p-4 ${energy >= expansionCost ? 'cursor-pointer hover:bg-accent/10' : 'opacity-60'}`}
                   onClick={upgradeCapacity}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <ArrowUpCircle className="h-5 w-5 text-chart-1 mr-2" />
                    <span>Reactor Expansion</span>
                  </div>
                  <span className="font-mono text-xs">{expansionCost} Energy</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Expand energy storage capacity to {Math.floor(energyCapacity * 1.5)}
                </p>
                <div className="mt-2 text-xs">
                  Level: {reactor.upgrades.reactorExpansions}
                </div>
              </div>
              
              {/* Auto generation upgrade */}
              <div className={`system-panel p-4 ${energy >= converterCost ? 'cursor-pointer hover:bg-accent/10' : 'opacity-60'}`}
                   onClick={upgradeAutoGeneration}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <Zap className="h-5 w-5 text-chart-1 mr-2" />
                    <span>Energy Converter</span>
                  </div>
                  <span className="font-mono text-xs">{converterCost} Energy</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Add +1 automatic energy generation per second
                </p>
                <div className="mt-2 text-xs">
                  Level: {reactor.upgrades.energyConverters}
                </div>
              </div>
              
              {/* Converter efficiency (relics) */}
              {(devMode || relics > 0 || efficiencyLevel > 0) && (
              <div className={`system-panel p-4 ${relics >= efficiencyCost ? 'cursor-pointer hover:bg-accent/10' : 'opacity-60'}`}
                   onClick={upgradeEfficiency}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <Gauge className="h-5 w-5 text-chart-1 mr-2" />
                    <span>Converter Efficiency</span>
                  </div>
                  <span className="font-mono text-xs">{efficiencyCost} Relics</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Each energy converter produces +{efficiencyLevel + 1} energy/s
                </p>
                <div className="mt-2 text-xs">
                  Level: {efficiencyLevel}
                </div>
              </div>) }
              
              {/* Shielding upgrade */}
              {(devMode || relics > 0 || shieldingPurchased) && (
              <div className={`system-panel p-4 ${!shieldingPurchased && relics >= shieldCost ? 'cursor-pointer hover:bg-accent/10' : 'opacity-60'}`}
                   onClick={purchaseShielding}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <Shield className="h-5 w-5 text-chart-5 mr-2" />
                    <span>Shielding</span>
                  </div>
                  {!shieldingPurchased && <span className="font-mono text-xs">{shieldCost} Relics</span>}
                  {shieldingPurchased && <span className="text-xs text-primary">Installed</span>}
                </div>
                <p className="text-xs text-muted-foreground">
                  {shieldingPurchased ? 'Shields active' : 'Enable 50-point shields'}
                </p>
              </div>) }

              {/* Wing Unlocks (cost 1 relic) */}
              {(devMode || relics > 0) && !processorUnlocked && (
              <div className={`system-panel p-4 ${(relics >= unlockCost && !processorUnlocked) ? 'cursor-pointer hover:bg-accent/10' : 'opacity-60'}`}
                   onClick={() => !processorUnlocked && unlockWing('unlockProcessor')}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <CpuIcon className="h-5 w-5 text-chart-2 mr-2" />
                    <span>Unlock Processor Wing</span>
                  </div>
                  {!processorUnlocked && <span className="font-mono text-xs">1 Relic</span>}
                  {processorUnlocked && <span className="text-xs text-primary">Unlocked</span>}
                </div>
              </div>) }

              {(devMode || relics > 0) && !crewUnlocked && (
              <div className={`system-panel p-4 ${(relics >= unlockCost && !crewUnlocked) ? 'cursor-pointer hover:bg-accent/10' : 'opacity-60'}`}
                   onClick={() => !crewUnlocked && unlockWing('unlockCrewQuarters')}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <Users className="h-5 w-5 text-chart-3 mr-2" />
                    <span>Unlock Crew Quarters</span>
                  </div>
                  {!crewUnlocked && <span className="font-mono text-xs">1 Relic</span>}
                  {crewUnlocked && <span className="text-xs text-primary">Unlocked</span>}
                </div>
              </div>) }

              {(devMode || relics > 0) && !manufacturingUnlocked && (
              <div className={`system-panel p-4 ${(relics >= unlockCost && !manufacturingUnlocked) ? 'cursor-pointer hover:bg-accent/10' : 'opacity-60'}`}
                   onClick={() => !manufacturingUnlocked && unlockWing('unlockManufacturing')}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <Package className="h-5 w-5 text-chart-4 mr-2" />
                    <span>Unlock Manufacturing</span>
                  </div>
                  {!manufacturingUnlocked && <span className="font-mono text-xs">1 Relic</span>}
                  {manufacturingUnlocked && <span className="text-xs text-primary">Unlocked</span>}
                </div>
              </div>) }

              {/* Navigation Unlock */}
              {(devMode || !navigationUnlocked) && (
              <div className={`system-panel p-4 ${(energy >= navUnlockCost && !navigationUnlocked) ? 'cursor-pointer hover:bg-accent/10' : 'opacity-60'}`}
                   onClick={() => !navigationUnlocked && unlockNavigationSystem()}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <Rocket className="h-5 w-5 text-chart-1 mr-2" />
                    <span>Unlock Navigation</span>
                  </div>
                  {!navigationUnlocked && <span className="font-mono text-xs">{navUnlockCost} Energy</span>}
                  {navigationUnlocked && <span className="text-xs text-primary">Unlocked</span>}
                </div>
                <p className="text-xs text-muted-foreground">
                  Gain access to the Navigation console and explore regions
                </p>
              </div>) }
            </div>
          </div>
        </div>
      </main>
    </GameLoader>
  )
} 
