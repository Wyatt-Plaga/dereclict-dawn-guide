"use client";

import { RegionType } from "@/game-engine/types/regions";
import RegionNode from "./RegionNode";

interface RegionProgress {
  encounters: number;
  maxEncounters: number;
  completed: boolean;
}

interface RegionTreeProps {
  voidProgress: RegionProgress;
  regionProgress: Record<string, RegionProgress>;
  currentRegion: RegionType;
  currentTier: number;
  onSelectRegion: (regionId: RegionType, tier?: number) => void;
  /** Which base regions are navigable (based on wing unlocks) */
  unlockedRegions: Set<string>;
}

const NODE_R = 28;
const SVG_W = 600;

// Layout: void at bottom, tiers ascend upward
const VOID_X = SVG_W / 2;
const VOID_Y = 420;

const BRANCH_Y = 280;
const BRANCH_SPACING = 130;
const BRANCH_START = (SVG_W - BRANCH_SPACING * 3) / 2;
const TIER2_Y = 160;
const TIER3_Y = 55;

const BRANCHES: { id: RegionType; label: string }[] = [
  { id: RegionType.NEBULA, label: "Nebula" },
  { id: RegionType.ASTEROID_FIELD, label: "Asteroid Belt" },
  { id: RegionType.RADIATION_ZONE, label: "Gamma Sector" },
  { id: RegionType.SUPERNOVA, label: "Stellar Graveyard" },
];

/** Region colors matching RegionNode */
function getRegionColor(regionId: RegionType): string {
  switch (regionId) {
    case "void":      return "#94a3b8";
    case "nebula":    return "#c084fc";
    case "asteroid":  return "#fbbf24";
    case "deepspace": return "#34d399";
    case "blackhole": return "#f87171";
    default:          return "#94a3b8";
  }
}

/** Curved connection path from one point to another */
function ConnectionPath({
  x1, y1, x2, y2,
  active = false,
  locked = false,
  color,
}: {
  x1: number; y1: number; x2: number; y2: number;
  active?: boolean;
  locked?: boolean;
  color?: string;
}) {
  const midY = (y1 + y2) / 2;
  const isCurved = x1 !== x2;
  const d = isCurved
    ? `M ${x1} ${y1} C ${x1} ${midY}, ${x2} ${midY}, ${x2} ${y2}`
    : `M ${x1} ${y1} L ${x2} ${y2}`;
  const strokeColor = color ?? (active ? "hsl(var(--primary))" : "hsl(var(--border))");

  return (
    <path
      d={d}
      fill="none"
      stroke={strokeColor}
      strokeWidth={active ? 2 : 1.5}
      strokeDasharray={locked ? "4 4" : "none"}
      opacity={locked ? 0.2 : active ? 0.7 : 0.3}
    />
  );
}

