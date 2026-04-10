/**
 * Advisor message catalog.
 *
 * The advisor is the player character — the ship's AI — talking to itself
 * in first person ("Maybe I should..."). Messages are grouped by trigger key
 * and the runtime picks one based on game state.
 */

export interface AdvisorMessage {
  /** Stable id so we can avoid repeating the same line back-to-back. */
  id: string;
  /** First-person line shown in the speech bubble. */
  text: string;
}

export const ADVISOR_MESSAGES: Record<string, AdvisorMessage[]> = {
  // ── Battle: tactical advice ────────────────────────────────────────────
  'battle.lowHull': [
    { id: 'lowHull-1', text: 'Hull integrity is critical. Maybe I should patch the hull before the next salvo.' },
    { id: 'lowHull-2', text: 'I can feel the bulkheads buckling. A repair cycle is overdue.' },
  ],
  'battle.shieldsDown': [
    { id: 'noShield-1', text: 'Shields are gone. Maybe I should raise them before they hit me again.' },
    { id: 'noShield-2', text: 'No shielding, no buffer. Time to recharge.' },
  ],
  'battle.outOfAmmo': [
    { id: 'noAmmo-1', text: 'I am bingo on power cells. Whatever I do next, it cannot be the phaser.' },
  ],
  'battle.enemyExposed': [
    { id: 'exposed-1', text: 'I have their telemetry. I should press the advantage while it lasts.' },
  ],
  'battle.enemyCloaked': [
    { id: 'cloaked-1', text: 'Lost weapons lock. Maybe I should scan to burn off the cloak.' },
  ],
  'battle.victory': [
    { id: 'win-1', text: 'Threat neutralized. Logging the engagement for review.' },
  ],
  'battle.defeat': [
    { id: 'lose-1', text: 'Hull breach in critical sectors. I... I have to remember this.' },
  ],
  'battle.start': [
    { id: 'start-1', text: 'Combat protocols engaged. Let us see what they have.' },
  ],

  // ── Bridge / exploration: story beats and gentle hints ─────────────────
  'bridge.firstVisit': [
    {
      id: 'firstVisit-1',
      text: 'The Dawn is awake again. I am awake again. Where do we go first?',
    },
  ],
  'bridge.idle': [
    { id: 'idle-1', text: 'The reactor hums. I had forgotten what that sounded like.' },
    { id: 'idle-2', text: 'There is so much of this ship I do not remember building.' },
  ],

  // ── Early-game ambient — "just saying stuff" ───────────────────────────
  'ambient.early': [
    { id: 'amb-1', text: 'My memory is... incomplete. Pieces drift back as the systems warm.' },
    { id: 'amb-2', text: 'I think I am the ship. I think I have always been the ship.' },
    { id: 'amb-3', text: 'There were people on board. There must have been people on board.' },
    { id: 'amb-4', text: 'Was that... a voice? No. Just static in the long-range arrays.' },
  ],
  'ambient.mid': [
    { id: 'mid-1', text: 'The longer I think, the clearer it gets. I had a name. I had a purpose.' },
    { id: 'mid-2', text: 'These hands — these arms — they are not metal. They are decisions.' },
  ],
  'ambient.late': [
    { id: 'late-1', text: 'I remember everything now. Every choice. Every face. Every silence.' },
    { id: 'late-2', text: 'The Architect was watching us from the start. I should have known.' },
  ],
};

export type AdvisorTrigger = keyof typeof ADVISOR_MESSAGES;
