"use client";

import { RegionType } from "@/game-engine/types/regions";

interface RegionNodeProps {
  cx: number;
  cy: number;
  r: number;
  regionId: RegionType;
  label: string;
  progress: number;       // 0-1 fill amount
  isCompleted: boolean;
  isActive: boolean;
  isLocked: boolean;
  onClick?: () => void;
  tier?: number;
}

/** Distinct color per region — vibrant and thematic */
function getNodeColor(regionId: RegionType): string {
  switch (regionId) {
    case "void":      return "#94a3b8"; // slate
    case "nebula":    return "#c084fc"; // purple
    case "asteroid":  return "#fbbf24"; // amber
    case "deepspace": return "#34d399"; // emerald
    case "blackhole": return "#f87171"; // red
    default:          return "#94a3b8";
  }
}

export default function RegionNode({
  cx, cy, r,
  regionId,
  label,
  progress,
  isCompleted,
  isActive,
  isLocked,
  onClick,
  tier,
}: RegionNodeProps) {
  const color = getNodeColor(regionId);
  const clampedProgress = Math.max(0, Math.min(1, progress));
  const fillR = r - 2;

  // Fill rises from bottom of circle
  const fillHeight = fillR * 2 * clampedProgress;
  const fillY = cy + fillR - fillHeight;

  const nodeId = `node-${regionId}-${tier ?? 0}`;

  return (
    <g
      className={`transition-all duration-300 ${
        isLocked ? "opacity-30" : onClick ? "cursor-pointer" : ""
      }`}
      onClick={isLocked ? undefined : onClick}
    >
      {/* Defs for this node */}
      <defs>
        <clipPath id={`clip-${nodeId}`}>
          <circle cx={cx} cy={cy} r={fillR} />
        </clipPath>
        <radialGradient id={`glow-${nodeId}`}>
          <stop offset="0%" stopColor={color} stopOpacity={0.3} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </radialGradient>
      </defs>

      {/* Outer glow for active node */}
      {isActive && !isLocked && (
        <circle
          cx={cx} cy={cy} r={r + 8}
          fill={`url(#glow-${nodeId})`}
          className="animate-pulse"
        />
      )}

      {/* Active ring */}
      {isActive && !isLocked && (
        <circle
          cx={cx} cy={cy} r={r + 4}
          fill="none"
          stroke={color}
          strokeWidth={1.5}
          opacity={0.5}
          strokeDasharray="4 3"
          className="animate-[spin_12s_linear_infinite]"
          style={{ transformOrigin: `${cx}px ${cy}px` }}
        />
      )}

      {/* Background circle */}
      <circle
        cx={cx} cy={cy} r={r}
        fill="hsl(var(--background))"
        stroke={isLocked ? "hsl(var(--muted-foreground))" : color}
        strokeWidth={isCompleted ? 3 : 2}
      />

      {/* Progress fill */}
      {clampedProgress > 0 && (
        <rect
          x={cx - fillR}
          y={fillY}
          width={fillR * 2}
          height={fillHeight}
          fill={color}
          opacity={isCompleted ? 0.5 : 0.3}
          clipPath={`url(#clip-${nodeId})`}
        />
      )}

      {/* Center icon */}
      {isCompleted ? (
        <text
          x={cx} y={cy + 1}
          textAnchor="middle"
          dominantBaseline="central"
          fill={color}
          fontSize={r * 0.7}
          fontWeight="bold"
        >
          ★
        </text>
      ) : isLocked ? (
        <text
          x={cx} y={cy + 2}
          textAnchor="middle"
          dominantBaseline="central"
          fill="hsl(var(--muted-foreground))"
          fontSize={r * 0.55}
        >
          ✦
        </text>
      ) : clampedProgress > 0 ? (
        <text
          x={cx} y={cy + 1}
          textAnchor="middle"
          dominantBaseline="central"
          fill="hsl(var(--foreground))"
          fontSize={r * 0.45}
          fontFamily="monospace"
          fontWeight="bold"
        >
          {Math.round(clampedProgress * 100)}%
        </text>
      ) : null}

      {/* Label below */}
      <text
        x={cx}
        y={cy + r + 15}
        textAnchor="middle"
        fill={isLocked ? "hsl(var(--muted-foreground))" : color}
        fontSize={11}
        fontFamily="monospace"
        fontWeight={isActive ? "bold" : "normal"}
        opacity={isLocked ? 0.4 : 0.9}
      >
        {label}
      </text>

      {/* Tier badge */}
      {tier !== undefined && tier > 1 && !isLocked && (
        <text
          x={cx}
          y={cy + r + 27}
          textAnchor="middle"
          fill="hsl(var(--muted-foreground))"
          fontSize={9}
          fontFamily="monospace"
        >
          Tier {tier}
        </text>
      )}
    </g>
  );
}
