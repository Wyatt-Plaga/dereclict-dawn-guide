"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

/** Ammo type → sprite path */
const AMMO_SPRITES: Record<string, string> = {
  powerCells: "/items/power-cells.png",
  munitions: "/items/munitions.png",
  dataCores: "/items/data-cores.png",
  repairKits: "/items/repair-kits.png",
};

/** Region material → sprite path */
const MATERIAL_SPRITES: Record<string, string> = {
  relics: "/items/relics.png",
  plasmaCores: "/items/plasma-cores.png",
  alloyComposites: "/items/alloy-composites.png",
  exoticData: "/items/exotic-data.png",
  stellarFragments: "/items/stellar-fragments.png",
};

/** Resource type → sprite path (maps base resources to their ammo sprites as visual stand-ins) */
const RESOURCE_SPRITES: Record<string, string> = {
  energy: "/items/power-cells.png",
  scrap: "/items/munitions.png",
  insight: "/items/data-cores.png",
  crew: "/items/repair-kits.png",
  relics: "/items/relics.png",
  plasmaCores: "/items/plasma-cores.png",
  alloyComposites: "/items/alloy-composites.png",
  exoticData: "/items/exotic-data.png",
  stellarFragments: "/items/stellar-fragments.png",
};

export function getItemSprite(id: string): string | undefined {
  return AMMO_SPRITES[id] ?? MATERIAL_SPRITES[id] ?? RESOURCE_SPRITES[id];
}

interface ItemSpriteProps {
  itemId: string;
  size?: number;
  className?: string;
  fallback?: React.ReactNode;
}

export default function ItemSprite({ itemId, size = 16, className, fallback }: ItemSpriteProps) {
  const [error, setError] = useState(false);
  const src = getItemSprite(itemId);

  if (!src || error) {
    return fallback ? <>{fallback}</> : null;
  }

  return (
    <img
      src={src}
      alt={itemId}
      width={size}
      height={size}
      className={cn("object-contain shrink-0", className)}
      style={{ imageRendering: "pixelated" }}
      onError={() => setError(true)}
    />
  );
}
