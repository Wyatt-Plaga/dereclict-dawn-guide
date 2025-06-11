export * from './ResourceStorage';
export * from './Generator';
export * from './Upgradable';
export * from './ManualCollector';
export * from './Tag';

export type ComponentKey =
  | 'ResourceStorage'
  | 'Generator'
  | 'Upgradable'
  | 'ManualCollector'
  | 'Tag';

export interface ComponentMap {
  ResourceStorage: import('./ResourceStorage').ResourceStorage;
  Generator: import('./Generator').Generator;
  Upgradable: import('./Upgradable').Upgradable;
  ManualCollector: import('./ManualCollector').ManualCollector;
  Tag: import('./Tag').Tag;
}

// Marker interface for all components
export interface Component {}

/**
 * Marks an entity as having stor-able resources (energy, insight, etc.)
 */
export interface ResourceStorage extends Component {
  /** current amount held */
  current: number;
  /** hard capacity */
  capacity: number;
}

/**
 * Produces resources every tick.
 */
export interface Generator extends Component {
  /** units per second (float) */
  ratePerSecond: number;
  /** optional flag for automation toggles */
  active?: boolean;
}

/**
 * Simple level-based upgrade capability.
 */
export interface Upgradable extends Component {
  level: number;
  maxLevel?: number;
  costRef: string;
}

// ---------------------------------------------------------------------------
// Upgrade Keys
// ---------------------------------------------------------------------------
export type UpgradeKey =
  | 'reactor:expansions'
  | 'reactor:converters'
  | 'processor:expansions'
  | 'processor:threads'
  | 'crew:quartersExpansion'
  | 'crew:workerCrews'
  | 'manufacturing:expansions'
  | 'manufacturing:bays';

/**
 * A thin wrapper for an ID + open component bag.
 * Future work will likely introduce helper factories / type-safe accessors.
 */
export interface Entity {
  id: string;
  components: Component[];
}

// ---------------------------------------------------------------------------
// CORE / META
// ---------------------------------------------------------------------------

export interface Identity extends Component {
  name: string;
  description?: string;
}

export interface TagSet extends Component {
  tags: Set<string>; // using Set for O(1) look-ups & uniqueness
}

// ---------------------------------------------------------------------------
// ECONOMY / IDLE LOOP
// ---------------------------------------------------------------------------

export interface ManualCollector extends Component {
  clickYield: number;
  cooldownMs: number;
  lastCollectTimestamp?: number;
}

export type ResourceType = 'energy' | 'insight' | 'crew' | 'scrap' | string;

export interface Cost extends Component {
  price: Record<ResourceType, number>;
}

export interface CapacityBonus extends Component {
  flat: number;
  mult: number; // multiplier (e.g., 0.1 ⇒ +10 %)
}

export interface ProductionBonus extends Component {
  flat: number;
  mult: number;
}

// ---------------------------------------------------------------------------
// PROGRESSION / UPGRADES
// ---------------------------------------------------------------------------

export interface UnlockCondition extends Component {
  requires: string[]; // IDs, tags, or feature flags
}

// ---------------------------------------------------------------------------
// CREW & STORY
// ---------------------------------------------------------------------------

export interface CrewAwakening extends Component {
  progress: number;
  threshold: number;
}

export interface EncounterState extends Component {
  stage: number;
  choiceLog: Array<{ choiceId: string; timestamp: number }>;
}

// ---------------------------------------------------------------------------
// COMBAT
// ---------------------------------------------------------------------------

export interface Health extends Component {
  hp: number;
  maxHp: number;
}

export interface Shield extends Component {
  sp: number; // shield points
  maxSp: number;
}

export interface DamageSource extends Component {
  dps: number;
  damageType: 'kinetic' | 'energy' | 'true' | string;
}

export interface CombatStats extends Component {
  attackSpeed: number;
  critChance: number;
  armor: number;
}

// ---------------------------------------------------------------------------
// TIME / TEMPORARY EFFECTS
// ---------------------------------------------------------------------------

export interface Timer extends Component {
  remainingMs: number;
  repeat?: boolean;
} 
