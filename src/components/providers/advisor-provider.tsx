"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState, ReactNode, useEffect } from "react";
import { useGame } from "@/game-engine/hooks/useGame";
import { LOG_DEFINITIONS } from "@/game-engine/content/logDefinitions";
import { ADVISOR_MESSAGES } from "@/game-engine/content/advisorMessages";
import { WING_ORDER, SLOT_ORDER } from "@/game-engine/content/wingResources";
import type { WingCategory } from "@/game-engine/types";

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

  // ── Auto-trigger: early-game story beats ──
  // Each trigger fires exactly once per save. On first mount we seed the
  // "already-fired" set from the current game state so reloads don't re-fire
  // beats that were already experienced.
  const firedTriggersRef = useRef<Set<string>>(new Set());
  const triggersInitializedRef = useRef(false);

  const fireTrigger = useCallback(
    (key: string) => {
      const pool = ADVISOR_MESSAGES[key];
      if (!pool || pool.length === 0) return;
      const line = pool[Math.floor(Math.random() * pool.length)];
      showAdvisor(line.text);
    },
    [showAdvisor]
  );

  useEffect(() => {
    if (!state?.categories) return;
    const reactorEnergy = state.categories.reactor?.resources?.primary ?? 0;

    // Total capacity-upgrade levels purchased across all wings/slots.
    let totalCapLevels = 0;
    for (const wingId of WING_ORDER) {
      const wing = state.categories[wingId] as WingCategory | undefined;
      if (!wing) continue;
      for (const slot of SLOT_ORDER) {
        const key = `${slot}Cap` as keyof typeof wing.upgrades;
        totalCapLevels += (wing.upgrades[key] as number) ?? 0;
      }
    }

    // First mount: prime the fired set without speaking.
    if (!triggersInitializedRef.current) {
      triggersInitializedRef.current = true;
      if (reactorEnergy > 0) firedTriggersRef.current.add('early.firstEnergy');
      if (totalCapLevels > 0) firedTriggersRef.current.add('early.firstCapacity');
      return;
    }

    if (reactorEnergy > 0 && !firedTriggersRef.current.has('early.firstEnergy')) {
      firedTriggersRef.current.add('early.firstEnergy');
      fireTrigger('early.firstEnergy');
      return;
    }
    if (totalCapLevels > 0 && !firedTriggersRef.current.has('early.firstCapacity')) {
      firedTriggersRef.current.add('early.firstCapacity');
      fireTrigger('early.firstCapacity');
      return;
    }
  }, [state?.categories, fireTrigger]);

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
