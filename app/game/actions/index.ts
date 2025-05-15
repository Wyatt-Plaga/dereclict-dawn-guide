export type ActionMap = {
  "action:resource_click":   { entityId: string; amount?: number };
  "action:purchase_upgrade": { entityId: string; upgradeId: string };
  "action:mark_log_read":    { logId: string };
  "action:mark_all_logs":    {};
  "action:story_choice":     { encounterId: string; choiceId: string };
  "action:combat_move":      { moveId: string };
  "action:retreat":          {};
  "action:adjust_automation": { entityId: string; automationType: string; direction: 'increase' | 'decrease' };
  "action:initiate_jump":    {};
  // 🚧 Add new action types above this line as features grow
};

// Convenience union of all valid action keys
export type ActionKey = keyof ActionMap; 