"use client";

import { useEffect, useRef, useState } from "react";
import { useGame } from "@/game-engine/hooks/useGame";
import { WING_DEFS, WING_ORDER, WingId } from "@/game-engine/content/wingResources";
import { Zap, CpuIcon, Users, Package, LucideIcon } from "lucide-react";

const WING_ICONS: Record<WingId, LucideIcon> = {
  reactor: Zap,
  processor: CpuIcon,
  crewQuarters: Users,
  manufacturing: Package,
};

const DISPLAY_MS = 5000;

export default function WingUnlockCelebration() {
  const { state } = useGame();
  const [unlocking, setUnlocking] = useState<WingId | null>(null);
  const prevUnlockedRef = useRef<Record<WingId, boolean> | null>(null);

  useEffect(() => {
    if (!state) return;
    const cur = WING_ORDER.reduce<Record<WingId, boolean>>((acc, id) => {
      acc[id] = state.categories[id]?.unlocked ?? false;
      return acc;
    }, {} as Record<WingId, boolean>);
    const prev = prevUnlockedRef.current;
    prevUnlockedRef.current = cur;
    if (!prev) return;
    const newlyUnlocked = WING_ORDER.find(id => cur[id] && !prev[id] && id !== "reactor");
    if (newlyUnlocked) setUnlocking(newlyUnlocked);
  }, [state]);

  useEffect(() => {
    if (!unlocking) return;
    const t = setTimeout(() => setUnlocking(null), DISPLAY_MS);
    return () => clearTimeout(t);
  }, [unlocking]);

  if (!unlocking) return null;
  const def = WING_DEFS[unlocking];
  const Icon = WING_ICONS[unlocking];

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center cursor-pointer"
      onClick={() => setUnlocking(null)}
    >
      <div className="absolute inset-0 bg-black/70 animate-wing-unlock-fade" />

      <div
        className={`absolute inset-4 sm:inset-8 border-[6px] border-${def.color} rounded-xl animate-wing-unlock-trace`}
        style={{ boxShadow: `0 0 80px hsl(var(--${def.color})), inset 0 0 60px hsl(var(--${def.color}) / 0.4)` }}
      />

      <div
        className={`relative z-10 px-12 py-10 system-panel border-2 border-${def.color} flex flex-col items-center gap-4 animate-wing-unlock-card`}
        style={{ boxShadow: `0 0 60px hsl(var(--${def.color}) / 0.6)` }}
      >
        <Icon className={`h-20 w-20 text-${def.color} animate-wing-unlock-pulse`} />
        <span className={`text-xs font-mono tracking-[0.4em] text-${def.color}/70`}>
          SHIP SYSTEMS RESTORED
        </span>
        <span className={`text-4xl font-bold font-mono uppercase tracking-widest text-${def.color}`}>
          {def.name}
        </span>
        <span className="text-[10px] font-mono text-muted-foreground tracking-widest">
          {def.pageTitle.toUpperCase()} — ONLINE
        </span>
        <span className="text-[10px] font-mono text-muted-foreground/60 mt-2">
          Click anywhere to dismiss
        </span>
      </div>
    </div>
  );
}
