"use client";

import { useState, useEffect, useRef } from "react";

const GLITCH_CHARS = "▓░▒█╔╗╚╝║═─┼0123456789ABCDEF";

interface GlitchTextProps {
  text: string;
  /** Average ms between glitch events (higher = more sparse) */
  interval?: number;
  /** Max characters glitched at once */
  maxGlitch?: number;
  /** How long each glitched char stays corrupted (ms) */
  glitchDuration?: number;
  className?: string;
}

export default function GlitchText({
  text,
  interval = 3000,
  maxGlitch = 2,
  glitchDuration = 150,
  className = "",
}: GlitchTextProps) {
  const [chars, setChars] = useState<string[]>(() => text.split(""));
  const timeoutRefs = useRef<ReturnType<typeof setTimeout>[]>([]);

  // Keep chars in sync if text prop changes
  useEffect(() => {
    setChars(text.split(""));
  }, [text]);

  useEffect(() => {
    const tick = () => {
      // Pick 1–maxGlitch random non-space positions to corrupt
      const positions: number[] = [];
      const count = Math.ceil(Math.random() * maxGlitch);
      for (let i = 0; i < count; i++) {
        const pos = Math.floor(Math.random() * text.length);
        if (text[pos] !== " " && text[pos] !== "\n") positions.push(pos);
      }

      if (positions.length === 0) return;

      // Corrupt
      setChars((prev) => {
        const next = [...prev];
        for (const pos of positions) {
          next[pos] = GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)];
        }
        return next;
      });

      // Restore after brief flash
      const restore = setTimeout(() => {
        setChars((prev) => {
          const next = [...prev];
          for (const pos of positions) {
            next[pos] = text[pos];
          }
          return next;
        });
      }, glitchDuration);

      timeoutRefs.current.push(restore);
    };

    // Jitter the interval so it feels organic
    let handle: ReturnType<typeof setTimeout>;
    const schedule = () => {
      const jitter = interval * (0.5 + Math.random());
      handle = setTimeout(() => {
        tick();
        schedule();
      }, jitter);
    };
    schedule();

    return () => {
      clearTimeout(handle);
      timeoutRefs.current.forEach(clearTimeout);
      timeoutRefs.current = [];
    };
  }, [text, interval, maxGlitch, glitchDuration]);

  return <span className={className}>{chars.join("")}</span>;
}
