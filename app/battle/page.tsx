"use client"

import { Shield, Zap, Wrench, Cpu, AlertTriangle, ChevronDown, ChevronUp, Scan, ZapOff, Search, Compass } from "lucide-react"
import { useSystemStatus } from "@/components/providers/system-status-provider"
import { useGame } from "@/app/game/hooks/useGame"
import Logger, { LogCategory, LogContext } from "@/app/utils/logger"
import GameLoader from '@/app/components/GameLoader'
import { Progress } from "@/components/ui/progress"
import { useState, useEffect, useRef } from "react"
import { CombatActionCategory, BattleLogEntry } from "@/app/game/types/combat"
import { PLAYER_ACTIONS } from "@/app/game/content/combatActions"
import { useRouter } from "next/navigation"
import { ENEMY_DEFINITIONS } from "@/app/game/content/enemies"
import { cn } from "@/lib/utils"
import EnemyMoveList from "@/components/EnemyMoveList"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { ENEMY_ACTIONS } from "@/app/game/content/combatActions"

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
  const { state, dispatch, isInitializing } = useGame()
  const { shouldFlicker } = useSystemStatus()
  const router = useRouter()
  
  // Prevent navigation away from battle during active combat
  useEffect(() => {
    if (isInitializing) return;
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
  
  // util hook to capture previous value
  function usePrevious<T>(val: T): T | undefined {
    const ref = useRef<T>();
    useEffect(() => {
      ref.current = val;
    });
    return ref.current;
  }
  
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
  
  // Flash states and previous value detection
  const prevShipShield = usePrevious(shipShield)
  const prevShipHealth = usePrevious(shipHealth)
  const prevEnemyShield = usePrevious(state.combat?.enemyStats?.shield)
  const prevEnemyHealth = usePrevious(state.combat?.enemyStats?.health)
  
  const [shipShieldFlash, setShipShieldFlash] = useState(false)
  const [shipDamageFlash, setShipDamageFlash] = useState(false)
  const [enemyShieldFlash, setEnemyShieldFlash] = useState(false)
  const [enemyDamageFlash, setEnemyDamageFlash] = useState(false)
  
  // Enemy turn overlay
  const [enemyTurnNotice, setEnemyTurnNotice] = useState(false)
  
  useEffect(() => {
    if (prevShipShield !== undefined && shipShield < prevShipShield) {
      setShipShieldFlash(true)
      setTimeout(() => setShipShieldFlash(false), 300)
    }
  }, [shipShield, prevShipShield])
  
  useEffect(() => {
    if (prevShipHealth !== undefined && shipHealth < prevShipHealth) {
      setShipDamageFlash(true)
      setTimeout(() => setShipDamageFlash(false), 300)
    }
  }, [shipHealth, prevShipHealth])
  
  useEffect(() => {
    if (prevEnemyShield !== undefined && state.combat?.enemyStats?.shield < prevEnemyShield) {
      setEnemyShieldFlash(true)
      setTimeout(() => setEnemyShieldFlash(false), 300)
    }
  }, [state.combat?.enemyStats?.shield, prevEnemyShield])
  
  useEffect(() => {
    if (prevEnemyHealth !== undefined && state.combat?.enemyStats?.health < prevEnemyHealth) {
      setEnemyDamageFlash(true)
      setTimeout(() => setEnemyDamageFlash(false), 300)
    }
  }, [state.combat?.enemyStats?.health, prevEnemyHealth])
  
  useEffect(() => {
    // If ship takes damage or shield loss when it's not from our own action, assume enemy turn
    if (
      (prevShipHealth !== undefined && shipHealth < prevShipHealth) ||
      (prevShipShield !== undefined && shipShield < prevShipShield)
    ) {
      setEnemyTurnNotice(true)
      setTimeout(() => setEnemyTurnNotice(false), 700)
    }
  }, [shipHealth, shipShield])
  
  // Get current enemy information
  const enemyId = state.combat?.currentEnemy || 'unknown'
  
  // Get enemy stats from combat state
  const enemyHealth = state.combat?.enemyStats?.health || 0
  const enemyMaxHealth = state.combat?.enemyStats?.maxHealth || 100
  const enemyShield = state.combat?.enemyStats?.shield || 0
  const enemyMaxShield = state.combat?.enemyStats?.maxShield || 50
  
  // Get full enemy definition for display if available
  const enemyDef = ENEMY_DEFINITIONS[enemyId as keyof typeof ENEMY_DEFINITIONS];

  // Determine if enemy is currently charging an action – used to disable player inputs
  const isEnemyCharging = Boolean(state.combat?.enemyIntentions);

  const enemy = {
    id: enemyId,
    name: enemyDef ? enemyDef.name : (enemyId || 'Unknown Enemy'),
    description: enemyDef ? enemyDef.description : 'Enemy encountered in combat.',
    health: enemyHealth,
    maxHealth: enemyMaxHealth,
    shield: enemyShield,
    maxShield: enemyMaxShield,
    image: enemyDef?.image || '/enemy-void.png',
    weakness: 'shield' as const // placeholder; could map from enemyDef in future
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
  
  // Auto-scroll battle log
  const logRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: 'smooth' })
  }, [battleLog])
  
  // State for battle log modal (declared before any early returns)
  const [showLog, setShowLog] = useState(false)
  
  // Trigger enemy attack resolution after 2s when a new action starts charging
  const chargingId = state.combat?.enemyIntentions?.actionId;
  useEffect(() => {
    if (!chargingId) return;
    console.log('⏳ Enemy action charging – scheduling resolve for', chargingId);
    const timer = setTimeout(() => {
      console.log('⚡ Dispatching ENEMY_ACTION_RESOLVE for', chargingId);
      dispatch({ type: 'ENEMY_ACTION_RESOLVE' })
    }, 2000);
    return () => clearTimeout(timer);
  }, [chargingId]);
  
  // Show loading overlay while engine initializing
  if (isInitializing) {
    return (
      <GameLoader>
        <main className="flex min-h-screen items-center justify-center">
          <div className="text-center space-y-4 animate-pulse">
            <p className="text-xl terminal-text">Recalibrating targeting arrays...</p>
            <p className="text-muted-foreground">Restoring battle telemetry</p>
          </div>
        </main>
      </GameLoader>
    );
  }
  
  return (
    <GameLoader>
      <main className="flex min-h-screen flex-col">
        <div className="flex flex-col p-4 md:p-8">
          {/* Header & alerts */}
          <div className="system-panel p-6 mb-6">
            <h1 className={`text-2xl font-bold text-primary mb-4 ${shouldFlicker('battle') ? 'flickering-text' : ''}`}>Combat Encounter</h1>
            
            {/* Enemy turn overlay */}
            {enemyTurnNotice && (
              <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
                <div className="bg-black/70 px-6 py-4 rounded-md text-lg text-red-400 animate-pulse">
                  Enemy is acting...
                </div>
              </div>
            )}
            
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
          </div>
          
          {/* Split Screen Layout */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* LEFT COLUMN – Ship status & actions */}
            <div className="flex flex-col space-y-6">
              {/* Ship status */}
              <div className="system-panel p-4 flex flex-col h-60">
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
                    <Progress 
                      value={(shipShield / maxShipShield) * 100}
                      className={cn("h-2 bg-muted", shipShieldFlash && "flash-shield")}
                      indicatorClassName="bg-chart-1" 
                    />
                  </div>
                  
                  {/* Ship hull */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span>Hull Integrity</span>
                      <span>{shipHealth}/{maxShipHealth}</span>
                    </div>
                    <Progress 
                      value={(shipHealth / maxShipHealth) * 100}
                      className={cn("h-2 bg-muted", shipDamageFlash && "flash-damage")}
                      indicatorClassName="bg-green-500" 
                    />
                  </div>
                </div>
              </div>
              
              {/* Combat actions header remains same */}
              <h2 className="text-lg font-semibold mb-4 terminal-text">Combat Actions</h2>

              {/* Actions grid retained */}
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
                          className="system-panel p-3 flex items-center justify-between hover:bg-accent/10 transition-colors h-full disabled:opacity-40 disabled:pointer-events-none"
                          disabled={state.combat?.cooldowns?.[action.id] > 0 || isEnemyCharging}
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
                          className="system-panel p-3 flex flex-col hover:bg-accent/10 transition-colors disabled:opacity-40 disabled:pointer-events-none"
                          disabled={state.combat?.cooldowns?.[action.id] > 0 || isEnemyCharging}
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
                          className="system-panel p-3 flex flex-col hover:bg-accent/10 transition-colors disabled:opacity-40 disabled:pointer-events-none"
                          disabled={state.combat?.cooldowns?.[action.id] > 0 || isEnemyCharging}
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
                          className="system-panel p-3 flex flex-col hover:bg-accent/10 transition-colors disabled:opacity-40 disabled:pointer-events-none"
                          disabled={state.combat?.cooldowns?.[action.id] > 0 || isEnemyCharging}
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
              
              {/* Retreat button at bottom */}
              <button 
                onClick={retreat}
                className="system-panel w-full p-3 flex items-center justify-center hover:bg-accent/10 transition-colors"
              >
                <span className="terminal-text">Retreat from Battle</span>
              </button>
            </div>

            {/* RIGHT COLUMN – Enemy panel & log */}
            <div className="flex flex-col space-y-6">
              {/* Enemy status */}
              <div className="system-panel p-4 flex flex-col h-60">
                <div className="flex items-center gap-3 mb-2">
                  {enemy.image && (
                    <img src={enemy.image} alt={enemy.name} className="w-12 h-12 object-contain enemy-sprite" />
                  )}
                  <h2 className="text-lg font-medium">{enemy.name}</h2>
                </div>
                <p className="text-sm text-muted-foreground">{enemy.description}</p>
                
                {/* Push shield and hull to bottom with auto margin */}
                <div className="mt-auto">
                  {/* Enemy shield - aligned with ship shield */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span>Shield Strength</span>
                      <span>{enemy.shield}/{enemy.maxShield}</span>
                    </div>
                    <Progress 
                      value={(enemy.shield / enemy.maxShield) * 100}
                      className={cn("h-2 bg-muted", enemyShieldFlash && "flash-shield")}
                      indicatorClassName="bg-chart-1" 
                    />
                  </div>
                  
                  {/* Enemy hull - aligned with ship hull */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span>Hull Integrity</span>
                      <span>{enemy.health}/{enemy.maxHealth}</span>
                    </div>
                    <Progress 
                      value={(enemy.health / enemy.maxHealth) * 100}
                      className={cn("h-2 bg-muted", enemyDamageFlash && "flash-damage")}
                      indicatorClassName="bg-green-500" 
                    />
                  </div>
                </div>
              </div>

              {/* Enemy move list */}
              <h2 className="text-lg font-semibold terminal-text mt-4 md:mt-0">Enemy Moves</h2>
              <div className="system-panel p-4 flex-1">
                <EnemyMoveList 
                  actions={enemyDef ? enemyDef.actions.map(id=>ENEMY_ACTIONS[id]) : []}
                  chargingActionId={state.combat?.enemyIntentions?.actionId || undefined}
                />
              </div>

              {/* Battle log modal trigger */}
              <button
                onClick={() => setShowLog(true)}
                className="self-end text-xs underline text-muted-foreground mt-2"
              >
                Open Battle Log
              </button>
            </div>
          </div>
        </div>

        {/* Log dialog */}
        <Dialog open={showLog} onOpenChange={setShowLog}>
          <DialogContent className="max-h-[80vh] w-[90vw] sm:w-[500px] overflow-y-auto">
            <h2 className="text-lg font-semibold terminal-text mb-2">Battle Log</h2>
            <div className="font-mono text-sm leading-tight space-y-1">
              {battleLog.map((entry, idx) => (
                <p key={entry.id || idx}>{entry.text}</p>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </GameLoader>
  )
} 