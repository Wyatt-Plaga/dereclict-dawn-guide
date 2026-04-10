"use client";

import { useState, useCallback, useRef } from "react";
import { LucideIcon } from "lucide-react";

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
  const [floats, setFloats] = useState<FloatIndicator[]>([]);
  const [ripples, setRipples] = useState<RippleInstance[]>([]);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      onClick();

      const rect = buttonRef.current?.getBoundingClientRect();
      const x = rect ? e.clientX - rect.left : 0;
      const y = rect ? e.clientY - rect.top : 0;

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
    },
    [onClick]
  );

  return (
    <button
      ref={buttonRef}
      onClick={handleClick}
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
