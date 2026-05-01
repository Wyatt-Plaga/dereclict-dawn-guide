"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { LucideIcon } from "lucide-react";
import { useDevMode } from "@/components/providers/dev-mode-provider";
import { cn } from "@/lib/utils";

interface FloatIndicator {
  id: number;
  x: number;
  y: number;
}

interface RippleInstance {
  id: number;
  x: number;
  y: number;
}

interface ResourceClickButtonProps {
  icon: LucideIcon;
  label: string;
  subLabel: string;
  /** When true, the subLabel renders in destructive red to flag a blocking
   *  reason (e.g. insufficient input resource). */
  subLabelAlert?: boolean;
  floatText: string;
  chartColor: string;
  onClick: () => void;
  disabled?: boolean;
  shouldFlicker?: boolean;
  className?: string;
  /** Milliseconds the player must hold to earn one resource. */
  holdDurationMs?: number;
}

let nextId = 0;

const DEFAULT_HOLD_MS = 3_000;
const DEV_HOLD_MS = 500;

export default function ResourceClickButton({
  icon: Icon,
  label,
  subLabel,
  subLabelAlert = false,
  floatText,
  chartColor,
  onClick,
  disabled = false,
  shouldFlicker = false,
  className = "mb-8",
  holdDurationMs,
}: ResourceClickButtonProps) {
  const { devMode } = useDevMode();
  const effectiveHoldMs = holdDurationMs ?? (devMode ? DEV_HOLD_MS : DEFAULT_HOLD_MS);
  const [floats, setFloats] = useState<FloatIndicator[]>([]);
  const [ripples, setRipples] = useState<RippleInstance[]>([]);
  const [progress, setProgress] = useState(0);
  const [holding, setHolding] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const rafRef = useRef<number | null>(null);
  const startedAtRef = useRef<number>(0);
  const accumulatedRef = useRef<number>(0);
  const lastPointerRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const onClickRef = useRef(onClick);
  const disabledRef = useRef(disabled);
  const holdMsRef = useRef(effectiveHoldMs);
  useEffect(() => { onClickRef.current = onClick; }, [onClick]);
  useEffect(() => { disabledRef.current = disabled; }, [disabled]);
  useEffect(() => { holdMsRef.current = effectiveHoldMs; }, [effectiveHoldMs]);

  const spawnFeedback = useCallback((x: number, y: number) => {
    const floatId = nextId++;
    const rippleId = nextId++;
    setFloats((prev) => [...prev, { id: floatId, x, y }]);
    setRipples((prev) => [...prev, { id: rippleId, x, y }]);
    setTimeout(() => setFloats((prev) => prev.filter((f) => f.id !== floatId)), 600);
    setTimeout(() => setRipples((prev) => prev.filter((r) => r.id !== rippleId)), 400);
  }, []);

  const stopHold = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (startedAtRef.current > 0) {
      accumulatedRef.current += performance.now() - startedAtRef.current;
      startedAtRef.current = 0;
    }
    setHolding(false);
    setProgress(Math.min(1, accumulatedRef.current / holdMsRef.current));
  }, []);

  const startHold = useCallback(() => {
    if (disabledRef.current) return;
    if (rafRef.current !== null) return;
    setHolding(true);
    startedAtRef.current = performance.now();
    setProgress(accumulatedRef.current / holdMsRef.current);

    const tick = () => {
      if (disabledRef.current) {
        stopHold();
        return;
      }
      const elapsed = accumulatedRef.current + (performance.now() - startedAtRef.current);
      if (elapsed >= holdMsRef.current) {
        accumulatedRef.current = 0;
        startedAtRef.current = performance.now();
        setProgress(0);
        onClickRef.current();
        const { x, y } = lastPointerRef.current;
        spawnFeedback(x, y);
      } else {
        setProgress(elapsed / holdMsRef.current);
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  }, [spawnFeedback, stopHold]);

  useEffect(() => () => {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
  }, []);

  const updatePointerFromEvent = useCallback((e: React.PointerEvent<HTMLButtonElement>) => {
    const rect = buttonRef.current?.getBoundingClientRect();
    lastPointerRef.current = {
      x: rect ? e.clientX - rect.left : 0,
      y: rect ? e.clientY - rect.top : 0,
    };
  }, []);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLButtonElement>) => {
      if (disabled) return;
      updatePointerFromEvent(e);
      startHold();
    },
    [disabled, startHold, updatePointerFromEvent]
  );

  return (
    <button
      ref={buttonRef}
      onPointerDown={handlePointerDown}
      onPointerMove={updatePointerFromEvent}
      onPointerUp={stopHold}
      onPointerLeave={stopHold}
      onPointerCancel={stopHold}
      disabled={disabled}
      className={cn(
        `system-panel w-full py-8 flex items-center justify-center transition-colors relative overflow-hidden select-none ${className}`,
        disabled
          ? "opacity-50 cursor-not-allowed"
          : holding
            ? `bg-${chartColor}/5`
            : "hover:bg-accent/10"
      )}
    >
      {/* Hold-to-fill bar — bright leading edge with a glowing trail */}
      <div
        className="absolute inset-y-0 left-0 right-0 origin-left pointer-events-none transition-opacity duration-200"
        style={{
          transform: `scaleX(${progress})`,
          opacity: holding ? 1 : 0.45,
          background: `linear-gradient(90deg, hsl(var(--${chartColor}) / 0.15) 0%, hsl(var(--${chartColor}) / 0.35) 70%, hsl(var(--${chartColor}) / 0.7) 100%)`,
          boxShadow: holding
            ? `inset -16px 0 24px -8px hsl(var(--${chartColor}) / 0.8), 0 0 24px hsl(var(--${chartColor}) / 0.5)`
            : `inset -8px 0 16px -8px hsl(var(--${chartColor}) / 0.4)`,
        }}
      />

      {ripples.map((r) => (
        <div
          key={r.id}
          className="click-ripple"
          style={{
            "--ripple-color": `hsl(var(--${chartColor}))`,
            "--ripple-x": `${r.x}px`,
            "--ripple-y": `${r.y}px`,
          } as React.CSSProperties}
        />
      ))}

      {floats.map((f) => (
        <span
          key={f.id}
          className={`click-float-indicator text-${chartColor}`}
          style={{
            left: f.x,
            top: f.y,
            textShadow: `0 0 8px hsl(var(--${chartColor}))`,
          }}
        >
          {floatText}
        </span>
      ))}

      <div className="flex flex-col items-center relative z-10">
        <Icon
          className={`h-12 w-12 text-${chartColor} mb-2 ${holding ? "animate-pulse" : ""} ${
            shouldFlicker ? "flickering-text" : ""
          }`}
        />
        <span className="terminal-text">{holding ? "Refining…" : `Hold to ${label}`}</span>
        <span className={cn(
          "text-xs mt-1",
          subLabelAlert
            ? "text-destructive font-semibold"
            : "text-muted-foreground"
        )}>
          {subLabel}
        </span>
      </div>
    </button>
  );
}
