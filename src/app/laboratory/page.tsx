"use client";

import { FlaskConical, ChevronUp, Lock, Check } from "lucide-react";
import { NavBar } from "@/components/ui/navbar";
import GameLoader from "@/app/components/GameLoader";
import { useGame } from "@/game-engine/hooks/useGame";
import { useSystemStatus } from "@/components/providers/system-status-provider";
import { RESEARCH_DEFS, canResearch } from "@/game-engine/content/research";
import { cn } from "@/lib/utils";
import { getResourceAccessor } from "@/game-engine/utils/resourceAccessor";

export default function LaboratoryPage() {
  const { state, dispatch } = useGame();
  const { shouldFlicker } = useSystemStatus();
  const lab = state.laboratory;

  /* ────────────────── Research tree ────────────────── */

  const renderResearchTree = () => (
    <section className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <FlaskConical className="h-4 w-4 text-primary" />
        <h2 className="text-sm font-semibold terminal-text uppercase tracking-wider">Research</h2>
      </div>
      <div className="flex flex-col gap-2">
        {RESEARCH_DEFS.map((r) => {
          const completed = lab.researched.includes(r.id);
          const available = canResearch(r.id, lab.researched);
          const accessor = getResourceAccessor(state, r.costResource);
          const currentAmount = accessor ? accessor.obj[accessor.key] as number : 0;
          const canAfford = currentAmount >= r.costAmount;
          const canBuy = available && canAfford;

          return (
            <button
              key={r.id}
              onClick={() => canBuy && dispatch({ type: 'PURCHASE_RESEARCH', payload: { researchId: r.id } })}
              disabled={!canBuy}
              className={cn(
                "system-panel p-4 text-left transition-colors",
                completed
                  ? "border-primary/30 bg-primary/5"
                  : canBuy
                    ? "hover:bg-primary/10 border-primary/20 cursor-pointer"
                    : "opacity-50 cursor-not-allowed border-muted/10"
              )}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {completed ? (
                    <Check className="h-4 w-4 text-primary" />
                  ) : available ? (
                    <FlaskConical className="h-4 w-4 text-primary" />
                  ) : (
                    <Lock className="h-4 w-4 text-muted-foreground/40" />
                  )}
                  <span className={cn("font-mono text-sm", completed ? "text-primary" : "text-foreground")}>
                    {r.name}
                  </span>
                </div>
                {!completed && (
                  <span className={cn(
                    "font-mono text-xs",
                    canAfford ? "text-primary" : "text-muted-foreground/60"
                  )}>
                    {r.costAmount} {r.costResource.charAt(0).toUpperCase() + r.costResource.slice(1)}
                  </span>
                )}
                {completed && (
                  <span className="text-[10px] text-primary/70 font-mono">RESEARCHED</span>
                )}
              </div>
              <p className="text-[10px] text-muted-foreground mt-1 ml-6">{r.description}</p>
            </button>
          );
        })}
      </div>
    </section>
  );

  /* ────────────────── Relic enhancements ────────────────── */

  const renderRelicEnhancements = () => {
    const reactor = state.categories.reactor;
    const relics = state.relics;
    const shieldingPurchased = reactor.specialUpgrades.shielding === 1;
    const shieldCost = 50;

    // Only show if player has relics or already bought shielding
    if (relics <= 0 && !shieldingPurchased) return null;

    return (
      <section className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <ChevronUp className="h-4 w-4 text-chart-5" />
          <h2 className="text-sm font-semibold terminal-text uppercase tracking-wider">Relic Enhancements</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={() => !shieldingPurchased && dispatch({ type: 'PURCHASE_UPGRADE', payload: { category: 'reactor', upgradeType: 'shielding' } })}
            disabled={shieldingPurchased || relics < shieldCost}
            className={cn(
              "system-panel p-4 text-left transition-colors",
              shieldingPurchased
                ? "border-primary/30 bg-primary/5"
                : relics >= shieldCost
                  ? "hover:bg-chart-5/10 border-chart-5/20 cursor-pointer"
                  : "opacity-50 cursor-not-allowed border-muted/10"
            )}
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-sm">Shielding</span>
              {shieldingPurchased
                ? <span className="text-[10px] text-primary font-mono">INSTALLED</span>
                : <span className="font-mono text-xs text-chart-5">{shieldCost} Relics</span>
              }
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">
              {shieldingPurchased ? 'Shields active — 50 shield points' : 'Enable 50-point shields for combat'}
            </p>
          </button>
        </div>
      </section>
    );
  };

  /* ────────────────── Page layout ────────────────── */

  return (
    <GameLoader>
      <main className="min-h-screen">
        <NavBar />
        <div className="flex flex-col p-4 md:p-8 md:ml-64">
          <h1 className={`text-xl font-bold text-primary mb-1 ${shouldFlicker('laboratory') ? 'flickering-text' : ''}`}>
            Laboratory
          </h1>
          <p className="text-xs text-muted-foreground mb-6 font-mono">
            Research new capabilities and upgrade ship systems.
          </p>

          {/* Research tree */}
          {renderResearchTree()}

          {/* Relic enhancements */}
          {renderRelicEnhancements()}
        </div>
      </main>
    </GameLoader>
  );
}
