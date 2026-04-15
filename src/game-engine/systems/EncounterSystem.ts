import { v4 as uuidv4 } from 'uuid';
import {
    GameState,
    BaseEncounter,
    EmptyEncounter,
    StoryEncounter,
    ResourceReward,
    RegionType,
    EncounterChoice,
    BuffReward,
    ActiveBuff
} from '../types';
import { AmmoTypeId } from '../content/ammoTypes';
import { getAmmoMax } from '../content/ammoTypes';
import { 
  getRandomEmptyEncounterMessage, 
  getRandomEmptyEncounterTitle,
  getRandomEmptyEncounterDescription, 
  generateEmptyEncounterRewards, 
  REGION_ENCOUNTER_CHANCES 
} from '../content/encounters';
import Logger, { LogCategory, LogContext } from '@/app/utils/logger';
import { REGION_DEFINITIONS } from '../content/regions';
import { JUMP_FUEL_COST } from '../content/bridgeFuel';
import { EventBus } from "../core/EventBus";
import { EventMap } from "../types/events";

/* -------------------------------------------------------------------------- */
/* Story encounter templates                                                  */
/* -------------------------------------------------------------------------- */

const MIN3 = 3 * 60 * 1000;
const MIN5 = 5 * 60 * 1000;

interface StoryTemplate {
    title: string;
    description: string;
    choices: {
        text: string;
        outcome: {
            resources?: ResourceReward[];
            buff?: BuffReward;
            text: string;
        };
    }[];
}

