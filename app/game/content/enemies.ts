import { z } from 'zod';
import { EnemyDefinition, EnemyType, RegionType } from '../types/combat';

import enemyData from './enemies.json';

/* ---------------------------- ZOD SCHEMA ---------------------------- */
const lootSchema = z.object({
  type: z.string(),
  amount: z.number(),
  probability: z.number().optional(),
});

const enemySchema: z.ZodType<EnemyDefinition> = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  type: z.nativeEnum(EnemyType),
  health: z.number(),
  maxHealth: z.number(),
  shield: z.number(),
  maxShield: z.number(),
  image: z.string().optional(),
  actions: z.array(z.string()),
  loot: z.array(lootSchema),
  regions: z.array(z.nativeEnum(RegionType)).optional(),
  difficultyTier: z.number().optional(),
}).strict();

function validateRecord<T>(schema: z.ZodType<T>, data: Record<string, unknown>): Record<string, T> {
  const result: Record<string, T> = {};
  for (const [key, value] of Object.entries(data)) {
    result[key] = schema.parse(value);
  }
  return result;
}

export const ENEMY_DEFINITIONS: Record<string, EnemyDefinition> = validateRecord(
  enemySchema as unknown as z.ZodSchema<EnemyDefinition>,
  enemyData as any,
); 