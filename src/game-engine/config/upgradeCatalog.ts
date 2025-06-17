import { GameState } from '../types';
import { GameCategory } from '../types/actions';
import { ReactorConstants, ProcessorConstants, CrewQuartersConstants, ManufacturingConstants } from './gameConstants';

export interface UpgradeDef {
  resource: 'energy' | 'insight' | 'scrap' | 'crew' | 'relics';
  cost(state: GameState): number;
  incrementPath: string; // dot path to level number
  apply(state: GameState): void; // recalculate stats
}

export const UPGRADE_CATALOG: Record<GameCategory, Record<string, UpgradeDef>> = {
  reactor: {
    reactorExpansions: {
      resource: 'energy',
      cost: (s) =>
        Math.floor(
          s.categories.reactor.stats.energyCapacity * ReactorConstants.EXPANSION_COST_MULTIPLIER
        ),
      incrementPath: 'categories.reactor.upgrades.reactorExpansions',
      apply: (s) => {
        const lvl = s.categories.reactor.upgrades.reactorExpansions;
        s.categories.reactor.stats.energyCapacity =
          ReactorConstants.BASE_ENERGY_CAPACITY *
          Math.pow(ReactorConstants.ENERGY_CAPACITY_MULTIPLIER, lvl);
      }
    },
    energyConverters: {
      resource: 'energy',
      cost: (s) =>
        (s.categories.reactor.upgrades.energyConverters + 1) *
        ReactorConstants.CONVERTER_COST_BASE,
      incrementPath: 'categories.reactor.upgrades.energyConverters',
      apply: (s) => {
        const lvl = s.categories.reactor.upgrades.energyConverters;
        s.categories.reactor.stats.energyPerSecond =
          lvl * ReactorConstants.ENERGY_PER_CONVERTER;
      }
    },
    converterEfficiency: {
      resource: 'relics',
      cost: (s) => {
        const lvl = s.categories.reactor.upgrades.converterEfficiency ?? 0;
        return 10 * Math.pow(lvl + 1, 2);
      },
      incrementPath: 'categories.reactor.upgrades.converterEfficiency',
      apply: (s) => {
        const efficiency = s.categories.reactor.upgrades.converterEfficiency ?? 0;
        const base = s.categories.reactor.upgrades.energyConverters;
        s.categories.reactor.stats.energyPerSecond = base * (ReactorConstants.ENERGY_PER_CONVERTER + efficiency);
      }
    },
    shielding: {
      resource: 'relics',
      cost: () => 50,
      incrementPath: 'categories.reactor.upgrades.shielding',
      apply: (s) => {
        if (s.categories.reactor.upgrades.shielding) {
          s.combat.playerStats.maxShield = 50 + (s.categories.reactor.upgrades.shieldBoosts ?? 0) * 100;
          s.combat.playerStats.shield = s.combat.playerStats.maxShield;
        }
      }
    },
    shieldBoosts: {
      resource: 'relics',
      cost: (s) => {
        const lvl = s.categories.reactor.upgrades.shieldBoosts ?? 0;
        return 100 * Math.pow(lvl + 1, 2);
      },
      incrementPath: 'categories.reactor.upgrades.shieldBoosts',
      apply: (s) => {
        if (s.categories.reactor.upgrades.shielding) {
          const boosts = s.categories.reactor.upgrades.shieldBoosts ?? 0;
          s.combat.playerStats.maxShield = 50 + boosts * 100;
          s.combat.playerStats.shield = Math.min(s.combat.playerStats.shield, s.combat.playerStats.maxShield);
        }
      }
    },
    /* -------------------- Ship Wing Unlocks (cost: 1 relic) -------------------- */
    unlockProcessor: {
      resource: 'relics',
      cost: () => 1,
      incrementPath: 'categories.processor.upgrades.unlocked',
      apply: (_s) => { /* no-op */ }
    },
    unlockCrewQuarters: {
      resource: 'relics',
      cost: () => 1,
      incrementPath: 'categories.crewQuarters.upgrades.unlocked',
      apply: (_s) => { /* no-op */ }
    },
    unlockManufacturing: {
      resource: 'relics',
      cost: () => 1,
      incrementPath: 'categories.manufacturing.upgrades.unlocked',
      apply: (_s) => { /* no-op */ }
    },
    unlockNavigation: {
      resource: 'energy',
      cost: () => 200,
      incrementPath: 'categories.reactor.upgrades.navigationUnlocked',
      apply: (_s) => { /* no-op */ }
    }
  },
  processor: {
    mainframeExpansions: {
      resource: 'insight',
      cost: (s) =>
        Math.floor(
          s.categories.processor.stats.insightCapacity *
            ProcessorConstants.EXPANSION_COST_MULTIPLIER
        ),
      incrementPath: 'categories.processor.upgrades.mainframeExpansions',
      apply: (s) => {
        const lvl = s.categories.processor.upgrades.mainframeExpansions;
        s.categories.processor.stats.insightCapacity =
          ProcessorConstants.BASE_INSIGHT_CAPACITY *
          Math.pow(ProcessorConstants.INSIGHT_CAPACITY_MULTIPLIER, lvl);
      }
    },
    processingThreads: {
      resource: 'insight',
      cost: (s) =>
        (s.categories.processor.upgrades.processingThreads + 1) *
        ProcessorConstants.THREAD_COST_BASE,
      incrementPath: 'categories.processor.upgrades.processingThreads',
      apply: (s) => {
        const lvl = s.categories.processor.upgrades.processingThreads;
        s.categories.processor.stats.insightPerSecond =
          lvl * ProcessorConstants.INSIGHT_PER_THREAD;
      }
    },
    threadEfficiency: {
      resource: 'relics',
      cost: (s) => {
        const lvl = s.categories.processor.upgrades.threadEfficiency ?? 0;
        return 10 * Math.pow(lvl + 1, 2);
      },
      incrementPath: 'categories.processor.upgrades.threadEfficiency',
      apply: (s) => {
        const efficiency = s.categories.processor.upgrades.threadEfficiency ?? 0;
        const base = s.categories.processor.upgrades.processingThreads;
        s.categories.processor.stats.insightPerSecond = base * (ProcessorConstants.INSIGHT_PER_THREAD + efficiency);
      }
    }
  },
  crewQuarters: {
    additionalQuarters: {
      resource: 'crew',
      cost: (s) =>
        Math.floor(
          s.categories.crewQuarters.stats.crewCapacity *
            CrewQuartersConstants.QUARTERS_COST_MULTIPLIER
        ),
      incrementPath: 'categories.crewQuarters.upgrades.additionalQuarters',
      apply: (s) => {
        const lvl = s.categories.crewQuarters.upgrades.additionalQuarters;
        s.categories.crewQuarters.stats.crewCapacity =
          CrewQuartersConstants.BASE_CREW_CAPACITY +
          lvl * CrewQuartersConstants.QUARTERS_UPGRADE_CAPACITY_INCREASE;
      }
    },
    workerCrews: {
      resource: 'crew',
      cost: (s) =>
        Math.floor(
          (s.categories.crewQuarters.upgrades.workerCrews + 1) *
            CrewQuartersConstants.WORKER_CREW_COST_BASE
        ),
      incrementPath: 'categories.crewQuarters.upgrades.workerCrews',
      apply: (s) => {
        const lvl = s.categories.crewQuarters.upgrades.workerCrews;
        s.categories.crewQuarters.stats.crewPerSecond =
          lvl * CrewQuartersConstants.WORKER_CREW_PRODUCTION_RATE;
      }
    },
    crewEfficiency: {
      resource: 'relics',
      cost: (s) => {
        const lvl = s.categories.crewQuarters.upgrades.crewEfficiency ?? 0;
        return 10 * Math.pow(lvl + 1, 2);
      },
      incrementPath: 'categories.crewQuarters.upgrades.crewEfficiency',
      apply: (s) => {
        const efficiency = s.categories.crewQuarters.upgrades.crewEfficiency ?? 0;
        const base = s.categories.crewQuarters.upgrades.workerCrews;
        s.categories.crewQuarters.stats.crewPerSecond = base * (CrewQuartersConstants.WORKER_CREW_PRODUCTION_RATE + efficiency);
      }
    }
  },
  manufacturing: {
    cargoHoldExpansions: {
      resource: 'scrap',
      cost: (s) =>
        Math.floor(
          s.categories.manufacturing.stats.scrapCapacity *
            ManufacturingConstants.EXPANSION_COST_MULTIPLIER
        ),
      incrementPath: 'categories.manufacturing.upgrades.cargoHoldExpansions',
      apply: (s) => {
        const lvl = s.categories.manufacturing.upgrades.cargoHoldExpansions;
        s.categories.manufacturing.stats.scrapCapacity =
          ManufacturingConstants.BASE_SCRAP_CAPACITY *
          Math.pow(ManufacturingConstants.SCRAP_CAPACITY_MULTIPLIER, lvl);
      }
    },
    manufacturingBays: {
      resource: 'scrap',
      cost: (s) =>
        (s.categories.manufacturing.upgrades.manufacturingBays + 1) *
        ManufacturingConstants.BAY_COST_BASE,
      incrementPath: 'categories.manufacturing.upgrades.manufacturingBays',
      apply: (s) => {
        const lvl = s.categories.manufacturing.upgrades.manufacturingBays;
        s.categories.manufacturing.stats.scrapPerSecond =
          lvl * ManufacturingConstants.SCRAP_PER_BAY;
      }
    },
    bayEfficiency: {
      resource: 'relics',
      cost: (s) => {
        const lvl = s.categories.manufacturing.upgrades.bayEfficiency ?? 0;
        return 10 * Math.pow(lvl + 1, 2);
      },
      incrementPath: 'categories.manufacturing.upgrades.bayEfficiency',
      apply: (s) => {
        const efficiency = s.categories.manufacturing.upgrades.bayEfficiency ?? 0;
        const base = s.categories.manufacturing.upgrades.manufacturingBays;
        s.categories.manufacturing.stats.scrapPerSecond = base * (ManufacturingConstants.SCRAP_PER_BAY + efficiency);
      }
    }
  }
}; 
