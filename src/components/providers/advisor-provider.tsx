"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState, ReactNode, useEffect } from "react";
import { useGame } from "@/game-engine/hooks/useGame";
import { LOG_DEFINITIONS } from "@/game-engine/content/logDefinitions";

interface AdvisorContextValue {
  /** Currently displayed message (null = bubble hidden). */
  message: string | null;
  /** Show a one-shot line. Replaces whatever is currently visible. */
  showAdvisor: (text: string) => void;
  /** Clear the bubble immediately. */
  clearAdvisor: () => void;
  /**
   * 0..1 — how "formed" the AI is. Drives glitch intensity.
   * 0 = early game, very corrupted text. 1 = late game, fully clean text.
   */
  formationLevel: number;
}

const AdvisorContext = createContext<AdvisorContextValue | undefined>(undefined);

const TOTAL_LOGS = Object.keys(LOG_DEFINITIONS).length;

export function AdvisorProvider({ children }: { children: ReactNode }) {
  const { state } = useGame();
  const [message, setMessage] = useState<string | null>(null);

  const showAdvisor = useCallback((text: string) => {
    // Toggle null first so React re-mounts even if same text twice in a row.
    setMessage(null);
    setTimeout(() => setMessage(text), 30);
  }, []);

  const clearAdvisor = useCallback(() => setMessage(null), []);

  // Formation level = unlocked logs / total logs, capped at 1.
  const discoveredCount = state?.logs?.discovered ? Object.keys(state.logs.discovered).length : 0;
  const formationLevel = useMemo(() => {
    if (TOTAL_LOGS <= 0) return 1;
    return Math.min(1, discoveredCount / TOTAL_LOGS);
  }, [discoveredCount]);

  // ── Auto-trigger: speak when a new log is discovered ──
  const seenLogIdsRef = useRef<Set<string>>(new Set());
  const initializedRef = useRef(false);
  useEffect(() => {
    const discovered = state?.logs?.discovered;
    if (!discovered) return;

    // First mount: prime the seen set without firing.
    if (!initializedRef.current) {
      seenLogIdsRef.current = new Set(Object.keys(discovered));
      initializedRef.current = true;
      return;
    }

    for (const logId of Object.keys(discovered)) {
      if (seenLogIdsRef.current.has(logId)) continue;
      seenLogIdsRef.current.add(logId);

      const def = LOG_DEFINITIONS[logId];
      if (!def) continue;

      // Use the first sentence of the log as the spoken line, or the title.
      const firstSentence = def.content.split(/(?<=[.!?])\s/)[0];
      const snippet = firstSentence.length > 140 ? def.title : firstSentence;
      showAdvisor(snippet);
      break; // one log per render — others will queue on next state update
    }
  }, [state?.logs?.discovered, showAdvisor]);

  const value: AdvisorContextValue = {
    message,
    showAdvisor,
    clearAdvisor,
    formationLevel,
  };

  return <AdvisorContext.Provider value={value}>{children}</AdvisorContext.Provider>;
}

export function useAdvisor() {
  const ctx = useContext(AdvisorContext);
  if (!ctx) throw new Error("useAdvisor must be used inside AdvisorProvider");
  return ctx;
}
