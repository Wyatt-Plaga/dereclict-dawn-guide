"use client";

import { useEffect, useRef, useState } from "react";
import { Skull, ShieldAlert, Crosshair, Heart, Zap as Bolt } from "lucide-react";
import { ENEMY_DEFINITIONS } from "@/game-engine/content/enemies";
import { EnemyType } from "@/game-engine/types/combat";
import { cn } from "@/lib/utils";

interface BattleIntroScreenProps {
  enemyId: string;
  regionId: string;
  onEngage: () => void;
  onRetreat: () => void;
}

const REGION_INTRO_FLAVOR: Record<string, { headline: string; subline: string }> = {
  void: {
    headline: "Contact in the Void",
    subline: "Long-range scans isolated a hostile silhouette against the dark.",
  },
  nebula: {
    headline: "Ambush in the Nebula",
    subline: "The plasma clouds parted — and something was waiting inside.",
  },
  asteroid: {
    headline: "Mining Claim Disputed",
    subline: "A hostile beacon flared from behind a tumbling asteroid.",
  },
  deepspace: {
    headline: "Hunter in Deep Space",
    subline: "An accelerating signature is closing on the Dawn.",
  },
  blackhole: {
    headline: "Guardian of the Singularity",
    subline: "Something here doesn't want you any closer to the event horizon.",
  },
};

const REGION_ACCENT: Record<string, { ring: string; text: string; glow: string; chip: string }> = {
  void: {
    ring: "border-slate-400/50",
    text: "text-slate-200",
    glow: "shadow-[0_0_60px_-10px_rgba(148,163,184,0.55)]",
    chip: "bg-slate-500/20 text-slate-200 border-slate-400/40",
  },
  nebula: {
    ring: "border-purple-400/60",
    text: "text-purple-200",
    glow: "shadow-[0_0_70px_-10px_rgba(168,85,247,0.6)]",
    chip: "bg-purple-500/20 text-purple-200 border-purple-400/40",
  },
  asteroid: {
    ring: "border-amber-400/60",
    text: "text-amber-200",
    glow: "shadow-[0_0_70px_-10px_rgba(251,191,36,0.6)]",
    chip: "bg-amber-500/20 text-amber-200 border-amber-400/40",
  },
  deepspace: {
    ring: "border-emerald-400/60",
    text: "text-emerald-200",
    glow: "shadow-[0_0_70px_-10px_rgba(52,211,153,0.55)]",
    chip: "bg-emerald-500/20 text-emerald-200 border-emerald-400/40",
  },
  blackhole: {
    ring: "border-red-500/60",
    text: "text-red-200",
    glow: "shadow-[0_0_80px_-10px_rgba(239,68,68,0.7)]",
    chip: "bg-red-500/20 text-red-200 border-red-500/40",
  },
};

const ENEMY_TYPE_LABEL: Record<string, string> = {
  [EnemyType.DRONE]: "Autonomous Drone",
  [EnemyType.FIGHTER]: "Fighter",
  [EnemyType.CRUISER]: "Cruiser",
  [EnemyType.BATTLESHIP]: "Battleship",
  [EnemyType.ALIEN]: "Unknown Alien",
  [EnemyType.VESSEL]: "Hostile Vessel",
  [EnemyType.ANOMALY]: "Spatial Anomaly",
  [EnemyType.SWARM]: "Swarm",
  [EnemyType.STATION]: "Defensive Station",
};

