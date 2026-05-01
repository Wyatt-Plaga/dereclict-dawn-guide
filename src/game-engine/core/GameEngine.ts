import { EventBus } from './EventBus';
import { EventMap } from '../types/events';
import { GameState, initialGameState, WingCategory } from '../types';
import { GameSystemManager } from '../systems';
import { GameAction } from '../types/actions';
import Logger, { LogCategory, LogContext } from '@/app/utils/logger';
import { SaveSystem } from './SaveSystem';
import { getCachedState, cacheState } from './memoryCache';
import { produce } from 'immer';

export class GameEngine {
    private state: GameState;
    public eventBus: EventBus<EventMap>;
    private systems: GameSystemManager;
    private lastTick: number;
    private isRunning: boolean;
    private saveSystem: SaveSystem;
    private loopInterval: ReturnType<typeof setInterval> | null = null;
    private beforeUnloadBound = false;
    private beforeUnloadHandler: (() => void) | null = null;

    constructor() {
        const cachedState = getCachedState();
        this.state = cachedState || initialGameState;

        this.eventBus = new EventBus<EventMap>();
        this.systems = new GameSystemManager(this.eventBus);
        this.saveSystem = new SaveSystem();

        // updateAllStats mutates — must run inside produce because the state
        // we just loaded (cached or initialGameState) may be frozen by immer
        // from a previous engine instance.
        this.state = produce(this.state, (draft) => {
            this.systems.upgrade.updateAllStats(draft as GameState);
        });

        this.lastTick = Date.now();
        this.isRunning = false;

        this.eventBus.on('DISPATCH_ACTION', (data) => {
            this.processAction(data as GameAction);
        });

        Logger.info(LogCategory.ENGINE, "Game engine initialized", LogContext.STARTUP);
    }

    public async initialize(): Promise<void> {
        await this.saveSystem.init();
        const savedGame = await this.loadGame();
        if (!savedGame) {
            this.start();
        }
    }

    start() {
        if (this.isRunning) return;

        this.isRunning = true;
        this.lastTick = Date.now();
        this.saveSystem.startAutoSave(() => this.getState(), 1000);
        this.loopInterval = setInterval(() => this.gameLoop(), 125);

        if (typeof window !== 'undefined' && !this.beforeUnloadBound) {
            this.beforeUnloadHandler = () => { this.saveGame(); };
            window.addEventListener('beforeunload', this.beforeUnloadHandler);
            window.addEventListener('pagehide', this.beforeUnloadHandler);
            this.beforeUnloadBound = true;
        }
    }

    stop() {
        this.saveGame();
        this.saveSystem.stopAutoSave();
        if (this.loopInterval) {
            clearInterval(this.loopInterval);
            this.loopInterval = null;
        }
        if (typeof window !== 'undefined' && this.beforeUnloadBound && this.beforeUnloadHandler) {
            window.removeEventListener('beforeunload', this.beforeUnloadHandler);
            window.removeEventListener('pagehide', this.beforeUnloadHandler);
            this.beforeUnloadBound = false;
            this.beforeUnloadHandler = null;
        }
        this.isRunning = false;
    }

    /** Kill the engine without saving — used for hard reset */
    destroy() {
        this.saveSystem.stopAutoSave();
        if (this.loopInterval) {
            clearInterval(this.loopInterval);
            this.loopInterval = null;
        }
        if (typeof window !== 'undefined' && this.beforeUnloadBound && this.beforeUnloadHandler) {
            window.removeEventListener('beforeunload', this.beforeUnloadHandler);
            window.removeEventListener('pagehide', this.beforeUnloadHandler);
            this.beforeUnloadBound = false;
            this.beforeUnloadHandler = null;
        }
        this.isRunning = false;
    }

    private gameLoop() {
        if (!this.isRunning) return;

        const now = Date.now();
        const delta = (now - this.lastTick) / 1000;

        this.tick(delta);
        this.lastTick = now;
    }

    private tick(delta: number) {
        const prevState = this.state;

        this.state = produce(this.state, (draft) => {
            draft.lastUpdate = Date.now();
            this.systems.update(draft as GameState, delta);
        });

        if (this.state !== prevState) {
            cacheState(this.state);
            this.eventBus.emit('stateUpdated', this.state);
        }
    }

    private processAction(action: GameAction) {
        this.state = produce(this.state, (draft) => {
            this.systems.processAction(draft as GameState, action);
        });

        cacheState(this.state);
        this.eventBus.emit('stateUpdated', this.state);
    }

    dispatch(action: GameAction) {
        this.eventBus.emit('DISPATCH_ACTION', action);
    }

    getState(): GameState {
        return this.state;
    }

    public async saveGame(): Promise<string> {
        cacheState(this.state);
        return await this.saveSystem.save(this.getState());
    }

