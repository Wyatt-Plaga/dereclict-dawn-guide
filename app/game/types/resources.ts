// Resource types
export type ResourceType = 'energy' | 'insight' | 'crew' | 'scrap';

// Resource cost for actions
export interface ResourceCost {
  type: ResourceType;
  amount: number;
}

// Resources for game state
export interface Resources {
  energy: number;
  insight: number;
  crew: number;
  scrap: number;
} 