export default function BattleIntroScreen({ enemyId, regionId, onEngage, onRetreat }: BattleIntroScreenProps) {
  const enemyDef = ENEMY_DEFINITIONS[enemyId];
  const accent = REGION_ACCENT[regionId] ?? REGION_ACCENT.void;
  const flavor = REGION_INTRO_FLAVOR[regionId] ?? REGION_INTRO_FLAVOR.void;

  const [imgError, setImgError] = useState(false);
  const [phase, setPhase] = useState<"locking" | "ready">("locking");
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Quick scan animation, then enable the engage button.
  useEffect(() => {
    const t = window.setTimeout(() => setPhase("ready"), 650);
    return () => window.clearTimeout(t);
  }, []);

  // Allow Enter/Space to engage once ready.
  useEffect(() => {
    if (phase !== "ready") return;
    buttonRef.current?.focus();
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onEngage();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [phase, onEngage]);

  if (!enemyDef) {
    // Defensive: if the enemy id isn't in our table, just engage immediately.
    return (
      <div className="fixed inset-0 z-50 bg-background flex items-center justify-center">
        <button
          onClick={onEngage}
          className="system-panel py-3 px-6 font-mono"
        >
          Engage
        </button>
      </div>
    );
  }

  const typeLabel = ENEMY_TYPE_LABEL[enemyDef.type] ?? "Hostile Contact";
  const isBoss = (enemyDef.difficultyTier ?? 1) > 1 || /king|queen|prime|titan/i.test(enemyDef.id);

  return (
    <div className="fixed inset-0 z-50 bg-background overflow-hidden">
      {/* Region backdrop layers */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(255,255,255,0.05),transparent_60%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,0)_0%,rgba(0,0,0,0.4)_60%,rgba(0,0,0,0.85)_100%)]" />
        <div className="absolute inset-0 opacity-[0.06] mix-blend-screen pointer-events-none"
             style={{ backgroundImage: "repeating-linear-gradient(0deg, rgba(255,255,255,0.6) 0px, rgba(255,255,255,0.6) 1px, transparent 1px, transparent 3px)" }} />
        <div
          aria-hidden
          className="absolute inset-0 opacity-20 blur-sm"
          style={{
            backgroundImage: `url(/regions/${regionId}.png)`,
            backgroundSize: "auto 170%",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        />
      </div>

      {/* Content */}
      <div className="relative h-full flex flex-col items-center justify-center px-4">
        {/* Top banner */}
        <div className="text-center mb-8 animate-fade-in-down">
          <div className="text-[11px] tracking-[0.4em] font-mono text-red-400/90 uppercase mb-2 flex items-center justify-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span>Threat Detected</span>
            <span className="inline-block w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          </div>
          <h1 className={cn("text-3xl md:text-4xl font-bold tracking-wide", accent.text)}>
            {flavor.headline}
          </h1>
          <p className="text-sm text-muted-foreground mt-1 italic max-w-xl mx-auto">{flavor.subline}</p>
        </div>

        {/* Enemy card */}
        <div className={cn(
          "relative w-full max-w-3xl rounded-lg border-2 bg-black/50 backdrop-blur-sm",
          accent.ring,
          accent.glow
        )}>
          {/* Corner brackets */}
          <CornerBrackets className={accent.text} />

          <div className="grid md:grid-cols-[260px_1fr] gap-6 p-6 md:p-8">
            {/* Sprite + scan ring */}
            <div className="relative flex items-center justify-center">
              <div className={cn(
                "absolute inset-0 rounded-full",
                phase === "locking" && "animate-ping",
                "bg-current opacity-[0.04]",
                accent.text
              )} />
              <div className={cn(
                "relative aspect-square w-48 md:w-56 rounded-md overflow-hidden flex items-center justify-center",
                "border", accent.ring,
                "bg-[radial-gradient(circle,rgba(255,255,255,0.08),transparent_70%)]"
              )}>
                {enemyDef.image && !imgError ? (
                  <img
                    src={enemyDef.image}
                    alt={enemyDef.name}
                    className="w-full h-full object-contain p-3"
                    style={{ imageRendering: "pixelated" }}
                    onError={() => setImgError(true)}
                  />
                ) : (
                  <Skull className="h-24 w-24 text-red-400" />
                )}
                {/* Scan line */}
                <div
                  className={cn(
                    "absolute inset-x-0 h-[2px] bg-current",
                    accent.text,
                    phase === "locking" ? "opacity-80" : "opacity-0",
                    "transition-opacity duration-300"
                  )}
                  style={{
                    animation: phase === "locking" ? "battle-scan 1.2s linear infinite" : undefined,
                    boxShadow: "0 0 10px currentColor",
                  }}
                />
              </div>

            </div>

            {/* Details */}
            <div className="flex flex-col">
              <div className="flex items-baseline justify-between flex-wrap gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <h2 className={cn("text-2xl md:text-3xl font-bold", accent.text)}>{enemyDef.name}</h2>
                  {isBoss && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono tracking-widest bg-red-500/90 text-black border border-red-300 shadow-lg">
                      BOSS
                    </span>
                  )}
                </div>
                <span className={cn("text-[10px] font-mono tracking-widest border px-2 py-0.5 rounded uppercase", accent.chip)}>
                  {typeLabel}
                </span>
              </div>
              <p className="text-sm md:text-base text-muted-foreground leading-relaxed mb-5">
                {enemyDef.description}
              </p>

              {/* Threat readouts */}
              <div className="grid grid-cols-3 gap-2 mb-5">
                <ThreatStat icon={Heart} label="Hull" value={enemyDef.maxHealth} tone="text-emerald-300" />
                <ThreatStat icon={ShieldAlert} label="Shield" value={enemyDef.maxShield || 0} tone="text-cyan-300" />
                <ThreatStat
                  icon={Crosshair}
                  label="Armor"
                  value={enemyDef.armor ? `${enemyDef.armor}` : "—"}
                  tone="text-amber-300"
                />
              </div>

              {/* Engage / Retreat */}
              <div className="flex flex-col sm:flex-row gap-2 mt-auto">
                <button
                  ref={buttonRef}
                  onClick={onEngage}
                  disabled={phase !== "ready"}
                  className={cn(
                    "flex-1 system-panel py-3 px-4 font-mono tracking-wider transition-all flex items-center justify-center gap-2",
                    phase === "ready"
                      ? cn("border-2", accent.ring, accent.text, "hover:bg-white/5")
                      : "opacity-60 cursor-not-allowed"
                  )}
                >
                  <Bolt className="h-4 w-4" />
                  {phase === "ready" ? "ENGAGE" : "Targeting…"}
                </button>
                <button
                  onClick={onRetreat}
                  className="sm:w-40 system-panel py-3 px-4 font-mono text-red-400 border-red-500/30 hover:bg-red-500/10 hover:border-red-500/60 transition-colors"
                >
                  Stand down
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer hint */}
        <div className="mt-6 text-[10px] font-mono text-muted-foreground tracking-widest uppercase">
          Press <kbd className="px-1 border border-muted-foreground/40 rounded">Enter</kbd> to engage
        </div>
      </div>

      <style jsx>{`
        @keyframes battle-scan {
          0%   { top: 0%;   }
          100% { top: 100%; }
        }
        .animate-fade-in-down {
          animation: fade-in-down 0.5s ease-out both;
        }
        @keyframes fade-in-down {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
      `}</style>
    </div>
  );
}

function ThreatStat({ icon: Icon, label, value, tone }: {
  icon: typeof Heart;
  label: string;
  value: string | number;
  tone: string;
}) {
  return (
    <div className="rounded border border-muted/30 bg-black/30 px-2 py-1.5">
      <div className={cn("flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider", tone)}>
        <Icon className="h-3 w-3" />
        {label}
      </div>
      <div className="font-mono text-base text-foreground">{value}</div>
    </div>
  );
}

function CornerBrackets({ className }: { className: string }) {
  const base = "absolute w-4 h-4 border-current pointer-events-none";
  return (
    <>
      <div className={cn(base, className, "top-1 left-1 border-t-2 border-l-2")} />
      <div className={cn(base, className, "top-1 right-1 border-t-2 border-r-2")} />
      <div className={cn(base, className, "bottom-1 left-1 border-b-2 border-l-2")} />
      <div className={cn(base, className, "bottom-1 right-1 border-b-2 border-r-2")} />
    </>
  );
}