const STORY_POOLS: Record<string, StoryTemplate[]> = {
    void: [
        {
            title: 'Temporal Rift',
            description: 'A shimmering tear in spacetime pulses with unstable energy. Readings are off the charts — whatever caused this defies known physics. The rift seems to be slowly closing.',
            choices: [
                {
                    text: 'Fly through the rift',
                    outcome: {
                        buff: { name: 'Temporal Surge', description: '+25% combat damage for 3 minutes', type: 'combatDamage', magnitude: 0.25, durationMs: MIN3 },
                        text: 'The Dawn screams through the rift. Time distorts around the hull — for a brief eternity you exist in two places at once. Your weapons systems emerge supercharged with residual temporal energy.',
                    },
                },
                {
                    text: 'Analyze the rift from a safe distance',
                    outcome: {
                        buff: { name: 'Quantum Insight', description: '+40% insight generation for 3 minutes', type: 'insightRate', magnitude: 0.4, durationMs: MIN3 },
                        text: 'Your processors work overtime cataloging the rift\'s properties. The exotic data streams are unlike anything in the Dawn\'s archives. Your analytical systems will run faster for some time as they process this windfall.',
                    },
                },
                {
                    text: 'Harvest the rift\'s energy',
                    outcome: {
                        resources: [
                            { type: 'ammo', amount: 4, ammoType: 'powerCells', message: 'Rift energy condensed into Power Cells.' },
                            { type: 'ammo', amount: 2, ammoType: 'dataCores', message: 'Exotic particles captured as Data Cores.' },
                        ],
                        text: 'You extend the collection arrays into the rift\'s edge. Raw spacetime energy floods in, crystallizing into usable ammunition. The rift collapses behind you as you pull away.',
                    },
                },
            ],
        },
        {
            title: 'Abandoned Relay Station',
            description: 'A derelict communications relay drifts in the void, its antenna still weakly broadcasting a maintenance ping. The station predates the Dawn\'s records by centuries.',
            choices: [
                {
                    text: 'Reactivate the relay\'s power core',
                    outcome: {
                        buff: { name: 'Relay Boost', description: '+30% energy generation for 5 minutes', type: 'energyRate', magnitude: 0.3, durationMs: MIN5 },
                        text: 'You dock and bring the ancient reactor back online. Its output feeds directly into the Dawn\'s grid through a jury-rigged connection. It won\'t last, but the boost is significant.',
                    },
                },
                {
                    text: 'Salvage its memory banks',
                    outcome: {
                        resources: [{ type: 'relics', amount: 2, message: 'Ancient data crystals recovered — classified as relics.' }],
                        text: 'The relay\'s memory banks contain encrypted data from a lost civilization. The crystals themselves are more valuable than anything stored on them — genuine relics of a forgotten age.',
                    },
                },
                {
                    text: 'Strip it for ammunition components',
                    outcome: {
                        resources: [
                            { type: 'ammo', amount: 3, ammoType: 'munitions', message: 'Relay plating repurposed into Munitions.' },
                            { type: 'ammo', amount: 2, ammoType: 'repairKits', message: 'Spare parts assembled into Repair Kits.' },
                        ],
                        text: 'The relay\'s hardened plating and redundant systems make excellent raw material. Your crew fashions the components into usable combat supplies.',
                    },
                },
            ],
        },
        {
            title: 'Dying Star\'s Echo',
            description: 'Sensors pick up the electromagnetic echo of a star that died millennia ago. The wavefront carries concentrated energy and encoded data from the star\'s final moments.',
            choices: [
                {
                    text: 'Ride the wavefront',
                    outcome: {
                        buff: { name: 'Stellar Wind', description: '+50% scrap collection for 3 minutes', type: 'scrapRate', magnitude: 0.5, durationMs: MIN3 },
                        text: 'The Dawn surfs the shockwave, its hull vibrating with resonant energy. Microdebris from the ancient explosion pelts the collectors — a bounty of material carried across light-years.',
                    },
                },
                {
                    text: 'Deploy sensors into the wavefront',
                    outcome: {
                        resources: [
                            { type: 'relics', amount: 1, message: 'Stellar core sample classified as relic.' },
                            { type: 'ammo', amount: 3, ammoType: 'powerCells', message: 'Stellar plasma captured as Power Cells.' },
                        ],
                        text: 'Your probes capture a fragment of the star\'s core material — impossibly dense and radiating with ancient power. The plasma surrounding it is readily converted to ammunition.',
                    },
                },
                {
                    text: 'Let it pass and study the afterglow',
                    outcome: {
                        buff: { name: 'Deep Calibration', description: '+30% insight generation for 5 minutes', type: 'insightRate', magnitude: 0.3, durationMs: MIN5 },
                        text: 'You hold position and record the wavefront\'s passage in exquisite detail. The calibration data will enhance your sensor arrays for some time.',
                    },
                },
            ],
        },
    ],
    nebula: [
        {
            title: 'Plasma Storm Front',
            description: 'A wall of superheated plasma advances through the nebula, crackling with electromagnetic discharge. It\'s too large to outrun, but the energy readings are extraordinary.',
            choices: [
                {
                    text: 'Ride the storm\'s edge',
                    outcome: {
                        buff: { name: 'Storm Charge', description: '+50% energy generation for 3 minutes', type: 'energyRate', magnitude: 0.5, durationMs: MIN3 },
                        text: 'The Dawn skims the plasma wall, energy collectors blazing white-hot. The ship shakes violently but the power surge is immense. Your reactors will run hot for a while.',
                    },
                },
                {
                    text: 'Deploy shield collectors',
                    outcome: {
                        resources: [
                            { type: 'ammo', amount: 5, ammoType: 'powerCells', message: 'Storm energy condensed into Power Cells.' },
                        ],
                        text: 'Your shield arrays absorb the plasma discharge, converting raw storm energy into stable power cells. The collectors nearly overload, but the haul is worth the risk.',
                    },
                },
                {
                    text: 'Shelter in a nearby gas pocket',
                    outcome: {
                        buff: { name: 'Nebula Calm', description: '+30% crew awakening for 5 minutes', type: 'crewRate', magnitude: 0.3, durationMs: MIN5 },
                        text: 'You find a calm pocket within the nebula\'s folds. As the storm rages outside, the crew takes the opportunity to rest and the medbay works at full capacity. The quiet won\'t last, but morale soars.',
                    },
                },
            ],
        },
        {
            title: 'Ancient Probe Swarm',
            description: 'Thousands of tiny, luminous probes emerge from the nebula clouds, orbiting the Dawn in complex patterns. They seem to be studying you — their design is unlike any known civilization.',
            choices: [
                {
                    text: 'Interface with the swarm\'s network',
                    outcome: {
                        buff: { name: 'Swarm Link', description: '+40% insight generation for 5 minutes', type: 'insightRate', magnitude: 0.4, durationMs: MIN5 },
                        text: 'Your systems handshake with the alien network. Data floods in — star maps, chemical compositions, gravitational charts. Your processors will be digesting this bounty for some time.',
                    },
                },
                {
                    text: 'Capture a handful for analysis',
                    outcome: {
                        resources: [
                            { type: 'ammo', amount: 3, ammoType: 'dataCores', message: 'Alien probe cores converted to Data Cores.' },
                            { type: 'relics', amount: 1, message: 'One intact probe classified as relic.' },
                        ],
                        text: 'You snag several probes in your cargo nets. Most are too damaged to function, but their exotic cores can be repurposed. One probe is intact enough to qualify as a genuine relic.',
                    },
                },
                {
                    text: 'Follow the swarm to its origin',
                    outcome: {
                        resources: [
                            { type: 'ammo', amount: 2, ammoType: 'powerCells', message: 'Origin beacon power cells recovered.' },
                            { type: 'ammo', amount: 2, ammoType: 'repairKits', message: 'Alien repair nanites adapted into Repair Kits.' },
                        ],
                        text: 'The swarm leads you to a small, hidden station embedded in a gas cloud. Long abandoned, its supply cache still holds useful material that your crew adapts for the Dawn\'s systems.',
                    },
                },
            ],
        },
    ],
    asteroid: [
        {
            title: 'Crystal Cavern',
            description: 'A massive asteroid has split open, revealing an interior lined with luminous crystals. They pulse with stored energy — geological processes have created a natural battery.',
            choices: [
                {
                    text: 'Mine the crystals aggressively',
                    outcome: {
                        buff: { name: 'Crystal Resonance', description: '+60% scrap collection for 3 minutes', type: 'scrapRate', magnitude: 0.6, durationMs: MIN3 },
                        text: 'Your mining lasers carve deep into the crystal veins. The resonant frequency amplifies your collection systems — everything you touch seems to yield more material than expected.',
                    },
                },
                {
                    text: 'Carefully extract intact specimens',
                    outcome: {
                        resources: [
                            { type: 'relics', amount: 2, message: 'Intact crystal matrices classified as relics.' },
                        ],
                        text: 'Patience pays off. Two perfect crystal matrices are extracted without fracture — their internal structure is too complex to be natural. Someone or something grew these, long ago.',
                    },
                },
                {
                    text: 'Process the crystals into ammunition',
                    outcome: {
                        resources: [
                            { type: 'ammo', amount: 4, ammoType: 'munitions', message: 'Crystal shards fashioned into Munitions.' },
                            { type: 'ammo', amount: 3, ammoType: 'powerCells', message: 'Crystal energy stored as Power Cells.' },
                        ],
                        text: 'The crystals shatter into razor-sharp fragments perfect for kinetic weapons, while their energy cores are easily converted to power cells. A practical haul.',
                    },
                },
            ],
        },
        {
            title: 'Smuggler\'s Cache',
            description: 'Hidden behind a cluster of asteroids, you find a sealed cargo container with smuggler markings. Its transponder is dead, but the container appears intact.',
            choices: [
                {
                    text: 'Crack it open',
                    outcome: {
                        resources: [
                            { type: 'ammo', amount: 3, ammoType: 'munitions', message: 'Black market munitions recovered.' },
                            { type: 'ammo', amount: 2, ammoType: 'dataCores', message: 'Encrypted data packages found.' },
                            { type: 'ammo', amount: 2, ammoType: 'repairKits', message: 'Medical supplies repurposed as Repair Kits.' },
                        ],
                        text: 'The container holds a smuggler\'s mixed stockpile — weapons components, encrypted data packages, and medical supplies. No questions asked about the original owners.',
                    },
                },
                {
                    text: 'Scan the container\'s data logs',
                    outcome: {
                        buff: { name: 'Smuggler\'s Charts', description: '+35% scrap collection for 5 minutes', type: 'scrapRate', magnitude: 0.35, durationMs: MIN5 },
                        text: 'The container\'s navigation computer contains detailed charts of resource-rich asteroid clusters that the smugglers had mapped. Your mining operations will benefit from this intelligence.',
                    },
                },
                {
                    text: 'Booby-trap the container and leave it as bait',
                    outcome: {
                        buff: { name: 'Tactical Edge', description: '+20% combat damage for 5 minutes', type: 'combatDamage', magnitude: 0.2, durationMs: MIN5 },
                        text: 'You rig the container with Dawn\'s signature and set it broadcasting. Any hostiles who investigate will reveal their approach vectors. The tactical data feeds into your targeting systems.',
                    },
                },
            ],
        },
    ],
    deepspace: [
        {
            title: 'Distortion Field',
            description: 'A region of warped spacetime hangs in the void like a lens of dark glass. Objects on the other side appear stretched and duplicated. The field hums with latent power.',
            choices: [
                {
                    text: 'Traverse the distortion',
                    outcome: {
                        buff: { name: 'Phase Shift', description: '+30% combat damage for 5 minutes', type: 'combatDamage', magnitude: 0.3, durationMs: MIN5 },
                        text: 'The Dawn passes through the field and emerges... changed. Your weapons seem to phase slightly out of normal space, striking targets from impossible angles. The effect is temporary, but devastating.',
                    },
                },
                {
                    text: 'Siphon the field\'s energy',
                    outcome: {
                        resources: [
                            { type: 'ammo', amount: 5, ammoType: 'powerCells', message: 'Distortion energy captured as Power Cells.' },
                            { type: 'ammo', amount: 3, ammoType: 'dataCores', message: 'Spacetime readings encoded as Data Cores.' },
                        ],
                        text: 'Careful extraction yields an exceptional haul. The distortion\'s energy crystallizes beautifully into stable cells, and the sensor data captured during extraction is invaluable.',
                    },
                },
                {
                    text: 'Study the field\'s boundaries',
                    outcome: {
                        buff: { name: 'Dimensional Awareness', description: '+25% shield strength for 5 minutes', type: 'shieldStrength', magnitude: 0.25, durationMs: MIN5 },
                        resources: [{ type: 'relics', amount: 1, message: 'Spacetime anomaly sample classified as relic.' }],
                        text: 'Your analysis reveals how matter interacts with warped spacetime. The findings enhance your shield harmonics — incoming attacks glance off at angles that shouldn\'t be possible.',
                    },
                },
            ],
        },
        {
            title: 'Ghost Ship Flotilla',
            description: 'A convoy of ships drifts in perfect formation, lights dark, engines cold. They\'ve been here for years — maybe decades. Their hulls bear the markings of no known faction.',
            choices: [
                {
                    text: 'Board the lead ship',
                    outcome: {
                        resources: [
                            { type: 'relics', amount: 3, message: 'Unknown technology classified as relics.' },
                        ],
                        text: 'The lead ship\'s bridge holds technology you\'ve never seen — controls that respond to thought, materials that shift color when touched. You carefully extract what you can. These are genuine relics of something beyond your understanding.',
                    },
                },
                {
                    text: 'Download their navigation data',
                    outcome: {
                        buff: { name: 'Star Charts', description: '+40% all generation rates for 3 minutes', type: 'energyRate', magnitude: 0.4, durationMs: MIN3 },
                        text: 'The flotilla\'s computers contain navigation data for resource-rich regions throughout deep space. The charts optimize every system on your ship as the crew plots more efficient routes.',
                    },
                },
                {
                    text: 'Scavenge ammunition from the convoy',
                    outcome: {
                        resources: [
                            { type: 'ammo', amount: 3, ammoType: 'powerCells', message: 'Alien power cells recovered.' },
                            { type: 'ammo', amount: 3, ammoType: 'munitions', message: 'Ballistic rounds adapted to Dawn\'s systems.' },
                            { type: 'ammo', amount: 2, ammoType: 'dataCores', message: 'Encrypted alien data cores.' },
                            { type: 'ammo', amount: 2, ammoType: 'repairKits', message: 'Alien medical supplies adapted.' },
                        ],
                        text: 'The flotilla\'s armories still hold supplies. The alien designs require some adaptation, but your engineers make them work. A windfall of ammunition across all types.',
                    },
                },
            ],
        },
    ],
    blackhole: [
        {
            title: 'Time Dilation Pocket',
            description: 'A region near the black hole where time flows at a fraction of normal speed. Objects caught within appear frozen. Your chronometers disagree violently with each other.',
            choices: [
                {
                    text: 'Enter the pocket and let time work for you',
                    outcome: {
                        buff: { name: 'Time Dilation', description: '+50% all generation rates for 5 minutes', type: 'energyRate', magnitude: 0.5, durationMs: MIN5 },
                        text: 'Inside the pocket, the Dawn\'s systems run at what feels like normal speed — but the universe outside crawls. Your generators, processors, and crew all benefit from this stolen time.',
                    },
                },
                {
                    text: 'Harvest the chronometric particles',
                    outcome: {
                        resources: [
                            { type: 'relics', amount: 4, message: 'Chronometric particles — priceless relics of warped spacetime.' },
                        ],
                        text: 'You extract particles that exist partially outside normal time. They shimmer with an inner light that shifts color depending on when you look at them. Extraordinary finds.',
                    },
                },
                {
                    text: 'Use the pocket as a resupply window',
                    outcome: {
                        resources: [
                            { type: 'ammo', amount: 5, ammoType: 'powerCells', message: 'Temporal energy stored as Power Cells.' },
                            { type: 'ammo', amount: 4, ammoType: 'munitions', message: 'Crew fabricated munitions in dilated time.' },
                            { type: 'ammo', amount: 4, ammoType: 'dataCores', message: 'Extended analysis produced Data Cores.' },
                            { type: 'ammo', amount: 3, ammoType: 'repairKits', message: 'Medical synthesizers ran overtime.' },
                        ],
                        text: 'You park inside the pocket and let the crew work. What feels like hours to them is minutes to the outside universe. The ammunition stores swell significantly.',
                    },
                },
            ],
        },
        {
            title: 'Accretion Disk Salvage',
            description: 'The black hole\'s accretion disk is a graveyard of shattered ships and compressed matter, all spiraling toward oblivion. Among the debris, some things still glow with power.',
            choices: [
                {
                    text: 'Dive deep for the richest salvage',
                    outcome: {
                        resources: [
                            { type: 'relics', amount: 3, message: 'Compressed exotic matter — relics from beyond the event horizon\'s edge.' },
                            { type: 'ammo', amount: 3, ammoType: 'munitions', message: 'Ultra-dense projectiles formed by gravitational compression.' },
                        ],
                        text: 'The deeper you go, the more the gravity pulls. Your engines strain as you snatch compressed fragments from the disk. The material is impossibly dense — perfect for weaponry and utterly irreplaceable.',
                    },
                },
                {
                    text: 'Skim the outer edge safely',
                    outcome: {
                        buff: { name: 'Gravity Sling', description: '+35% combat damage for 5 minutes', type: 'combatDamage', magnitude: 0.35, durationMs: MIN5 },
                        text: 'You use the black hole\'s gravity to accelerate the Dawn to incredible speed. The velocity data feeds into your targeting computers — at these speeds, your weapons hit with devastating kinetic force.',
                    },
                },
                {
                    text: 'Study the accretion patterns',
                    outcome: {
                        buff: { name: 'Singularity Insight', description: '+50% insight generation for 5 minutes', type: 'insightRate', magnitude: 0.5, durationMs: MIN5 },
                        text: 'The physics at work here would take decades to study in a lab. Your instruments drink in data that rewrites several fundamental assumptions in the Dawn\'s science database.',
                    },
                },
            ],
        },
    ],
};

