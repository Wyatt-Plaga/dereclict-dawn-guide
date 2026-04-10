"use client";

import { LucideIcon } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface ResourceProgressBarProps {
  icon: LucideIcon;
  label: string;
  current: number;
  max: number;
  rate?: number;
  chartColor: string;
}

export default function ResourceProgressBar({
  icon: Icon,
  label,
  current,
  max,
  rate,
  chartColor,
}: ResourceProgressBarProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          <Icon className={`h-5 w-5 text-${chartColor} mr-2`} />
          <span className="terminal-text">{label}</span>
        </div>
        <span className="font-mono">
          {Math.floor(current)} / {Math.floor(max)}
        </span>
      </div>
      <Progress
        value={(current / max) * 100}
        className="h-2 bg-muted"
        indicatorClassName={`bg-${chartColor}`}
      />
      {rate !== undefined && rate > 0 && (
        <div className="text-xs text-muted-foreground mt-1">
          <span>+{rate % 1 === 0 ? rate : rate.toFixed(1)} per second</span>
        </div>
      )}
    </div>
  );
}
