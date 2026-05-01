"use client";

import { NavBar } from "@/components/ui/navbar";
import { Compass, Rocket, Skull, Zap, Wrench, Plus, Minus, ChevronUp, Bot, Atom } from "lucide-react";
import { useSystemStatus } from "@/components/providers/system-status-provider";
import { useGame } from "@/game-engine/hooks/useGame";
import Logger, { LogCategory, LogContext } from "@/app/utils/logger";
import GameLoader from "@/app/components/GameLoader";
import { useRouter } from "next/navigation";
import { REGION_DEFINITIONS } from "@/game-engine/content/regions";
import { REGION_TYPE_STYLES } from "@/game-engine/content/regionStyles";
import {
  workerHireEnergyCost,
  workerMaxUpgradeRelicCost,
  WORKER_BASE,
  WORKER_PER_UPGRADE,
  WORKER_BOSS_GATE_SIZE,
  WingId,
} from "@/game-engine/content/wingResources";
import { WingCategory } from "@/game-engine/types/resources";
import { cn } from "@/lib/utils";

/** Tailwind color classes matching the RegionTree node colors */
const REGION_COLOR_MAP: Record<RegionType, { text: string; border: string; hoverBg: string }> = {
  void:      { text: "text-slate-400",   border: "border-slate-400/60",   hoverBg: "hover:bg-slate-400/10" },
  nebula:    { text: "text-purple-400",  border: "border-purple-400/60",  hoverBg: "hover:bg-purple-400/10" },
  asteroid:  { text: "text-amber-400",   border: "border-amber-400/60",   hoverBg: "hover:bg-amber-400/10" },
  deepspace: { text: "text-emerald-400", border: "border-emerald-400/60", hoverBg: "hover:bg-emerald-400/10" },
  blackhole: { text: "text-red-400",     border: "border-red-400/60",     hoverBg: "hover:bg-red-400/10" },
};
import { RegionType } from "@/game-engine/types/regions";
import { useDevMode } from "@/components/providers/dev-mode-provider";
import {
  FUEL_CAPACITY,
  FUEL_RATE_PER_SECOND,
  MANUAL_FUEL_CYCLE_MS,
  MANUAL_FUEL_PER_CYCLE,
  MANUAL_FUEL_IGNITE_ENERGY_COST,
  JUMP_FUEL_COST,
  FUEL_PUMP_MAX_LEVEL,
  fuelPumpUpgradeCost,
  fuelPumpMultiplier,
} from "@/game-engine/content/bridgeFuel";
import { Progress } from "@/components/ui/progress";
import { REGION_WING_UNLOCKS } from "@/game-engine/content/wingResources";
import RegionTree from "./components/RegionTree";
import { useEffect, useState } from "react";

const JUMPS_PER_REGION = 6;

interface ManualFuelCycleButtonProps {
  cycleStartMs: number | undefined;
  canAfford: boolean;
  onClick: () => void;
}

function ManualFuelCycleButton({ cycleStartMs, canAfford, onClick }: ManualFuelCycleButtonProps) {
  // Tick locally while a cycle is running so the fill bar animates smoothly
  // between game-engine ticks.
  const [, setNow] = useState(0);
  const running = cycleStartMs !== undefined;
  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => setNow(Date.now()), 80);
    return () => window.clearInterval(id);
  }, [running]);

  const elapsed = running ? Date.now() - (cycleStartMs as number) : 0;
  const progress = Math.min(1, elapsed / MANUAL_FUEL_CYCLE_MS);
  const disabled = running || !canAfford;
  const remainingSec = Math.max(0, Math.ceil((MANUAL_FUEL_CYCLE_MS - elapsed) / 1000));

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "relative w-full overflow-hidden rounded border p-3 text-left font-mono text-xs transition-colors mb-2 select-none",
        running
          ? "border-primary/60 bg-primary/5 cursor-default"
          : !canAfford
            ? "border-muted/20 bg-muted/5 opacity-50 cursor-not-allowed"
            : "border-primary/40 bg-primary/5 hover:bg-primary/10 text-primary"
      )}
    >
      {running && (
        <div
          className="absolute inset-y-0 left-0 bg-primary/25 transition-[width] duration-75 ease-linear pointer-events-none"
          style={{ width: `${progress * 100}%` }}
        />
      )}
      <div className="relative flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Atom className={cn("h-4 w-4 text-primary", running && "animate-pulse")} />
          <span className="font-semibold text-primary">
            {running
              ? `Refining… ${remainingSec}s · +${MANUAL_FUEL_PER_CYCLE} fuel`
              : "Refine fuel"}
          </span>
        </div>
        {!running && (
          <span className="text-muted-foreground">
            {MANUAL_FUEL_IGNITE_ENERGY_COST} Energy → +{MANUAL_FUEL_PER_CYCLE} fuel
          </span>
        )}
      </div>
    </button>
  );
}

