/**
 * Research definitions — one-time unlocks purchased on the Laboratory page.
 *
 * Modelled after Armory & Machine's Research system:
 * - "Main" branch costs Energy with escalating thresholds (50 → 500 → 3000)
 * - Each research gates an entire upgrade CATEGORY (workers, efficiency, etc.)
 * - Repeatable per-slot upgrades are purchased separately after the category is unlocked.
 * - Capacity upgrades are NOT gated by research — they become available on a
 *   wing as soon as that wing's secondary resource tier is unlocked.
 */

export interface ResearchDef {
  id: string;
  name: string;
  description: string;
  branch: string;            // grouping label (e.g. 'main')
  /** Resource spent to purchase this research */
  costResource: string;      // resource id (e.g. 'energy')
  costAmount: number;
  /** Research IDs that must be completed before this one is available */
  prerequisites: string[];
  /** Feature flag key set to true on GameState.laboratory when researched */
  unlocks: string;
}

/* ========================================================================== */
/* Main branch — costs Energy, gates core upgrade categories                  */
/* ========================================================================== */

export const RESEARCH_DEFS: ResearchDef[] = [
  {
    id: 'workforce_systems',
    name: 'Workforce Systems',
    description: 'Reactivate crew assignment protocols. Enables hiring workers from the shared pool.',
    branch: 'main',
    costResource: 'energy',
    costAmount: 50,
    prerequisites: [],
    unlocks: 'workerHiring',
  },
  {
    id: 'crew_expansion',
    name: 'Crew Expansion',
    description: 'Advanced bunk allocation algorithms. Raise the per-slot worker cap on any resource.',
    branch: 'main',
    costResource: 'energy',
    costAmount: 500,
    prerequisites: ['workforce_systems'],
    unlocks: 'maxWorkersUpgrades',
  },
  {
    id: 'optimization_routines',
    name: 'Optimization Routines',
    description: 'Fine-tune production pipelines. Each worker produces more per second.',
    branch: 'main',
    costResource: 'energy',
    costAmount: 3000,
    prerequisites: ['crew_expansion'],
    unlocks: 'efficiencyUpgrades',
  },
];

/** Lookup by id */
export const RESEARCH_BY_ID: Record<string, ResearchDef> = {};
for (const r of RESEARCH_DEFS) {
  RESEARCH_BY_ID[r.id] = r;
}

/** All branches in display order */
export const RESEARCH_BRANCHES = ['main'] as const;

/** Check whether all prerequisites for a research are met */
export function canResearch(researchId: string, completed: string[]): boolean {
  const def = RESEARCH_BY_ID[researchId];
  if (!def) return false;
  if (completed.includes(researchId)) return false; // already done
  return def.prerequisites.every(p => completed.includes(p));
}