export default function RegionTree({
  voidProgress,
  regionProgress,
  currentRegion,
  currentTier,
  onSelectRegion,
  unlockedRegions,
}: RegionTreeProps) {
  const voidCompleted = voidProgress.completed;
  const voidFill = voidProgress.encounters / voidProgress.maxEncounters;

  const branchPositions = BRANCHES.map((_, i) => ({
    x: BRANCH_START + i * BRANCH_SPACING,
  }));

  // Progressive tier visibility (only count unlocked regions)
  const anyT1Completed = BRANCHES.some(b => unlockedRegions.has(b.id) && regionProgress[b.id]?.completed);
  const showT2 = anyT1Completed;
  // T3 only visible when any T2 boss is beaten
  const anyT2Completed = BRANCHES.some(b => unlockedRegions.has(b.id) && regionProgress[`${b.id}-t2`]?.completed);
  const showT3 = anyT2Completed;

  // Dynamic viewBox — grows upward as tiers unlock
  const bottomY = VOID_Y + NODE_R + 25;
  let topY = VOID_Y - NODE_R - 10;

  if (voidCompleted) {
    topY = BRANCH_Y - NODE_R - 15;
  }
  if (showT2) {
    topY = TIER2_Y - NODE_R - 15;
  }
  if (showT3) {
    topY = TIER3_Y - NODE_R - 15;
  }

  const viewH = bottomY - topY;
  const minHeight = Math.max(120, viewH * 0.7);

  return (
    <svg
      viewBox={`0 ${topY} ${SVG_W} ${viewH}`}
      className="w-full max-w-[700px] mx-auto"
      style={{ minHeight }}
    >
      {/* ---- VOID (always visible) ---- */}
      <RegionNode
        cx={VOID_X} cy={VOID_Y} r={NODE_R}
        regionId={RegionType.VOID}
        label="The Void"
        progress={voidFill}
        isCompleted={voidCompleted}
        isActive={currentRegion === "void"}
        isLocked={false}
        onClick={() => onSelectRegion(RegionType.VOID, 1)}
      />

      {/* ---- TIER 1 BRANCHES (after void completed) ---- */}
      {voidCompleted && (
        <>
          {/* Void → branch curved lines (only for unlocked regions) */}
          {BRANCHES.map((branch, i) => {
            const regionAvailable = unlockedRegions.has(branch.id);
            if (!regionAvailable) return null;
            return (
              <ConnectionPath
                key={`void-branch-${i}`}
                x1={VOID_X} y1={VOID_Y - NODE_R}
                x2={branchPositions[i].x} y2={BRANCH_Y + NODE_R}
                active
                color={getRegionColor(branch.id)}
              />
            );
          })}

          {/* T1 nodes (only for unlocked regions) */}
          {BRANCHES.map((branch, i) => {
            const regionAvailable = unlockedRegions.has(branch.id);
            if (!regionAvailable) return null;

            const prog = regionProgress[branch.id] ?? { encounters: 0, maxEncounters: 6, completed: false };
            const fill = prog.encounters / prog.maxEncounters;

            // T2 progress (keyed as "nebula-t2" etc.)
            const t2Key = `${branch.id}-t2`;
            const t2Prog = regionProgress[t2Key] ?? { encounters: 0, maxEncounters: 6, completed: false };
            const t2Fill = t2Prog.encounters / t2Prog.maxEncounters;
            const t2Unlocked = prog.completed;

            // T3 progress
            const t3Key = `${branch.id}-t3`;
            const t3Prog = regionProgress[t3Key] ?? { encounters: 0, maxEncounters: 6, completed: false };
            const t3Fill = t3Prog.encounters / t3Prog.maxEncounters;
            const t3Unlocked = t2Prog.completed;

            const isActiveT1 = currentRegion === branch.id && currentTier === 1;
            const isActiveT2 = currentRegion === branch.id && currentTier === 2;
            const isActiveT3 = currentRegion === branch.id && currentTier === 3;

            return (
              <g key={branch.id}>
                {/* T1 → T2 line */}
                {showT2 && (
                  <ConnectionPath
                    x1={branchPositions[i].x} y1={BRANCH_Y - NODE_R}
                    x2={branchPositions[i].x} y2={TIER2_Y + NODE_R}
                    active={t2Unlocked}
                    locked={!t2Unlocked}
                    color={t2Unlocked ? getRegionColor(branch.id) : undefined}
                  />
                )}

                {/* T2 → T3 line */}
                {showT3 && (
                  <ConnectionPath
                    x1={branchPositions[i].x} y1={TIER2_Y - NODE_R}
                    x2={branchPositions[i].x} y2={TIER3_Y + NODE_R}
                    active={t3Unlocked}
                    locked={!t3Unlocked}
                    color={t3Unlocked ? getRegionColor(branch.id) : undefined}
                  />
                )}

                {/* Tier 1 node */}
                <RegionNode
                  cx={branchPositions[i].x}
                  cy={BRANCH_Y}
                  r={NODE_R}
                  regionId={branch.id}
                  label={branch.label}
                  progress={fill}
                  isCompleted={prog.completed}
                  isActive={isActiveT1}
                  isLocked={false}
                  tier={1}
                  onClick={() => onSelectRegion(branch.id, 1)}
                />

                {/* Tier 2 node */}
                {showT2 && (
                  <RegionNode
                    cx={branchPositions[i].x}
                    cy={TIER2_Y}
                    r={NODE_R}
                    regionId={branch.id}
                    label={`${branch.label} II`}
                    progress={t2Fill}
                    isCompleted={t2Prog.completed}
                    isActive={isActiveT2}
                    isLocked={!t2Unlocked}
                    tier={2}
                    onClick={t2Unlocked ? () => onSelectRegion(branch.id, 2) : undefined}
                  />
                )}

                {/* Tier 3 node — only visible when any T2 is completed */}
                {showT3 && (
                  <RegionNode
                    cx={branchPositions[i].x}
                    cy={TIER3_Y}
                    r={NODE_R}
                    regionId={branch.id}
                    label={`${branch.label} III`}
                    progress={t3Fill}
                    isCompleted={t3Prog.completed}
                    isActive={isActiveT3}
                    isLocked={!t3Unlocked}
                    tier={3}
                    onClick={t3Unlocked ? () => onSelectRegion(branch.id, 3) : undefined}
                  />
                )}
              </g>
            );
          })}
        </>
      )}
    </svg>
  );
}
