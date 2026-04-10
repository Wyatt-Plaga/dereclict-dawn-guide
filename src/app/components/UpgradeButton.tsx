"use client";

import { LucideIcon } from "lucide-react";

interface UpgradeButtonProps {
  icon: LucideIcon;
  name: string;
  description: string;
  cost: number;
  costLabel: string;
  level: number;
  currentResource: number;
  chartColor: string;
  onClick: () => void;
}

export default function UpgradeButton({
  icon: Icon,
  name,
  description,
  cost,
  costLabel,
  level,
  currentResource,
  chartColor,
  onClick,
}: UpgradeButtonProps) {
  const affordable = currentResource >= cost;

  return (
    <button
      className={`w-full system-panel p-3 text-left transition-all relative overflow-hidden group ${
        affordable
          ? `hover:bg-${chartColor}/10 hover:border-${chartColor}/50 shadow-[0_0_15px_rgba(0,0,0,0.3)] hover:shadow-[0_0_20px_rgba(var(--${chartColor}),0.2)]`
          : "opacity-50 cursor-not-allowed grayscale"
      }`}
      disabled={!affordable}
      onClick={onClick}
    >
      <div
        className={`absolute inset-0 bg-gradient-to-r from-${chartColor}/5 to-transparent opacity-0 transition-opacity duration-300 ${
          affordable ? "group-hover:opacity-100" : ""
        }`}
      />

      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center">
          <Icon
            className={`h-4 w-4 mr-2 ${
              affordable ? `text-${chartColor}` : "text-muted-foreground"
            }`}
          />
          <span
            className={`text-sm font-semibold ${
              affordable ? "text-foreground" : "text-muted-foreground"
            }`}
          >
            {name}
          </span>
          <span className="text-[10px] font-mono text-primary/60 ml-2">Lv.{level}</span>
        </div>
        <span
          className={`font-mono text-xs px-2 py-0.5 rounded ${
            affordable
              ? `bg-${chartColor}/20 text-${chartColor}`
              : "bg-muted/20 text-muted-foreground"
          }`}
        >
          {cost} {costLabel}
        </span>
      </div>
      <p className="text-[10px] text-muted-foreground relative z-10 mt-1">
        {description}
      </p>
    </button>
  );
}
