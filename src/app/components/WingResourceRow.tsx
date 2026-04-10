"use client";

import { Minus, Plus, ChevronUp, Gauge } from "lucide-react";
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
  canAssign: boolean;        // whether there's a free worker to assign
  onAssign: () => void;
  onUnassign: () => void;
  // Consumption info
  consumeLabel?: string;     // e.g., "1.5 Energy/s per worker"
  // Upgrade info
  capLevel: number;
  capCost: number;
  capCurrencyName: string;
  capCurrencyAvailable: number;
  onBuyCap: () => void;
  effLevel: number;
  effCost: number;
  effCurrencyName: string;
  effCurrencyAvailable: number;
  onBuyEff: () => void;
  // Slot tier for visual styling
  tier: 'primary' | 'secondary' | 'tertiary';
}

export default function WingResourceRow({
  name, description, color, current, capacity, rate, workers,
  canAssign, onAssign, onUnassign,
  consumeLabel,
  capLevel, capCost, capCurrencyName, capCurrencyAvailable, onBuyCap,
  effLevel, effCost, effCurrencyName, effCurrencyAvailable, onBuyEff,
  tier,
}: WingResourceRowProps) {
  const canBuyCap = capCurrencyAvailable >= capCost;
  const canBuyEff = effCurrencyAvailable >= effCost;
  const pct = capacity > 0 ? (current / capacity) * 100 : 0;

  return (
    <div className={cn(
      "system-panel p-4",
      tier === 'secondary' && "border-l-2 border-l-primary/20",
      tier === 'tertiary' && "border-l-2 border-l-primary/10",
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
        <span className={`text-xs font-mono text-${color}`}>
          {Math.floor(current)}/{Math.floor(capacity)}
        </span>
      </div>

      {/* Progress bar */}
      <Progress
        value={pct}
        className="h-1.5 bg-muted mb-2"
        indicatorClassName={`bg-${color}`}
      />

      {/* Rate display */}
      <div className="flex items-center justify-between mb-3">
        <div className="text-[10px] text-muted-foreground font-mono">
          {rate > 0 ? (
            <span className={`text-${color}`}>+{rate.toFixed(1)}/s</span>
          ) : rate < 0 ? (
            <span className="text-red-400">{rate.toFixed(1)}/s</span>
          ) : workers > 0 ? (
            <span className="text-amber-400">stalled (no input)</span>
          ) : (
            <span>idle</span>
          )}
          {consumeLabel && <span className="text-muted-foreground/60 ml-2">({consumeLabel})</span>}
        </div>
      </div>

      {/* Worker assignment */}
      <div className="flex items-center gap-3 mb-3">
        <span className="text-xs text-muted-foreground">Workers:</span>
        <div className="flex items-center gap-1">
          <button
            onClick={onUnassign}
            disabled={workers <= 0}
            className={cn(
              "h-6 w-6 flex items-center justify-center rounded transition-colors",
              workers > 0
                ? "bg-red-500/10 text-red-400 hover:bg-red-500/20"
                : "bg-muted/10 text-muted-foreground/30 cursor-not-allowed"
            )}
          >
            <Minus className="h-3 w-3" />
          </button>
          <span className="text-sm font-mono w-6 text-center font-semibold">{workers}</span>
          <button
            onClick={onAssign}
            disabled={!canAssign}
            className={cn(
              "h-6 w-6 flex items-center justify-center rounded transition-colors",
              canAssign
                ? `bg-${color}/10 text-${color} hover:bg-${color}/20`
                : "bg-muted/10 text-muted-foreground/30 cursor-not-allowed"
            )}
          >
            <Plus className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* Upgrade buttons row */}
      <div className="grid grid-cols-2 gap-2">
        {/* Capacity upgrade */}
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

        {/* Efficiency upgrade */}
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
      </div>

      {/* Description */}
      <p className="text-[9px] text-muted-foreground/60 mt-2">{description}</p>
    </div>
  );
}