/**
 * @deprecated — jumps now cost fuel, not energy. Retained for any lingering UI
 * references; new code should import JUMP_FUEL_COST from content/bridgeFuel.
 */
export const JUMP_COSTS: Record<RegionType, number> = {
  void: JUMP_FUEL_COST,
  nebula: JUMP_FUEL_COST,
  asteroid: JUMP_FUEL_COST,
  deepspace: JUMP_FUEL_COST,
  blackhole: JUMP_FUEL_COST,
};

/** Get the REGION_DEFINITIONS key for a base region at a given tier.
 *  e.g. ("nebula", 1) → "nebula", ("nebula", 2) → "nebula-t2" */
export function getRegionKey(region: RegionType, tier: number): string {
  if (tier <= 1) return region;
  return `${region}-t${tier}`;
}

/**
 * System responsible for generating and managing encounters
 */
export class EncounterSystem {
    private eventBus?: EventBus<EventMap>;

    constructor(eventBus?: EventBus<EventMap>) {
        this.eventBus = eventBus;

        if (this.eventBus) {
            const bus = this.eventBus;
            bus.on('INITIATE_JUMP', (data) => {
                const { state } = data;

                // Compute the player's current region key
                const currentRegion = state.bridge.currentRegion;
                const currentTier = state.bridge.currentTier ?? 1;
                const currentRegionKey = getRegionKey(currentRegion, currentTier);

                // If there's a pending rematch AND we're in the same region the
                // retreat happened, force that enemy. Otherwise the rematch
                // remains queued and a normal jump occurs.
                if (state.encounters.pendingRematch && state.encounters.pendingRematch.regionKey === currentRegionKey) {
                    const { enemyId } = state.encounters.pendingRematch;
                    state.encounters.pendingRematch = undefined;

                    // No energy cost for rematch — you already paid
                    // Force a combat encounter with the same enemy
                    const encounter = this.generateEncounter(state);
                    encounter.type = 'combat';
                    state.encounters.active = true;
                    state.encounters.encounter = encounter;
                    bus.emit('START_COMBAT', { state, enemyId, regionId: currentRegion });
                    return;
                }

                // Deduct jump fuel cost — jumps are funded by the bridge
                // reservoir, not the reactor.
                if ((state.bridge.fuel ?? 0) < JUMP_FUEL_COST) {
                    // Not enough fuel — refuse the jump.
                    return;
                }
                state.bridge.fuel = Math.max(0, (state.bridge.fuel ?? 0) - JUMP_FUEL_COST);

                const encounter = this.generateEncounter(state);
                state.encounters.active = true;
                state.encounters.encounter = encounter;

                // If combat encounter, emit start combat
                if (encounter.type === 'combat') {
                    const combatEnemyId = this.generateRandomEnemyForRegion(currentRegionKey);
                    if (combatEnemyId) {
                        bus.emit('START_COMBAT', { state: state, enemyId: combatEnemyId, regionId: encounter.region });
                    }
                }
            });

            bus.on('COMPLETE_ENCOUNTER', (data) => {
                const { state, choiceId } = data;
                this.completeEncounter(state, choiceId);
            });
        }
    }
    
