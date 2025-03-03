"use client"

import { NavBar } from "@/components/ui/navbar"
import { Shield, Zap, Wrench, Cpu, ZapOff, Scan, Search, Compass } from "lucide-react"
import { useSystemStatus } from "@/components/providers/system-status-provider"
import { useState, useEffect } from "react"
import { useGame } from "@/app/game/hooks/useGame"
import GameLoader from '@/app/components/GameLoader'
import { useRouter } from 'next/navigation'
import { CombatActionCategory } from "../game/types/combat"
import { PLAYER_ACTIONS } from "../game/content/combatActions"
import { ENEMY_DEFINITIONS } from "../game/content/enemies"

export default function BattlePage() {
  const { state, dispatch } = useGame()
  const { shouldFlicker } = useSystemStatus()
  const router = useRouter()
  
  // Track expanded action categories
  const [expandedActions, setExpandedActions] = useState<string[]>([])
  
  // If combat is not active and not just completed, redirect to navigation
  useEffect(() => {
    // Add safety check for combat state
    if (!state.combat) {
      router.push('/navigation');
      return;
    }
    
    // If not in active combat and the encounter isn't just completed, redirect to navigation
    if (!state.combat.active && !state.combat.encounterCompleted) {
      router.push('/navigation');
      return;
    }
    
    // If encounter just completed, show results for 5 seconds then redirect
    if (!state.combat.active && state.combat.encounterCompleted) {
      const redirectTimer = setTimeout(() => {
        router.push('/navigation');
      }, 5000); // 5 seconds to view results
      
      return () => clearTimeout(redirectTimer);
    }
  }, [state.combat?.active, state.combat?.encounterCompleted, router]);
  
  // Toggle action category expansion
  const toggleActionExpansion = (actionType: string) => {
    setExpandedActions(prev => {
      if (prev.includes(actionType)) {
        return prev.filter(type => type !== actionType);
      } else {
        return [...prev, actionType];
      }
    });
  };
  
  // Check if action category is expanded
  const isActionExpanded = (actionType: string) => {
    return expandedActions.includes(actionType);
  };
  
  // Get enemy data
  const enemy = state.combat?.currentEnemy 
    ? ENEMY_DEFINITIONS[state.combat.currentEnemy] 
    : {
        id: 'unknown',
        name: 'Unknown Vessel',
        description: 'Unable to identify target.',
        health: 0,
        maxHealth: 100,
        shield: 0,
        maxShield: 50,
        image: '/enemies/unknown.png',
        type: 'vessel',
        actions: [],
        loot: [],
        regions: [],
        difficultyTier: 1
      };
  
  // Filter actions by category
  const getActionsByCategory = (category: CombatActionCategory) => {
    return Object.values(PLAYER_ACTIONS).filter(
      action => action.category === category
    );
  };
  
  // Get player and enemy stats
  const playerStats = state.combat?.playerStats || {
    health: 0,
    maxHealth: 100,
    shield: 0,
    maxShield: 50,
    statusEffects: []
  };
  
  const enemyStats = state.combat?.enemyStats || {
    health: 0,
    maxHealth: 0,
    shield: 0,
    maxShield: 0,
    statusEffects: []
  };
  
  // Combat actions
  const useShield = () => {
    dispatch({
      type: 'PERFORM_COMBAT_ACTION',
      payload: { actionId: 'raise-shields' }
    });
  };
  
  const useWeapon = () => {
    dispatch({
      type: 'PERFORM_COMBAT_ACTION',
      payload: { actionId: 'plasma-cannon' }
    });
  };
  
  const useRepair = () => {
    dispatch({
      type: 'PERFORM_COMBAT_ACTION',
      payload: { actionId: 'hull-repair' }
    });
  };
  
  const useSabotage = () => {
    dispatch({
      type: 'PERFORM_COMBAT_ACTION',
      payload: { actionId: 'sabotage' }
    });
  };
  
  const retreat = () => {
    dispatch({
      type: 'RETREAT_FROM_COMBAT'
    });
  };
  
  return (
    <GameLoader>
      <main className="flex min-h-screen flex-col">
        <NavBar />
        
        <div className="flex flex-col p-4 md:p-8 md:ml-64">
          <div className="system-panel p-6 mb-6">
            <h1 className={`text-2xl font-bold text-primary mb-4 ${shouldFlicker('battle') ? 'flickering-text' : ''}`}>Combat Encounter</h1>
            
            {/* Battle status panels */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {/* Enemy status */}
              <div className="system-panel p-4">
                <h2 className="text-lg font-medium mb-4 terminal-text">Enemy Vessel</h2>
                <div className="flex mb-4">
                  <div className="w-20 h-20 bg-gray-700 rounded mr-4 flex items-center justify-center overflow-hidden">
                    <div className="text-4xl text-red-500">👾</div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-medium">{enemy.name}</h3>
                    <p className="text-sm text-muted-foreground mb-2">{enemy.description}</p>
                  </div>
                </div>
                
                {/* Enemy health and shield */}
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Hull Integrity</span>
                      <span className="text-sm">{enemyStats.health}/{enemyStats.maxHealth}</span>
                    </div>
                    <div className="h-2 bg-background rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-green-500 rounded-full" 
                        style={{ width: `${(enemyStats.health / enemyStats.maxHealth) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Shields</span>
                      <span className="text-sm">{enemyStats.shield}/{enemyStats.maxShield}</span>
                    </div>
                    <div className="h-2 bg-background rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-500 rounded-full" 
                        style={{ width: `${(enemyStats.shield / (enemyStats.maxShield || 1)) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  {enemyStats.statusEffects.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {enemyStats.statusEffects.map((effect, index) => (
                        <span key={index} className="text-xs px-2 py-1 rounded bg-accent text-accent-foreground">
                          {effect.type} ({effect.remainingTurns})
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Dawn status */}
              <div className="system-panel p-4">
                <h2 className="text-lg font-medium mb-4 terminal-text">Dawn Status</h2>
                {/* Player health and shield */}
                <div className="space-y-3 mb-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Hull Integrity</span>
                      <span className="text-sm">{playerStats.health}/{playerStats.maxHealth}</span>
                    </div>
                    <div className="h-2 bg-background rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-green-500 rounded-full" 
                        style={{ width: `${(playerStats.health / playerStats.maxHealth) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Shields</span>
                      <span className="text-sm">{playerStats.shield}/{playerStats.maxShield}</span>
                    </div>
                    <div className="h-2 bg-background rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-500 rounded-full" 
                        style={{ width: `${(playerStats.shield / playerStats.maxShield) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
                
                {/* Resources */}
                <h3 className="text-sm font-medium mb-2">Resources</h3>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-background/30 p-2 rounded">
                    <div className="text-xs text-muted-foreground">Energy</div>
                    <div className="text-lg">{state.categories.reactor.resources.energy}</div>
                  </div>
                  <div className="bg-background/30 p-2 rounded">
                    <div className="text-xs text-muted-foreground">Insight</div>
                    <div className="text-lg">{state.categories.processor.resources.insight}</div>
                  </div>
                  <div className="bg-background/30 p-2 rounded">
                    <div className="text-xs text-muted-foreground">Crew</div>
                    <div className="text-lg">{state.categories.crewQuarters.resources.crew}</div>
                  </div>
                  <div className="bg-background/30 p-2 rounded">
                    <div className="text-xs text-muted-foreground">Scrap</div>
                    <div className="text-lg">{state.categories.manufacturing.resources.scrap}</div>
                  </div>
                </div>
                
                {playerStats.statusEffects.length > 0 && (
                  <div className="mt-3">
                    <h3 className="text-sm font-medium mb-1">Status Effects</h3>
                    <div className="flex flex-wrap gap-1">
                      {playerStats.statusEffects.map((effect, index) => (
                        <span key={index} className="text-xs px-2 py-1 rounded bg-accent text-accent-foreground">
                          {effect.type} ({effect.remainingTurns})
                        </span>
                      ))}
                    </div>
                  </div>
                )}
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
                    disabled={!state.combat?.active || playerStats.health <= 0}
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
                    disabled={!state.combat?.active || playerStats.health <= 0}
                  >
                    <div className="flex items-center mb-1">
                      <Zap className="h-4 w-4 mr-2 text-chart-2" />
                      <span>Plasma Cannon</span>
                    </div>
                    <span className="text-xs self-start bg-chart-2/20 text-chart-2 px-1.5 py-0.5 rounded mt-auto">15 Scrap</span>
                  </button>
                  
                  <button 
                    onClick={() => dispatch({
                      type: 'PERFORM_COMBAT_ACTION',
                      payload: { actionId: 'missile-barrage' }
                    })}
                    className="system-panel p-3 flex flex-col hover:bg-accent/10 transition-colors"
                    disabled={!state.combat?.active || playerStats.health <= 0}
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
                    disabled={!state.combat?.active || playerStats.health <= 0}
                  >
                    <div className="flex items-center mb-1">
                      <Wrench className="h-4 w-4 mr-2 text-chart-3" />
                      <span>Hull Repair</span>
                    </div>
                    <span className="text-xs self-start bg-chart-3/20 text-chart-3 px-1.5 py-0.5 rounded mt-auto">2 Crew</span>
                  </button>
                  
                  <button 
                    onClick={() => dispatch({
                      type: 'PERFORM_COMBAT_ACTION',
                      payload: { actionId: 'shield-recharge' }
                    })}
                    className="system-panel p-3 flex flex-col hover:bg-accent/10 transition-colors"
                    disabled={!state.combat?.active || playerStats.health <= 0}
                  >
                    <div className="flex items-center mb-1">
                      <Shield className="h-4 w-4 mr-2 text-chart-3" />
                      <span>Shield Recharge</span>
                    </div>
                    <span className="text-xs self-start bg-chart-3/20 text-chart-3 px-1.5 py-0.5 rounded mt-auto">3 Crew</span>
                  </button>
                  
                  <button 
                    onClick={() => dispatch({
                      type: 'PERFORM_COMBAT_ACTION',
                      payload: { actionId: 'system-bypass' }
                    })}
                    className="system-panel p-3 flex flex-col hover:bg-accent/10 transition-colors"
                    disabled={!state.combat?.active || playerStats.health <= 0}
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
                    disabled={!state.combat?.active || playerStats.health <= 0}
                  >
                    <div className="flex items-center mb-1">
                      <ZapOff className="h-4 w-4 mr-2 text-chart-4" />
                      <span>Sabotage</span>
                    </div>
                    <span className="text-xs self-start bg-chart-4/20 text-chart-4 px-1.5 py-0.5 rounded mt-auto">8 Insight</span>
                  </button>
                  
                  <button 
                    onClick={() => dispatch({
                      type: 'PERFORM_COMBAT_ACTION',
                      payload: { actionId: 'scan' }
                    })}
                    className="system-panel p-3 flex flex-col hover:bg-accent/10 transition-colors"
                    disabled={!state.combat?.active || playerStats.health <= 0}
                  >
                    <div className="flex items-center mb-1">
                      <Scan className="h-4 w-4 mr-2 text-chart-4" />
                      <span>Scan</span>
                    </div>
                    <span className="text-xs self-start bg-chart-4/20 text-chart-4 px-1.5 py-0.5 rounded mt-auto">5 Insight</span>
                  </button>
                  
                  <button 
                    onClick={() => dispatch({
                      type: 'PERFORM_COMBAT_ACTION',
                      payload: { actionId: 'find-weakness' }
                    })}
                    className="system-panel p-3 flex flex-col hover:bg-accent/10 transition-colors"
                    disabled={!state.combat?.active || playerStats.health <= 0}
                  >
                    <div className="flex items-center mb-1">
                      <Search className="h-4 w-4 mr-2 text-chart-4" />
                      <span>Find Weakness</span>
                    </div>
                    <span className="text-xs self-start bg-chart-4/20 text-chart-4 px-1.5 py-0.5 rounded mt-auto">12 Insight</span>
                  </button>
                  
                  <button 
                    onClick={() => dispatch({
                      type: 'PERFORM_COMBAT_ACTION',
                      payload: { actionId: 'sensor-overload' }
                    })}
                    className="system-panel p-3 flex flex-col hover:bg-accent/10 transition-colors"
                    disabled={!state.combat?.active || playerStats.health <= 0}
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
                {!state.combat?.battleLog || state.combat.battleLog.length === 0 ? (
                  <p className="text-muted-foreground">Awaiting combat data...</p>
                ) : (
                  state.combat.battleLog.slice().reverse().map(entry => (
                    <p key={entry.id} className={`
                      ${entry.type === 'SYSTEM' ? 'text-green-400' : ''}
                      ${entry.type === 'PLAYER' ? 'text-blue-400' : ''}
                      ${entry.type === 'ENEMY' ? 'text-red-400' : ''}
                      ${entry.type === 'ANALYSIS' ? 'text-yellow-400' : ''}
                    `}>
                      ► {entry.text}
                    </p>
                  ))
                )}
              </div>
            </div>
            
            {/* Retreat button */}
            <button 
              onClick={retreat}
              className="system-panel w-full p-3 flex items-center justify-center hover:bg-accent/10 transition-colors"
              disabled={!state.combat?.active || state.combat.encounterCompleted}
            >
              <span className="terminal-text">Retreat from Battle</span>
            </button>
          </div>
        </div>
      </main>
    </GameLoader>
  )
} 