const REGION_DISPLAY_NAMES: Record<RegionType, string> = {
  void: "The Void",
  nebula: "Azure Nebula",
  asteroid: "Shattered Belt",
  deepspace: "Gamma Sector",
  blackhole: "Stellar Graveyard",
};

export default function BridgePage() {
  const { state, dispatch, engine } = useGame();
  const { shouldFlicker } = useSystemStatus();
  const router = useRouter();
  const { devMode } = useDevMode();

  const currentRegionId = (state?.bridge?.currentRegion ?? "void") as RegionType;
  const currentTier = state?.bridge?.currentTier ?? 1;
  const regionDefKey = currentTier > 1 ? `${currentRegionId}-t${currentTier}` : currentRegionId;
  const currentRegionDef = REGION_DEFINITIONS[regionDefKey] ?? REGION_DEFINITIONS[currentRegionId];
  const currentRegionConfig = REGION_TYPE_STYLES[currentRegionId] ?? REGION_TYPE_STYLES[RegionType.VOID];
  const voidCompleted = state?.bridge?.completedRegions?.includes("void") ?? false;

  // Compute progress per region — only count victories (not retreats/defeats)
  const encountersFor = (regionId: string) =>
    state?.encounters?.history?.filter((h) => h.region === regionId && h.result === 'victory').length ?? 0;

  const voidProgress = {
    encounters: encountersFor("void"),
    maxEncounters: JUMPS_PER_REGION,
    completed: voidCompleted,
  };

  const regionProgress: Record<string, { encounters: number; maxEncounters: number; completed: boolean }> = {};
  const completedRegions = state?.bridge?.completedRegions ?? [];
  for (const rId of ["nebula", "asteroid", "deepspace", "blackhole"]) {
    // T1
    regionProgress[rId] = {
      encounters: encountersFor(rId),
      maxEncounters: JUMPS_PER_REGION,
      completed: completedRegions.includes(rId),
    };
    // T2
    const t2Key = `${rId}-t2`;
    regionProgress[t2Key] = {
      encounters: encountersFor(t2Key),
      maxEncounters: JUMPS_PER_REGION,
      completed: completedRegions.includes(t2Key),
    };
    // T3
    const t3Key = `${rId}-t3`;
    regionProgress[t3Key] = {
      encounters: encountersFor(t3Key),
      maxEncounters: JUMPS_PER_REGION,
      completed: completedRegions.includes(t3Key),
    };
  }

  // Determine which regions are navigable based on wing unlocks
  const unlockedRegions = new Set<string>(["void"]);
  for (const unlock of REGION_WING_UNLOCKS) {
    if (state?.categories?.[unlock.wing]?.unlocked) {
      unlockedRegions.add(unlock.unlocksRegion);
    }
  }
  // Blackhole requires all 3 non-reactor wings unlocked
  if (state?.categories?.processor?.unlocked &&
      state?.categories?.crewQuarters?.unlocked &&
      state?.categories?.manufacturing?.unlocked) {
    unlockedRegions.add("blackhole");
  }
  // Dev mode unlocks everything
  if (devMode) {
    ["nebula", "asteroid", "deepspace", "blackhole"].forEach(r => unlockedRegions.add(r));
  }

  const selectRegion = (regionId: RegionType, tier?: number) => {
    const t = tier ?? 1;
    if (regionId === currentRegionId && t === currentTier) return;
    // Don't allow navigating to locked regions
    if (!unlockedRegions.has(regionId)) return;
    dispatch({ type: "SELECT_REGION", payload: { region: regionId, tier: t } });
  };

  // Pending rematch from retreat — only forces a rematch if we're back in that region
  const pendingRematch = state?.encounters?.pendingRematch;
  const currentRegionKey = currentTier > 1 ? `${currentRegionId}-t${currentTier}` : currentRegionId;
  const isRematch = !!pendingRematch && pendingRematch.regionKey === currentRegionKey;

  // Jump cost & affordability (free for rematch). Jumps are now fuelled
  // by the bridge fuel reservoir instead of reactor energy. The very first
  // jump only costs 1 fuel — a guided opener.
  const isFirstJump = (state?.encounters?.history?.length ?? 0) === 0;
  const jumpCost = isRematch ? 0 : isFirstJump ? 1 : JUMP_FUEL_COST;
  const currentEnergy = Math.floor(state?.categories?.reactor?.resources?.primary ?? 0);
  const rawFuel = state?.bridge?.fuel;
  const currentFuel = typeof rawFuel === 'number' && Number.isFinite(rawFuel) ? rawFuel : 0;
  const canAffordJump = isRematch || currentFuel >= jumpCost;

  const initiateJump = () => {
    if (!canAffordJump) return;
    Logger.info(LogCategory.ACTIONS, "Initiating jump sequence", LogContext.NONE);
    dispatch({ type: "INITIATE_JUMP" });
    // Engine state updates synchronously inside dispatch — read it directly
    // so we route to the right page without waiting for the React tick.
    const next = engine.getState();
    if (next.combat?.active) {
      router.push("/battle");
    } else {
      router.push("/encounter");
    }
  };

  // Boss warning — next encounter is the boss fight
  const isBossNext = !isRematch && (
    currentRegionId === "void"
      ? voidProgress.encounters >= 5 && !voidCompleted
      : (regionProgress[currentRegionKey]?.encounters ?? 0) >= 5 &&
        !(regionProgress[currentRegionKey]?.completed ?? false)
  );

  /* ---- Worker management (shared pool) ---- */
  const workers = state?.workers ?? { total: 0, max: 0, maxLevel: 0 };
  const totalAssigned = (['reactor', 'processor', 'crewQuarters', 'manufacturing'] as WingId[])
    .reduce((sum, id) => {
      const w = state?.categories?.[id] as WingCategory | undefined;
      if (!w) return sum;
      return sum + w.workers.primary + w.workers.secondary + w.workers.tertiary + w.workers.quaternary;
    }, 0) + (state?.bridge?.fuelWorkers ?? 0);
  const freeWorkers = workers.total - totalAssigned;

  /* ---- Fuel reservoir ---- */
  const fuelWorkers = state?.bridge?.fuelWorkers ?? 0;
  const fuelPumpLevel = state?.bridge?.fuelPumpLevel ?? 0;
  const fuelPumpMult = fuelPumpMultiplier(fuelPumpLevel);
  const fuelRatePerSec = fuelWorkers * FUEL_RATE_PER_SECOND * fuelPumpMult;
  const fuelRatePerMin = fuelRatePerSec * 60;
  const fuelPct = FUEL_CAPACITY > 0 ? (currentFuel / FUEL_CAPACITY) * 100 : 0;
  // Fuel reservoir shows up whenever the player has access to the bridge.
  const canAutomateFuel = true;
  const canBuildDrones = (state?.relics ?? 0) >= 1 || devMode;
  const fuelPumpAtMax = fuelPumpLevel >= FUEL_PUMP_MAX_LEVEL;
  const fuelPumpNextCost = fuelPumpAtMax ? 0 : fuelPumpUpgradeCost(fuelPumpLevel);
  const canAffordFuelPump = !fuelPumpAtMax && currentEnergy >= fuelPumpNextCost;

  const hireCost = workerHireEnergyCost(workers.total);
  const canHire = workers.total < workers.max && currentEnergy >= hireCost;

  const maxLevelCost = workerMaxUpgradeRelicCost(workers.maxLevel);
  const bossCeiling = (state?.workerGateLevel ?? 1) * WORKER_BOSS_GATE_SIZE;
  const currentRawMax = WORKER_BASE + workers.maxLevel * WORKER_PER_UPGRADE;
  const maxAtCeiling = currentRawMax >= bossCeiling;
  const canUpgradeMax = !maxAtCeiling && (state?.relics ?? 0) >= maxLevelCost;

  return (
    <GameLoader>
      <main className="min-h-screen">
        <NavBar />

        <div className="flex flex-col p-4 md:p-8 md:ml-64">
          <div className="system-panel p-6 mb-6">
            <h1
              className={`text-2xl font-bold text-primary mb-6 ${
                shouldFlicker("bridge") ? "flickering-text" : ""
              }`}
            >
              Bridge
            </h1>

            {/* Current location with region art */}
            <div className="flex gap-5 mb-6">
              <img
                src={`/regions/${currentRegionId}.png`}
                alt={currentRegionDef?.name ?? currentRegionId}
                className="w-24 h-24 object-contain shrink-0 rounded"
                style={{ imageRendering: "pixelated" }}
              />
              <div className="flex flex-col justify-center">
                <div className="flex items-center gap-2 text-sm mb-1">
                  <Compass className={`h-4 w-4 ${REGION_COLOR_MAP[currentRegionId].text}`} />
                  <span className="text-muted-foreground">Current Location:</span>
                  <span className="font-medium">
                    {currentRegionDef?.name ?? REGION_DISPLAY_NAMES[currentRegionId] ?? currentRegionId}
                  </span>
                  {isBossNext && (
                    <span className="ml-2 text-xs text-red-500 font-mono animate-pulse">
                      WARNING — MASSIVE SIGNAL DETECTED
                    </span>
                  )}
                </div>
                {currentRegionDef?.description && (
                  <p className="text-sm text-muted-foreground max-w-xl">
                    {currentRegionDef.description}
                  </p>
                )}
              </div>
            </div>

            {/* REGION TREE */}
            <div className="mb-8">
              <RegionTree
                voidProgress={voidProgress}
                regionProgress={regionProgress}
                currentRegion={currentRegionId}
                currentTier={currentTier}
                onSelectRegion={selectRegion}
                unlockedRegions={unlockedRegions}
              />
            </div>

            {/* Jump button */}
            <button
              onClick={initiateJump}
              disabled={!canAffordJump}
              className={`system-panel w-full py-6 flex items-center justify-center transition-colors ${
                !canAffordJump
                  ? "opacity-50 cursor-not-allowed"
                  : isRematch
                    ? "border-orange-500/60 hover:bg-orange-500/10 hover:border-orange-500"
                    : isBossNext
                      ? "border-red-500/60 hover:bg-red-500/10 hover:border-red-500"
                      : `${REGION_COLOR_MAP[currentRegionId].border} ${REGION_COLOR_MAP[currentRegionId].hoverBg}`
              }`}
            >
              <div className="flex flex-col items-center">
                {isBossNext ? (
                  <Skull className={`h-10 w-10 text-red-500 ${shouldFlicker("bridge") ? "flickering-text" : ""} animate-pulse`} />
                ) : isRematch ? (
                  <Rocket className={`h-10 w-10 text-orange-400 ${shouldFlicker("bridge") ? "flickering-text" : ""}`} />
                ) : (
                  <Rocket
                    className={`h-10 w-10 ${REGION_COLOR_MAP[currentRegionId].text} ${
                      shouldFlicker("bridge") ? "flickering-text" : ""
                    }`}
                  />
                )}
                <span className={`font-mono tracking-wider ${
                  isRematch ? "text-orange-400" : isBossNext ? "text-red-500" : REGION_COLOR_MAP[currentRegionId].text
                }`}>
                  {isRematch ? "Re-engage Target" : isBossNext ? "Confront the Unknown" : "Initiate Jump"}
                </span>
                {isRematch && (
                  <span className="text-xs text-orange-400/80 mt-1 font-mono">
                    The enemy that drove you back still lurks in this region
                  </span>
                )}
                {isBossNext && (
                  <span className="text-xs text-red-400 mt-1 font-mono animate-pulse">
                    Sensors detect an overwhelming presence ahead
                  </span>
                )}
                <span className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                  {isRematch ? (
                    <span>No fuel cost</span>
                  ) : (
                    <>
                      <Atom className="h-3 w-3" />
                      {jumpCost} Fuel
                      {!canAffordJump && (
                        <span className="text-red-400 ml-1">(insufficient)</span>
                      )}
                    </>
                  )}
                </span>
              </div>
            </button>

            {/* Dev controls */}
            {devMode && (
              <div className="mt-4 p-3 border border-dashed border-yellow-500/30 rounded text-xs font-mono">
                <span className="text-yellow-500">DEV</span> — Quick travel:{" "}
                {(["void", "nebula", "asteroid", "deepspace", "blackhole"] as RegionType[]).map((r) => (
                  <button
                    key={r}
                    onClick={() => dispatch({ type: "SELECT_REGION", payload: { region: r } })}
                    className={`mx-1 px-2 py-0.5 rounded ${
                      r === currentRegionId ? "bg-primary/20 text-primary" : "hover:bg-accent/10"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ─── Drone Bay (unlocks after first combat victory) ─────── */}
          {canBuildDrones && (
          <div className="system-panel p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-primary flex items-center gap-2">
                <Bot className="h-5 w-5" />
                Drone Bay
              </h2>
              <div className="flex items-center gap-3 text-sm font-mono">
                <span className="text-muted-foreground">
                  {totalAssigned} working
                </span>
                <span className="text-primary">
                  {freeWorkers} idle
                </span>
                <span className="text-muted-foreground/60">
                  {workers.total}/{workers.max} built
                </span>
              </div>
            </div>

            <p className="text-xs text-muted-foreground font-mono mb-4">
              Drones are shared across every wing of the Dawn. Build them here, then assign them in each wing.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <button
                onClick={() => dispatch({ type: 'HIRE_WORKER' })}
                disabled={!canHire}
                className={cn(
                  "flex items-center justify-between gap-2 px-4 py-3 rounded text-sm font-mono transition-colors border",
                  canHire
                    ? "bg-primary/10 text-primary hover:bg-primary/20 border-primary/40"
                    : "bg-muted/10 text-muted-foreground/50 cursor-not-allowed border-muted/10"
                )}
              >
                <div className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  <span>Build Drone</span>
                </div>
                <span className="flex items-center gap-1 text-xs text-muted-foreground/80">
                  <Zap className="h-3 w-3" />
                  {hireCost} Energy
                </span>
              </button>

              <button
                onClick={() => dispatch({ type: 'BUY_WORKER_CAP_UPGRADE' })}
                disabled={!canUpgradeMax}
                className={cn(
                  "flex items-center justify-between gap-2 px-4 py-3 rounded text-sm font-mono transition-colors border",
                  canUpgradeMax
                    ? "bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border-amber-500/40"
                    : "bg-muted/10 text-muted-foreground/50 cursor-not-allowed border-muted/10"
                )}
              >
                <div className="flex items-center gap-2">
                  <ChevronUp className="h-4 w-4" />
                  <span>+{WORKER_PER_UPGRADE} Max Drones</span>
                </div>
                <span className="text-xs text-muted-foreground/80">
                  {maxAtCeiling
                    ? "Defeat next boss to expand"
                    : `${maxLevelCost} Relics`}
                </span>
              </button>
            </div>

            {workers.total === 0 && (
              <p className="text-[10px] text-muted-foreground/70 font-mono mt-3 text-center">
                No drones yet — build some to begin automating wings.
              </p>
            )}
          </div>
          )}

          {/* ─── Fuel Reservoir ─────────────────────────────────────── */}
          {canAutomateFuel && (
            <div className="system-panel p-6 mt-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-primary flex items-center gap-2">
                  <Atom className="h-5 w-5" />
                  Fuel Reservoir
                </h2>
                <div className="flex items-center gap-3 text-sm font-mono">
                  <span className={fuelWorkers > 0 ? "text-emerald-400" : "text-muted-foreground/60"}>
                    {fuelWorkers > 0 ? "+" : ""}{fuelRatePerMin.toFixed(2)}/min
                  </span>
                  <span className="text-muted-foreground">
                    {currentFuel.toFixed(2)}/{FUEL_CAPACITY} fuel
                  </span>
                </div>
              </div>

              <p className="text-xs text-muted-foreground font-mono mb-4">
                Fuel powers every jump. {canBuildDrones
                  ? 'Assign drones to refine it while you explore.'
                  : 'Hold the refine valve to manually pump fuel — slow, but it works.'}
              </p>

              <Progress value={fuelPct} className="h-2 mb-4" />

              {!canBuildDrones && (
                <ManualFuelCycleButton
                  cycleStartMs={state?.bridge?.manualFuelCycleStartMs}
                  canAfford={currentEnergy >= MANUAL_FUEL_IGNITE_ENERGY_COST}
                  onClick={() => dispatch({ type: 'START_MANUAL_FUEL_CYCLE' })}
                />
              )}

              {canBuildDrones && (
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => dispatch({ type: 'ASSIGN_BRIDGE_FUEL_WORKER' })}
                    disabled={freeWorkers <= 0 || fuelWorkers >= 1}
                    className={cn(
                      "h-7 w-7 flex items-center justify-center rounded transition-colors shrink-0",
                      freeWorkers > 0 && fuelWorkers < 1
                        ? "bg-primary/10 text-primary hover:bg-primary/20"
                        : "bg-muted/10 text-muted-foreground/30 cursor-not-allowed"
                    )}
                    aria-label="Assign fuel drone"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => dispatch({ type: 'UNASSIGN_BRIDGE_FUEL_WORKER' })}
                    disabled={fuelWorkers <= 0}
                    className={cn(
                      "h-7 w-7 flex items-center justify-center rounded transition-colors shrink-0",
                      fuelWorkers > 0
                        ? "bg-muted/10 text-muted-foreground/60 hover:bg-muted/20"
                        : "bg-muted/5 text-muted-foreground/20 cursor-not-allowed"
                    )}
                    aria-label="Remove fuel drone"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="text-xs font-mono font-semibold">{fuelWorkers}/1</span>
                </div>
              </div>
              )}

              {/* Fuel Pump upgrade — boosts fuel generation rate, paid in energy */}
              <button
                onClick={() => dispatch({ type: 'BUY_FUEL_PUMP_UPGRADE' })}
                disabled={fuelPumpAtMax || !canAffordFuelPump}
                className={cn(
                  "mt-4 w-full flex items-center justify-between gap-3 p-3 rounded text-left transition-colors",
                  fuelPumpAtMax
                    ? "bg-primary/5 border border-primary/20 cursor-default"
                    : canAffordFuelPump
                      ? "bg-primary/5 hover:bg-primary/10 border border-primary/20"
                      : "bg-muted/5 border border-muted/10 opacity-50 cursor-not-allowed"
                )}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <ChevronUp className="h-4 w-4 text-primary shrink-0" />
                  <div className="min-w-0">
                    <div className="text-xs font-mono text-primary">
                      Fuel Pump Lv.{fuelPumpLevel}/{FUEL_PUMP_MAX_LEVEL}
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      {fuelPumpMult.toFixed(2)}× generation rate
                      {!fuelPumpAtMax && (
                        <> · next: {fuelPumpMultiplier(fuelPumpLevel + 1).toFixed(2)}×</>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-[10px] font-mono text-right shrink-0">
                  {fuelPumpAtMax ? (
                    <span className="text-primary/70">MAX</span>
                  ) : (
                    <span className={canAffordFuelPump ? "text-primary" : "text-muted-foreground"}>
                      {fuelPumpNextCost.toLocaleString()} Energy
                    </span>
                  )}
                </div>
              </button>
            </div>
          )}
        </div>
      </main>
    </GameLoader>
  );
}
