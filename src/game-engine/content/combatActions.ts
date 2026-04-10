import { CombatActionCategory, CombatActionDefinition, EnemyActionDefinition } from '../types/combat';

/**
 * Player actions — cooldowns in seconds.
 * These are placeholder until the equipment system (Phase 3) replaces them.
 */
export const PLAYER_ACTIONS: Record<string, CombatActionDefinition> = {
  "raise-shields": {
    id: "raise-shields",
    name: "Raise Shields",
    description: "Bolster your defenses against incoming attacks",
    category: CombatActionCategory.SHIELD,
    cost: { type: "energy", amount: 10 },
    shieldRepair: 15,
    apCost: 1,
    cooldown: 3
  },
  "energy-pulse": {
    id: "energy-pulse",
    name: "Energy Pulse",
    description: "Basic reactor-powered energy discharge",
    category: CombatActionCategory.WEAPON,
    cost: { type: "energy", amount: 15 },
    damage: 15,
    apCost: 1,
    cooldown: 2
  },
  "plasma-cannon": {
    id: "plasma-cannon",
    name: "Plasma Cannon",
    description: "Direct energy attack on enemy systems",
    category: CombatActionCategory.WEAPON,
    cost: { type: "scrap", amount: 15 },
    damage: 20,
    apCost: 2,
    cooldown: 3
  },
  "missile-barrage": {
    id: "missile-barrage",
    name: "Missile Barrage",
    description: "Launch explosive projectiles at enemy hull",
    category: CombatActionCategory.WEAPON,
    cost: { type: "scrap", amount: 25 },
    damage: 35,
    apCost: 3,
    cooldown: 5
  },
  "hull-repair": {
    id: "hull-repair",
    name: "Hull Repair",
    description: "Patch damaged sections of the ship's hull",
    category: CombatActionCategory.REPAIR,
    cost: { type: "crew", amount: 2 },
    hullRepair: 15,
    apCost: 1,
    cooldown: 4
  },
  "shield-recharge": {
    id: "shield-recharge",
    name: "Shield Recharge",
    description: "Divert power to the ship's shield generators",
    category: CombatActionCategory.REPAIR,
    cost: { type: "crew", amount: 3 },
    shieldRepair: 20,
    apCost: 1,
    cooldown: 4
  },
  "scan": {
    id: "scan",
    name: "Scan",
    description: "Hack enemy systems to reveal ability details",
    category: CombatActionCategory.SABOTAGE,
    cost: { type: "insight", amount: 5 },
    statusEffect: { type: "EXPOSE", duration: 4, magnitude: 1 },
    apCost: 1,
    cooldown: 3
  },
  "sabotage": {
    id: "sabotage",
    name: "Sabotage",
    description: "Disrupt enemy systems with targeted data packets",
    category: CombatActionCategory.SABOTAGE,
    cost: { type: "insight", amount: 8 },
    damage: 10,
    statusEffect: { type: "WEAKEN", duration: 3, magnitude: 0.2 },
    apCost: 2,
    cooldown: 8
  },
};

/**
 * Enemy actions — real-time cooldowns in seconds.
 * hullDamage hits hull directly, shieldDamage hits shields directly.
 */