    public loadPreset(preset: Partial<GameState>) {
        const init = initialGameState;

        const mergeWing = <T extends WingCategory>(base: T, over: Partial<T> | undefined): T => ({
            ...base,
            ...(over ?? {}),
            resources: { ...base.resources, ...(over?.resources ?? {}) },
            workers: { ...base.workers, ...(over?.workers ?? {}) },
            upgrades: { ...base.upgrades, ...(over?.upgrades ?? {}) },
            stats: { ...base.stats, ...(over?.stats ?? {}) },
            automated: { ...base.automated, ...(over?.automated ?? {}) },
        });

        const reactorPreset = preset.categories?.reactor;
        this.state = {
            ...init,
            ...preset,
            categories: {
                reactor: {
                    ...mergeWing(init.categories.reactor, reactorPreset),
                    specialUpgrades: {
                        ...init.categories.reactor.specialUpgrades,
                        ...(reactorPreset?.specialUpgrades ?? {}),
                    },
                },
                processor: mergeWing(init.categories.processor, preset.categories?.processor),
                crewQuarters: mergeWing(init.categories.crewQuarters, preset.categories?.crewQuarters),
                manufacturing: mergeWing(init.categories.manufacturing, preset.categories?.manufacturing),
            },
            workerGateLevel: preset.workerGateLevel ?? init.workerGateLevel,
            workers: { ...init.workers, ...(preset.workers ?? {}) },
            bridge: { ...init.bridge, ...(preset.bridge ?? {}) },
            encounters: { ...init.encounters, ...(preset.encounters ?? {}) },
            logs: { ...init.logs, ...(preset.logs ?? {}) },
            lastUpdate: Date.now(),
        };

        // Wrap in produce — the spread above shares inner refs with
        // initialGameState which immer may have frozen.
        this.state = produce(this.state, (draft) => {
            this.systems.upgrade.updateAllStats(draft as GameState);
        });
        cacheState(this.state);
        this.eventBus.emit('stateUpdated', this.state);
    }

