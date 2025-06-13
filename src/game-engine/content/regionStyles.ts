import { RegionType } from "../types/combat";
import { LucideIcon, Circle, Zap, Cpu, Users, Package } from "lucide-react";

export interface RegionStyle {
  icon: LucideIcon;
  colorClass: string;
  bgClass: string;
  barClass: string;
}

export const REGION_TYPE_STYLES: Record<RegionType, RegionStyle> = {
  [RegionType.VOID]: {
    icon: Circle,
    colorClass: "text-black dark:text-white",
    bgClass: "bg-black/20 dark:bg-gray-700/20",
    barClass: "bg-black dark:bg-gray-300",
  },
  [RegionType.NEBULA]: {
    icon: Zap,
    colorClass: "text-chart-1",
    bgClass: "bg-chart-1/20",
    barClass: "bg-chart-1",
  },
  [RegionType.SUPERNOVA]: {
    icon: Cpu,
    colorClass: "text-chart-2",
    bgClass: "bg-chart-2/20",
    barClass: "bg-chart-2",
  },
  [RegionType.RADIATION_ZONE]: {
    icon: Users,
    colorClass: "text-chart-3",
    bgClass: "bg-chart-3/20",
    barClass: "bg-chart-3",
  },
  [RegionType.ASTEROID_FIELD]: {
    icon: Package,
    colorClass: "text-chart-4",
    bgClass: "bg-chart-4/20",
    barClass: "bg-chart-4",
  },
}; 