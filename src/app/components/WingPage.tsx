"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { NavBar } from "@/components/ui/navbar";
import { useSystemStatus } from "@/components/providers/system-status-provider";
import { useGame } from "@/game-engine/hooks/useGame";
import GameLoader from "@/app/components/GameLoader";
import WorkerAllocationBar from "@/app/components/WorkerAllocationBar";
import WingResourceRow from "@/app/components/WingResourceRow";
import ResourceClickButton from "@/app/components/ResourceClickButton";
import { WING_DEFS, SLOT_ORDER, WingId, ResourceSlot, capacityUpgradeCost, efficiencyUpgradeCost } from "@/game-engine/content/wingResources";
import { ResourceSystem } from "@/game-engine/systems/ResourceSystem";
import { WingCategory, capKey, effKey } from "@/game-engine/types/resources";
import { LucideIcon, ChevronUp, Wrench, Cpu, Package, Bot } from "lucide-react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

interface WingPageProps {
  wingId: WingId;
  icon: LucideIcon;
  flickerKey: string;
  children?: React.ReactNode;
}

export default function WingPage({ wingId, icon: Icon, flickerKey, children }: WingPageProps) {
  const { state, dispatch } = useGame();
  const { shouldFlicker } = useSystemStatus();

  const wing = state.categories[wingId] as WingCategory;
  const def = WING_DEFS[wingId];

  // Track which elements just appeared so we can animate them
  const [animating, setAnimating] = useState<Set<string>>(new Set());
  const prevState = useRef({ secondary: wing.secondaryUnlocked, tertiary: wing.tertiaryUnlocked, automated: { ...wing.automated } });

  useEffect(() => {
    const prev = prevState.current;
    const newAnims = new Set<string>();

    if (wing.secondaryUnlocked && !prev.secondary) newAnims.add('slot-secondary');
    if (wing.tertiaryUnlocked && !prev.tertiary) newAnims.add('slot-tertiary');
    if (wing.automated.primary && !prev.automated.primary) newAnims.add('auto-primary');
    if (wing.automated.secondary && !prev.automated.secondary) newAnims.add('auto-secondary');
    if (wing.automated.tertiary && !prev.automated.tertiary) newAnims.add('auto-tertiary');

    prevState.current = { secondary: wing.secondaryUnlocked, tertiary: wing.tertiaryUnlocked, automated: { ...wing.automated } };

    if (newAnims.size > 0) {
      setAnimating(newAnims);
      const timer = setTimeout(() => setAnimating(new Set()), 1200);
      return () => clearTimeout(timer);
    }
  }, [wing.secondaryUnlocked, wing.tertiaryUnlocked, wing.automated.primary, wing.automated.secondary, wing.automated.tertiary]);

  // Workers are drawn from a single global pool now
  const wingAssigned = wing.workers.primary + wing.workers.secondary + wing.workers.tertiary;
  const globalAssigned = (['reactor', 'processor', 'crewQuarters', 'manufacturing'] as WingId[])
    .reduce((sum, id) => {
      const w = state.categories[id] as WingCategory;
      return sum + w.workers.primary + w.workers.secondary + w.workers.tertiary;
    }, 0);
  const totalWorkers = state.workers?.total ?? 0;
  const maxWorkers = state.workers?.max ?? 0;
  const freeWorkers = totalWorkers - globalAssigned;
  const hasAvailable = freeWorkers > 0 && wing.unlocked;

  const anyAutomated = wing.automated.primary || wing.automated.secondary || wing.automated.tertiary;
  const workerPanelNew = anyAutomated && (animating.has('auto-primary') || animating.has('auto-secondary') || animating.has('auto-tertiary'));

  // Which slots are visible (tier unlocked)
  const visibleSlots: ResourceSlot[] = ['primary'];
  if (wing.secondaryUnlocked) visibleSlots.push('secondary');
  if (wing.tertiaryUnlocked) visibleSlots.push('tertiary');

  // Check if next tier can be unlocked (threshold met but not yet unlocked)
  const canUnlockSecondary = ResourceSystem.canUnlockTier(wing, wingId, 'secondary');
  const canUnlockTertiary = ResourceSystem.canUnlockTier(wing, wingId, 'tertiary');

  // Check if a slot can have automation enabled right now
  const canEnableSlotAutomation = (slot: ResourceSlot): boolean => {
    if (wing.automated[slot]) return false;
    if (!wing.tertiaryUnlocked) return false;
    const thresholdKey = `automate${slot.charAt(0).toUpperCase()}${slot.slice(1)}` as keyof typeof def.unlockThresholds;
    const threshold = def.unlockThresholds[thresholdKey] as number;
    return wing.resources.tertiary >= threshold;
  };

  const getConsumeLabel = (slot: ResourceSlot): string | undefined => {
    const slotDef = def.resources[slot];
    if (slot === 'primary' && wingId !== 'reactor') {
      return `${def.energyCostPerPrimaryWorker} Energy/s per worker`;
    }
    if (slot === 'secondary') {
      return `${slotDef.consumeRate} ${def.resources.primary.name}/s per worker`;
    }
    if (slot === 'tertiary') {
      return `${slotDef.consumeRate} ${def.resources.secondary.name}/s per worker`;
    }
    return undefined;
  };

  return (
    <GameLoader>
      <main className="min-h-screen">
        <NavBar />
        <div className="flex flex-col p-4 md:p-8 md:ml-64">
          {/* Header */}
          <h1 className={`text-xl font-bold text-primary mb-1 ${shouldFlicker(flickerKey) ? 'flickering-text' : ''}`}>
            {def.pageTitle}
          </h1>
          <p className="text-xs text-muted-foreground mb-4 font-mono">{def.description}</p>

          {/* Energy balance — show when any slot is automated */}
          {anyAutomated && <WorkerAllocationBar />}

          {/* Shared worker pool indicator — show when any slot is automated */}
          {anyAutomated && (
            <div className={cn("system-panel p-3 mb-4", workerPanelNew && "animate-slot-reveal")}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bot className={`h-4 w-4 text-${def.color}`} />
                  <span className="text-xs font-semibold terminal-text uppercase tracking-wider">Drones on this wing</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-muted-foreground">
                    {wingAssigned} here · {freeWorkers} idle · {totalWorkers}/{maxWorkers} total
                  </span>
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground/60 font-mono mt-1">
                Build and upgrade drones in the Bridge.
              </p>
            </div>
          )}

          {/* Resource chain label — show when at least secondary is visible */}
          {wing.secondaryUnlocked && (
            <div className="flex items-center gap-1.5 text-[10px] font-mono text-muted-foreground mb-2">
              <span className={`text-${def.color}`}>{def.resources.primary.name}</span>
              <span>&rarr;</span>
              <span className={`text-${def.color}/70`}>{def.resources.secondary.name}</span>
              {wing.tertiaryUnlocked && (
                <>
                  <span>&rarr;</span>
                  <span className={`text-${def.color}/50`}>{def.resources.tertiary.name}</span>
                </>
              )}
            </div>
          )}

          {/* Resource slots — each independently click or automated */}
          <div className="flex flex-col gap-3 mb-6">
            {visibleSlots.map(slot => {
              const slotDef = def.resources[slot];
              const isAutomated = wing.automated[slot];
              const isNewSlot = animating.has(`slot-${slot}`);
              const isNewAuto = animating.has(`auto-${slot}`);

              if (isAutomated) {
                // ── Automated slot: worker assignment + upgrades ──
                const cLevel = wing.upgrades[capKey(slot)] as number;
                const eLevel = wing.upgrades[effKey(slot)] as number;

                return (
                  <div key={slot} className={isNewAuto ? 'animate-glow-once rounded' : ''}>
                  <WingResourceRow
                    name={slotDef.name}
                    description={slotDef.description}
                    color={def.color}
                    current={wing.resources[slot]}
                    capacity={wing.stats[`${slot}Capacity` as keyof typeof wing.stats] as number}
                    rate={wing.stats[`${slot}Rate` as keyof typeof wing.stats] as number}
                    workers={wing.workers[slot]}
                    canAssign={hasAvailable}
                    onAssign={() => dispatch({ type: 'ASSIGN_WORKER', payload: { wing: wingId, slot } })}
                    onUnassign={() => dispatch({ type: 'UNASSIGN_WORKER', payload: { wing: wingId, slot } })}
                    consumeLabel={getConsumeLabel(slot)}
                    capLevel={cLevel}
                    capCost={capacityUpgradeCost(cLevel)}
                    capCurrencyName={def.resources.secondary.name}
                    capCurrencyAvailable={wing.resources.secondary}
                    onBuyCap={() => dispatch({ type: 'BUY_CAPACITY_UPGRADE', payload: { wing: wingId, slot } })}
                    effLevel={eLevel}
                    effCost={efficiencyUpgradeCost(eLevel)}
                    effCurrencyName={def.resources.tertiary.name}
                    effCurrencyAvailable={wing.resources.tertiary}
                    onBuyEff={() => dispatch({ type: 'BUY_EFFICIENCY_UPGRADE', payload: { wing: wingId, slot } })}
                    tier={slot}
                  />
                  </div>
                );
              }

              // ── Manual slot: click button + upgrades + optional automation ──
              const capStat = `${slot}Capacity` as keyof typeof wing.stats;
              const cap = wing.stats[capStat] as number;
              const current = wing.resources[slot];
              const pct = cap > 0 ? (current / cap) * 100 : 0;
              const canAutomate = canEnableSlotAutomation(slot);
              const cLevel = wing.upgrades[capKey(slot)] as number;
              const eLevel = wing.upgrades[effKey(slot)] as number;

              // Click cost calculation (mirrors ActionSystem logic)
              let clickCost = 0;
              let clickCostName = '';
              let canAffordClick = true;
              if (slot === 'primary' && wingId !== 'reactor') {
                clickCost = def.energyCostPerPrimaryWorker * (def.clickAmounts[slot] / slotDef.baseRate);
                clickCostName = 'Energy';
                canAffordClick = state.categories.reactor.resources.primary >= clickCost;
              } else if (slot === 'secondary') {
                clickCost = slotDef.consumeRate * (def.clickAmounts[slot] / slotDef.baseRate);
                clickCostName = def.resources.primary.name;
                canAffordClick = wing.resources.primary >= clickCost;
              } else if (slot === 'tertiary') {
                clickCost = slotDef.consumeRate * (def.clickAmounts[slot] / slotDef.baseRate);
                clickCostName = def.resources.secondary.name;
                canAffordClick = wing.resources.secondary >= clickCost;
              }
              const atCap = current >= cap;
              const clickDisabled = atCap || !canAffordClick;

              const costLabel = clickCost > 0
                ? `+${def.clickAmounts[slot]} (costs ${+clickCost.toFixed(1)} ${clickCostName})`
                : `+${def.clickAmounts[slot]} per click`;

              return (
                <div key={slot} className={cn("system-panel p-4", isNewSlot && "animate-slot-reveal")}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={`font-semibold text-sm text-${def.color}`}>{slotDef.name}</span>
                    <span className={`text-xs font-mono text-${def.color}`}>
                      {Math.floor(current)}/{Math.floor(cap)}
                    </span>
                  </div>
                  <Progress value={pct} className="h-1.5 bg-muted mb-3" indicatorClassName={`bg-${def.color}`} />

                  <ResourceClickButton
                    icon={Icon}
                    label={`Generate ${slotDef.name}`}
                    subLabel={costLabel}
                    floatText={`+${def.clickAmounts[slot]}`}
                    chartColor={def.color}
                    onClick={() => dispatch({ type: 'CLICK_RESOURCE', payload: { category: wingId, slot } })}
                    disabled={clickDisabled}
                    shouldFlicker={shouldFlicker(flickerKey)}
                  />

                  {/* Capacity & efficiency upgrades (available even in manual mode) */}
                  {wing.secondaryUnlocked && (
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => dispatch({ type: 'BUY_CAPACITY_UPGRADE', payload: { wing: wingId, slot } })}
                        disabled={wing.resources.secondary < capacityUpgradeCost(cLevel)}
                        className={cn(
                          "flex-1 flex items-center justify-center gap-1 py-1 rounded text-[10px] font-mono transition-colors",
                          wing.resources.secondary >= capacityUpgradeCost(cLevel)
                            ? `bg-${def.color}/10 text-${def.color} hover:bg-${def.color}/20 border border-${def.color}/20`
                            : "bg-muted/10 text-muted-foreground/40 cursor-not-allowed border border-muted/10"
                        )}
                      >
                        <ChevronUp className="h-3 w-3" />
                        Cap Lv.{cLevel}
                        <span className="text-muted-foreground/50">({capacityUpgradeCost(cLevel)} {def.resources.secondary.name})</span>
                      </button>
                      {wing.tertiaryUnlocked && (
                        <button
                          onClick={() => dispatch({ type: 'BUY_EFFICIENCY_UPGRADE', payload: { wing: wingId, slot } })}
                          disabled={wing.resources.tertiary < efficiencyUpgradeCost(eLevel)}
                          className={cn(
                            "flex-1 flex items-center justify-center gap-1 py-1 rounded text-[10px] font-mono transition-colors",
                            wing.resources.tertiary >= efficiencyUpgradeCost(eLevel)
                              ? `bg-${def.color}/10 text-${def.color} hover:bg-${def.color}/20 border border-${def.color}/20`
                              : "bg-muted/10 text-muted-foreground/40 cursor-not-allowed border border-muted/10"
                          )}
                        >
                          <ChevronUp className="h-3 w-3" />
                          Eff Lv.{eLevel}
                          <span className="text-muted-foreground/50">({efficiencyUpgradeCost(eLevel)} {def.resources.tertiary.name})</span>
                        </button>
                      )}
                    </div>
                  )}

                  {canAutomate && (
                    <button
                      onClick={() => dispatch({ type: 'ENABLE_AUTOMATION', payload: { wing: wingId, slot } })}
                      className={`w-full mt-3 system-panel p-3 border-${def.color}/40 hover:bg-${def.color}/10 transition-colors animate-unlock-btn-in`}
                    >
                      <div className="flex items-center justify-center gap-2">
                        <Wrench className={`h-4 w-4 text-${def.color} animate-pulse`} />
                        <span className={`font-mono text-sm font-semibold text-${def.color}`}>
                          Automate {slotDef.name}
                        </span>
                      </div>
                    </button>
                  )}

                  <p className="text-[9px] text-muted-foreground/60 mt-2">{slotDef.description}</p>
                </div>
              );
            })}

            {/* Tier unlock buttons */}
            {canUnlockSecondary && (
              <button
                onClick={() => dispatch({ type: 'UNLOCK_TIER', payload: { wing: wingId, tier: 'secondary' } })}
                className={`system-panel p-4 border-${def.color}/40 hover:bg-${def.color}/10 transition-colors animate-unlock-btn-in`}
              >
                <div className="flex items-center justify-center gap-2">
                  <Package className={`h-5 w-5 text-${def.color} animate-pulse`} />
                  <span className={`font-mono font-semibold text-${def.color}`}>
                    Unlock {def.resources.secondary.name}
                  </span>
                </div>
                <p className="text-[10px] text-muted-foreground text-center mt-1 font-mono">
                  A new resource has been detected
                </p>
              </button>
            )}
            {canUnlockTertiary && (
              <button
                onClick={() => dispatch({ type: 'UNLOCK_TIER', payload: { wing: wingId, tier: 'tertiary' } })}
                className={`system-panel p-4 border-${def.color}/40 hover:bg-${def.color}/10 transition-colors animate-unlock-btn-in`}
              >
                <div className="flex items-center justify-center gap-2">
                  <Cpu className={`h-5 w-5 text-${def.color} animate-pulse`} />
                  <span className={`font-mono font-semibold text-${def.color}`}>
                    Unlock {def.resources.tertiary.name}
                  </span>
                </div>
                <p className="text-[10px] text-muted-foreground text-center mt-1 font-mono">
                  Advanced processing available
                </p>
              </button>
            )}
          </div>

          {/* Extra content (special upgrades, etc.) */}
          {children}
        </div>
      </main>
    </GameLoader>
  );
}
