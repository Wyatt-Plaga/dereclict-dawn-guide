"use client";

import { Zap, Wrench } from "lucide-react";
import { useGame } from "@/game-engine/hooks/useGame";
import { WING_DEFS, WingId } from "@/game-engine/content/wingResources";
import { WingCategory } from "@/game-engine/types/resources";
import { ResourceSystem } from "@/game-engine/systems/ResourceSystem";

export default function WorkerAllocationBar() {
  const { state } = useGame();

  // Energy balance
  const rs = new ResourceSystem();
  const energyProd = rs.getEnergyProduction(state);
  const energyConsume = rs.getEnergyConsumption(state);
  const netEnergy = energyProd - energyConsume;

  // Current wing worker info
  const wingId = undefined; // rendered per-wing inside WingPage now
  // This bar now only shows global energy balance

  return (
    <div className="system-panel p-3 mb-4">
      {/* Energy balance */}
      <div className="flex items-center gap-2 text-xs font-mono">
        <Zap className="h-3 w-3 text-chart-1" />
        <span className="text-muted-foreground">Energy:</span>
        <span className="text-chart-1">+{energyProd.toFixed(1)}/s</span>
        {energyConsume > 0 && (
          <span className="text-red-400">-{energyConsume.toFixed(1)}/s</span>
        )}
        <span className={`font-semibold ${netEnergy >= 0 ? 'text-chart-1' : 'text-red-400'}`}>
          NET {netEnergy >= 0 ? '+' : ''}{netEnergy.toFixed(1)}/s
        </span>
      </div>
    </div>
  );
}
