"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const GLITCH_CHARS = "!@#$%^&*()_+-=[]{}|;:,.<>?/~`█▓▒░<>/\\";

function corrupt(text: string, intensity: number): string {
  // intensity 0..1 — fraction of characters replaced with junk
  if (intensity <= 0) return text;
  return text
    .split("")
    .map((c) => {
      if (c === " " || c === "\n") return c;
      return Math.random() < intensity
        ? GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)]
        : c;
    })
    .join("");
}

interface GlitchTextProps {
  text: string;
  /**
   * Formation level 0..1 — 0 = max corruption, 1 = clean.
   * Inverse of glitch intensity.
   */
  formationLevel: number;
  className?: string;
}

/**
 * Renders text with character-level corruption + jitter that scales
 * inversely with the formation level.
 *
 * - formationLevel 0.0  → ~4% chars flicker, slow re-shuffle, faint jitter
 * - formationLevel 0.5  → ~2% chars flicker
 * - formationLevel 1.0  → clean text, no animation
 */
export default function GlitchText({ text, formationLevel, className }: GlitchTextProps) {
  // Glitch intensity is the inverse of formation. Capped low so even at
  // formationLevel 0 it's a subtle flicker, not a wall of garbled symbols.
  const intensity = Math.max(0, (1 - formationLevel) * 0.04);
  const refreshMs = 200 + formationLevel * 400; // slower, calmer re-scramble

  const [display, setDisplay] = useState(() => corrupt(text, intensity));

  useEffect(() => {
    setDisplay(corrupt(text, intensity));
    if (intensity <= 0) return;

    const id = setInterval(() => {
      setDisplay(corrupt(text, intensity));
    }, refreshMs);
    return () => clearInterval(id);
  }, [text, intensity, refreshMs]);

  return (
    <span
      className={cn(
        intensity > 0.05 && "advisor-glitch-jitter",
        className,
      )}
    >
      {display}
    </span>
  );
}
