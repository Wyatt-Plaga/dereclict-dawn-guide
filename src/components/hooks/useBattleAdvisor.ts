"use client";

import { useEffect, useRef } from "react";
import { GameState } from "@/game-engine/types";
import { ADVISOR_MESSAGES, AdvisorTrigger } from "@/game-engine/content/advisorMessages";
import { useAdvisor } from "@/components/providers/advisor-provider";

/**
 * Pushes advisor lines into the global AdvisorProvider when meaningful
 * combat thresholds are crossed (low hull, shields drop, victory, etc.).
 */
export function useBattleAdvisor(state: GameState | undefined): void {
  const { showAdvisor } = useAdvisor();
  const lastIdRef = useRef<Record<string, string>>({});
  const firedRef = useRef<Record<string, boolean>>({});
  const lastEnemyRef = useRef<string | null>(null);

  const combat = state?.combat;
  const active = combat?.active ?? false;
  const enemyId = combat?.currentEnemy ?? null;
  const health = combat?.playerStats.health ?? 0;
  const maxHealth = combat?.playerStats.maxHealth ?? 1;
  const shield = combat?.playerStats.shield ?? 0;
  const enemyCloaked = combat?.enemyCloaked ?? false;
  const outcome = combat?.outcome;
  const completed = combat?.encounterCompleted ?? false;

  // Reset fired flags between distinct encounters.
  useEffect(() => {
    if (enemyId !== lastEnemyRef.current) {
      firedRef.current = {};
      lastEnemyRef.current = enemyId;
    }
  }, [enemyId]);

  const fire = (trigger: AdvisorTrigger) => {
    if (firedRef.current[trigger]) return;
    const pool = ADVISOR_MESSAGES[trigger];
    if (!pool || pool.length === 0) return;

    const lastId = lastIdRef.current[trigger];
    const candidates = pool.length > 1 ? pool.filter(m => m.id !== lastId) : pool;
    const choice = candidates[Math.floor(Math.random() * candidates.length)];
    lastIdRef.current[trigger] = choice.id;
    firedRef.current[trigger] = true;
    showAdvisor(choice.text);
  };

  // Combat start
  useEffect(() => {
    if (active && enemyId) fire('battle.start');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, enemyId]);

  // Low hull (< 30%)
  useEffect(() => {
    if (active && maxHealth > 0 && health > 0 && health / maxHealth < 0.3) {
      fire('battle.lowHull');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, health, maxHealth]);

  // Shields just dropped to zero (and we had shields to lose)
  const prevShieldRef = useRef(shield);
  useEffect(() => {
    if (active && prevShieldRef.current > 0 && shield === 0) {
      fire('battle.shieldsDown');
    }
    prevShieldRef.current = shield;
  }, [active, shield]);

  // Enemy cloaked
  useEffect(() => {
    if (active && enemyCloaked) fire('battle.enemyCloaked');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, enemyCloaked]);

  // Victory / defeat
  useEffect(() => {
    if (completed && outcome === 'victory') fire('battle.victory');
    if (completed && outcome === 'defeat') fire('battle.defeat');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [completed, outcome]);
}
