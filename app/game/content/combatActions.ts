import { z } from 'zod';
import { CombatActionCategory, CombatActionDefinition, EnemyActionDefinition } from '../types/combat';

import playerMovesData from './playerMoves.json';
import enemyMovesData from './enemyMoves.json';

/* ---------------------------- ZOD SCHEMAS ---------------------------- */
const resourceCostSchema = z.object({
  type: z.string(),
  amount: z.number(),
});

const combatActionSchema: z.ZodType<CombatActionDefinition> = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  category: z.nativeEnum(CombatActionCategory),
  cost: resourceCostSchema,
  damage: z.number().optional(),
  shieldRepair: z.number().optional(),
  hullRepair: z.number().optional(),
  statusEffect: z.any().optional(),
  cooldown: z.number(),
});

const enemyActionSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  damage: z.number().optional(),
  shieldDamage: z.number().optional(),
  statusEffect: z.any().optional(),
  cooldown: z.number(),
  useCondition: z.any(),
}).strict();

/* --------------------------- VALIDATE DATA --------------------------- */
function validateRecord<T>(
  schema: z.ZodType<T>,
  data: Record<string, unknown>,
  label: string,
): Record<string, T> {
  const result: Record<string, T> = {};
  for (const [key, value] of Object.entries(data)) {
    const parsed = schema.parse(value);
    result[key] = parsed;
  }
  return result;
}

export const PLAYER_ACTIONS: Record<string, CombatActionDefinition> = validateRecord(
  combatActionSchema,
  playerMovesData as any,
  'PLAYER_ACTIONS',
);

export const ENEMY_ACTIONS: Record<string, EnemyActionDefinition> = validateRecord(
  enemyActionSchema as unknown as z.ZodSchema<EnemyActionDefinition>,
  enemyMovesData as any,
  'ENEMY_ACTIONS',
); 