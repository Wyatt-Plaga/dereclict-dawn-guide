"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useAdvisor } from "@/components/providers/advisor-provider";
import GlitchText from "@/components/GlitchText";

interface AdvisorBubbleProps {
  /** Sprite path. Defaults to the VIKI-style holographic projection. */
  spritePath?: string;
  /** Display size of the sprite in pixels (square). */
  spriteSize?: number;
  /** How long (ms) the bubble stays before auto-hiding. 0 = never auto-hide. */
  durationMs?: number;
}

/**
 * Floating AI advisor — pinned to the bottom-right corner of the viewport.
 * Reads its current message + formation level from the AdvisorProvider.
 */
export default function AdvisorBubble({
  spritePath = "/ai-advisor-pixellab.png",
  spriteSize = 168,
  durationMs = 6000,
}: AdvisorBubbleProps) {
  const { message, clearAdvisor, formationLevel } = useAdvisor();
  const [visible, setVisible] = useState(false);
  const [shownText, setShownText] = useState<string | null>(null);

  // When a new message comes in, show it. Auto-hide after duration.
  useEffect(() => {
    if (!message) {
      setVisible(false);
      return;
    }
    setShownText(message);
    setVisible(true);

    if (durationMs > 0) {
      const t = setTimeout(() => setVisible(false), durationMs);
      return () => clearTimeout(t);
    }
  }, [message, durationMs]);

  // Once exit animation finishes, drop the text and notify the provider.
  useEffect(() => {
    if (visible || !shownText) return;
    const t = setTimeout(() => {
      setShownText(null);
      clearAdvisor();
    }, 350);
    return () => clearTimeout(t);
  }, [visible, shownText, clearAdvisor]);

  if (!shownText) return null;

  return (
    <div
      className={cn(
        "fixed bottom-4 right-4 z-50 pointer-events-none",
        "flex items-end gap-2",
        "transition-all duration-300 ease-out",
        visible
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-3 scale-95",
      )}
    >
      {/* Speech bubble */}
      <div
        className="relative max-w-sm system-panel bg-background/95 backdrop-blur px-4 py-3 border-primary/40"
        style={{ marginBottom: spriteSize * 0.25 }}
      >
        <p className="text-sm font-mono text-foreground leading-snug">
          <GlitchText text={shownText} formationLevel={formationLevel} />
        </p>
        {/* Tail pointing right toward the sprite */}
        <span
          className="absolute right-[-7px] bottom-4 w-0 h-0
                     border-t-[7px] border-t-transparent
                     border-b-[7px] border-b-transparent
                     border-l-[7px] border-l-primary/40"
        />
      </div>

      {/* AI projection — gentle float bob with hologram glow */}
      <img
        src={spritePath}
        alt="ship AI"
        width={spriteSize}
        height={spriteSize}
        className="object-contain shrink-0 advisor-bob drop-shadow-[0_0_14px_rgba(56,189,248,0.7)]"
        style={{ imageRendering: "pixelated" }}
      />
    </div>
  );
}
