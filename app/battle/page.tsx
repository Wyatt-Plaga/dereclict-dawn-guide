"use client"

import { Shield, Zap, Wrench, Cpu, AlertTriangle, ChevronDown, ChevronUp, Scan, ZapOff, Search, Compass } from "lucide-react"
import { useSystemStatus } from "@/components/providers/system-status-provider"
import { useGame } from "@/app/game/hooks/useGame"
import Logger, { LogCategory, LogContext } from "@/app/utils/logger"
import GameLoader from '@/app/components/GameLoader'
import { Progress } from "@/components/ui/progress"
import { useState, useEffect } from "react"
import { CombatActionCategory, BattleLogEntry } from "@/app/game/types/combat"
import { PLAYER_ACTIONS } from "@/app/game/content/combatActions"
import { useRouter } from "next/navigation"
// Remove direct imports since we'll use dynamic imports like the EncounterSystem does

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
  const router = useRouter()
  
  // Prevent navigation away from battle during active combat
  useEffect(() => {
    // If combat is not active but we're on the battle page, redirect to navigation
    if (!state.combat?.active) {
      Logger.info(
        LogCategory.ACTIONS, 
        'No active combat, redirecting to navigation', 
        LogContext.NONE
      )
      router.push('/navigation')
    }
    
    // Block navigation attempts during combat through the browser back button
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (state.combat?.active) {
        const message = "You are in the middle of combat! Use the 'Retreat' button to safely exit.";
        e.preventDefault();
        e.returnValue = message;
        return message;
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [state.combat?.active, router]);
  
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
  
  // Use actual combat state instead of mock data
  const shipHealth = state.combat?.playerStats?.health || 0
  const maxShipHealth = state.combat?.playerStats?.maxHealth || 100
  const shipShield = state.combat?.playerStats?.shield || 0
  const maxShipShield = state.combat?.playerStats?.maxShield || 50
  
  // Get current enemy information
  const enemyId = state.combat?.currentEnemy || 'unknown'
  
  // Get enemy stats from combat state
  const enemyHealth = state.combat?.enemyStats?.health || 0
  const enemyMaxHealth = state.combat?.enemyStats?.maxHealth || 100
  const enemyShield = state.combat?.enemyStats?.shield || 0
  const enemyMaxShield = state.combat?.enemyStats?.maxShield || 50
  
  // Find enemy definition from the appropriate region-specific array
  const findEnemyDefinition = (id: string) => {
    try {
      // Try to determine which region this enemy belongs to based on its ID
      if (id.startsWith('void-')) {
        const { VOID_ENEMIES } = require('@/app/game/content/enemies/voidEnemies');
        return VOID_ENEMIES.find((e: any) => e.id === id);
      } else if (id.startsWith('asteroid-')) {
        const { ASTEROID_ENEMIES } = require('@/app/game/content/enemies/asteroidFieldEnemies');
        return ASTEROID_ENEMIES.find((e: any) => e.id === id);
      } else if (id.startsWith('blackhole-')) {
        const { BLACKHOLE_ENEMIES } = require('@/app/game/content/enemies/blackHoleEnemies');
        return BLACKHOLE_ENEMIES.find((e: any) => e.id === id);
      } else if (id.startsWith('supernova-')) {
        const { SUPERNOVA_ENEMIES } = require('@/app/game/content/enemies/supernovaEnemies');
        return SUPERNOVA_ENEMIES.find((e: any) => e.id === id);
      } else if (id.startsWith('habitable-')) {
        const { HABITABLE_ZONE_ENEMIES } = require('@/app/game/content/enemies/habitableZoneEnemies');
        return HABITABLE_ZONE_ENEMIES.find((e: any) => e.id === id);
      }
      
      // If we can't determine the region from the ID, log a warning
      Logger.warn(
        LogCategory.COMBAT,
        `Could not determine region for enemy ID: ${id}`,
        LogContext.COMBAT
      );
      
      return undefined;
    } catch (error) {
      Logger.error(
        LogCategory.COMBAT,
        `Error finding enemy definition: ${error}`,
        LogContext.COMBAT
      );
      return undefined;
    }
  }
  
  const enemyDef = findEnemyDefinition(enemyId);
  
  // For display purposes - if we don't have enemy details, use placeholder
  const enemy = {
    id: enemyId,
    name: enemyDef?.name || enemyId || 'Unknown Enemy',
    description: enemyDef?.description || 'Enemy encountered in combat.',
    health: enemyHealth,
    maxHealth: enemyMaxHealth,
    shield: enemyShield,
    maxShield: enemyMaxShield,
    image: enemyDef?.image || '/enemy-void.png',
    weakness: 'shield' as const
  }
  
  // Convert battle log entries for display
  const battleLog = state.combat?.battleLog || [] 
  
  // Dispatch combat actions
  const performCombatAction = (actionId: string) => {
    Logger.info(
      LogCategory.COMBAT, 
      `Performing combat action: ${actionId}`, 
      LogContext.COMBAT_ACTION
    )
    dispatch({ type: 'COMBAT_ACTION', payload: { actionId } })
  }
  
  // Shield actions
  const useShield = () => {
    performCombatAction('raise-shields')
  }
  
  // Weapon actions
  const useWeapon = (actionId: string) => {
    performCombatAction(actionId)
  }
  
  // Repair actions
  const useRepair = (actionId: string) => {
    performCombatAction(actionId)
  }
  
  // Sabotage actions
  const useSabotage = (actionId: string) => {
    performCombatAction(actionId)
  }
  
  // Retreat from battle
  const retreat = () => {
    Logger.info(
      LogCategory.COMBAT, 
      'Retreating from battle', 
      LogContext.COMBAT
    )
    dispatch({ type: 'RETREAT_FROM_BATTLE' })
    router.push('/navigation')
  }
  
  // Check if we have any error message to display
  const actionError = state.combat?.lastActionResult?.success === false ? 
    state.combat.lastActionResult.message : null
  
  return (
    <GameLoader>
      <main className="flex min-h-screen flex-col">
        <div className="flex flex-col p-4 md:p-8">
          <div className="system-panel p-6 mb-6">
            <h1 className={`text-2xl font-bold text-primary mb-4 ${shouldFlicker('battle') ? 'flickering-text' : ''}`}>Combat Encounter</h1>
            
            {/* Battle mode notice */}
            <div className="mb-4 p-3 system-panel border border-yellow-700/50 bg-yellow-900/10">
              <p className="text-yellow-400 flex items-center text-sm">
                <AlertTriangle className="h-4 w-4 mr-2 flex-shrink-0" />
                <span>ALERT: Ship engaged in combat. All other systems are locked. You must either defeat the enemy or retreat to continue your journey.</span>
              </p>
            </div>
            
            {/* Display action error if any */}
            {actionError && (
              <div className="mb-4 p-2 system-panel bg-red-900/20 border border-red-900/50">
                <p className="text-red-400 flex items-center">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  {actionError}
                </p>
              </div>
            )}
            
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
              {/* Energy Shields section */}
              <div className="system-panel p-4 flex flex-col">
                <h3 className="text-sm font-semibold mb-3 flex items-center">
                  <Shield className="h-5 w-5 mr-2 text-chart-1" />
                  Energy Shields <span className="text-xs text-muted-foreground ml-2">(Reactor)</span>
                </h3>
                <div className="grid grid-cols-1 gap-2 flex-grow">
                  {Object.values(PLAYER_ACTIONS)
                    .filter(action => action.category === CombatActionCategory.SHIELD)
                    .map(action => (
                      <button 
                        key={action.id}
                        onClick={() => performCombatAction(action.id)}
                        className="system-panel p-3 flex items-center justify-between hover:bg-accent/10 transition-colors h-full"
                        disabled={state.combat?.cooldowns?.[action.id] > 0}
                      >
                        <div className="flex items-center">
                          <Shield className="h-4 w-4 mr-2 text-chart-1" />
                          <span>{action.name}</span>
                          {state.combat?.cooldowns?.[action.id] > 0 && (
                            <span className="ml-2 text-xs text-muted-foreground">
                              (CD: {state.combat.cooldowns[action.id]})
                            </span>
                          )}
                        </div>
                        <span className="text-xs px-1.5 py-0.5 bg-chart-1/20 text-chart-1 rounded">
                          {action.cost.amount} {action.cost.type}
                        </span>
                      </button>
                    ))}
                </div>
              </div>
              
              {/* Weapons Systems section */}
              <div className="system-panel p-4 flex flex-col">
                <h3 className="text-sm font-semibold mb-3 flex items-center">
                  <Zap className="h-5 w-5 mr-2 text-chart-2" />
                  Weapons Systems <span className="text-xs text-muted-foreground ml-2">(Manufacturing)</span>
                </h3>
                <div className="grid grid-cols-2 gap-2 flex-grow">
                  {Object.values(PLAYER_ACTIONS)
                    .filter(action => action.category === CombatActionCategory.WEAPON)
                    .map(action => (
                      <button 
                        key={action.id}
                        onClick={() => performCombatAction(action.id)}
                        className="system-panel p-3 flex flex-col hover:bg-accent/10 transition-colors"
                        disabled={state.combat?.cooldowns?.[action.id] > 0}
                      >
                        <div className="flex items-center mb-1">
                          <Zap className="h-4 w-4 mr-2 text-chart-2" />
                          <span>{action.name}</span>
                        </div>
                        {state.combat?.cooldowns?.[action.id] > 0 && (
                          <span className="text-xs text-muted-foreground mb-1">
                            Cooldown: {state.combat.cooldowns[action.id]}
                          </span>
                        )}
                        <span className="text-xs self-start bg-chart-2/20 text-chart-2 px-1.5 py-0.5 rounded mt-auto">
                          {action.cost.amount} {action.cost.type}
                        </span>
                      </button>
                    ))}
                </div>
              </div>
              
              {/* Repair Drones section */}
              <div className="system-panel p-4 flex flex-col">
                <h3 className="text-sm font-semibold mb-3 flex items-center">
                  <Wrench className="h-5 w-5 mr-2 text-chart-3" />
                  Repair Drones <span className="text-xs text-muted-foreground ml-2">(Crew)</span>
                </h3>
                <div className="grid grid-cols-2 gap-2 flex-grow">
                  {Object.values(PLAYER_ACTIONS)
                    .filter(action => action.category === CombatActionCategory.REPAIR)
                    .map(action => (
                      <button 
                        key={action.id}
                        onClick={() => performCombatAction(action.id)}
                        className="system-panel p-3 flex flex-col hover:bg-accent/10 transition-colors"
                        disabled={state.combat?.cooldowns?.[action.id] > 0}
                      >
                        <div className="flex items-center mb-1">
                          <Wrench className="h-4 w-4 mr-2 text-chart-3" />
                          <span>{action.name}</span>
                        </div>
                        {state.combat?.cooldowns?.[action.id] > 0 && (
                          <span className="text-xs text-muted-foreground mb-1">
                            Cooldown: {state.combat.cooldowns[action.id]}
                          </span>
                        )}
                        <span className="text-xs self-start bg-chart-3/20 text-chart-3 px-1.5 py-0.5 rounded mt-auto">
                          {action.cost.amount} {action.cost.type}
                        </span>
                      </button>
                    ))}
                </div>
              </div>
              
              {/* Electronic Countermeasures section */}
              <div className="system-panel p-4 flex flex-col">
                <h3 className="text-sm font-semibold mb-3 flex items-center">
                  <Cpu className="h-5 w-5 mr-2 text-chart-4" />
                  Electronic CM <span className="text-xs text-muted-foreground ml-2">(Processor)</span>
                </h3>
                <div className="grid grid-cols-2 gap-2 flex-grow">
                  {Object.values(PLAYER_ACTIONS)
                    .filter(action => action.category === CombatActionCategory.SABOTAGE)
                    .map(action => (
                      <button 
                        key={action.id}
                        onClick={() => performCombatAction(action.id)}
                        className="system-panel p-3 flex flex-col hover:bg-accent/10 transition-colors"
                        disabled={state.combat?.cooldowns?.[action.id] > 0}
                      >
                        <div className="flex items-center mb-1">
                          <ZapOff className="h-4 w-4 mr-2 text-chart-4" />
                          <span>{action.name}</span>
                        </div>
                        {state.combat?.cooldowns?.[action.id] > 0 && (
                          <span className="text-xs text-muted-foreground mb-1">
                            Cooldown: {state.combat.cooldowns[action.id]}
                          </span>
                        )}
                        <span className="text-xs self-start bg-chart-4/20 text-chart-4 px-1.5 py-0.5 rounded mt-auto">
                          {action.cost.amount} {action.cost.type}
                        </span>
                      </button>
                    ))}
                </div>
              </div>
            </div>
            
            {/* Battle log */}
            <div className="mb-4">
              <h2 className="text-lg font-semibold mb-2 terminal-text">Battle Log</h2>
              <div className="system-panel p-3 h-28 overflow-y-auto font-mono text-xs">
                {battleLog.length > 0 ? (
                  battleLog.map((entry: BattleLogEntry, index) => {
                    // Determine log entry style based on type
                    const logStyle = entry.type === 'PLAYER' 
                      ? 'text-blue-400' 
                      : entry.type === 'ENEMY' 
                        ? 'text-red-400' 
                        : entry.type === 'ANALYSIS' 
                          ? 'text-yellow-400' 
                          : 'text-green-400';
                    
                    return (
                      <p key={entry.id || index} className={logStyle}>
                        ► {entry.text}
                      </p>
                    );
                  })
                ) : (
                  <p className="text-green-400">► System: Combat initiated.</p>
                )}
              </div>
            </div>
            
            {/* Retreat button */}
            <button 
              onClick={retreat}
              className="system-panel w-full p-3 flex items-center justify-center hover:bg-accent/10 transition-colors"
            >
              <span className="terminal-text">Retreat from Battle</span>
            </button>
          </div>
        </div>
      </main>
    </GameLoader>
  )
} 