"use client"

import { NavBar } from "@/components/ui/navbar"
import { Shield, Zap, Wrench, Cpu, AlertTriangle } from "lucide-react"
import { useSystemStatus } from "@/components/providers/system-status-provider"
import { useGame } from "@/app/game/hooks/useGame"
import Logger, { LogCategory, LogContext } from "@/app/utils/logger"
import GameLoader from '@/app/components/GameLoader'
import Link from "next/link"
import { Progress } from "@/components/ui/progress"

// Enemy type
interface Enemy {
  id: string;
  name: string;
  health: number;
  maxHealth: number;
  image: string;
  weakness: 'shield' | 'weapon' | 'repair' | 'countermeasure';
}

export default function BattlePage() {
  const { state } = useGame()
  const { shouldFlicker } = useSystemStatus()
  
  // Get resources from game state
  const reactor = state.categories.reactor
  const processor = state.categories.processor
  const crewQuarters = state.categories.crewQuarters
  const manufacturing = state.categories.manufacturing
  
  // Log component render
  Logger.debug(
    LogCategory.UI,
    `Rendering BattlePage`,
    LogContext.UI_RENDER
  )
  
  // Mock battle state - in a full implementation this would be part of the game state
  const shipHealth = 80;
  const maxShipHealth = 100;
  
  // Example enemy with shield weakness
  const enemy: Enemy = {
    id: 'void-stalker',
    name: 'Void Stalker',
    health: 70,
    maxHealth: 100,
    image: '/enemy-void.png',
    weakness: 'shield'
  };
  
  // For a complete implementation, we would dispatch proper actions
  const useShield = () => {
    console.log('Using shield');
    // dispatch({ type: 'COMBAT_ACTION', payload: { actionType: 'shield' } })
  }
  
  const useWeapon = () => {
    console.log('Using weapon');
    // dispatch({ type: 'COMBAT_ACTION', payload: { actionType: 'weapon' } })
  }
  
  const useRepair = () => {
    console.log('Using repair');
    // dispatch({ type: 'COMBAT_ACTION', payload: { actionType: 'repair' } })
  }
  
  const useCountermeasure = () => {
    console.log('Using countermeasure');
    // dispatch({ type: 'COMBAT_ACTION', payload: { actionType: 'countermeasure' } })
  }
  
  const retreat = () => {
    console.log('Retreating from battle');
    // In a full implementation, we would:
    // dispatch({ type: 'RETREAT_FROM_BATTLE' })
  }
  
  return (
    <GameLoader>
      <main className="flex min-h-screen flex-col">
        <NavBar />
        
        <div className="flex flex-col p-4 md:p-8 md:ml-64">
          <div className="system-panel p-6 mb-6">
            <h1 className={`text-2xl font-bold text-primary mb-4 ${shouldFlicker('battle') ? 'flickering-text' : ''}`}>Combat Encounter</h1>
            
            {/* Battle status */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {/* Ship status */}
              <div className="system-panel p-4">
                <h2 className="text-lg font-medium mb-4">Dawn Status</h2>
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span>Hull Integrity</span>
                    <span>{shipHealth}/{maxShipHealth}</span>
                  </div>
                  <Progress value={(shipHealth / maxShipHealth) * 100} className="h-2 bg-muted" indicatorClassName="bg-chart-3" />
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Energy:</span> {Math.floor(reactor.resources.energy)}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Scrap:</span> {Math.floor(manufacturing.resources.scrap)}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Crew:</span> {Math.floor(crewQuarters.resources.crew)}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Insight:</span> {Math.floor(processor.resources.insight)}
                  </div>
                </div>
              </div>
              
              {/* Enemy status */}
              <div className="system-panel p-4">
                <h2 className="text-lg font-medium mb-4">Enemy: {enemy.name}</h2>
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span>Health</span>
                    <span>{enemy.health}/{enemy.maxHealth}</span>
                  </div>
                  <Progress value={(enemy.health / enemy.maxHealth) * 100} className="h-2 bg-muted" indicatorClassName="bg-red-500" />
                </div>
                
                <div className="text-sm mt-4">
                  <p className="text-yellow-400 flex items-center">
                    <AlertTriangle className="h-4 w-4 mr-1" />
                    Weakness detected: {enemy.weakness === 'shield' ? 'Energy Shields' : 
                      enemy.weakness === 'weapon' ? 'Direct Weapons' : 
                      enemy.weakness === 'repair' ? 'Repair Drones' : 
                      'Countermeasures'}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Combat actions */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold mb-4 terminal-text">Combat Actions</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <button 
                  onClick={useShield}
                  className={`system-panel p-4 text-center hover:bg-accent/10 transition-colors ${enemy.weakness === 'shield' ? 'border-2 border-yellow-400' : ''}`}
                >
                  <Shield className="h-8 w-8 mx-auto mb-2 text-chart-1" />
                  <h3 className="text-sm font-semibold">Shields</h3>
                  <p className="text-xs text-muted-foreground">Cost: 10 Energy</p>
                </button>
                
                <button 
                  onClick={useWeapon}
                  className={`system-panel p-4 text-center hover:bg-accent/10 transition-colors ${enemy.weakness === 'weapon' ? 'border-2 border-yellow-400' : ''}`}
                >
                  <Zap className="h-8 w-8 mx-auto mb-2 text-chart-2" />
                  <h3 className="text-sm font-semibold">Weapons</h3>
                  <p className="text-xs text-muted-foreground">Cost: 15 Scrap</p>
                </button>
                
                <button 
                  onClick={useRepair}
                  className={`system-panel p-4 text-center hover:bg-accent/10 transition-colors ${enemy.weakness === 'repair' ? 'border-2 border-yellow-400' : ''}`}
                >
                  <Wrench className="h-8 w-8 mx-auto mb-2 text-chart-3" />
                  <h3 className="text-sm font-semibold">Repairs</h3>
                  <p className="text-xs text-muted-foreground">Cost: 2 Crew</p>
                </button>
                
                <button 
                  onClick={useCountermeasure}
                  className={`system-panel p-4 text-center hover:bg-accent/10 transition-colors ${enemy.weakness === 'countermeasure' ? 'border-2 border-yellow-400' : ''}`}
                >
                  <Cpu className="h-8 w-8 mx-auto mb-2 text-chart-4" />
                  <h3 className="text-sm font-semibold">Countermeasures</h3>
                  <p className="text-xs text-muted-foreground">Cost: 8 Insight</p>
                </button>
              </div>
            </div>
            
            {/* Battle log */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold mb-2 terminal-text">Battle Log</h2>
              <div className="system-panel p-4 h-32 overflow-y-auto font-mono text-xs">
                <p className="text-green-400">► System: Enemy vessel detected.</p>
                <p className="text-blue-400">► Dawn: Shields activated.</p>
                <p className="text-red-400">► Enemy: Attacking with plasma barrage.</p>
                <p className="text-yellow-400">► Analysis: Enemy weak against energy shields.</p>
              </div>
            </div>
            
            {/* Retreat button */}
            <Link href="/navigation">
              <button 
                onClick={retreat}
                className="system-panel w-full p-4 flex items-center justify-center hover:bg-accent/10 transition-colors"
              >
                <span className="terminal-text">Retreat from Battle</span>
              </button>
            </Link>
          </div>
        </div>
      </main>
    </GameLoader>
  )
} 