    /**
     * Generate an encounter based on the current region
     */
    generateEncounter(state: GameState): BaseEncounter {
        const region = state.bridge.currentRegion;
        Logger.debug(LogCategory.ACTIONS, `Generating encounter for region: ${region}`, LogContext.NONE);
        
        // Get encounter chances for the current region
        const encounterChances = REGION_ENCOUNTER_CHANCES[region] || 
            { combat: 0.3, empty: 0.5, narrative: 0.2 }; // Fallback values if region not found
        
        // Generate a random value to determine encounter type
        const randomValue = Math.random();
        
        // Determine the type of encounter based on region probabilities
        if (randomValue < encounterChances.combat) {
            // Combat encounter - delegate to the combat system
            return this.generateCombatEncounter(region);
        } else if (randomValue < encounterChances.combat + encounterChances.empty) {
            // Empty encounter
            return this.generateEmptyEncounter(region);
        } else {
            // Narrative/story encounter
            return this.generateStoryEncounter(region);
        }
    }
    
    /**
     * Generate an empty encounter
     */
    private generateEmptyEncounter(region: RegionType): EmptyEncounter {
        const message = getRandomEmptyEncounterMessage(region);
        const resources = generateEmptyEncounterRewards(region);
        
        return {
            id: uuidv4(),
            type: 'empty',
            title: getRandomEmptyEncounterTitle(region),
            description: getRandomEmptyEncounterDescription(region),
            region,
            message,
            resources
        };
    }
    
