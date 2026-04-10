"use client";

import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import EnemyMoveList from "@/components/EnemyMoveList";
import { EnemyActionDefinition } from "@/game-engine/types/combat";

interface EnemyStatusPanelProps {
  name: string;
  description: string;
  image: string;
  shield: number;
  maxShield: number;
  health: number;
  maxHealth: number;
  enemyShieldFlash: boolean;
  enemyDamageFlash: boolean;
  actions: EnemyActionDefinition[];
  enemyCooldowns?: Record<string, number>;
  isExposed: boolean;
  onOpenLog: () => void;
}

export default function EnemyStatusPanel({
  name,
  description,
  image,
  shield,
  maxShield,
  health,
  maxHealth,
  enemyShieldFlash,
  enemyDamageFlash,
  actions,
  enemyCooldowns = {},
  isExposed,
  onOpenLog,
}: EnemyStatusPanelProps) {
  return (
    <div className="flex flex-col h-full space-y-6">
      <div className="system-panel p-4 flex flex-col h-60">
        <div className="flex items-center gap-3 mb-2">
          {image && (
            <img
              src={image}
              alt={name}
              className="w-12 h-12 object-contain enemy-sprite"
            />
          )}
          <h2 className="text-lg font-medium">{name}</h2>
        </div>
        <p className="text-sm text-muted-foreground">{description}</p>
        <div className="mt-auto">
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1">
              <span>Shield Strength</span>
              <span>
                {shield}/{maxShield}
              </span>
            </div>
            <Progress
              value={(shield / maxShield) * 100}
              className={cn(
                "h-2 bg-muted",
                enemyShieldFlash && "flash-shield"
              )}
              indicatorClassName="bg-chart-1"
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <span>Hull Integrity</span>
              <span>
                {health}/{maxHealth}
              </span>
            </div>
            <Progress
              value={(health / maxHealth) * 100}
              className={cn(
                "h-2 bg-muted",
                enemyDamageFlash && "flash-damage"
              )}
              indicatorClassName="bg-green-500"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold terminal-text">Enemy Moves</h2>
        {isExposed && (
          <span className="text-xs text-chart-2 font-mono animate-pulse">SYSTEMS HACKED</span>
        )}
      </div>
      <div className="system-panel p-4 flex-grow">
        <EnemyMoveList actions={actions} enemyCooldowns={enemyCooldowns} isExposed={isExposed} />
      </div>

      <button
        onClick={onOpenLog}
        className="system-panel w-full p-3 mt-auto hover:bg-accent/10 transition-colors"
      >
        Open Battle Log
      </button>
    </div>
  );
}