export const ENEMY_ACTIONS: Record<string, EnemyActionDefinition> = {
  // ======================== VOID ========================
  "sputtering-phaser": {
    id: "sputtering-phaser",
    name: "Sputtering Phaser",
    description: "A barely-functional energy weapon. Flickers more than it fires.",
    hullDamage: 3,
    shieldDamage: 5,
    cooldown: 2,
    useCondition: { type: "ALWAYS" }
  },
  "low-yield-torpedo": {
    id: "low-yield-torpedo",
    name: "Low-yield Torpedo",
    description: "A dented warhead launched with questionable accuracy.",
    hullDamage: 8,
    shieldDamage: 3,
    cooldown: 3,
    useCondition: { type: "ALWAYS" }
  },
  "broken-distress-signal": {
    id: "broken-distress-signal",
    name: "Activate Broken Distress Signal",
    description: "Emits a garbled signal. Nobody is coming.",
    cooldown: 3,
    useCondition: { type: "ALWAYS" }
  },
  "rend": {
    id: "rend",
    name: "Rend",
    description: "Tears at the hull with makeshift claws.",
    hullDamage: 8,
    shieldDamage: 4,
    cooldown: 2,
    useCondition: { type: "ALWAYS" }
  },
  "chomp": {
    id: "chomp",
    name: "Chomp",
    description: "A vicious bite that targets weakened prey.",
    hullDamage: 20,
    shieldDamage: 5,
    cooldown: 3,
    useCondition: { type: "PLAYER_HEALTH_BELOW", threshold: 0.3 },
    conditionLabel: "Only when target hull < 30%"
  },

  // --- Void Boss: Guttersnipe King ---
  "junk-cannon": {
    id: "junk-cannon",
    name: "Junk Cannon",
    description: "Fires a compacted ball of salvage. Inaccurate but surprisingly painful.",
    hullDamage: 10,
    shieldDamage: 8,
    cooldown: 3,
    useCondition: { type: "ALWAYS" }
  },
  "ramming-prow": {
    id: "ramming-prow",
    name: "Ramming Prow",
    description: "Accelerates the entire barge into the target. Subtlety was never an option.",
    hullDamage: 15,
    shieldDamage: 5,
    cooldown: 4,
    useCondition: { type: "ALWAYS" }
  },
  "salvage-flare": {
    id: "salvage-flare",
    name: "Salvage Flare",
    description: "Launches burning refuse. More annoying than dangerous — unless you're already damaged.",
    hullDamage: 5,
    shieldDamage: 12,
    cooldown: 3,
    useCondition: { type: "ALWAYS" }
  },

  // ======================== NEBULA — T1: Stellar Nursery ========================

  // --- Infant Nebula Feeder ---
  "shield-siphon": {
    id: "shield-siphon",
    name: "Shield Siphon",
    description: "Latches onto shield frequencies and drains energy directly into itself.",
    shieldDamage: 20,
    selfShieldHeal: 10,
    cooldown: 2,
    useCondition: { type: "PLAYER_HAS_SHIELDS" },
    conditionLabel: "Only when target has shields"
  },
  "nebula-stun": {
    id: "nebula-stun",
    name: "Bioelectric Shock",
    description: "Releases a pulse of bioelectric energy. Overloads ship systems temporarily.",
    shieldDamage: 5,
    hullDamage: 3,
    stunDuration: 3,
    cooldown: 15,
    useCondition: { type: "ALWAYS" }
  },
  "feeder-claw": {
    id: "feeder-claw",
    name: "Claw",
    description: "Rakes the hull with bioluminescent talons. Glows brighter the more it feeds.",
    hullDamage: 12,
    shieldDamage: 5,
    cooldown: 2,
    useCondition: { type: "ALWAYS" }
  },

  // --- Plasma Wisp ---
  "sputtering-burst": {
    id: "sputtering-burst",
    name: "Sputtering Burst",
    description: "Rapid but weak discharges of ionized plasma. Death by a thousand sparks.",
    hullDamage: 3,
    shieldDamage: 4,
    cooldown: 2,
    useCondition: { type: "ALWAYS" }
  },
  "self-implosion": {
    id: "self-implosion",
    name: "Self-Implosion",
    description: "Collapses inward then detonates violently. Only targets unshielded prey.",
    hullDamage: 30,
    shieldDamage: 5,
    selfDamage: 20,
    cooldown: 6,
    useCondition: { type: "PLAYER_NO_SHIELDS" },
    conditionLabel: "Only when target has no shields"
  },

  // --- Nebula Jellyfish ---
  "electric-sting": {
    id: "electric-sting",
    name: "Electric Sting",
    description: "Tentacles discharge stored electricity on contact. Disrupts unshielded systems.",
    shieldDamage: 18,
    hullDamage: 8,
    stunDuration: 1,
    cooldown: 3,
    useCondition: { type: "ALWAYS" }
  },
  "nebula-pulse": {
    id: "nebula-pulse",
    name: "Nebula Pulse",
    description: "Draws ambient energy from the nebula to restore its protective membrane.",
    selfShieldHeal: 12,
    cooldown: 4,
    useCondition: { type: "ALWAYS" }
  },

  // --- T1 Boss: Mother Nebula Feeder ---
  "nebula-drain": {
    id: "nebula-drain",
    name: "Nebula Drain",
    description: "A massive siphon tendril that drains shields at terrifying speed.",
    shieldDamage: 30,
    selfShieldHeal: 15,
    cooldown: 3,
    useCondition: { type: "PLAYER_HAS_SHIELDS" },
    conditionLabel: "Only when target has shields"
  },
  "birth-cry": {
    id: "birth-cry",
    name: "Birth Cry",
    description: "An ear-splitting frequency that disrupts all electronic systems.",
    shieldDamage: 10,
    hullDamage: 5,
    stunDuration: 3,
    cooldown: 10,
    useCondition: { type: "ALWAYS" }
  },
  "tendril-lash": {
    id: "tendril-lash",
    name: "Tendril Lash",
    description: "Whips a massive feeding tendril across the hull. Leaves deep gouges.",
    hullDamage: 18,
    shieldDamage: 8,
    cooldown: 3,
    useCondition: { type: "ALWAYS" }
  },
  "nebular-regeneration": {
    id: "nebular-regeneration",
    name: "Nebular Regeneration",
    description: "Draws energy from the surrounding gas clouds to restore its membrane.",
    selfShieldHeal: 20,
    cooldown: 6,
    useCondition: { type: "ALWAYS" }
  },

  // ======================== NEBULA — T2: Ionized Mists ========================

  // --- Juvenile Nebula Feeder ---
  "evolved-siphon": {
    id: "evolved-siphon",
    name: "Evolved Siphon",
    description: "A refined feeding mechanism. Strips shields with surgical precision.",
    shieldDamage: 25,
    selfShieldHeal: 15,
    cooldown: 2,
    useCondition: { type: "PLAYER_HAS_SHIELDS" },
    conditionLabel: "Only when target has shields"
  },
  "electrical-pulse": {
    id: "electrical-pulse",
    name: "Electrical Pulse",
    description: "Emits a concentrated electromagnetic burst. Fries circuits and stuns systems.",
    shieldDamage: 8,
    hullDamage: 5,
    stunDuration: 2,
    cooldown: 8,
    useCondition: { type: "ALWAYS" }
  },
  "barbed-tendril": {
    id: "barbed-tendril",
    name: "Barbed Tendril",
    description: "Evolved feeding appendage with hooked barbs. Tears hull plating on withdrawal.",
    hullDamage: 18,
    shieldDamage: 8,
    cooldown: 2,
    useCondition: { type: "ALWAYS" }
  },

  // --- Ion Wraith ---
  "ion-bolt": {
    id: "ion-bolt",
    name: "Ion Bolt",
    description: "A concentrated lance of ionized particles. Damages shields and hull equally.",
    shieldDamage: 20,
    hullDamage: 15,
    cooldown: 3,
    useCondition: { type: "ALWAYS" }
  },
  "shield-leech": {
    id: "shield-leech",
    name: "Shield Leech",
    description: "Drains shield energy through direct contact. Converts stolen energy to its own defenses.",
    shieldDamage: 30,
    selfShieldHeal: 20,
    cooldown: 4,
    useCondition: { type: "PLAYER_HAS_SHIELDS" },
    conditionLabel: "Only when target has shields"
  },
  "phase-pulse": {
    id: "phase-pulse",
    name: "Phase Pulse",
    description: "A ghostly energy wave that passes through matter. Low damage but unavoidable.",
    hullDamage: 8,
    shieldDamage: 6,
    cooldown: 2,
    useCondition: { type: "ALWAYS" }
  },

  // --- Luminous Parasite Swarm ---
  "drain-pulse": {
    id: "drain-pulse",
    name: "Drain Pulse",
    description: "Rapid micro-drains from thousands of parasites. Each one takes so little, but together...",
    shieldDamage: 8,
    hullDamage: 3,
    cooldown: 1,
    useCondition: { type: "ALWAYS" }
  },
  "swarm-regeneration": {
    id: "swarm-regeneration",
    name: "Swarm Regeneration",
    description: "The swarm draws together, sharing stolen energy to rebuild their collective barrier.",
    selfShieldHeal: 15,
    cooldown: 4,
    useCondition: { type: "ALWAYS" }
  },
  "parasitic-burst": {
    id: "parasitic-burst",
    name: "Parasitic Burst",
    description: "Without shields to feed on, the swarm burrows directly into the hull.",
    hullDamage: 22,
    shieldDamage: 5,
    cooldown: 3,
    useCondition: { type: "PLAYER_NO_SHIELDS" },
    conditionLabel: "Only when target has no shields"
  },

  // --- T2 Boss: Mother of the Mists ---
  "ionic-lash": {
    id: "ionic-lash",
    name: "Ionic Lash",
    description: "A whip of supercharged ions. Sears through shields and stuns exposed systems.",
    shieldDamage: 35,
    hullDamage: 20,
    stunDuration: 2,
    cooldown: 4,
    useCondition: { type: "ALWAYS" }
  },
  "mist-siphon": {
    id: "mist-siphon",
    name: "Mist Siphon",
    description: "Envelops the target in ionized mist, dissolving shield energy at a molecular level.",
    shieldDamage: 50,
    selfShieldHeal: 30,
    cooldown: 5,
    useCondition: { type: "PLAYER_HAS_SHIELDS" },
    conditionLabel: "Only when target has shields"
  },
  "shroud": {
    id: "shroud",
    name: "Shroud",
    description: "Wraps itself in layers of dense nebula gas. A living shield of ionized cloud.",
    selfShieldHeal: 40,
    cooldown: 6,
    useCondition: { type: "ALWAYS" }
  },
  "ionizing-gale": {
    id: "ionizing-gale",
    name: "Ionizing Gale",
    description: "Exhales a stream of charged particles. Sustained low damage that wears down defenses.",
    hullDamage: 8,
    shieldDamage: 10,
    cooldown: 1,
    useCondition: { type: "ALWAYS" }
  },

  // ======================== NEBULA — T3: Pillars of Creation ========================

  // --- Adult Nebula Feeder ---
  "massive-siphon": {
    id: "massive-siphon",
    name: "Massive Siphon",
    description: "Fully matured feeding organ. Rips entire shield arrays apart in seconds.",
    shieldDamage: 45,
    selfShieldHeal: 25,
    cooldown: 3,
    useCondition: { type: "PLAYER_HAS_SHIELDS" },
    conditionLabel: "Only when target has shields"
  },
  "electrical-nova": {
    id: "electrical-nova",
    name: "Electrical Nova",
    description: "Detonates stored bioelectric energy in all directions. Everything nearby suffers.",
    shieldDamage: 30,
    hullDamage: 30,
    stunDuration: 2,
    cooldown: 8,
    useCondition: { type: "ALWAYS" }
  },
  "feeding-frenzy": {
    id: "feeding-frenzy",
    name: "Feeding Frenzy",
    description: "A savage flurry of tendrils and teeth. The feeder has lost all restraint.",
    hullDamage: 20,
    shieldDamage: 15,
    cooldown: 2,
    useCondition: { type: "ALWAYS" }
  },

  // --- Stellar Embryo ---
  "proto-flare": {
    id: "proto-flare",
    name: "Proto-Flare",
    description: "Ejections of superheated plasma from a forming star. Devastating at close range.",
    shieldDamage: 20,
    hullDamage: 18,
    cooldown: 3,
    useCondition: { type: "ALWAYS" }
  },
  "stellar-pulse": {
    id: "stellar-pulse",
    name: "Stellar Pulse",
    description: "Draws hydrogen from the surrounding gas to feed its nuclear core. Shields regenerate rapidly.",
    selfShieldHeal: 20,
    cooldown: 3,
    useCondition: { type: "ALWAYS" }
  },
  "gravity-grasp": {
    id: "gravity-grasp",
    name: "Gravity Grasp",
    description: "Its growing mass generates localized gravity fields. Pins the target in place.",
    hullDamage: 35,
    shieldDamage: 10,
    stunDuration: 2,
    cooldown: 6,
    useCondition: { type: "ALWAYS" }
  },

  // --- Prismatic Cnidarian ---
  "prismatic-sting": {
    id: "prismatic-sting",
    name: "Prismatic Sting",
    description: "Tentacles discharge in rapid succession. Each sting is small, but the rhythm is relentless.",
    shieldDamage: 22,
    hullDamage: 10,
    stunDuration: 1,
    cooldown: 2,
    useCondition: { type: "ALWAYS" }
  },
  "chromatic-drain": {
    id: "chromatic-drain",
    name: "Chromatic Drain",
    description: "Refracts shield energy through crystalline tendrils, stealing it wavelength by wavelength.",
    shieldDamage: 35,
    selfShieldHeal: 20,
    cooldown: 3,
    useCondition: { type: "PLAYER_HAS_SHIELDS" },
    conditionLabel: "Only when target has shields"
  },
  "prismatic-barrier": {
    id: "prismatic-barrier",
    name: "Prismatic Barrier",
    description: "Crystallizes ambient nebula gases into a light-refracting shield.",
    selfShieldHeal: 25,
    cooldown: 5,
    useCondition: { type: "ALWAYS" }
  },

  // --- T3 Boss: Mother of Stars ---
  "absorb-energy": {
    id: "absorb-energy",
    name: "Absorb Energy",
    description: "Consumes shield energy on a massive scale. It is building something inside itself.",
    shieldDamage: 60,
    selfShieldHeal: 40,
    cooldown: 4,
    useCondition: { type: "PLAYER_HAS_SHIELDS" },
    conditionLabel: "Only when target has shields"
  },
  "stellar-wind": {
    id: "stellar-wind",
    name: "Stellar Wind",
    description: "A constant stream of charged particles from its proto-stellar core. Never stops.",
    shieldDamage: 15,
    hullDamage: 15,
    cooldown: 2,
    useCondition: { type: "ALWAYS" }
  },
  "forge-anew": {
    id: "forge-anew",
    name: "Forge Anew",
    description: "Without shields, there is nothing between you and the heart of a forming star.",
    hullDamage: 70,
    shieldDamage: 10,
    cooldown: 8,
    useCondition: { type: "PLAYER_NO_SHIELDS" },
    conditionLabel: "Only when target has no shields"
  },
  "birth-of-a-star": {
    id: "birth-of-a-star",
    name: "Birth of a Star",
    description: "Nuclear fusion ignites. The light of creation fills everything. There is nowhere to hide.",
    shieldDamage: 80,
    hullDamage: 80,
    cooldown: 15,
    useCondition: { type: "PLAYER_HEALTH_BELOW", threshold: 0.4 },
    conditionLabel: "Only when target hull < 40%"
  },

  // ======================== RADIATION — T1: Exclusion Zone ========================

  // --- Flicker Drone ---
  "flicker-shot": {
    id: "flicker-shot",
    name: "Flicker Shot",
    description: "A distorted energy pulse fired from shifting coordinates. Hard to track, harder to dodge.",
    hullDamage: 8,
    shieldDamage: 6,
    radiationStacks: 1,
    cooldown: 2,
    useCondition: { type: "ALWAYS" }
  },
  "phase-cloak": {
    id: "phase-cloak",
    name: "Phase Cloak",
    description: "Shifts into an adjacent frequency. Sensors read nothing but static.",
    cloakDuration: 4,
    cooldown: 10,
    useCondition: { type: "ALWAYS" }
  },

  // --- Isotope Crawler ---
  "contaminate": {
    id: "contaminate",
    name: "Contaminate",
    description: "Leaks radioactive isotopes onto your hull. The Geiger counter starts clicking faster.",
    hullDamage: 5,
    shieldDamage: 3,
    radiationStacks: 3,
    cooldown: 5,
    useCondition: { type: "ALWAYS" }
  },
  "irradiated-bite": {
    id: "irradiated-bite",
    name: "Irradiated Bite",
    description: "Gnaws through hull plating with mandibles coated in radioactive residue.",
    hullDamage: 12,
    shieldDamage: 4,
    radiationStacks: 1,
    cooldown: 3,
    useCondition: { type: "ALWAYS" }
  },

  // --- Signal Moth ---
  "frequency-jam": {
    id: "frequency-jam",
    name: "Frequency Jam",
    description: "Broadcasts on all frequencies simultaneously. Weapon targeting locks up.",
    stunDuration: 2,
    shieldDamage: 5,
    cooldown: 8,
    useCondition: { type: "ALWAYS" }
  },
  "static-discharge": {
    id: "static-discharge",
    name: "Static Discharge",
    description: "Releases accumulated electromagnetic interference in a directed burst.",
    hullDamage: 10,
    shieldDamage: 8,
    cooldown: 2,
    useCondition: { type: "ALWAYS" }
  },

  // --- T1 Boss: Warden Null-Seven ---
  "containment-beam": {
    id: "containment-beam",
    name: "Containment Beam",
    description: "Military-grade suppression weapon. Designed to neutralize contaminated vessels.",
    hullDamage: 15,
    shieldDamage: 12,
    radiationStacks: 2,
    cooldown: 3,
    useCondition: { type: "ALWAYS" }
  },
  "warden-cloak": {
    id: "warden-cloak",
    name: "Stealth Protocol",
    description: "Activates military cloaking. Only visible to irradiated targets — their glow gives the Warden a target.",
    cloakDuration: 5,
    cooldown: 12,
    useCondition: { type: "PLAYER_RADIATION_ABOVE", threshold: 3 },
    conditionLabel: "Only when target has 3+ radiation stacks"
  },
  "purge-lance": {
    id: "purge-lance",
    name: "Purge Lance",
    description: "A focused decontamination laser. Originally designed to sterilize, now weaponized.",
    hullDamage: 25,
    shieldDamage: 10,
    cooldown: 5,
    useCondition: { type: "ALWAYS" }
  },
  "quarantine-pulse": {
    id: "quarantine-pulse",
    name: "Quarantine Pulse",
    description: "Emergency lockdown signal. Shuts down all external systems temporarily.",
    stunDuration: 3,
    shieldDamage: 8,
    radiationStacks: 1,
    cooldown: 10,
    useCondition: { type: "ALWAYS" }
  },

  // ======================== RADIATION — T2: Dead Signal ========================

  // --- Cascade Drone ---
  "cascade-bolt": {
    id: "cascade-bolt",
    name: "Cascade Bolt",
    description: "Fires an irradiated projectile that destabilizes on impact. More dangerous to the already contaminated.",
    hullDamage: 12,
    shieldDamage: 10,
    radiationStacks: 2,
    cooldown: 3,
    useCondition: { type: "ALWAYS" }
  },
  "feedback-spike": {
    id: "feedback-spike",
    name: "Feedback Spike",
    description: "Exploits existing radiation contamination to amplify damage. The more stacks, the worse it gets.",
    hullDamage: 35,
    shieldDamage: 15,
    cooldown: 5,
    useCondition: { type: "PLAYER_RADIATION_ABOVE", threshold: 5 },
    conditionLabel: "Only when target has 5+ radiation stacks"
  },

  // --- Phantom Repeater ---
  "ghost-signal": {
    id: "ghost-signal",
    name: "Ghost Signal",
    description: "Broadcasts false sensor readings. Your targeting computer is chasing phantoms.",
    hullDamage: 8,
    shieldDamage: 10,
    radiationStacks: 1,
    cooldown: 2,
    useCondition: { type: "ALWAYS" }
  },
  "phantom-cloak": {
    id: "phantom-cloak",
    name: "Phantom Cloak",
    description: "Disappears into the signal noise. Only a direct scan can cut through the interference.",
    cloakDuration: 5,
    cooldown: 8,
    useCondition: { type: "ALWAYS" }
  },
  "signal-overload": {
    id: "signal-overload",
    name: "Signal Overload",
    description: "Floods all communication channels simultaneously. Systems lock up under the data deluge.",
    stunDuration: 3,
    shieldDamage: 12,
    cooldown: 10,
    useCondition: { type: "ALWAYS" }
  },

  // --- Rad-Hulk ---
  "rad-slam": {
    id: "rad-slam",
    name: "Rad-Slam",
    description: "A massive irradiated fist. The impact is bad. The contamination is worse.",
    hullDamage: 20,
    shieldDamage: 8,
    radiationStacks: 2,
    cooldown: 3,
    useCondition: { type: "ALWAYS" }
  },
  "isotope-leak": {
    id: "isotope-leak",
    name: "Isotope Leak",
    description: "Cracks in its hull vent radioactive material. Being near it is a death sentence.",
    radiationStacks: 4,
    hullDamage: 5,
    cooldown: 6,
    useCondition: { type: "ALWAYS" }
  },
  "critical-mass": {
    id: "critical-mass",
    name: "Critical Mass",
    description: "When enough radiation saturates the area, the Hulk channels it into a devastating blast.",
    hullDamage: 45,
    shieldDamage: 20,
    cooldown: 7,
    useCondition: { type: "PLAYER_RADIATION_ABOVE", threshold: 10 },
    conditionLabel: "Only when target has 10+ radiation stacks"
  },

  // --- T2 Boss: Dr. Echo ---
  "echo-pulse": {
    id: "echo-pulse",
    name: "Echo Pulse",
    description: "A resonating frequency that bounces between hull sections, amplifying with each reflection.",
    hullDamage: 18,
    shieldDamage: 15,
    radiationStacks: 2,
    cooldown: 3,
    useCondition: { type: "ALWAYS" }
  },
  "thesis-broadcast": {
    id: "thesis-broadcast",
    name: "Thesis Broadcast",
    description: "Dr. Echo broadcasts its research findings. The data itself is radioactive.",
    radiationStacks: 4,
    shieldDamage: 10,
    stunDuration: 2,
    cooldown: 6,
    useCondition: { type: "ALWAYS" }
  },
  "echo-cloak": {
    id: "echo-cloak",
    name: "Echo Cloak",
    description: "Disperses into overlapping signal echoes. Which one is real? None of them. All of them.",
    cloakDuration: 6,
    cooldown: 14,
    useCondition: { type: "ALWAYS" }
  },
  "frequency-lock": {
    id: "frequency-lock",
    name: "Frequency Lock",
    description: "Locks onto the target's operating frequency. The next strike will be precisely calibrated.",
    hullDamage: 40,
    shieldDamage: 20,
    cooldown: 5,
    useCondition: { type: "PLAYER_RADIATION_ABOVE", threshold: 5 },
    conditionLabel: "Only when target has 5+ radiation stacks"
  },

  // ======================== RADIATION — T3: Ground Zero ========================

  // --- Decay Angel ---
  "radiant-touch": {
    id: "radiant-touch",
    name: "Radiant Touch",
    description: "A gentle caress of pure radiation. Beautiful and absolutely lethal.",
    hullDamage: 15,
    shieldDamage: 15,
    radiationStacks: 3,
    cooldown: 2,
    useCondition: { type: "ALWAYS" }
  },
  "angel-cloak": {
    id: "angel-cloak",
    name: "Decay Shroud",
    description: "Wraps itself in a halo of decaying particles. Invisible to conventional sensors.",
    cloakDuration: 5,
    cooldown: 10,
    useCondition: { type: "ALWAYS" }
  },
  "half-life": {
    id: "half-life",
    name: "Half-Life",
    description: "Everything it touches decays. Shields crumble. Hull corrodes. Systems fail.",
    hullDamage: 30,
    shieldDamage: 25,
    stunDuration: 2,
    radiationStacks: 2,
    cooldown: 5,
    useCondition: { type: "ALWAYS" }
  },

  // --- Null Worm ---
  "null-bite": {
    id: "null-bite",
    name: "Null Bite",
    description: "Teeth that exist in a state of nuclear decay. What they touch ceases to be.",
    hullDamage: 25,
    shieldDamage: 10,
    radiationStacks: 2,
    cooldown: 3,
    useCondition: { type: "ALWAYS" }
  },
  "radiation-flood": {
    id: "radiation-flood",
    name: "Radiation Flood",
    description: "Opens specialized glands that vent concentrated radioactive material. The area becomes uninhabitable.",
    radiationStacks: 5,
    hullDamage: 8,
    cooldown: 5,
    useCondition: { type: "ALWAYS" }
  },
  "death-bloom": {
    id: "death-bloom",
    name: "Death Bloom",
    description: "A final burst of accumulated radiation. Everything in the vicinity takes catastrophic damage.",
    hullDamage: 50,
    shieldDamage: 30,
    radiationStacks: 3,
    cooldown: 8,
    useCondition: { type: "PLAYER_RADIATION_ABOVE", threshold: 8 },
    conditionLabel: "Only when target has 8+ radiation stacks"
  },

  // --- Geiger Wraith ---
  "geiger-pulse": {
    id: "geiger-pulse",
    name: "Geiger Pulse",
    description: "The clicking of a Geiger counter made manifest. Each click is a burst of radiation.",
    shieldDamage: 18,
    hullDamage: 12,
    radiationStacks: 1,
    cooldown: 2,
    useCondition: { type: "ALWAYS" }
  },
  "wraith-cloak": {
    id: "wraith-cloak",
    name: "Spectral Phase",
    description: "Fades into the background radiation. It's always there. You just can't see it.",
    cloakDuration: 6,
    cooldown: 8,
    useCondition: { type: "ALWAYS" }
  },
  "geiger-storm": {
    id: "geiger-storm",
    name: "Geiger Storm",
    description: "The clicking becomes a roar. A storm of radiation particles shreds through everything.",
    hullDamage: 35,
    shieldDamage: 25,
    stunDuration: 2,
    cooldown: 10,
    useCondition: { type: "ALWAYS" }
  },

  // --- T3 Boss: The Quiet Frequency ---
  "quiet-whisper": {
    id: "quiet-whisper",
    name: "The Quiet Whisper",
    description: "It speaks to you on a frequency that shouldn't exist. Your cells listen. Your shields don't matter.",
    hullDamage: 20,
    shieldDamage: 20,
    radiationStacks: 3,
    cooldown: 3,
    useCondition: { type: "ALWAYS" }
  },
  "communion-protocol": {
    id: "communion-protocol",
    name: "Communion Protocol",
    description: "The Frequency opens a direct channel to your biology. Radiation damage doubles. It wants you to stop being separate.",
    radiationStacks: 5,
    hullDamage: 30,
    shieldDamage: 15,
    stunDuration: 3,
    cooldown: 8,
    useCondition: { type: "PLAYER_RADIATION_ABOVE", threshold: 8 },
    conditionLabel: "Only when target has 8+ radiation stacks"
  },
  "frequency-cloak": {
    id: "frequency-cloak",
    name: "Frequency Shift",
    description: "Shifts to a wavelength your sensors cannot perceive. It is still there. It is always there.",
    cloakDuration: 7,
    cooldown: 15,
    useCondition: { type: "ALWAYS" }
  },
  "resonance-cascade": {
    id: "resonance-cascade",
    name: "Resonance Cascade",
    description: "Every atom in the area vibrates at the Frequency's chosen note. Hull integrity becomes a suggestion.",
    hullDamage: 50,
    shieldDamage: 40,
    radiationStacks: 2,
    cooldown: 6,
    useCondition: { type: "ALWAYS" }
  },

  // ======================== ASTEROID — T1: Outer Drift ========================

  "drill-strike": {
    id: "drill-strike",
    name: "Drill Strike",
    description: "A heavy industrial drill bit repurposed as a weapon. Slow to wind up, devastating on contact.",
    hullDamage: 18,
    shieldDamage: 5,
    cooldown: 4,
    useCondition: { type: "ALWAYS" }
  },
  "fragment-spray": {
    id: "fragment-spray",
    name: "Fragment Spray",
    description: "Expels a burst of rock shrapnel from its ore hopper. Inaccurate but punishing.",
    hullDamage: 10,
    shieldDamage: 8,
    cooldown: 3,
    useCondition: { type: "ALWAYS" }
  },
  "reinforced-stance": {
    id: "reinforced-stance",
    name: "Reinforced Stance",
    description: "Locks its joints and thickens plating. Temporarily much harder to damage.",
    cooldown: 8,
    armorBuff: 4,
    useCondition: { type: "PLAYER_HAS_SHIELDS" },
    conditionLabel: "Only when target has shields"
  },
  "ore-slam": {
    id: "ore-slam",
    name: "Ore Slam",
    description: "Swings a massive chunk of compressed ore like a battering ram.",
    hullDamage: 22,
    shieldDamage: 8,
    cooldown: 4,
    useCondition: { type: "ALWAYS" }
  },
  "grind": {
    id: "grind",
    name: "Grind",
    description: "Catches the hull in spinning treads. Tears metal apart layer by layer.",
    hullDamage: 12,
    shieldDamage: 3,
    cooldown: 3,
    useCondition: { type: "PLAYER_NO_SHIELDS" },
    conditionLabel: "Only when target has no shields"
  },
  "collision-course": {
    id: "collision-course",
    name: "Collision Course",
    description: "Accelerates directly into the target. Deals massive damage to both parties.",
    hullDamage: 30,
    shieldDamage: 10,
    selfDamage: 15,
    cooldown: 6,
    useCondition: { type: "PLAYER_HEALTH_BELOW", threshold: 0.5 },
    conditionLabel: "Only when target hull < 50%"
  },

  // --- T1 Boss: Pit Foreman ---
  "foreman-hammer": {
    id: "foreman-hammer",
    name: "Foreman's Hammer",
    description: "A massive hydraulic piston strike. The sound alone buckles plating.",
    hullDamage: 25,
    shieldDamage: 10,
    cooldown: 4,
    useCondition: { type: "ALWAYS" }
  },
  "brace-for-impact": {
    id: "brace-for-impact",
    name: "Brace for Impact",
    description: "Engages emergency armor locks. The Foreman becomes nearly impervious.",
    cooldown: 10,
    armorBuff: 6,
    useCondition: { type: "ALWAYS" }
  },
  "seismic-charge": {
    id: "seismic-charge",
    name: "Seismic Charge",
    description: "Detonates a mining charge that sends shockwaves through the hull. Stuns systems briefly.",
    hullDamage: 15,
    shieldDamage: 5,
    stunDuration: 2,
    cooldown: 8,
    useCondition: { type: "ALWAYS" }
  },
  "emergency-weld": {
    id: "emergency-weld",
    name: "Emergency Weld",
    description: "Repair drones frantically patch damaged sections. Old subroutine — still works.",
    selfHullHeal: 20,
    cooldown: 12,
    useCondition: { type: "PLAYER_HEALTH_BELOW", threshold: 0.6 },
    conditionLabel: "Only when target hull < 60%"
  },

  // ======================== ASTEROID — T2: Shattered Corridor ========================

  "pneumatic-crush": {
    id: "pneumatic-crush",
    name: "Pneumatic Crush",
    description: "Hydraulic arms close around the hull with hundreds of tons of force.",
    hullDamage: 30,
    shieldDamage: 10,
    cooldown: 4,
    useCondition: { type: "ALWAYS" }
  },
  "ablative-plating": {
    id: "ablative-plating",
    name: "Ablative Plating",
    description: "Sheds damaged outer layers to reveal fresh armor underneath.",
    cooldown: 10,
    armorBuff: 6,
    useCondition: { type: "ALWAYS" }
  },
  "slag-cannon": {
    id: "slag-cannon",
    name: "Slag Cannon",
    description: "Fires superheated molten metal. Burns through shields and sears hull plating.",
    hullDamage: 20,
    shieldDamage: 15,
    cooldown: 4,
    useCondition: { type: "ALWAYS" }
  },
  "overcharge-drill": {
    id: "overcharge-drill",
    name: "Overcharge Drill",
    description: "The drill spins up to dangerous RPMs. The next impact will be catastrophic.",
    hullDamage: 45,
    shieldDamage: 15,
    cooldown: 5,
    useCondition: { type: "ALWAYS" }
  },
  "deploy-repair-swarm": {
    id: "deploy-repair-swarm",
    name: "Deploy Repair Swarm",
    description: "Releases a cloud of micro-drones that weld shut breaches in real-time.",
    selfHullHeal: 25,
    cooldown: 10,
    useCondition: { type: "ALWAYS" }
  },
  "railgun-burst": {
    id: "railgun-burst",
    name: "Railgun Burst",
    description: "Magnetically accelerated slugs fired in a tight pattern. Military hardware.",
    hullDamage: 35,
    shieldDamage: 12,
    cooldown: 5,
    useCondition: { type: "ALWAYS" }
  },
  "concussive-barrage": {
    id: "concussive-barrage",
    name: "Concussive Barrage",
    description: "Launches a volley of explosive charges. Rattles the crew and scrambles systems.",
    hullDamage: 20,
    shieldDamage: 10,
    stunDuration: 1,
    cooldown: 5,
    useCondition: { type: "ALWAYS" }
  },

  // --- T2 Boss: Convoy Warden ---
  "broadside-salvo": {
    id: "broadside-salvo",
    name: "Broadside Salvo",
    description: "All port-side batteries fire simultaneously. Escort protocol: maximum suppression.",
    hullDamage: 40,
    shieldDamage: 15,
    cooldown: 4,
    useCondition: { type: "ALWAYS" }
  },
  "kinetic-barrier": {
    id: "kinetic-barrier",
    name: "Kinetic Barrier",
    description: "Activates layered reactive armor. Each hit triggers a counter-blast that absorbs damage.",
    cooldown: 12,
    armorBuff: 8,
    useCondition: { type: "ALWAYS" }
  },
  "targeting-lock": {
    id: "targeting-lock",
    name: "Targeting Lock",
    description: "Locks weapon systems onto hull breaches. The next shot will find the weakest point.",
    hullDamage: 50,
    shieldDamage: 5,
    cooldown: 6,
    useCondition: { type: "PLAYER_NO_SHIELDS" },
    conditionLabel: "Only when target has no shields"
  },
  "hull-restoration": {
    id: "hull-restoration",
    name: "Hull Restoration",
    description: "Automated repair bay seals hull breaches with military-grade nanopaste.",
    selfHullHeal: 40,
    cooldown: 15,
    useCondition: { type: "PLAYER_HAS_SHIELDS" },
    conditionLabel: "Only when target has shields"
  },

  // ======================== ASTEROID — T3: The Core ========================

  "tectonic-grinder": {
    id: "tectonic-grinder",
    name: "Tectonic Grinder",
    description: "Massive rotating teeth designed to chew through planetary crust. Your ship is much softer.",
    hullDamage: 40,
    shieldDamage: 15,
    cooldown: 4,
    useCondition: { type: "ALWAYS" }
  },
  "magma-bore": {
    id: "magma-bore",
    name: "Magma Bore",
    description: "Superheated lance of compressed magma punches clean through armor plating.",
    hullDamage: 55,
    shieldDamage: 20,
    cooldown: 5,
    useCondition: { type: "ALWAYS" }
  },
  "core-plating": {
    id: "core-plating",
    name: "Core Plating",
    description: "Hull forged from the planet's mantle. Nearly indestructible when fully engaged.",
    cooldown: 10,
    armorBuff: 10,
    useCondition: { type: "ALWAYS" }
  },
  "seismic-pulse": {
    id: "seismic-pulse",
    name: "Seismic Pulse",
    description: "Emits a shockwave that ripples through the asteroid field. Debris impacts follow.",
    hullDamage: 25,
    shieldDamage: 25,
    stunDuration: 2,
    cooldown: 6,
    useCondition: { type: "ALWAYS" }
  },
  "reconstruct": {
    id: "reconstruct",
    name: "Reconstruct",
    description: "Draws raw material from the surrounding rock to rebuild damaged sections.",
    selfHullHeal: 35,
    cooldown: 9,
    useCondition: { type: "ALWAYS" }
  },
  "mass-driver": {
    id: "mass-driver",
    name: "Mass Driver",
    description: "Hurls a building-sized asteroid fragment. There is no dodging this.",
    hullDamage: 60,
    shieldDamage: 20,
    cooldown: 6,
    useCondition: { type: "ALWAYS" }
  },
  "point-defense-grid": {
    id: "point-defense-grid",
    name: "Point Defense Grid",
    description: "A curtain of rapid-fire projectiles. Low damage per hit, but constant pressure.",
    hullDamage: 12,
    shieldDamage: 12,
    cooldown: 2,
    useCondition: { type: "ALWAYS" }
  },

  // --- T3 Boss: The Lithivore ---
  "planet-eater-bite": {
    id: "planet-eater-bite",
    name: "Planet-Eater Bite",
    description: "Jaws that once cracked a planet's mantle close around your ship.",
    hullDamage: 65,
    shieldDamage: 20,
    cooldown: 5,
    useCondition: { type: "ALWAYS" }
  },
  "lithic-regeneration": {
    id: "lithic-regeneration",
    name: "Lithic Regeneration",
    description: "Absorbs surrounding rock into its body, healing catastrophic wounds in seconds.",
    selfHullHeal: 60,
    cooldown: 12,
    useCondition: { type: "ALWAYS" }
  },
  "gravity-crush": {
    id: "gravity-crush",
    name: "Gravity Crush",
    description: "Generates a localized gravity well. The hull groans as tons of force press inward.",
    hullDamage: 40,
    shieldDamage: 30,
    stunDuration: 2,
    cooldown: 7,
    useCondition: { type: "ALWAYS" }
  },
  "molten-mantle": {
    id: "molten-mantle",
    name: "Molten Mantle",
    description: "Superheats its outer shell to white-hot temperatures. Anything that touches it melts.",
    cooldown: 14,
    armorBuff: 15,
    useCondition: { type: "PLAYER_HEALTH_BELOW", threshold: 0.4 },
    conditionLabel: "Only when target hull < 40%"
  },

  // ======================== DEEP SPACE — The Threshold ========================

  // --- Null Drifter ---
  "void-lance": {
    id: "void-lance",
    name: "Void Lance",
    description: "A beam of compressed nothing. Where it passes, matter simply ceases.",
    hullDamage: 35,
    shieldDamage: 25,
    cooldown: 3,
    useCondition: { type: "ALWAYS" }
  },
  "entropy-field": {
    id: "entropy-field",
    name: "Entropy Field",
    description: "Everything within the field decays. Shields corrode. Hull rusts. Time feels heavier.",
    shieldDamage: 20,
    hullDamage: 15,
    radiationStacks: 2,
    cooldown: 4,
    useCondition: { type: "ALWAYS" }
  },
  "null-armor": {
    id: "null-armor",
    name: "Null Armor",
    description: "Its hull becomes conceptually harder to damage. The idea of piercing it becomes difficult.",
    armorBuff: 8,
    cooldown: 10,
    useCondition: { type: "ALWAYS" }
  },

  // --- Echo Remnant ---
  "memory-strike": {
    id: "memory-strike",
    name: "Memory Strike",
    description: "Attacks with a weapon that no longer exists. The damage is real. The weapon is a memory.",
    hullDamage: 25,
    shieldDamage: 30,
    cooldown: 3,
    useCondition: { type: "ALWAYS" }
  },
  "echo-drain": {
    id: "echo-drain",
    name: "Echo Drain",
    description: "Siphons your shield energy into its fading form. For a moment, it becomes more real.",
    shieldDamage: 35,
    selfShieldHeal: 25,
    cooldown: 4,
    useCondition: { type: "PLAYER_HAS_SHIELDS" },
    conditionLabel: "Only when target has shields"
  },
  "temporal-stutter": {
    id: "temporal-stutter",
    name: "Temporal Stutter",
    description: "Time skips. You were doing something. You can't remember what.",
    stunDuration: 3,
    radiationStacks: 1,
    cooldown: 8,
    useCondition: { type: "ALWAYS" }
  },

  // --- Gravity Phantom ---
  "mass-crush": {
    id: "mass-crush",
    name: "Mass Crush",
    description: "Warps local gravity to crushing force. Hull buckles inward.",
    hullDamage: 45,
    shieldDamage: 15,
    cooldown: 4,
    useCondition: { type: "ALWAYS" }
  },
  "gravity-cloak": {
    id: "gravity-cloak",
    name: "Gravity Cloak",
    description: "Bends light around itself. You know it's there because nearby objects accelerate toward nothing.",
    cloakDuration: 6,
    cooldown: 10,
    useCondition: { type: "ALWAYS" }
  },
  "singularity-pulse": {
    id: "singularity-pulse",
    name: "Singularity Pulse",
    description: "A brief gravitational anomaly. Everything lurches sideways. Systems scramble.",
    hullDamage: 30,
    shieldDamage: 20,
    stunDuration: 2,
    radiationStacks: 1,
    cooldown: 6,
    useCondition: { type: "ALWAYS" }
  },

  // --- Convergence Choir ---
  "harmonic-pulse": {
    id: "harmonic-pulse",
    name: "Harmonic Pulse",
    description: "Multiple frequencies align into a single devastating tone. Shields resonate and shatter.",
    shieldDamage: 50,
    hullDamage: 15,
    cooldown: 3,
    useCondition: { type: "ALWAYS" }
  },
  "choir-drain": {
    id: "choir-drain",
    name: "Choir Drain",
    description: "The chorus feeds on your emissions. Shield energy flows into their harmonics.",
    shieldDamage: 40,
    selfShieldHeal: 30,
    cooldown: 4,
    useCondition: { type: "PLAYER_HAS_SHIELDS" },
    conditionLabel: "Only when target has shields"
  },
  "dissonance": {
    id: "dissonance",
    name: "Dissonance",
    description: "The choir sings a wrong note. On purpose. Your systems interpret it as conflicting commands.",
    stunDuration: 3,
    shieldDamage: 15,
    radiationStacks: 2,
    cooldown: 8,
    useCondition: { type: "ALWAYS" }
  },

  // --- Mini-Boss: The Watcher's Lens ---
  "absolute-scan": {
    id: "absolute-scan",
    name: "Absolute Scan",
    description: "The Lens sees everything. Shield harmonics, hull stress points, crew positions. It shares this data with its weapons.",
    hullDamage: 30,
    shieldDamage: 30,
    cooldown: 3,
    useCondition: { type: "ALWAYS" }
  },
  "lens-focus": {
    id: "lens-focus",
    name: "Lens Focus",
    description: "Concentrates all observational power into a single point. The resulting beam ignores conventional defenses.",
    hullDamage: 50,
    shieldDamage: 10,
    cooldown: 5,
    useCondition: { type: "PLAYER_NO_SHIELDS" },
    conditionLabel: "Only when target has no shields"
  },
  "panoptic-drain": {
    id: "panoptic-drain",
    name: "Panoptic Drain",
    description: "The Lens drinks in your shield frequencies, analyzing and absorbing simultaneously.",
    shieldDamage: 45,
    selfShieldHeal: 30,
    cooldown: 4,
    useCondition: { type: "PLAYER_HAS_SHIELDS" },
    conditionLabel: "Only when target has shields"
  },
  "lens-cloak": {
    id: "lens-cloak",
    name: "Observational Blind",
    description: "The Lens turns its gaze elsewhere. For a few seconds, you cannot see it. But it sees you.",
    cloakDuration: 5,
    cooldown: 12,
    useCondition: { type: "ALWAYS" }
  },
  "omniscient-burst": {
    id: "omniscient-burst",
    name: "Omniscient Burst",
    description: "Having analyzed every weakness, the Lens strikes at all of them simultaneously.",
    hullDamage: 40,
    shieldDamage: 40,
    stunDuration: 2,
    radiationStacks: 2,
    cooldown: 8,
    useCondition: { type: "ALWAYS" }
  },

  // --- Final Boss: The Architect ---
  "pattern-strike": {
    id: "pattern-strike",
    name: "Pattern Strike",
    description: "The Architect corrects an imperfection. Your ship is the imperfection.",
    hullDamage: 35,
    shieldDamage: 30,
    cooldown: 3,
    useCondition: { type: "ALWAYS" }
  },
  "reality-warp": {
    id: "reality-warp",
    name: "Reality Warp",
    description: "The rules change. What protected you now harms you. What damaged you now heals you. For 15 seconds, nothing works as expected.",
    shieldDamage: 30,
    hullDamage: 30,
    stunDuration: 2,
    cooldown: 20,
    useCondition: { type: "ALWAYS" }
  },
  "architect-cloak": {
    id: "architect-cloak",
    name: "Phase Shift",
    description: "Steps outside the observable universe. Still there. Still watching. Still building.",
    cloakDuration: 7,
    cooldown: 18,
    useCondition: { type: "ALWAYS" }
  },
  "gravity-well": {
    id: "gravity-well",
    name: "Gravity Well",
    description: "Creates a localized gravity singularity. Everything slows. Everything hurts.",
    hullDamage: 40,
    shieldDamage: 25,
    stunDuration: 3,
    radiationStacks: 3,
    cooldown: 8,
    useCondition: { type: "ALWAYS" }
  },
  "the-singularity": {
    id: "the-singularity",
    name: "The Singularity",
    description: "The Architect's final argument. All matter, energy, and meaning converge to a single point.",
    hullDamage: 80,
    shieldDamage: 80,
    cooldown: 15,
    useCondition: { type: "PLAYER_HEALTH_BELOW", threshold: 0.3 },
    conditionLabel: "Only when target hull < 30%"
  },
  "architect-restore": {
    id: "architect-restore",
    name: "Reconstruct Reality",
    description: "Rebuilds damaged sections by borrowing matter from adjacent dimensions.",
    selfHullHeal: 50,
    selfShieldHeal: 40,
    cooldown: 12,
    useCondition: { type: "ALWAYS" }
  },
};
