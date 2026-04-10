"use client";

import { Radiation, EyeOff } from "lucide-react";
import { AMMO_TYPES, AmmoTypeId, getAmmoMax } from "@/game-engine/content/ammoTypes";
import { useSystemStatus } from "@/components/providers/system-status-provider";
import { useGame } from "@/game-engine/hooks/useGame";
import GameLoader from "@/app/components/GameLoader";
import { useState, useEffect, useRef } from "react";
import { ENEMY_ACTIONS } from "@/game-engine/content/combatActions";
import { ALL_PLAYER_ABILITIES } from "@/game-engine/content/playerAbilities";
import { useRouter } from "next/navigation";
import { ENEMY_DEFINITIONS } from "@/game-engine/content/enemies";
import { useDevMode } from "@/components/providers/dev-mode-provider";

import PostBattleScreen from "./components/PostBattleScreen";
import PlayerStatusPanel from "./components/PlayerStatusPanel";
import EnemyStatusBar from "./components/EnemyStatusBar";
import CombatActionGrid from "./components/CombatActionGrid";
import BattleLogDialog from "./components/BattleLogDialog";
import EnemyMoveList from "@/components/EnemyMoveList";
import ItemSprite from "@/components/ui/ItemSprite";
import { useBattleAdvisor } from "@/components/hooks/useBattleAdvisor";
import { ADVISOR_MESSAGES } from "@/game-engine/content/advisorMessages";
import { useAdvisor } from "@/components/providers/advisor-provider";

/* -------------------------------------------------------------------------- */
/* Hooks                                                                      */
/* -------------------------------------------------------------------------- */
function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>();
  useEffect(() => void (ref.current = value));
  return ref.current;
}