    /**
     * Story encounter pools — multiple events per region, randomly selected.
     * Rewards are buffs, ammo, relics, and rare resources instead of flat resource amounts.
     */
    private generateStoryEncounter(region: RegionType): StoryEncounter {
        const pools = STORY_POOLS[region] ?? STORY_POOLS['void'];
        const template = pools[Math.floor(Math.random() * pools.length)];

        return {
            id: uuidv4(),
            type: 'story',
            title: template.title,
            description: template.description,
            region,
            choices: template.choices.map(c => ({
                id: uuidv4(),
                text: c.text,
                outcome: { ...c.outcome, continuesToNextEncounter: true },
            })),
        };
    }
    
    /**
     * Apply rewards from an encounter to the game state
     */
    applyRewards(state: GameState, rewards: ResourceReward[]): GameState {
        Logger.debug(LogCategory.RESOURCES, `Applying ${rewards.length} rewards`, LogContext.NONE);

        const newState = { ...state };

        rewards.forEach(reward => {
            const { type, amount } = reward;

            switch (type) {
                case 'energy':
                    newState.categories.reactor.resources.primary = Math.min(
                        newState.categories.reactor.resources.primary + amount,
                        newState.categories.reactor.stats.primaryCapacity
                    );
                    break;

                case 'insight':
                    newState.categories.processor.resources.primary = Math.min(
                        newState.categories.processor.resources.primary + amount,
                        newState.categories.processor.stats.primaryCapacity
                    );
                    break;

                case 'crew':
                    if (amount >= 1) {
                        newState.categories.crewQuarters.resources.primary = Math.min(
                            newState.categories.crewQuarters.resources.primary + Math.floor(amount),
                            newState.categories.crewQuarters.stats.primaryCapacity
                        );
                    }
                    break;

                case 'scrap':
                    newState.categories.manufacturing.resources.primary = Math.min(
                        newState.categories.manufacturing.resources.primary + amount,
                        newState.categories.manufacturing.stats.primaryCapacity
                    );
                    break;

                case 'relics':
                    newState.relics += amount;
                    break;

                case 'ammo': {
                    const ammoId = reward.ammoType as AmmoTypeId;
                    if (ammoId && newState.ammo[ammoId]) {
                        const max = getAmmoMax(ammoId, newState.ammo[ammoId].tier);
                        newState.ammo[ammoId].current = Math.min(
                            newState.ammo[ammoId].current + amount,
                            max
                        );
                    }
                    break;
                }

                default:
                    Logger.warn(LogCategory.RESOURCES, `Unknown reward type: ${type}`, LogContext.NONE);
            }
        });

        return newState;
    }

