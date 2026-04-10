"use client";

import { Zap, Brain, Users, Package, AwardIcon, Gem, Crosshair } from "lucide-react";
import { ResourceReward } from "@/game-engine/types";
import { AMMO_TYPES } from "@/game-engine/content/ammoTypes";

const RESOURCE_CONFIG: Record<
  string,
  { icon: typeof Zap; bgClass: string; textClass: string; label: string }
> = {
  energy:  { icon: Zap, bgClass: "bg-chart-1/10", textClass: "text-chart-1", label: "Energy" },
  insight: { icon: Brain, bgClass: "bg-chart-2/10", textClass: "text-chart-2", label: "Insight" },
  crew:    { icon: Users, bgClass: "bg-chart-3/10", textClass: "text-chart-3", label: "Crew" },
  scrap:   { icon: Package, bgClass: "bg-chart-4/10", textClass: "text-chart-4", label: "Scrap" },
  relics:  { icon: Gem, bgClass: "bg-chart-5/10", textClass: "text-chart-5", label: "Relics" },
  ammo:    { icon: Crosshair, bgClass: "bg-primary/10", textClass: "text-primary", label: "Ammo" },
};

export default function ResourceRewardList({
  rewards,
}: {
  rewards: ResourceReward[];
}) {
  return (
    <div className="grid grid-cols-1 gap-4">
      {rewards.map((reward, index) => {
        const isAmmo = reward.type === 'ammo' && reward.ammoType;
        const ammoDef = isAmmo ? AMMO_TYPES[reward.ammoType as keyof typeof AMMO_TYPES] : null;
        const config = RESOURCE_CONFIG[reward.type] ?? RESOURCE_CONFIG.energy;
        const Icon = config.icon;
        const displayName = isAmmo && ammoDef ? ammoDef.name : config.label;

        return (
          <div key={index} className="flex flex-col gap-3">
            <div className="flex items-center gap-3 p-3 system-panel hover:bg-accent/10 transition-colors">
              <div className={`p-2 rounded-full ${config.bgClass}`}>
                <Icon className={`h-5 w-5 ${config.textClass}`} />
              </div>
              <div>
                <div className={`text-lg font-medium ${config.textClass}`}>
                  {displayName}
                </div>
                <div className="text-muted-foreground">
                  {reward.amount > 0 ? `+${reward.amount}` : reward.amount}
                </div>
              </div>
            </div>
            {reward.message && (
              <p className="text-sm italic pl-3">{reward.message}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
