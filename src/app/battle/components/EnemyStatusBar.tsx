"use client";

import { Skull } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface EnemyStatusBarProps {
  name: string;
  image: string;
  shield: number;
  maxShield: number;
  health: number;
  maxHealth: number;
  enemyShieldFlash: boolean;
  enemyDamageFlash: boolean;
  isExposed: boolean;
  isCloaked?: boolean;
}

export default function EnemyStatusBar({
  name,
  image,
  shield,
  maxShield,
  health,
  maxHealth,
  enemyShieldFlash,
  enemyDamageFlash,
  isExposed,
  isCloaked = false,
}: EnemyStatusBarProps) {
  const [imgError, setImgError] = useState(false);

  return (
    <div className={cn("system-panel p-3", isCloaked && "opacity-40")}>
      <div className="flex items-center gap-3 mb-2">
        {image && !imgError ? (
          <img
            src={image}
            alt={name}
            className="w-10 h-10 object-contain shrink-0"
            style={{ imageRendering: "pixelated" }}
            onError={() => setImgError(true)}
          />
        ) : (
          <Skull className="h-8 w-8 text-red-400 shrink-0" />
        )}
        <div className="flex flex-col">
          <h2 className="text-sm font-semibold">{name}</h2>
          {isCloaked && (
            <span className="text-[10px] text-purple-400 font-mono animate-pulse">CLOAKED</span>
          )}
          {isExposed && !isCloaked && (
            <span className="text-[10px] text-chart-2 font-mono">EXPOSED</span>
          )}
        </div>
      </div>
      <div className="space-y-2">
        {maxShield > 0 && (
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-muted-foreground">Shield</span>
              <span className="font-mono">
                {Math.round(shield)}/{Math.round(maxShield)}
              </span>
            </div>
            <Progress
              value={(shield / maxShield) * 100}
              className={cn("h-2 bg-muted", enemyShieldFlash && "flash-shield")}
              indicatorClassName="bg-chart-1"
            />
          </div>
        )}
        <div>
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-muted-foreground">Hull</span>
            <span className="font-mono">
              {Math.round(health)}/{Math.round(maxHealth)}
            </span>
          </div>
          <Progress
            value={(health / maxHealth) * 100}
            className={cn("h-2 bg-muted", enemyDamageFlash && "flash-damage")}
            indicatorClassName="bg-green-500"
          />
        </div>
      </div>
    </div>
  );
}