    /**
     * Apply a timed buff to the game state
     */
    applyBuff(state: GameState, buffReward: BuffReward): GameState {
        if (!state.buffs) state.buffs = [];
        const buff: ActiveBuff = {
            id: uuidv4(),
            name: buffReward.name,
            description: buffReward.description,
            type: buffReward.type,
            magnitude: buffReward.magnitude,
            remainingMs: buffReward.durationMs,
            totalMs: buffReward.durationMs,
        };
        state.buffs.push(buff);
        return state;
    }
    
    /**
     * Complete the current encounter
     */
    completeEncounter(state: GameState, choiceId?: string): GameState {
        Logger.info(
            LogCategory.ACTIONS,
            'Completing encounter',
            LogContext.NONE
        );
        
        if (!state.encounters.active || !state.encounters.encounter) {
            Logger.warn(
                LogCategory.ACTIONS,
                'No active encounter to complete',
                LogContext.NONE
            );
            return state;
        }
        
        // Create a copy of the state to modify
        let newState = { ...state };
        
        // Get the current encounter
        const encounter = state.encounters.encounter;
        
        // Handle different encounter types
        if (encounter.type === 'empty') {
            const emptyEncounter = encounter as EmptyEncounter;
            if (emptyEncounter.resources && emptyEncounter.resources.length > 0) {
                newState = this.applyRewards(newState, emptyEncounter.resources);
            }
        } else if (encounter.type === 'story') {
            const storyEncounter = encounter as StoryEncounter;
            
            // Make sure a choice was made
            if (!choiceId) {
                Logger.warn(LogCategory.ACTIONS, 'No choice was made for story encounter', LogContext.NONE);
                return state;
            }
            
            // Find the selected choice
            const selectedChoice = storyEncounter.choices.find(choice => choice.id === choiceId);
            if (!selectedChoice) {
                Logger.warn(LogCategory.ACTIONS, `Invalid choice ID: ${choiceId}`, LogContext.NONE);
                return state;
            }
            
            // Apply rewards from the outcome if any
            if (selectedChoice.outcome.resources && selectedChoice.outcome.resources.length > 0) {
                newState = this.applyRewards(newState, selectedChoice.outcome.resources);
            }
            // Apply buff if any
            if (selectedChoice.outcome.buff) {
                newState = this.applyBuff(newState, selectedChoice.outcome.buff);
            }
        } else if (encounter.type === 'combat') {
            // Combat encounters will be handled by the CombatSystem
            
            // Log that we're starting combat
            Logger.info(
                LogCategory.COMBAT,
                'Combat encounter detected - initiating combat sequence',
                LogContext.COMBAT
            );
            
            // Get the combat encounter details
            const combatEncounter = encounter as BaseEncounter;
            
            // Extract region from the encounter, using tier for correct enemy pool
            const regionId = combatEncounter.region;
            const tier = newState.bridge.currentTier ?? 1;
            const regionKey = getRegionKey(regionId, tier);

            // Generate a random enemy from the region
            const enemyId = this.generateRandomEnemyForRegion(regionKey);
            
            if (enemyId && this.eventBus) {
                // Emit event to start combat
                this.eventBus.emit('START_COMBAT', { state: newState, enemyId, regionId });

                // Prepare state for combat UI
                newState.encounters.active = false;
                newState.encounters.encounter = undefined;
                newState.combat.active = true;

                // History is NOT recorded here — it's recorded on victory
                // so retreats don't count as progress
                return newState;
            }
        }
        
        // Record history with the tiered region key so T1/T2/T3 progress is tracked separately
        const histTier = newState.bridge.currentTier ?? 1;
        const histRegionKey = getRegionKey(encounter.region, histTier);

        // Add to encounter history
        newState.encounters.history = Array.isArray(newState.encounters.history)
          ? [
              ...newState.encounters.history,
              {
                  id: encounter.id,
                  type: encounter.type,
                  result: choiceId || 'completed',
                  date: Date.now(),
                  region: histRegionKey
              }
            ]
          : [
              {
                  id: encounter.id,
                  type: encounter.type,
                  result: choiceId || 'completed',
                  date: Date.now(),
                  region: histRegionKey
              }
            ];
        
        // Clear the active encounter
        newState.encounters.active = false;
        newState.encounters.encounter = undefined;
        
        return newState;
    }

