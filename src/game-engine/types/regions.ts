/**
 * Region Types
 */
export type RegionType = 'void' | 'nebula' | 'asteroid' | 'deepspace' | 'blackhole';

export const RegionType = {
  VOID: 'void' as RegionType,
  NEBULA: 'nebula' as RegionType,
  ASTEROID_FIELD: 'asteroid' as RegionType,
  RADIATION_ZONE: 'deepspace' as RegionType,
  SUPERNOVA: 'blackhole' as RegionType
};

/**
 * Region Definition
 */
export interface RegionDefinition {
  id: string;
  name: string;
  description: string;
  type?: RegionType;
  difficulty?: number;
  encounterChance: number;
  enemyProbabilities: {
    enemyId: string;
    weight: number;
  }[];
  resourceModifiers?: Record<string, number>;
}

