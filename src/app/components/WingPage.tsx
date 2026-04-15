"use client";

import { useRef, useEffect, useState } from "react";
import { NavBar } from "@/components/ui/navbar";
import { useSystemStatus } from "@/components/providers/system-status-provider";
import { useGame } from "@/game-engine/hooks/useGame";
import GameLoader from "@/app/components/GameLoader";
import WorkerAllocationBar from "@/app/components/WorkerAllocationBar";
import WingResourceRow from "@/app/components/WingResourceRow";
import ResourceClickButton from "@/app/components/ResourceClickButton";
import { WING_DEFS, SLOT_ORDER, SLOT_CONSUMES, WingId, ResourceSlot, capacityUpgradeCost, efficiencyUpgradeCost, maxWorkersUpgradeCost } from "@/game-engine/content/wingResources";
import { ResourceSystem } from "@/game-engine/systems/ResourceSystem";
import { WingCategory, capKey, effKey, maxWorkersKey } from "@/game-engine/types/resources";
import { LucideIcon, ChevronUp, Wrench, Cpu, Package } from "lucide-react";
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
  const prevState = useRef({
    secondary: wing.secondaryUnlocked,
    tertiary: wing.tertiaryUnlocked,
    quaternary: wing.quaternaryUnlocked,
    automated: { ...wing.automated },
  });

  useEffect(() => {
    const prev = prevState.current;
    const newAnims = new Set<string>();

    if (wing.secondaryUnlocked && !prev.secondary) newAnims.add('slot-secondary');
    if (wing.tertiaryUnlocked && !prev.tertiary) newAnims.add('slot-tertiary');
    if (wing.quaternaryUnlocked && !prev.quaternary) newAnims.add('slot-quaternary');
    if (wing.automated.primary && !prev.automated.primary) newAnims.add('auto-primary');
    if (wing.automated.secondary && !prev.automated.secondary) newAnims.add('auto-secondary');
    if (wing.automated.tertiary && !prev.automated.tertiary) newAnims.add('auto-tertiary');
    if (wing.automated.quaternary && !prev.automated.quaternary) newAnims.add('auto-quaternary');

    prevState.current = {
      secondary: wing.secondaryUnlocked,
      tertiary: wing.tertiaryUnlocked,
      quaternary: wing.quaternaryUnlocked,
      automated: { ...wing.automated },
    };

    if (newAnims.size > 0) {
      setAnimating(newAnims);
      const timer = setTimeout(() => setAnimating(new Set()), 1200);
      return () => clearTimeout(timer);
    }
  }, [wing.secondaryUnlocked, wing.tertiaryUnlocked, wing.quaternaryUnlocked, wing.automated.primary, wing.automated.secondary, wing.automated.tertiary, wing.automated.quaternary]);

  // Workers are drawn from a single global pool
  const globalAssigned = (['reactor', 'processor', 'crewQuarters', 'manufacturing'] as WingId[])
    .reduce((sum, id) => {
      const w = state.categories[id] as WingCategory;
      return sum + w.workers.primary + w.workers.secondary + w.workers.tertiary + w.workers.quaternary;
    }, 0) + (state.bridge?.fuelWorkers ?? 0);
  const totalWorkers = state.workers?.total ?? 0;
  const freeWorkers = totalWorkers - globalAssigned;
  const hasAvailable = freeWorkers > 0 && wing.unlocked && state.laboratory.workerHiring;

  const anyAutomated = wing.automated.primary || wing.automated.secondary || wing.automated.tertiary || wing.automated.quaternary;

  // Which slots are visible (tier unlocked)
  const visibleSlots: ResourceSlot[] = ['primary'];
  if (wing.secondaryUnlocked) visibleSlots.push('secondary');
  if (wing.tertiaryUnlocked) visibleSlots.push('tertiary');
  if (wing.quaternaryUnlocked) visibleSlots.push('quaternary');

  // Check if next tier can be unlocked
  const canUnlockSecondary = ResourceSystem.canUnlockTier(wing, wingId, 'secondary');
  const canUnlockTertiary = ResourceSystem.canUnlockTier(wing, wingId, 'tertiary');
  const canUnlockQuaternary = ResourceSystem.canUnlockTier(wing, wingId, 'quaternary');

  // Check if a slot can have automation enabled right now. Automation is
  // unlocked in one gate by the Workforce Systems research — after that any
  // visible slot on the wing can be automated freely.
  const canEnableSlotAutomation = (slot: ResourceSlot): boolean => {
    if (wing.automated[slot]) return false;
    if (!state.laboratory.workerHiring) return false;
    if (slot === 'secondary' && !wing.secondaryUnlocked) return false;
    if (slot === 'tertiary' && !wing.tertiaryUnlocked) return false;
    if (slot === 'quaternary' && !wing.quaternaryUnlocked) return false;
    return true;
  };

  const getConsumeLabel = (slot: ResourceSlot): string | undefined => {
    const slotDef = def.resources[slot];
    if (slot === 'primary' && wingId !== 'reactor') {
      return `${def.energyCostPerPrimaryWorker} Energy/s per worker`;
    }
    const inputSlot = SLOT_CONSUMES[slot];
    if (inputSlot) {
      return `${slotDef.consumeRate} ${def.resources[inputSlot].name}/s per worker`;
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

          {/* Resource chain label */}
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
              {wing.quaternaryUnlocked && (
                <>
                  <span>&rarr;</span>
                  <span className={`text-${def.color}/40`}>{def.resources.quaternary.name}</span>
                </>
              )}
            </div>
          )}

          {/* Resource slots */}
          <div className="flex flex-col gap-3 mb-6">
            {visibleSlots.map(slot => {
              const slotDef = def.resources[slot];
              const isNewSlot = animating.has(`slot-${slot}`);
              const isNewAuto = animating.has(`auto-${slot}`);
              const isAutomated = wing.automated[slot];

              if (isAutomated) {
                // ── Automated slot: worker assignment + upgrades (gated by Lab research) ──
                const cLevel = wing.upgrades[capKey(slot)] as number;
                const eLevel = wing.upgrades[effKey(slot)] as number;
                const mLevel = wing.upgrades[maxWorkersKey(slot)] as number;
                const slotMax = ResourceSystem.getMaxWorkersForSlot(wing, slot);

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
                      maxWorkers={slotMax}
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
                      {...(state.laboratory.efficiencyUpgrades && wing.tertiaryUnlocked ? {
                        onBuyEff: () => dispatch({ type: 'BUY_EFFICIENCY_UPGRADE', payload: { wing: wingId, slot } }),
                      } : {})}
                      {...(state.laboratory.maxWorkersUpgrades && wing.quaternaryUnlocked ? {
                        maxWorkersLevel: mLevel,
                        maxWorkersCost: maxWorkersUpgradeCost(mLevel),
                        maxWorkersCurrencyName: def.resources.quaternary.name,
                        maxWorkersCurrencyAvailable: wing.resources.quaternary,
                        onBuyMaxWorkers: () => dispatch({ type: 'BUY_MAX_WORKERS_UPGRADE', payload: { wing: wingId, slot } }),
                      } : {})}
                      tier={slot}
                      onDisableAutomation={() => dispatch({ type: 'DISABLE_AUTOMATION', payload: { wing: wingId, slot } })}
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
              const mLevel = wing.upgrades[maxWorkersKey(slot)] as number;

              // Non-primary clicks consume the prior-tier resource (mirrors the
              // worker-second cost in ResourceSystem). Disable the click button
              // when the player can't afford it so no animation plays.
              const atCap = current >= cap;
              const clickInputSlot = SLOT_CONSUMES[slot];
              const clickInputCost = clickInputSlot
                ? slotDef.consumeRate * (def.clickAmounts[slot] / slotDef.baseRate)
                : 0;
              const cannotAfford = clickInputSlot !== undefined
                && wing.resources[clickInputSlot] < clickInputCost;
              const clickDisabled = atCap || cannotAfford;
              const costLabel = clickInputSlot
                ? `-${clickInputCost} ${def.resources[clickInputSlot].name}`
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

                  {/* Capacity (auto) / efficiency / max-workers upgrades */}
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
                      {state.laboratory.efficiencyUpgrades && wing.tertiaryUnlocked && (
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
                      {state.laboratory.maxWorkersUpgrades && wing.quaternaryUnlocked && (
                        <button
                          onClick={() => dispatch({ type: 'BUY_MAX_WORKERS_UPGRADE', payload: { wing: wingId, slot } })}
                          disabled={wing.resources.quaternary < maxWorkersUpgradeCost(mLevel)}
                          className={cn(
                            "flex-1 flex items-center justify-center gap-1 py-1 rounded text-[10px] font-mono transition-colors",
                            wing.resources.quaternary >= maxWorkersUpgradeCost(mLevel)
                              ? `bg-${def.color}/10 text-${def.color} hover:bg-${def.color}/20 border border-${def.color}/20`
                              : "bg-muted/10 text-muted-foreground/40 cursor-not-allowed border border-muted/10"
                          )}
                        >
                          <ChevronUp className="h-3 w-3" />
                          Crew Lv.{mLevel}
                          <span className="text-muted-foreground/50">({maxWorkersUpgradeCost(mLevel)} {def.resources.quaternary.name})</span>
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
            {canUnlockQuaternary && (
              <button
                onClick={() => dispatch({ type: 'UNLOCK_TIER', payload: { wing: wingId, tier: 'quaternary' } })}
                className={`system-panel p-4 border-${def.color}/40 hover:bg-${def.color}/10 transition-colors animate-unlock-btn-in`}
              >
                <div className="flex items-center justify-center gap-2">
                  <Cpu className={`h-5 w-5 text-${def.color} animate-pulse`} />
                  <span className={`font-mono font-semibold text-${def.color}`}>
                    Unlock {def.resources.quaternary.name}
                  </span>
                </div>
                <p className="text-[10px] text-muted-foreground text-center mt-1 font-mono">
                  Specialist tier available
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
