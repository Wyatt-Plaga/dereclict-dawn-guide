"use client";

import { Minus, Plus, ChevronUp, Gauge, Users, Power } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface WingResourceRowProps {
  name: string;
  description: string;
  color: string;             // chart color class (e.g., 'chart-1')
  current: number;
  capacity: number;
  rate: number;              // net production rate per second
  workers: number;
  maxWorkers: number;        // per-slot worker cap
  canAssign: boolean;        // whether there's a free worker to assign
  onAssign: () => void;
  onUnassign: () => void;
  consumeLabel?: string;     // e.g., "1.5 Energy/s per worker"
  // Upgrade info — pass undefined for onBuyX to hide the button
  capLevel: number;
  capCost: number;
  capCurrencyName: string;
  capCurrencyAvailable: number;
  onBuyCap?: () => void;
  effLevel: number;
  effCost: number;
  effCurrencyName: string;
  effCurrencyAvailable: number;
  onBuyEff?: () => void;
  maxWorkersLevel?: number;
  maxWorkersCost?: number;
  maxWorkersCurrencyName?: string;
  maxWorkersCurrencyAvailable?: number;
  onBuyMaxWorkers?: () => void;
  tier: 'primary' | 'secondary' | 'tertiary' | 'quaternary';
  onDisableAutomation?: () => void;
}

