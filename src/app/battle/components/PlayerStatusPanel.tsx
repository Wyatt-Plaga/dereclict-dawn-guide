"use client";

import { Ship, Radiation } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface PlayerStatusPanelProps {
  shipShield: number;
  maxShipShield: number;
  shipHealth: number;
  maxShipHealth: number;
  shieldsUnlocked: boolean;
  shipShieldFlash: boolean;
  shipDamageFlash: boolean;
  radiationStacks?: number;
}

export default function PlayerStatusPanel({
  shipShield,
  maxShipShield,
  shipHealth,
  maxShipHealth,
  shieldsUnlocked,
  shipShieldFlash,
  shipDamageFlash,
  radiationStacks = 0,
}: PlayerStatusPanelProps) {
  const [imgError, setImgError] = useState(false);

  return (
    <div className="system-panel p-3">
      <div className="flex items-center gap-3 mb-2">
        {!imgError ? (
          <img
            src="/dawn-ship.png"
            alt="UES Dawn"
            className="w-10 h-10 object-contain shrink-0"
            style={{ imageRendering: "pixelated" }}
            onError={() => setImgError(true)}
          />
        ) : (
          <Ship className="h-8 w-8 text-primary shrink-0" />
        )}
        <div>
          <h2 className="text-sm font-semibold">The Dawn</h2>
          {radiationStacks > 0 && (
            <div className="flex items-center gap-1 text-[10px] font-mono text-yellow-400">
              <Radiation className="h-3 w-3" />
              {radiationStacks} stacks ({radiationStacks * 3} dmg/turn)
            </div>
          )}
        </div>
      </div>
      <div className="space-y-2">
        {shieldsUnlocked ? (
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-muted-foreground">Shield</span>
              <span className="font-mono">
                {Math.round(shipShield)}/{Math.round(maxShipShield)}
              </span>
            </div>
            <Progress
              value={(shipShield / maxShipShield) * 100}
              className={cn("h-2 bg-muted", shipShieldFlash && "flash-shield")}
              indicatorClassName="bg-chart-1"
            />
          </div>
        ) : (
          <div className="flex items-center justify-center h-6 text-muted-foreground/30 text-xs font-mono border border-dashed border-muted-foreground/20 rounded">
            SHIELDS OFFLINE
          </div>
        )}
        <div>
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-muted-foreground">Hull</span>
            <span className="font-mono">
              {Math.round(shipHealth)}/{Math.round(maxShipHealth)}
            </span>
          </div>
          <Progress
            value={(shipHealth / maxShipHealth) * 100}
            className={cn("h-2 bg-muted", shipDamageFlash && "flash-damage")}
            indicatorClassName="bg-green-500"
          />
        </div>
      </div>
    </div>
  );
}
