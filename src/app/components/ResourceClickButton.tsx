"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { LucideIcon } from "lucide-react";
import { useDevMode } from "@/components/providers/dev-mode-provider";

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
  floatText: string;
  chartColor: string;
  onClick: () => void;
  disabled?: boolean;
  shouldFlicker?: boolean;
  className?: string;
}

let nextId = 0;

const HOLD_START_DELAY_MS = 300;
const HOLD_REPEAT_MS = 240;
const HOLD_REPEAT_MS_DEV = 60;

export default function ResourceClickButton({
  icon: Icon,
  label,
  subLabel,
  floatText,
  chartColor,
  onClick,
  disabled = false,
  shouldFlicker = false,
  className = "mb-8",
}: ResourceClickButtonProps) {
  const { devMode } = useDevMode();
  const [floats, setFloats] = useState<FloatIndicator[]>([]);
  const [ripples, setRipples] = useState<RippleInstance[]>([]);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const holdStartTimeoutRef = useRef<number | null>(null);
  const holdIntervalRef = useRef<number | null>(null);
  const lastPointerRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Keep latest onClick/disabled reachable from timer callbacks
  const onClickRef = useRef(onClick);
  const disabledRef = useRef(disabled);
  useEffect(() => {
    onClickRef.current = onClick;
  }, [onClick]);
  useEffect(() => {
    disabledRef.current = disabled;
  }, [disabled]);

  const stopHold = useCallback(() => {
    if (holdStartTimeoutRef.current !== null) {
      clearTimeout(holdStartTimeoutRef.current);
      holdStartTimeoutRef.current = null;
    }
    if (holdIntervalRef.current !== null) {
      clearInterval(holdIntervalRef.current);
      holdIntervalRef.current = null;
    }
  }, []);

  const spawnFeedback = useCallback((x: number, y: number) => {
    const floatId = nextId++;
    const rippleId = nextId++;
    setFloats((prev) => [...prev, { id: floatId, x, y }]);
    setRipples((prev) => [...prev, { id: rippleId, x, y }]);
    setTimeout(() => {
      setFloats((prev) => prev.filter((f) => f.id !== floatId));
    }, 600);
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== rippleId));
    }, 400);
  }, []);

  const fireClick = useCallback(() => {
    if (disabledRef.current) {
      stopHold();
      return;
    }
    onClickRef.current();
    const { x, y } = lastPointerRef.current;
    spawnFeedback(x, y);
  }, [spawnFeedback, stopHold]);

  const startHold = useCallback(() => {
    const repeatMs = devMode ? HOLD_REPEAT_MS_DEV : HOLD_REPEAT_MS;
    holdStartTimeoutRef.current = window.setTimeout(() => {
      holdIntervalRef.current = window.setInterval(fireClick, repeatMs);
    }, HOLD_START_DELAY_MS);
  }, [fireClick, devMode]);

  // Clean up any pending timers on unmount
  useEffect(() => () => stopHold(), [stopHold]);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLButtonElement>) => {
      if (disabled) return;
      const rect = buttonRef.current?.getBoundingClientRect();
      lastPointerRef.current = {
        x: rect ? e.clientX - rect.left : 0,
        y: rect ? e.clientY - rect.top : 0,
      };
      fireClick();
      startHold();
    },
    [disabled, fireClick, startHold]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLButtonElement>) => {
      if (e.key !== "Enter" && e.key !== " ") return;
      e.preventDefault();
      if (disabled) return;
      const rect = buttonRef.current?.getBoundingClientRect();
      lastPointerRef.current = {
        x: rect ? rect.width / 2 : 0,
        y: rect ? rect.height / 2 : 0,
      };
      fireClick();
    },
    [disabled, fireClick]
  );

  return (
    <button
      ref={buttonRef}
      onPointerDown={handlePointerDown}
      onPointerUp={stopHold}
      onPointerLeave={stopHold}
      onPointerCancel={stopHold}
      onKeyDown={handleKeyDown}
      disabled={disabled}
      className={`system-panel w-full py-8 flex items-center justify-center transition-colors relative overflow-hidden active:scale-[0.98] ${className} ${
        disabled ? "opacity-50 cursor-not-allowed" : "hover:bg-accent/10"
      }`}
    >
      {ripples.map((r) => (
        <div
          key={r.id}
          className="click-ripple"
          style={
            {
              "--ripple-color": `hsl(var(--${chartColor}))`,
              "--ripple-x": `${r.x}px`,
              "--ripple-y": `${r.y}px`,
            } as React.CSSProperties
          }
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
          className={`h-12 w-12 text-${chartColor} mb-2 ${
            shouldFlicker ? "flickering-text" : ""
          }`}
        />
        <span className="terminal-text">{label}</span>
        <span className="text-xs text-muted-foreground mt-1">{subLabel}</span>
      </div>
    </button>
  );
}