export default function WingResourceRow({
  name, description, color, current, capacity, rate, workers, maxWorkers,
  canAssign, onAssign, onUnassign,
  consumeLabel,
  capLevel, capCost, capCurrencyName, capCurrencyAvailable, onBuyCap,
  effLevel, effCost, effCurrencyName, effCurrencyAvailable, onBuyEff,
  maxWorkersLevel, maxWorkersCost, maxWorkersCurrencyName, maxWorkersCurrencyAvailable, onBuyMaxWorkers,
  tier,
  onDisableAutomation,
}: WingResourceRowProps) {
  const showCap = onBuyCap !== undefined;
  const showEff = onBuyEff !== undefined;
  const showMaxWorkers = onBuyMaxWorkers !== undefined && maxWorkersCost !== undefined;
  const canBuyCap = showCap && capCurrencyAvailable >= capCost;
  const canBuyEff = showEff && effCurrencyAvailable >= effCost;
  const canBuyMaxWorkers = showMaxWorkers && (maxWorkersCurrencyAvailable ?? 0) >= (maxWorkersCost ?? 0);
  const anyUpgrade = showCap || showEff || showMaxWorkers;
  const upgradeColCount = [showCap, showEff, showMaxWorkers].filter(Boolean).length;
  const slotFull = workers >= maxWorkers;
  const plusDisabled = !canAssign || slotFull;
  const pct = capacity > 0 ? (current / capacity) * 100 : 0;

  return (
    <div className={cn(
      "system-panel p-4",
      tier === 'secondary' && "border-l-2 border-l-primary/20",
      tier === 'tertiary' && "border-l-2 border-l-primary/10",
      tier === 'quaternary' && "border-l-2 border-l-primary/5",
    )}>
      {/* Header: name + resource bar */}
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2">
          <span className={`font-semibold text-sm text-${color}`}>{name}</span>
          {tier === 'secondary' && (
            <span className="text-[9px] font-mono text-muted-foreground/60 uppercase">capacity upgrades</span>
          )}
          {tier === 'tertiary' && (
            <span className="text-[9px] font-mono text-muted-foreground/60 uppercase">efficiency upgrades</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-mono text-${color}`}>
            {Math.floor(current)}/{Math.floor(capacity)}
          </span>
          {onDisableAutomation && (
            <button
              onClick={onDisableAutomation}
              title="Disable automation"
              className={`h-6 w-6 flex items-center justify-center rounded transition-colors bg-${color}/10 text-${color}/70 hover:bg-red-500/20 hover:text-red-400`}
            >
              <Power className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Worker controls + progress bar */}
      <div className="flex items-center gap-2 mb-2">
        <button
          onClick={onAssign}
          disabled={plusDisabled}
          className={cn(
            "h-7 w-7 flex items-center justify-center rounded transition-colors shrink-0",
            !plusDisabled
              ? `bg-${color}/10 text-${color} hover:bg-${color}/20`
              : "bg-muted/10 text-muted-foreground/30 cursor-not-allowed"
          )}
        >
          <Plus className="h-4 w-4" />
        </button>
        <button
          onClick={onUnassign}
          disabled={workers <= 0}
          className={cn(
            "h-7 w-7 flex items-center justify-center rounded transition-colors shrink-0",
            workers > 0
              ? "bg-muted/10 text-muted-foreground/60 hover:bg-muted/20"
              : "bg-muted/5 text-muted-foreground/20 cursor-not-allowed"
          )}
        >
          <Minus className="h-4 w-4" />
        </button>
        <span className="text-xs font-mono w-10 text-center font-semibold shrink-0">{workers}/{maxWorkers}</span>
        <Progress
          value={pct}
          className="h-1.5 bg-muted flex-1"
          indicatorClassName={`bg-${color}`}
        />
      </div>

      {/* Rate display */}
      <div className="flex items-center justify-between mb-3">
        <div className="text-[10px] text-muted-foreground font-mono">
          {rate > 0 ? (
            <span className={`text-${color}`}>+{rate.toFixed(2)}/s</span>
          ) : rate < 0 ? (
            <span className="text-red-400">{rate.toFixed(2)}/s</span>
          ) : workers > 0 ? (
            <span className="text-amber-400">stalled (no input)</span>
          ) : (
            <span>idle</span>
          )}
          {consumeLabel && <span className="text-muted-foreground/60 ml-2">({consumeLabel})</span>}
        </div>
      </div>

      {/* Upgrade buttons row (only when research unlocks them) */}
      {anyUpgrade && (
        <div className={cn(
          "grid gap-2",
          upgradeColCount === 1 && "grid-cols-1",
          upgradeColCount === 2 && "grid-cols-2",
          upgradeColCount === 3 && "grid-cols-3",
        )}>
          {showCap && (
            <button
              onClick={onBuyCap}
              disabled={!canBuyCap}
              className={cn(
                "flex items-center gap-1.5 p-2 rounded text-left transition-colors",
                canBuyCap
                  ? "bg-primary/5 hover:bg-primary/10 border border-primary/10"
                  : "bg-muted/5 border border-muted/10 opacity-50 cursor-not-allowed"
              )}
            >
              <ChevronUp className="h-3.5 w-3.5 text-primary shrink-0" />
              <div className="min-w-0">
                <div className="text-[10px] font-mono text-primary">Max Cap Lv.{capLevel}</div>
                <div className="text-[9px] text-muted-foreground truncate">{capCost} {capCurrencyName}</div>
              </div>
            </button>
          )}

          {showEff && (
            <button
              onClick={onBuyEff}
              disabled={!canBuyEff}
              className={cn(
                "flex items-center gap-1.5 p-2 rounded text-left transition-colors",
                canBuyEff
                  ? "bg-primary/5 hover:bg-primary/10 border border-primary/10"
                  : "bg-muted/5 border border-muted/10 opacity-50 cursor-not-allowed"
              )}
            >
              <Gauge className="h-3.5 w-3.5 text-primary shrink-0" />
              <div className="min-w-0">
                <div className="text-[10px] font-mono text-primary">Efficiency Lv.{effLevel}</div>
                <div className="text-[9px] text-muted-foreground truncate">{effCost} {effCurrencyName}</div>
              </div>
            </button>
          )}

          {showMaxWorkers && (
            <button
              onClick={onBuyMaxWorkers}
              disabled={!canBuyMaxWorkers}
              className={cn(
                "flex items-center gap-1.5 p-2 rounded text-left transition-colors",
                canBuyMaxWorkers
                  ? "bg-primary/5 hover:bg-primary/10 border border-primary/10"
                  : "bg-muted/5 border border-muted/10 opacity-50 cursor-not-allowed"
              )}
            >
              <Users className="h-3.5 w-3.5 text-primary shrink-0" />
              <div className="min-w-0">
                <div className="text-[10px] font-mono text-primary">Max Crew Lv.{maxWorkersLevel}</div>
                <div className="text-[9px] text-muted-foreground truncate">{maxWorkersCost} {maxWorkersCurrencyName}</div>
              </div>
            </button>
          )}
        </div>
      )}

      {/* Description */}
      <p className="text-[9px] text-muted-foreground/60 mt-2">{description}</p>
    </div>
  );
}
