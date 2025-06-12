"use client";

import {
  Shield,
  Zap,
  Wrench,
  Cpu,
  AlertTriangle,
  ZapOff,
} from "lucide-react";
import { useSystemStatus } from "@/components/providers/system-status-provider";
import { useGame } from "@/app/game/hooks/useGame";
import Logger, { LogCategory, LogContext } from "@/app/utils/logger";
import GameLoader from "@/app/components/GameLoader";
import { Progress } from "@/components/ui/progress";
import { useState, useEffect, useRef } from "react";
import { CombatActionCategory } from "@/app/game/types/combat";
import { PLAYER_ACTIONS } from "@/app/game/content/combatActions";
import { useRouter } from "next/navigation";
import { ENEMY_DEFINITIONS } from "@/app/game/content/enemies";
import { cn } from "@/lib/utils";
import EnemyMoveList from "@/components/EnemyMoveList";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ENEMY_ACTIONS } from "@/app/game/content/combatActions";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */
interface Enemy {
  id: string;
  name: string;
  description: string;
  health: number;
  maxHealth: number;
  shield: number;
  maxShield: number;
  image: string;
  weakness: "shield" | "weapon" | "repair" | "countermeasure";
}

/* -------------------------------------------------------------------------- */
/* Component                                                                  */
/* -------------------------------------------------------------------------- */
export default function BattlePage() {
  const { state, dispatch, isInitializing } = useGame();
  const { shouldFlicker } = useSystemStatus();
  const router = useRouter();

  /* --------------------------- NAV / UNLOAD GUARD ------------------------- */
  useEffect(() => {
    if (isInitializing) return;
    if (!state.combat?.active) router.push("/navigation");

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (state.combat?.active) {
        e.preventDefault();
        e.returnValue =
          "You are in the middle of combat! Use the 'Retreat' button to safely exit.";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () =>
      window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isInitializing, state.combat?.active, router]);

  /* -------------------------------- HELPERS ------------------------------- */
  function usePrevious<T>(value: T): T | undefined {
    const ref = useRef<T>();
    useEffect(() => void (ref.current = value));
    return ref.current;
  }

  /* -------------------------- RESOURCE READOUTS --------------------------- */
  const { reactor, processor, crewQuarters, manufacturing } = state.categories;

  /* ---------------------- PLAYER RESOURCE AMOUNTS ---------------------- */
  const resourceAmounts = {
    energy: Math.floor(reactor.resources.energy),
    insight: Math.floor(processor.resources.insight),
    crew: Math.floor(crewQuarters.resources.crew),
    scrap: Math.floor(manufacturing.resources.scrap),
  } as const;

  const canAfford = (actionId: string) => {
    const action = PLAYER_ACTIONS[actionId];
    if (!action) return false;
    const { type, amount } = action.cost;
    return resourceAmounts[type as keyof typeof resourceAmounts] >= amount;
  };

  /* -------------------------------- PLAYER -------------------------------- */
  const shipShield = state.combat?.playerStats?.shield ?? 0;
  const maxShipShield = state.combat?.playerStats?.maxShield ?? 50;
  const shipHealth = state.combat?.playerStats?.health ?? 0;
  const maxShipHealth = state.combat?.playerStats?.maxHealth ?? 100;
  const prevShipShield = usePrevious(shipShield);
  const prevShipHealth = usePrevious(shipHealth);

  /* -------------------------------- ENEMY --------------------------------- */
  const enemyId = state.combat?.currentEnemy ?? "unknown";
  const enemyDef = ENEMY_DEFINITIONS[
    enemyId as keyof typeof ENEMY_DEFINITIONS
  ];
  const enemy: Enemy = {
    id: enemyId,
    name: enemyDef?.name ?? enemyId,
    description: enemyDef?.description ?? "Enemy encountered in combat.",
    health: state.combat?.enemyStats?.health ?? 0,
    maxHealth: state.combat?.enemyStats?.maxHealth ?? 100,
    shield: state.combat?.enemyStats?.shield ?? 0,
    maxShield: state.combat?.enemyStats?.maxShield ?? 50,
    image: enemyDef?.image ?? "/enemy-void.png",
    weakness: "shield",
  };
  const prevEnemyShield = usePrevious(enemy.shield);
  const prevEnemyHealth = usePrevious(enemy.health);

  /* ------------------------------ FLASHES --------------------------------- */
  const [shipShieldFlash, setShipShieldFlash] = useState(false);
  const [shipDamageFlash, setShipDamageFlash] = useState(false);
  const [enemyShieldFlash, setEnemyShieldFlash] = useState(false);
  const [enemyDamageFlash, setEnemyDamageFlash] = useState(false);
  const [enemyTurnNotice, setEnemyTurnNotice] = useState(false);

  useEffect(() => {
    if (prevShipShield !== undefined && shipShield < prevShipShield) {
      setShipShieldFlash(true);
      setTimeout(() => setShipShieldFlash(false), 300);
    }
  }, [shipShield, prevShipShield]);

  useEffect(() => {
    if (prevShipHealth !== undefined && shipHealth < prevShipHealth) {
      setShipDamageFlash(true);
      setTimeout(() => setShipDamageFlash(false), 300);
    }
  }, [shipHealth, prevShipHealth]);

  useEffect(() => {
    if (prevEnemyShield !== undefined && enemy.shield < prevEnemyShield) {
      setEnemyShieldFlash(true);
      setTimeout(() => setEnemyShieldFlash(false), 300);
    }
  }, [enemy.shield, prevEnemyShield]);

  useEffect(() => {
    if (prevEnemyHealth !== undefined && enemy.health < prevEnemyHealth) {
      setEnemyDamageFlash(true);
      setTimeout(() => setEnemyDamageFlash(false), 300);
    }
  }, [enemy.health, prevEnemyHealth]);

  /* "Enemy acting…" overlay when our ship takes damage on their turn */
  useEffect(() => {
    if (
      (prevShipHealth !== undefined && shipHealth < prevShipHealth) ||
      (prevShipShield !== undefined && shipShield < prevShipShield)
    ) {
      setEnemyTurnNotice(true);
      setTimeout(() => setEnemyTurnNotice(false), 700);
    }
  }, [shipHealth, shipShield]);

  /* ------------------------------ ACTIONS --------------------------------- */
  const performCombatAction = (actionId: string) =>
    dispatch({ type: "COMBAT_ACTION", payload: { actionId } });

  const retreat = () => {
    dispatch({ type: "RETREAT_FROM_BATTLE" });
    router.push("/navigation");
  };

  const isEnemyCharging = Boolean(state.combat?.enemyIntentions);

  /* -------------------------- ENEMY CHARGE TIMER --------------------------- */
  useEffect(() => {
    const chargingId = state.combat?.enemyIntentions?.actionId;
    if (!chargingId) return;
    const t = setTimeout(
      () => dispatch({ type: "ENEMY_ACTION_RESOLVE" }),
      2000
    );
    return () => clearTimeout(t);
  }, [state.combat?.enemyIntentions?.actionId, dispatch]);

  /* ----------------------------- BATTLE LOG ------------------------------- */
  const battleLog = state.combat?.battleLog ?? [];
  const [showLog, setShowLog] = useState(false);
  const logRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    logRef.current?.scrollTo({
      top: logRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [battleLog]);

  /* ------------------------------ LOADING --------------------------------- */
  if (isInitializing) {
    return (
      <GameLoader>
        <main className="flex min-h-screen items-center justify-center">
          <div className="text-center space-y-4 animate-pulse">
            <p className="text-xl terminal-text">
              Recalibrating targeting arrays...
            </p>
            <p className="text-muted-foreground">Restoring battle telemetry</p>
          </div>
        </main>
      </GameLoader>
    );
  }

  /* ----------------------------------------------------------------------- */
  /* RENDER                                                                  */
  /* ----------------------------------------------------------------------- */
  return (
    <GameLoader>
      <main className="flex min-h-screen flex-col">
        <div className="flex flex-col p-4 md:p-8 flex-1">
          {/* ----------------------- HEADER ----------------------- */}
          <div className="system-panel p-6 mb-6">
            <h1
              className={`text-2xl font-bold text-primary mb-4 ${
                shouldFlicker("battle") ? "flickering-text" : ""
              }`}
            >
              Combat Encounter
            </h1>

            {enemyTurnNotice && (
              <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
                <div className="bg-black/70 px-6 py-4 rounded-md text-lg text-red-400 animate-pulse">
                  Enemy is acting...
                </div>
              </div>
            )}

            <div className="mb-4 p-3 system-panel border border-yellow-700/50 bg-yellow-900/10">
              <p className="text-yellow-400 flex items-center text-sm">
                <AlertTriangle className="h-4 w-4 mr-2 flex-shrink-0" />
                <span>
                  ALERT: Ship engaged in combat. Defeat the enemy or retreat to
                  continue your journey.
                </span>
              </p>
            </div>
          </div>

          {/* ----------------------- 2-COLUMN GRID ---------------------- */}
          <div className="grid md:grid-cols-2 gap-6 flex-1">
            {/* ==================== PLAYER COLUMN ==================== */}
            <div className="flex flex-col h-full space-y-6">
              {/* --- Status card --- */}
              <div className="system-panel p-4 flex flex-col h-60">
                <h2 className="text-lg font-medium mb-3">Dawn Status</h2>
                <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                  <div>
                    <span className="text-muted-foreground">Energy:</span>{" "}
                    {resourceAmounts.energy}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Insight:</span>{" "}
                    {resourceAmounts.insight}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Crew:</span>{" "}
                    {resourceAmounts.crew}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Scrap:</span>{" "}
                    {resourceAmounts.scrap}
                  </div>
                </div>
                <div className="mt-auto">
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-1">
                      <span>Shield Strength</span>
                      <span>
                        {shipShield}/{maxShipShield}
                      </span>
                    </div>
                    <Progress
                      value={(shipShield / maxShipShield) * 100}
                      className={cn(
                        "h-2 bg-muted",
                        shipShieldFlash && "flash-shield"
                      )}
                      indicatorClassName="bg-chart-1"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span>Hull Integrity</span>
                      <span>
                        {shipHealth}/{maxShipHealth}
                      </span>
                    </div>
                    <Progress
                      value={(shipHealth / maxShipHealth) * 100}
                      className={cn(
                        "h-2 bg-muted",
                        shipDamageFlash && "flash-damage"
                      )}
                      indicatorClassName="bg-green-500"
                    />
                  </div>
                </div>
              </div>

              {/* --- Combat actions header --- */}
              <h2 className="text-lg font-semibold terminal-text">
                Combat Actions
              </h2>

              {/* --- Actions grid --- */}
              <div className="grid grid-cols-2 gap-4">
                {/* Energy Shields */}
                <div className="system-panel p-4 flex flex-col">
                  <h3 className="text-sm font-semibold mb-3 flex items-center">
                    <Shield className="h-5 w-5 mr-2 text-chart-1" />
                    Energy Shields{" "}
                    <span className="text-xs text-muted-foreground ml-2">
                      (Reactor)
                    </span>
                  </h3>
                  <div className="grid grid-cols-1 gap-2 flex-grow">
                    {Object.values(PLAYER_ACTIONS)
                      .filter(
                        (a) => a.category === CombatActionCategory.SHIELD
                      )
                      .map((a) => (
                        <button
                          key={a.id}
                          onClick={() => performCombatAction(a.id)}
                          disabled={
                            state.combat?.cooldowns?.[a.id] > 0 ||
                            isEnemyCharging ||
                            !canAfford(a.id)
                          }
                          className="system-panel p-3 flex items-center justify-between hover:bg-accent/10 transition-colors h-full disabled:opacity-40 disabled:pointer-events-none"
                        >
                          <div className="flex items-center">
                            <Shield className="h-4 w-4 mr-2 text-chart-1" />
                            <span>{a.name}</span>
                            {state.combat?.cooldowns?.[a.id] > 0 && (
                              <span className="ml-2 text-xs text-muted-foreground">
                                (CD: {state.combat.cooldowns[a.id]})
                              </span>
                            )}
                          </div>
                          <span className="text-xs px-1.5 py-0.5 bg-chart-1/20 text-chart-1 rounded">
                            {a.cost.amount} {a.cost.type}
                          </span>
                        </button>
                      ))}
                  </div>
                </div>

                {/* Weapons */}
                <div className="system-panel p-4 flex flex-col">
                  <h3 className="text-sm font-semibold mb-3 flex items-center">
                    <Zap className="h-5 w-5 mr-2 text-chart-2" />
                    Weapons Systems{" "}
                    <span className="text-xs text-muted-foreground ml-2">
                      (Manufacturing)
                    </span>
                  </h3>
                  <div className="grid grid-cols-2 gap-2 flex-grow">
                    {Object.values(PLAYER_ACTIONS)
                      .filter(
                        (a) => a.category === CombatActionCategory.WEAPON
                      )
                      .map((a) => (
                        <button
                          key={a.id}
                          onClick={() => performCombatAction(a.id)}
                          disabled={
                            state.combat?.cooldowns?.[a.id] > 0 ||
                            isEnemyCharging ||
                            !canAfford(a.id)
                          }
                          className="system-panel p-3 flex flex-col hover:bg-accent/10 transition-colors disabled:opacity-40 disabled:pointer-events-none"
                        >
                          <div className="flex items-center mb-1">
                            <Zap className="h-4 w-4 mr-2 text-chart-2" />
                            <span>{a.name}</span>
                          </div>
                          {state.combat?.cooldowns?.[a.id] > 0 && (
                            <span className="text-xs text-muted-foreground mb-1">
                              Cooldown: {state.combat.cooldowns[a.id]}
                            </span>
                          )}
                          <span className="text-xs self-start bg-chart-2/20 text-chart-2 px-1.5 py-0.5 rounded mt-auto">
                            {a.cost.amount} {a.cost.type}
                          </span>
                        </button>
                      ))}
                  </div>
                </div>

                {/* Repair Drones */}
                <div className="system-panel p-4 flex flex-col">
                  <h3 className="text-sm font-semibold mb-3 flex items-center">
                    <Wrench className="h-5 w-5 mr-2 text-chart-3" />
                    Repair Drones{" "}
                    <span className="text-xs text-muted-foreground ml-2">
                      (Crew)
                    </span>
                  </h3>
                  <div className="grid grid-cols-2 gap-2 flex-grow">
                    {Object.values(PLAYER_ACTIONS)
                      .filter(
                        (a) => a.category === CombatActionCategory.REPAIR
                      )
                      .map((a) => (
                        <button
                          key={a.id}
                          onClick={() => performCombatAction(a.id)}
                          disabled={
                            state.combat?.cooldowns?.[a.id] > 0 ||
                            isEnemyCharging ||
                            !canAfford(a.id)
                          }
                          className="system-panel p-3 flex flex-col hover:bg-accent/10 transition-colors disabled:opacity-40 disabled:pointer-events-none"
                        >
                          <div className="flex items-center mb-1">
                            <Wrench className="h-4 w-4 mr-2 text-chart-3" />
                            <span>{a.name}</span>
                          </div>
                          {state.combat?.cooldowns?.[a.id] > 0 && (
                            <span className="text-xs text-muted-foreground mb-1">
                              Cooldown: {state.combat.cooldowns[a.id]}
                            </span>
                          )}
                          <span className="text-xs self-start bg-chart-3/20 text-chart-3 px-1.5 py-0.5 rounded mt-auto">
                            {a.cost.amount} {a.cost.type}
                          </span>
                        </button>
                      ))}
                  </div>
                </div>

                {/* Electronic CM */}
                <div className="system-panel p-4 flex flex-col">
                  <h3 className="text-sm font-semibold mb-3 flex items-center">
                    <Cpu className="h-5 w-5 mr-2 text-chart-4" />
                    Electronic CM{" "}
                    <span className="text-xs text-muted-foreground ml-2">
                      (Processor)
                    </span>
                  </h3>
                  <div className="grid grid-cols-2 gap-2 flex-grow">
                    {Object.values(PLAYER_ACTIONS)
                      .filter(
                        (a) => a.category === CombatActionCategory.SABOTAGE
                      )
                      .map((a) => (
                        <button
                          key={a.id}
                          onClick={() => performCombatAction(a.id)}
                          disabled={
                            state.combat?.cooldowns?.[a.id] > 0 ||
                            isEnemyCharging ||
                            !canAfford(a.id)
                          }
                          className="system-panel p-3 flex flex-col hover:bg-accent/10 transition-colors disabled:opacity-40 disabled:pointer-events-none"
                        >
                          <div className="flex items-center mb-1">
                            <ZapOff className="h-4 w-4 mr-2 text-chart-4" />
                            <span>{a.name}</span>
                          </div>
                          {state.combat?.cooldowns?.[a.id] > 0 && (
                            <span className="text-xs text-muted-foreground mb-1">
                              Cooldown: {state.combat.cooldowns[a.id]}
                            </span>
                          )}
                          <span className="text-xs self-start bg-chart-4/20 text-chart-4 px-1.5 py-0.5 rounded mt-auto">
                            {a.cost.amount} {a.cost.type}
                          </span>
                        </button>
                      ))}
                  </div>
                </div>
              </div>

              {/* Retreat button (bottom-pinned) */}
              <button
                onClick={retreat}
                className="system-panel w-full p-3 mt-auto hover:bg-accent/10 transition-colors"
              >
                Retreat from Battle
              </button>
            </div>

            {/* ==================== ENEMY COLUMN ==================== */}
            <div className="flex flex-col h-full space-y-6">
              {/* Enemy status */}
              <div className="system-panel p-4 flex flex-col h-60">
                <div className="flex items-center gap-3 mb-2">
                  {enemy.image && (
                    <img
                      src={enemy.image}
                      alt={enemy.name}
                      className="w-12 h-12 object-contain enemy-sprite"
                    />
                  )}
                  <h2 className="text-lg font-medium">{enemy.name}</h2>
                </div>
                <p className="text-sm text-muted-foreground">
                  {enemy.description}
                </p>
                <div className="mt-auto">
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-1">
                      <span>Shield Strength</span>
                      <span>
                        {enemy.shield}/{enemy.maxShield}
                      </span>
                    </div>
                    <Progress
                      value={(enemy.shield / enemy.maxShield) * 100}
                      className={cn(
                        "h-2 bg-muted",
                        enemyShieldFlash && "flash-shield"
                      )}
                      indicatorClassName="bg-chart-1"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span>Hull Integrity</span>
                      <span>
                        {enemy.health}/{enemy.maxHealth}
                      </span>
                    </div>
                    <Progress
                      value={(enemy.health / enemy.maxHealth) * 100}
                      className={cn(
                        "h-2 bg-muted",
                        enemyDamageFlash && "flash-damage"
                      )}
                      indicatorClassName="bg-green-500"
                    />
                  </div>
                </div>
              </div>

              {/* Enemy moves */}
              <h2 className="text-lg font-semibold terminal-text">Enemy Moves</h2>
              <div className="system-panel p-4 flex-grow">
                <EnemyMoveList
                  actions={
                    enemyDef ? enemyDef.actions.map((id) => ENEMY_ACTIONS[id]) : []
                  }
                  chargingActionId={state.combat?.enemyIntentions?.actionId}
                />
              </div>

              {/* Battle-log button, same look as retreat */}
              <button
                onClick={() => setShowLog(true)}
                className="system-panel w-full p-3 mt-auto hover:bg-accent/10 transition-colors"
              >
                Open Battle Log
              </button>
            </div>
          </div>
        </div>

        {/* ----------------------- LOG DIALOG ----------------------- */}
        <Dialog open={showLog} onOpenChange={setShowLog}>
          <DialogContent className="max-h-[80vh] w-[90vw] sm:w-[500px] overflow-y-auto">
            <h2 className="text-lg font-semibold terminal-text mb-2">
              Battle Log
            </h2>
            <div
              ref={logRef}
              className="font-mono text-xs leading-tight space-y-1"
            >
              {battleLog.map((entry, idx) => (
                <p key={entry.id ?? idx}>{entry.text}</p>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </GameLoader>
  );
}
