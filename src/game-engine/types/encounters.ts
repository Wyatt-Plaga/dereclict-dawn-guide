import { RegionType } from './regions';
import { ResourceReward } from './resources';

/**
 * Encounter Types
 */
export interface BaseEncounter {
    id: string;
    type: 'combat' | 'story' | 'empty';
    title: string;
    description: string;
    region: RegionType;
}

export interface EmptyEncounter extends BaseEncounter {
    type: 'empty';
    resources?: ResourceReward[];
    message: string;
}

export interface StoryEncounter extends BaseEncounter {
    type: 'story';
    choices: EncounterChoice[];
    message?: string;
}

export interface EncounterChoice {
    id: string;
    text: string;
    outcome: {
        resources?: ResourceReward[];
        text: string;
        continuesToNextEncounter?: boolean;
    };
}

export interface EncounterHistory {
    type: 'combat' | 'story' | 'empty';
    id: string;
    result: string;
    date: number;
    region: RegionType;
}