/* -------------------------------------------------------------------------- */
/* Component                                                                  */
/* -------------------------------------------------------------------------- */
export default function BattlePage() {
  const { state, dispatch, isInitializing } = useGame();
  const { shouldFlicker } = useSystemStatus();
  const { devMode } = useDevMode();
  const router = useRouter();

  /* --------------------------- NAV / UNLOAD GUARD ------------------------- */
  useEffect(() => {
    if (isInitializing) return;
    if (!state.combat?.active && !state.combat?.encounterCompleted) {
      router.push("/bridge");
    }

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
  }, [isInitializing, state.combat?.active, state.combat?.encounterCompleted, router]);

  /* -------------------------- DERIVED STATE -------------------------------- */
  const { reactor, processor, crewQuarters, manufacturing } = state.categories;

  const resourceAmounts = {
    energy: Math.floor(reactor.resources.primary),
    insight: Math.floor(processor.resources.primary),
    crew: Math.floor(crewQuarters.resources.primary),
    scrap: Math.floor(manufacturing.resources.primary),
  } as const;

  const canAfford = (actionId: string) => {
    const ability = ALL_PLAYER_ABILITIES[actionId];
    if (!ability) return true;
    // Check ammo first
    if (ability.ammoCost) {
      const ammoState = state.ammo?.[ability.ammoCost.type];
      return ammoState ? ammoState.current >= ability.ammoCost.amount : false;
    }
    // Legacy resource check
    if (!ability.cost) return true;
    const { type, amount } = ability.cost;
    return resourceAmounts[type as keyof typeof resourceAmounts] >= amount;
  };

  const manufacturingUnlocked = manufacturing.unlocked || devMode;
  const crewUnlocked = crewQuarters.unlocked || devMode;
  const processorUnlocked = processor.unlocked || devMode;
  const shieldsUnlocked = (reactor.specialUpgrades.shielding || 0) > 0 || devMode;

  /* -------------------------------- PLAYER -------------------------------- */
  const shipShield = state.combat?.playerStats?.shield ?? 0;
  const maxShipShield = state.combat?.playerStats?.maxShield ?? 50;
  const shipHealth = state.combat?.playerStats?.health ?? 0;
  const maxShipHealth = state.combat?.playerStats?.maxHealth ?? 100;
  const prevShipShield = usePrevious(shipShield);
  const prevShipHealth = usePrevious(shipHealth);

  /* -------------------------------- ENEMY --------------------------------- */
  const enemyId = state.combat?.currentEnemy ?? "unknown";
  const enemyDef = ENEMY_DEFINITIONS[enemyId as keyof typeof ENEMY_DEFINITIONS];
  const enemy = {
    name: enemyDef?.name ?? enemyId,
    description: enemyDef?.description ?? "Enemy encountered in combat.",
    health: state.combat?.enemyStats?.health ?? 0,
    maxHealth: state.combat?.enemyStats?.maxHealth ?? 100,
    shield: state.combat?.enemyStats?.shield ?? 0,
    maxShield: state.combat?.enemyStats?.maxShield ?? 50,
    image: enemyDef?.image ?? "/enemy-void.png",
  };
  const prevEnemyShield = usePrevious(enemy.shield);
  const prevEnemyHealth = usePrevious(enemy.health);

  /* ------------------------------ FLASHES --------------------------------- */
  const [shipShieldFlash, setShipShieldFlash] = useState(false);
  const [shipDamageFlash, setShipDamageFlash] = useState(false);
  const [enemyShieldFlash, setEnemyShieldFlash] = useState(false);
  const [enemyDamageFlash, setEnemyDamageFlash] = useState(false);
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

  /* ------------------------------ ACTIONS --------------------------------- */
  const performCombatAction = (actionId: string) =>
    dispatch({ type: "COMBAT_ACTION", payload: { actionId } });

  const retreat = () => {
    dispatch({ type: "RETREAT_FROM_BATTLE" });
    router.push("/bridge");
  };

  /* Is the enemy's intent revealed? (EXPOSE status effect active) */
  const isEnemyExposed = (state.combat?.enemyStats?.statusEffects ?? [])
    .some((e) => e.type === "EXPOSE" && e.remainingTurns > 0);

  /* Void enemies always reveal their abilities (Phase 2 design) */
  const isVoidRegion = (state.combat?.currentRegion ?? "") === "void";

  /* Radiation & Cloak */
  const radiationStacks = state.combat?.radiationStacks ?? 0;
  const enemyCloaked = state.combat?.enemyCloaked ?? false;

  /* Turn / AP */
  const turn = state.combat?.turn ?? 1;
  const turnPhase = state.combat?.turnPhase ?? "PLAYER";
  const playerAP = state.combat?.playerAP ?? 0;
  const maxPlayerAP = state.combat?.maxPlayerAP ?? 1;
  const playerStunTurns = state.combat?.playerStunTurns ?? 0;
  const lastEnemyActionId = state.combat?.lastEnemyActionId ?? null;

  /* ----------------------------- BATTLE LOG ------------------------------- */
  const battleLog = state.combat?.battleLog ?? [];
  const [showLog, setShowLog] = useState(false);

  /* ----------------------------- ADVISOR ---------------------------------- */
  useBattleAdvisor(state);
  const { showAdvisor } = useAdvisor();

  const triggerTestAdvisor = () => {
    const pools = Object.values(ADVISOR_MESSAGES);
    const pool = pools[Math.floor(Math.random() * pools.length)];
    const line = pool[Math.floor(Math.random() * pool.length)];
    showAdvisor(line.text);
  };

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

  /* ----------------------- POST BATTLE ----------------------------------- */
  if (state.combat?.encounterCompleted) {
    return (
      <GameLoader>
        <PostBattleScreen
          outcome={state.combat.outcome as "victory" | "defeat" | "retreat" | null}
          rewards={state.combat.rewards}
          onExit={() => router.push("/bridge")}
        />
      </GameLoader>
    );
  }

  /* ----------------------------------------------------------------------- */
  /* RENDER                                                                  */
  /* ----------------------------------------------------------------------- */
  const CELL_COLORS: Record<string, { filled: string; text: string; border: string; bg: string }> = {
    cyan:    { filled: "bg-cyan-500",    text: "text-cyan-400",    border: "border-cyan-500/30", bg: "bg-cyan-500/5" },
    amber:   { filled: "bg-amber-500",   text: "text-amber-400",   border: "border-amber-500/30", bg: "bg-amber-500/5" },
    violet:  { filled: "bg-violet-500",  text: "text-violet-400",  border: "border-violet-500/30", bg: "bg-violet-500/5" },
    emerald: { filled: "bg-emerald-500", text: "text-emerald-400", border: "border-emerald-500/30", bg: "bg-emerald-500/5" },
  };

  return (
    <GameLoader>
      <main className="min-h-screen">
        <div className="flex flex-col p-4 md:p-6">
          {/* Header row */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <h1
                className={`text-lg font-bold text-primary ${
                  shouldFlicker("battle") ? "flickering-text" : ""
                }`}
              >
                Combat — {enemy.name}
              </h1>
              <span className="text-xs font-mono text-muted-foreground">
                Turn {turn} · {turnPhase === "PLAYER" ? "Your Turn" : "Enemy Turn"}
              </span>
            </div>
            <div className="flex items-center gap-3">
              {(radiationStacks > 0) && (
                <span className="text-xs font-mono text-yellow-400 flex items-center gap-1">
                  <Radiation className="h-3.5 w-3.5" /> {radiationStacks} RAD
                </span>
              )}
              {enemyCloaked && (
                <span className="text-xs font-mono text-purple-400 flex items-center gap-1 animate-pulse">
                  <EyeOff className="h-3.5 w-3.5" /> CLOAKED
                </span>
              )}
              <button
                onClick={() => setShowLog(true)}
                className="text-xs font-mono text-muted-foreground hover:text-foreground transition-colors"
              >
                Battle Log
              </button>
              {devMode && (
                <button
                  onClick={triggerTestAdvisor}
                  className="text-xs font-mono text-cyan-400 border border-cyan-500/40 px-2 py-0.5 rounded hover:bg-cyan-500/10 transition-colors"
                >
                  Test Advisor
                </button>
              )}
            </div>
          </div>

          {/* Ammo strip — rectangles like armory */}
          <div className="grid grid-cols-4 gap-2 mb-3">
            {(["powerCells", "munitions", "dataCores", "repairKits"] as AmmoTypeId[]).map(ammoId => {
              const def = AMMO_TYPES[ammoId];
              const ammoState = state.ammo?.[ammoId];
              const current = ammoState?.current ?? 0;
              const max = getAmmoMax(ammoId, ammoState?.tier ?? 0);
              const c = CELL_COLORS[def.color] ?? CELL_COLORS.cyan;
              return (
                <div key={ammoId} className={`rounded px-2 py-1.5 border ${c.border} ${c.bg}`}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1">
                      <ItemSprite itemId={ammoId} size={14} />
                      <span className={`text-[10px] font-mono font-semibold ${c.text}`}>{def.name}</span>
                    </div>
                    <span className={`text-[10px] font-mono ${c.text}`}>{current}/{max}</span>
                  </div>
                  <div className="flex flex-wrap gap-0.5">
                    {Array.from({ length: max }, (_, i) => (
                      <div
                        key={i}
                        className={`w-2 h-2 rounded-sm transition-colors ${
                          i < current ? c.filled : "bg-muted/30"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Status bars — side by side */}
          <div className="grid grid-cols-2 gap-3 mb-3">
            <PlayerStatusPanel
              shipShield={shipShield}
              maxShipShield={maxShipShield}
              shipHealth={shipHealth}
              maxShipHealth={maxShipHealth}
              shieldsUnlocked={shieldsUnlocked}
              shipShieldFlash={shipShieldFlash}
              shipDamageFlash={shipDamageFlash}
              radiationStacks={radiationStacks}
            />
            <EnemyStatusBar
              name={enemy.name}
              image={enemy.image}
              shield={enemy.shield}
              maxShield={enemy.maxShield}
              health={enemy.health}
              maxHealth={enemy.maxHealth}
              enemyShieldFlash={enemyShieldFlash}
              enemyDamageFlash={enemyDamageFlash}
              isExposed={isEnemyExposed}
              isCloaked={enemyCloaked}
            />
          </div>

          {/* 2-Column: Player Actions (left) + Enemy Moves (right) */}
          <div className="grid md:grid-cols-2 gap-3 mb-4">
            <CombatActionGrid
              availableActions={state.combat?.availableActions ?? []}
              cooldowns={state.combat?.cooldowns ?? {}}
              canAfford={canAfford}
              onAction={performCombatAction}
              isStunned={playerStunTurns > 0}
              stunTurnsRemaining={playerStunTurns}
              enemyCloaked={enemyCloaked}
              ammo={state.ammo}
              playerAP={playerAP}
              maxPlayerAP={maxPlayerAP}
              turnPhase={turnPhase}
            />

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Enemy Moves</h2>
                {(isEnemyExposed && !isVoidRegion) && (
                  <span className="text-[10px] text-chart-2 font-mono">SYSTEMS HACKED</span>
                )}
              </div>
              <EnemyMoveList
                actions={
                  enemyDef
                    ? enemyDef.actions.map((id) => ENEMY_ACTIONS[id]).filter(Boolean)
                    : []
                }
                enemyCooldowns={state.combat?.enemyCooldowns ?? {}}
                lastEnemyActionId={lastEnemyActionId}
                alwaysReveal={isVoidRegion}
                isExposed={isEnemyExposed}
              />
            </div>
          </div>

          {/* Retreat button — prominent */}
          <button
            onClick={retreat}
            className="system-panel w-full py-3 text-center font-mono text-red-400 border-red-500/30 hover:bg-red-500/10 hover:border-red-500/60 transition-colors"
          >
            Retreat from Battle
          </button>
        </div>

        <BattleLogDialog
          open={showLog}
          onOpenChange={setShowLog}
          entries={battleLog}
        />
      </main>
    </GameLoader>
  );
}
