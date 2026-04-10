"use client";

import { Award, Skull, Flag } from "lucide-react";
import ItemSprite from "@/components/ui/ItemSprite";

interface Rewards {
  energy: number;
  insight: number;
  crew: number;
  scrap: number;
  relics?: number;
}

interface PostBattleScreenProps {
  outcome: "victory" | "defeat" | "retreat" | null;
  rewards?: Rewards;
  onExit: () => void;
}

const OUTCOME_CONFIG = {
  victory: {
    title: "VICTORY",
    icon: Award,
    color: "text-blue-400",
    bg: "bg-blue-950/20",
    border: "border-blue-500/50",
    message:
      "The hostile vessel has been neutralized. Salvage operations complete.",
  },
  defeat: {
    title: "CRITICAL FAILURE",
    icon: Skull,
    color: "text-destructive",
    bg: "bg-destructive/10",
    border: "border-destructive/30",
    message:
      "The Dawn has sustained catastrophic damage. Emergency protocols active.",
  },
  retreat: {
    title: "TACTICAL RETREAT",
    icon: Flag,
    color: "text-chart-4",
    bg: "bg-chart-4/10",
    border: "border-chart-4/30",
    message: "Combat disengaged. Jump drive spooled for emergency exit.",
  },
} as const;

const REWARD_ITEMS: {
  key: keyof Rewards;
  spriteId: string;
  label: string;
  color: string;
  chartClass: string;
}[] = [
  { key: "energy", spriteId: "energy", label: "Energy", color: "chart-1", chartClass: "text-chart-1" },
  { key: "insight", spriteId: "insight", label: "Insight", color: "chart-2", chartClass: "text-chart-2" },
  { key: "scrap", spriteId: "scrap", label: "Scrap", color: "chart-4", chartClass: "text-chart-4" },
  { key: "relics", spriteId: "relics", label: "Relics", color: "chart-5", chartClass: "text-chart-5" },
];

export default function PostBattleScreen({
  outcome,
  rewards,
  onExit,
}: PostBattleScreenProps) {
  const config = OUTCOME_CONFIG[outcome || "retreat"];

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div
        className={`system-panel p-8 max-w-2xl w-full text-center border-2 ${config.border} ${config.bg}`}
      >
        <div className="flex justify-center mb-6">
          <config.icon
            className={`h-24 w-24 ${config.color} animate-pulse`}
          />
        </div>

        <h1
          className={`text-4xl font-bold mb-4 ${config.color} terminal-text tracking-widest`}
        >
          {config.title}
        </h1>

        <p className="text-lg text-muted-foreground mb-8 max-w-md mx-auto">
          {config.message}
        </p>

        {outcome === "victory" && rewards && (
          <div className="mb-8 bg-blue-950/30 p-6 rounded border border-blue-500/30 shadow-[0_0_30px_rgba(0,100,255,0.1)]">
            <h3 className="text-sm font-mono text-blue-400 uppercase mb-4 tracking-widest text-center">
              Salvage Manifest
            </h3>
            <div className="flex justify-center gap-4 flex-wrap">
              {REWARD_ITEMS.map(({ key, spriteId, label, color, chartClass }) => {
                const amount = rewards[key] ?? 0;
                if (amount <= 0) return null;
                return (
                  <div
                    key={key}
                    className={`flex flex-col items-center p-3 bg-${color}/10 rounded border border-${color}/20 min-w-[80px]`}
                  >
                    <ItemSprite itemId={spriteId} size={28} />
                    <span className={`text-lg font-bold ${chartClass}`}>
                      +{amount}
                    </span>
                    <span className="text-[10px] text-muted-foreground uppercase">
                      {label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <button
          onClick={onExit}
          className="system-panel px-8 py-3 hover:bg-accent/10 transition-colors text-lg font-mono uppercase tracking-wider w-full sm:w-auto"
        >
          Return to Bridge
        </button>
      </div>
    </main>
  );
}