    // Add a new method for generating combat encounters
    private generateCombatEncounter(region: string): BaseEncounter {
        const regionType = region as RegionType;
        
        // Region-specific encounter titles and descriptions
        const encounterDetails = {
            'void': {
                title: "Unknown Vessel Approaching",
                description: "Long-range sensors have detected an unidentified vessel approaching on an intercept course. The vessel is not responding to hails and appears to be powering weapons systems. The emptiness of the void offers little cover for evasive maneuvers."
            },
            'nebula': {
                title: "Ambush in the Nebula",
                description: "The dense nebula clouds suddenly part to reveal a hostile vessel lying in wait. The electromagnetic interference from the nebula masked their presence until now. Their weapons are charged and targeting systems locked onto the Dawn."
            },
            'asteroid': {
                title: "Mining Claim Dispute",
                description: "A rugged mining vessel emerges from behind a large asteroid, broadcasting territorial warnings. They claim this asteroid field as their exclusive mining territory and demand immediate departure or payment. Weapons systems are online and tracking the Dawn."
            },
            'deepspace': {
                title: "Deep Space Hunter",
                description: "A sleek combat vessel appears on sensors, accelerating toward the Dawn at high velocity. Its design suggests advanced technology and dedicated combat capabilities. No communication attempts have been made - their intentions appear hostile."
            },
            'blackhole': {
                title: "Guardians of the Singularity",
                description: "A strange vessel of unknown origin materializes near the event horizon. Its design defies conventional physics, suggesting either incredibly advanced technology or origins from beyond known space. They appear to be positioning to prevent the Dawn from approaching the black hole further."
            }
        };
        
        // Get region-specific details or use defaults
        const details = encounterDetails[regionType] || {
            title: "Hostile Encounter",
            description: "Sensors have detected a hostile entity approaching. Weapon signatures detected. Combat seems inevitable."
        };
        
        // Create a basic encounter structure that will be handled by the combat system
        return {
            id: `combat-${region}-${Date.now()}`,
            title: details.title,
            description: details.description,
            region: regionType,
            type: "combat"
        };
    }

    /**
     * Generate a random enemy for the given region key (e.g. "nebula", "nebula-t2")
     */
    private generateRandomEnemyForRegion(regionId: string): string | null {
        // Find the region definition - REGION_DEFINITIONS is a Record<string, RegionDefinition>
        const region = REGION_DEFINITIONS[regionId];
        
        if (!region || !region.enemyProbabilities || region.enemyProbabilities.length === 0) {
            Logger.warn(
                LogCategory.COMBAT,
                `No enemies defined for region ${regionId}`,
                LogContext.COMBAT
            );
            return null;
        }
        
        // Calculate total weight
        let totalWeight = 0;
        region.enemyProbabilities.forEach((enemy: { weight: number; enemyId: string }) => {
            totalWeight += enemy.weight;
        });
        
        // Select an enemy based on weights
        let randomValue = Math.random() * totalWeight;
        
        for (const enemy of region.enemyProbabilities) {
            randomValue -= enemy.weight;
            if (randomValue <= 0) {
                return enemy.enemyId;
            }
        }
        
        // Fallback to first enemy
        return region.enemyProbabilities[0].enemyId;
    }
} 
