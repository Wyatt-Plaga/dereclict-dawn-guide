"use client"

import { NavBar } from "@/components/ui/navbar"
import { Shield, Zap, Wrench, Cpu, AlertTriangle, ChevronDown, ChevronUp, Scan, ZapOff, Search, Compass } from "lucide-react"
import { useSystemStatus } from "@/components/providers/system-status-provider"
import { useGame } from "@/app/game/hooks/useGame"
import Logger, { LogCategory, LogContext } from "@/app/utils/logger"
import GameLoader from '@/app/components/GameLoader'
import Link from "next/link"
import { Progress } from "@/components/ui/progress"
import { useState } from "react"

// Enemy type
interface Enemy {
  id: string;
  name: string;
  description: string;
  health: number;
  maxHealth: number;
  shield: number;
  maxShield: number;
  image: string;
  weakness: 'shield' | 'weapon' | 'repair' | 'countermeasure';
}

export default function BattlePage() {
  const { state, dispatch } = useGame()
  const { shouldFlicker } = useSystemStatus()
  
  // Get resources from game state
  const reactor = state.categories.reactor
  const processor = state.categories.processor
  const crewQuarters = state.categories.crewQuarters
  const manufacturing = state.categories.manufacturing
  
  // Track which action categories are expanded
  const [expandedActions, setExpandedActions] = useState<string[]>([])
  
  // Toggle expansion of an action category
  const toggleActionExpansion = (actionType: string) => {
    if (expandedActions.includes(actionType)) {
      setExpandedActions(expandedActions.filter(a => a !== actionType))
    } else {
      setExpandedActions([...expandedActions, actionType])
    }
  }
  
  // Check if an action is expanded
  const isActionExpanded = (actionType: string) => {
    return expandedActions.includes(actionType)
  }
  
  // Log component render
  Logger.debug(
    LogCategory.UI,
    `Rendering BattlePage`,
    LogContext.UI_RENDER
  )
  
  // Mock battle state - in a full implementation this would be part of the game state
  const shipHealth = 80;
  const maxShipHealth = 100;
  const shipShield = 35;
  const maxShipShield = 50;
  
  // Example enemy with shield weakness
  const enemy: Enemy = {
    id: 'void-stalker',
    name: 'Void Stalker',
    description: 'A mysterious entity that lurks in the void between stars. It appears to feed on energy and is drawn to functioning ships.',
    health: 70,
    maxHealth: 100,
    shield: 20,
    maxShield: 40,
    image: '/enemy-void.png',
    weakness: 'shield'
  };
  
  // For a complete implementation, we would dispatch proper actions
  const useShield = () => {
    Logger.info(LogCategory.ACTIONS, 'Using shield', LogContext.NONE);
    // dispatch({ type: 'COMBAT_ACTION', payload: { actionType: 'shield' } })
  }
  
  const useWeapon = () => {
    Logger.info(LogCategory.ACTIONS, 'Using weapon', LogContext.NONE);
    // dispatch({ type: 'COMBAT_ACTION', payload: { actionType: 'weapon' } })
  }
  
  const useRepair = () => {
    Logger.info(LogCategory.ACTIONS, 'Using repair', LogContext.NONE);
    // dispatch({ type: 'COMBAT_ACTION', payload: { actionType: 'repair' } })
  }
  
  const useSabotage = () => {
    Logger.info(LogCategory.ACTIONS, 'Using sabotage', LogContext.NONE);
    // dispatch({ type: 'COMBAT_ACTION', payload: { actionType: 'sabotage' } })
  }
  
  const retreat = () => {
    Logger.info(LogCategory.ACTIONS, 'Retreating from battle', LogContext.NONE);
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
              <div className="system-panel p-4 flex flex-col">
                <div>
                  <h2 className="text-lg font-medium mb-3">Dawn Status</h2>
                  
                  {/* Resource readouts at top */}
                  <div className="grid grid-cols-2 gap-2 text-sm mb-4">
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
                
                {/* Push shield and hull to bottom with auto margin */}
                <div className="mt-auto">
                  {/* Ship shield */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span>Shield Strength</span>
                      <span>{shipShield}/{maxShipShield}</span>
                    </div>
                    <Progress value={(shipShield / maxShipShield) * 100} className="h-2 bg-muted" indicatorClassName="bg-chart-1" />
                  </div>
                  
                  {/* Ship hull */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span>Hull Integrity</span>
                      <span>{shipHealth}/{maxShipHealth}</span>
                    </div>
                    <Progress value={(shipHealth / maxShipHealth) * 100} className="h-2 bg-muted" indicatorClassName="bg-green-500" />
                  </div>
                </div>
              </div>
              
              {/* Enemy status */}
              <div className="system-panel p-4 flex flex-col">
                <div>
                  <h2 className="text-lg font-medium mb-2">{enemy.name}</h2>
                  <p className="text-sm text-muted-foreground">{enemy.description}</p>
                </div>
                
                {/* Push shield and hull to bottom with auto margin */}
                <div className="mt-auto">
                  {/* Enemy shield - aligned with ship shield */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span>Shield Strength</span>
                      <span>{enemy.shield}/{enemy.maxShield}</span>
                    </div>
                    <Progress value={(enemy.shield / enemy.maxShield) * 100} className="h-2 bg-muted" indicatorClassName="bg-chart-1" />
                  </div>
                  
                  {/* Enemy hull - aligned with ship hull */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span>Hull Integrity</span>
                      <span>{enemy.health}/{enemy.maxHealth}</span>
                    </div>
                    <Progress value={(enemy.health / enemy.maxHealth) * 100} className="h-2 bg-muted" indicatorClassName="bg-green-500" />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Combat actions - Categories in quadrants, with actions also in quadrants within each category */}
            <h2 className="text-lg font-semibold mb-4 terminal-text">Combat Actions</h2>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              {/* Energy Shields section - 1 action */}
              <div className="system-panel p-4 flex flex-col">
                <h3 className="text-sm font-semibold mb-3 flex items-center">
                  <Shield className="h-5 w-5 mr-2 text-chart-1" />
                  Energy Shields <span className="text-xs text-muted-foreground ml-2">(Reactor)</span>
                </h3>
                <div className="grid grid-cols-1 gap-2 flex-grow">
                  <button 
                    onClick={useShield}
                    className="system-panel p-3 flex items-center justify-between hover:bg-accent/10 transition-colors h-full"
                  >
                    <div className="flex items-center">
                      <Shield className="h-4 w-4 mr-2 text-chart-1" />
                      <span>Raise Shields</span>
                    </div>
                    <span className="text-xs px-1.5 py-0.5 bg-chart-1/20 text-chart-1 rounded">10 Energy</span>
                  </button>
                </div>
              </div>
              
              {/* Weapons Systems section - 2 actions */}
              <div className="system-panel p-4 flex flex-col">
                <h3 className="text-sm font-semibold mb-3 flex items-center">
                  <Zap className="h-5 w-5 mr-2 text-chart-2" />
                  Weapons Systems <span className="text-xs text-muted-foreground ml-2">(Manufacturing)</span>
                </h3>
                <div className="grid grid-cols-2 gap-2 flex-grow">
                  <button 
                    onClick={useWeapon}
                    className="system-panel p-3 flex flex-col hover:bg-accent/10 transition-colors"
                  >
                    <div className="flex items-center mb-1">
                      <Zap className="h-4 w-4 mr-2 text-chart-2" />
                      <span>Plasma Cannon</span>
                    </div>
                    <span className="text-xs self-start bg-chart-2/20 text-chart-2 px-1.5 py-0.5 rounded mt-auto">15 Scrap</span>
                  </button>
                  
                  <button 
                    className="system-panel p-3 flex flex-col hover:bg-accent/10 transition-colors"
                  >
                    <div className="flex items-center mb-1">
                      <Zap className="h-4 w-4 mr-2 text-chart-2" />
                      <span>Missile Barrage</span>
                    </div>
                    <span className="text-xs self-start bg-chart-2/20 text-chart-2 px-1.5 py-0.5 rounded mt-auto">25 Scrap</span>
                  </button>
                </div>
              </div>
              
              {/* Repair Drones section - 3 actions */}
              <div className="system-panel p-4 flex flex-col">
                <h3 className="text-sm font-semibold mb-3 flex items-center">
                  <Wrench className="h-5 w-5 mr-2 text-chart-3" />
                  Repair Drones <span className="text-xs text-muted-foreground ml-2">(Crew)</span>
                </h3>
                <div className="grid grid-cols-2 gap-2 flex-grow">
                  <button 
                    onClick={useRepair}
                    className="system-panel p-3 flex flex-col hover:bg-accent/10 transition-colors"
                  >
                    <div className="flex items-center mb-1">
                      <Wrench className="h-4 w-4 mr-2 text-chart-3" />
                      <span>Hull Repair</span>
                    </div>
                    <span className="text-xs self-start bg-chart-3/20 text-chart-3 px-1.5 py-0.5 rounded mt-auto">2 Crew</span>
                  </button>
                  
                  <button 
                    className="system-panel p-3 flex flex-col hover:bg-accent/10 transition-colors"
                  >
                    <div className="flex items-center mb-1">
                      <Shield className="h-4 w-4 mr-2 text-chart-3" />
                      <span>Shield Recharge</span>
                    </div>
                    <span className="text-xs self-start bg-chart-3/20 text-chart-3 px-1.5 py-0.5 rounded mt-auto">3 Crew</span>
                  </button>
                  
                  <button 
                    className="system-panel p-3 flex flex-col hover:bg-accent/10 transition-colors"
                  >
                    <div className="flex items-center mb-1">
                      <Wrench className="h-4 w-4 mr-2 text-chart-3" />
                      <span>System Bypass</span>
                    </div>
                    <span className="text-xs self-start bg-chart-3/20 text-chart-3 px-1.5 py-0.5 rounded mt-auto">4 Crew</span>
                  </button>
                  
                  {/* Fourth cell is intentionally left empty for layout consistency */}
                  <div className="hidden"></div>
                </div>
              </div>
              
              {/* Electronic Countermeasures section - 4 actions */}
              <div className="system-panel p-4 flex flex-col">
                <h3 className="text-sm font-semibold mb-3 flex items-center">
                  <Cpu className="h-5 w-5 mr-2 text-chart-4" />
                  Electronic CM <span className="text-xs text-muted-foreground ml-2">(Processor)</span>
                </h3>
                <div className="grid grid-cols-2 gap-2 flex-grow">
                  <button 
                    onClick={useSabotage}
                    className="system-panel p-3 flex flex-col hover:bg-accent/10 transition-colors"
                  >
                    <div className="flex items-center mb-1">
                      <ZapOff className="h-4 w-4 mr-2 text-chart-4" />
                      <span>Sabotage</span>
                    </div>
                    <span className="text-xs self-start bg-chart-4/20 text-chart-4 px-1.5 py-0.5 rounded mt-auto">8 Insight</span>
                  </button>
                  
                  <button 
                    className="system-panel p-3 flex flex-col hover:bg-accent/10 transition-colors"
                  >
                    <div className="flex items-center mb-1">
                      <Scan className="h-4 w-4 mr-2 text-chart-4" />
                      <span>Scan</span>
                    </div>
                    <span className="text-xs self-start bg-chart-4/20 text-chart-4 px-1.5 py-0.5 rounded mt-auto">5 Insight</span>
                  </button>
                  
                  <button 
                    className="system-panel p-3 flex flex-col hover:bg-accent/10 transition-colors"
                  >
                    <div className="flex items-center mb-1">
                      <Search className="h-4 w-4 mr-2 text-chart-4" />
                      <span>Find Weakness</span>
                    </div>
                    <span className="text-xs self-start bg-chart-4/20 text-chart-4 px-1.5 py-0.5 rounded mt-auto">12 Insight</span>
                  </button>
                  
                  <button 
                    className="system-panel p-3 flex flex-col hover:bg-accent/10 transition-colors"
                  >
                    <div className="flex items-center mb-1">
                      <Compass className="h-4 w-4 mr-2 text-chart-4" />
                      <span>Sensor Overload</span>
                    </div>
                    <span className="text-xs self-start bg-chart-4/20 text-chart-4 px-1.5 py-0.5 rounded mt-auto">10 Insight</span>
                  </button>
                </div>
              </div>
            </div>
            
            {/* Battle log */}
            <div className="mb-4">
              <h2 className="text-lg font-semibold mb-2 terminal-text">Battle Log</h2>
              <div className="system-panel p-3 h-28 overflow-y-auto font-mono text-xs">
                <p className="text-green-400">► System: Unknown vessel detected.</p>
                <p className="text-blue-400">► Dawn: Shields activated.</p>
                <p className="text-red-400">► {enemy.name}: Approaching on intercept course.</p>
                <p className="text-yellow-400">► Analysis: Scanning for vulnerabilities...</p>
              </div>
            </div>
            
            {/* Retreat button */}
            <Link href="/navigation">
              <button 
                onClick={retreat}
                className="system-panel w-full p-3 flex items-center justify-center hover:bg-accent/10 transition-colors"
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