    public async loadGame(): Promise<boolean> {
        const saveData = await this.saveSystem.load();
        if (!saveData) return false;

        const s = saveData.state as any;

        // Dev: any save predating the current laboratory schema is wiped (no migration).
        if ((s.version ?? 0) < 7) {
            return false;
        }

        // ─── V2 → V3 migration: global workerPool → per-wing workers ───
        if (s.workerPool && !('workerGateLevel' in s)) {
            s.workerGateLevel = 1;
            delete s.workerPool;
        }
        if (s.workerGateLevel === undefined) {
            s.workerGateLevel = 1;
        }

        const migrateWing = (cat: any, isReactor: boolean) => {
            // Ensure new resource shape (primary/secondary/tertiary)
            if (cat.resources && !('primary' in cat.resources)) {
                const oldResName = Object.keys(cat.resources)[0];
                const oldVal = cat.resources[oldResName] ?? 0;
                cat.resources = { primary: oldVal, secondary: 0, tertiary: 0 };
            }

            // Ensure workers
            if (!cat.workers) {
                cat.workers = { primary: 0, secondary: 0, tertiary: 0 };
            }

            // Migrate upgrades
            if (cat.upgrades && !('primaryCap' in cat.upgrades)) {
                cat.upgrades = {
                    primaryCap: 0, secondaryCap: 0, tertiaryCap: 0,
                    primaryEff: 0, secondaryEff: 0, tertiaryEff: 0,
                };
            }
            // Strip legacy per-wing worker fields
            delete cat.workerCount;
            if (cat.upgrades) delete cat.upgrades.workerCap;
            if (cat.stats) delete cat.stats.workerCapacity;

            // Default new speed-upgrade levels to 0 for older saves.
            if (cat.upgrades) {
                if (cat.upgrades.primarySpeed === undefined) cat.upgrades.primarySpeed = 0;
                if (cat.upgrades.secondarySpeed === undefined) cat.upgrades.secondarySpeed = 0;
                if (cat.upgrades.tertiarySpeed === undefined) cat.upgrades.tertiarySpeed = 0;
                if (cat.upgrades.quaternarySpeed === undefined) cat.upgrades.quaternarySpeed = 0;
            }

            // Ensure progression flags
            if (cat.secondaryUnlocked === undefined) cat.secondaryUnlocked = false;
            if (cat.tertiaryUnlocked === undefined) cat.tertiaryUnlocked = false;

            // Migrate automationEnabled (single bool) → automated (per-slot)
            if (cat.automated === undefined) {
                const wasAuto = cat.automationEnabled ?? false;
                cat.automated = { primary: wasAuto, secondary: wasAuto, tertiary: wasAuto };
                delete cat.automationEnabled;
            }

            // Ensure unlocked field
            if (cat.unlocked === undefined) {
                if (isReactor) {
                    cat.unlocked = true;
                } else {
                    cat.unlocked = (cat.upgrades?.unlocked || 0) > 0;
                }
            }

            // Ensure stats shape
            if (cat.stats && !('primaryCapacity' in cat.stats)) {
                cat.stats = {
                    primaryCapacity: 100, primaryRate: 0,
                    secondaryCapacity: 10, secondaryRate: 0,
                    tertiaryCapacity: 5, tertiaryRate: 0,
                };
            }

            // Reactor special upgrades
            if (isReactor && !cat.specialUpgrades) {
                cat.specialUpgrades = {
                    shielding: cat.upgrades?.shielding ?? 0,
                    shieldBoosts: cat.upgrades?.shieldBoosts ?? 0,
                    bridgeUnlocked: cat.upgrades?.bridgeUnlocked ?? 0,
                };
            }
        };

        if (s.categories) {
            migrateWing(s.categories.reactor, true);
            migrateWing(s.categories.processor, false);
            migrateWing(s.categories.crewQuarters, false);
            migrateWing(s.categories.manufacturing, false);
        }

        // ─── Laboratory.unlocked (added post-v7): default to "already built"
        //     for any save where the player previously had access to research
        //     so we don't silently strip features. ───
        if (s.laboratory && s.laboratory.unlocked === undefined) {
            s.laboratory.unlocked =
                s.laboratory.workerHiring ||
                s.laboratory.maxWorkersUpgrades ||
                s.laboratory.efficiencyUpgrades ||
                (s.laboratory.researched?.length ?? 0) > 0;
        }

        // ─── Bridge fuel fields (added post-v7) ───
        if (s.bridge) {
            // Bridge.unlocked default: prior saves that already had bridge progress
            // (any completed regions or fuel earned) keep access; everyone else
            // builds it explicitly via the reactor page.
            if (s.bridge.unlocked === undefined) {
                s.bridge.unlocked =
                    (s.bridge.completedRegions?.length ?? 0) > 0 ||
                    (s.bridge.fuel ?? 0) > 0 ||
                    (s.bridge.fuelPumpLevel ?? 0) > 0;
            }
            if (typeof s.bridge.fuel !== 'number' || !Number.isFinite(s.bridge.fuel)) s.bridge.fuel = 0;
            if (typeof s.bridge.fuelWorkers !== 'number' || !Number.isFinite(s.bridge.fuelWorkers)) s.bridge.fuelWorkers = 0;
            if (s.bridge.fuelAutomated === undefined) s.bridge.fuelAutomated = false;
            if (typeof s.bridge.fuelPumpLevel !== 'number' || !Number.isFinite(s.bridge.fuelPumpLevel)) s.bridge.fuelPumpLevel = 0;
            // Strip stale flag from earlier ignite-toggle iteration; the cycle
            // model uses manualFuelCycleStartMs.
            if ('manualFuelIgnited' in s.bridge) delete (s.bridge as { manualFuelIgnited?: boolean }).manualFuelIgnited;
            if (s.bridge.manualFuelCycleStartMs !== undefined &&
                (typeof s.bridge.manualFuelCycleStartMs !== 'number' || !Number.isFinite(s.bridge.manualFuelCycleStartMs))) {
                s.bridge.manualFuelCycleStartMs = undefined;
            }
        }

        // ─── Combat field migration (from previous session) ───
        if (s.combat) {
            const c = s.combat;
            if ('playerStunTimer' in c && !('playerStunTurns' in c)) {
                c.playerStunTurns = Math.ceil(c.playerStunTimer) || 0;
                delete c.playerStunTimer;
            }
            if ('radiationDecayTimer' in c && !('radiationDecayCounter' in c)) {
                c.radiationDecayCounter = Math.ceil(c.radiationDecayTimer) || 2;
                delete c.radiationDecayTimer;
            }
            if ('enemyCloakTimer' in c && !('enemyCloakTurns' in c)) {
                c.enemyCloakTurns = Math.ceil(c.enemyCloakTimer) || 0;
                delete c.enemyCloakTimer;
            }
            if (c.turnPhase === undefined) c.turnPhase = 'PLAYER_TURN';
            if (c.playerAP === undefined) c.playerAP = 3;
            if (c.maxPlayerAP === undefined) c.maxPlayerAP = 3;
            if (c.playerStunTurns === undefined) c.playerStunTurns = 0;
            if (c.radiationDecayCounter === undefined) c.radiationDecayCounter = 2;
            if (c.enemyCloakTurns === undefined) c.enemyCloakTurns = 0;
            if (c.radiationStacks === undefined) c.radiationStacks = 0;
            if (c.enemyCloaked === undefined) c.enemyCloaked = false;
            if (c.enemyCooldowns === undefined) c.enemyCooldowns = {};
        }

        this.state = s;
        cacheState(this.state);
        this.eventBus.emit('stateUpdated', this.state);

        if (!this.isRunning) {
            this.start();
        }
        return true;
    }
}
