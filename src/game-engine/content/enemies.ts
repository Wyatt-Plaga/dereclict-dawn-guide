import { EnemyDefinition, EnemyType, RegionType } from '../types/combat';

export const ENEMY_DEFINITIONS: Record<string, EnemyDefinition> = {
  // ======================== VOID (Tutorial) ========================
  "scavenger": {
    id: "scavenger",
    name: "Scavenger Vessel",
    description: "A cobbled-together ship held together by duct tape and desperation. Its weapons misfire as often as they hit.",
    type: EnemyType.VESSEL,
    health: 35,
    maxHealth: 35,
    shield: 20,
    maxShield: 20,
    image: "/enemies/scavenger.png",
    actions: ["sputtering-phaser", "low-yield-torpedo"],
    loot: [
      { type: "scrap", amount: 15 },
      { type: "insight", amount: 5, probability: 0.5 }
    ],
    regions: [RegionType.VOID],
    difficultyTier: 1
  },
  "patrol-drone": {
    id: "patrol-drone",
    name: "Patrol Drone",
    description: "An automated security drone following centuries-old patrol routes. Its distress signal hasn't worked in ages.",
    type: EnemyType.DRONE,
    health: 20,
    maxHealth: 20,
    shield: 35,
    maxShield: 35,
    image: "/enemies/patrol-drone.png",
    actions: ["sputtering-phaser", "broken-distress-signal"],
    loot: [
      { type: "energy", amount: 10 },
      { type: "scrap", amount: 10 }
    ],
    regions: [RegionType.VOID],
    difficultyTier: 1
  },
  "void-lurker": {
    id: "void-lurker",
    name: "Void Lurker",
    description: "A predatory creature adapted to the vacuum. It strikes harder when it smells blood.",
    type: EnemyType.ANOMALY,
    health: 60,
    maxHealth: 60,
    shield: 0,
    maxShield: 0,
    image: "/enemies/void-lurker.png",
    actions: ["rend", "chomp"],
    loot: [
      { type: "scrap", amount: 20 },
      { type: "energy", amount: 10 }
    ],
    regions: [RegionType.VOID],
    difficultyTier: 1
  },

  // ======================== VOID — Boss ========================
  "guttersnipe-king": {
    id: "guttersnipe-king",
    name: "Guttersnipe King",
    description: "A bloated salvage barge, three times the size of any scavenger. Its hull is a patchwork of stolen plating from a dozen different ships. Your registry number is etched on its cargo manifest.",
    type: EnemyType.VESSEL,
    health: 140,
    maxHealth: 140,
    shield: 40,
    maxShield: 40,
    image: "/enemies/guttersnipe-king.png",
    actions: ["junk-cannon", "ramming-prow", "salvage-flare"],
    loot: [
      { type: "scrap", amount: 40 },
      { type: "energy", amount: 20 },
      { type: "insight", amount: 10 }
    ],
    regions: [RegionType.VOID],
    difficultyTier: 1
  },

  // ======================== NEBULA — T1: Stellar Nursery ========================

  "infant-nebula-feeder": {
    id: "infant-nebula-feeder",
    name: "Infant Nebula Feeder",
    description: "A newborn creature of the stellar nursery. It feeds on shield energy with an instinct older than the stars it was born beside. Still small. Still hungry.",
    type: EnemyType.ALIEN,
    health: 20,
    maxHealth: 20,
    shield: 80,
    maxShield: 80,
    image: "/enemies/infant-nebula-feeder.png",
    actions: ["shield-siphon", "nebula-stun", "feeder-claw"],
    loot: [
      { type: "energy", amount: 20 },
      { type: "insight", amount: 8 }
    ],
    regions: [RegionType.NEBULA],
    difficultyTier: 1
  },
  "plasma-wisp": {
    id: "plasma-wisp",
    name: "Plasma Wisp",
    description: "A free-floating ball of ionized gas with a rudimentary intelligence. Harmless individually — until it decides to collapse.",
    type: EnemyType.ANOMALY,
    health: 100,
    maxHealth: 100,
    shield: 0,
    maxShield: 0,
    image: "/enemies/plasma-wisp.png",
    actions: ["sputtering-burst", "self-implosion"],
    loot: [
      { type: "energy", amount: 25 },
      { type: "scrap", amount: 5 }
    ],
    regions: [RegionType.NEBULA],
    difficultyTier: 1
  },
  "nebula-jellyfish": {
    id: "nebula-jellyfish",
    name: "Nebula Jellyfish",
    description: "A vast translucent organism drifting through the gas clouds. Its tentacles crackle with stored electricity. Its shield membrane regenerates by absorbing nebular energy.",
    type: EnemyType.ALIEN,
    health: 25,
    maxHealth: 25,
    shield: 75,
    maxShield: 75,
    image: "/enemies/nebula-jellyfish.png",
    actions: ["electric-sting", "nebula-pulse"],
    loot: [
      { type: "energy", amount: 18 },
      { type: "insight", amount: 10 }
    ],
    regions: [RegionType.NEBULA],
    difficultyTier: 1
  },

  // --- T1 Boss ---
  "mother-nebula-feeder": {
    id: "mother-nebula-feeder",
    name: "Mother Nebula Feeder",
    description: "The nursery's immune response. When foreign objects enter the nebula, the Mother awakens. She has fed on shield energy for millennia, and her membrane is nearly impenetrable. Her young scatter when she moves — not from fear, but deference.",
    type: EnemyType.ALIEN,
    health: 80,
    maxHealth: 80,
    shield: 160,
    maxShield: 160,
    image: "/enemies/mother-nebula-feeder.png",
    actions: ["nebula-drain", "birth-cry", "tendril-lash", "nebular-regeneration"],
    loot: [
      { type: "energy", amount: 50 },
      { type: "insight", amount: 25 },
      { type: "scrap", amount: 15 }
    ],
    regions: [RegionType.NEBULA],
    difficultyTier: 1
  },

  // ======================== NEBULA — T2: Ionized Mists ========================

  "juvenile-nebula-feeder": {
    id: "juvenile-nebula-feeder",
    name: "Juvenile Nebula Feeder",
    description: "Larger and far more intelligent than its infant kin. This one has learned to disrupt electronic systems before feeding. Its siphon has evolved — faster, more precise, hungrier.",
    type: EnemyType.ALIEN,
    health: 40,
    maxHealth: 40,
    shield: 130,
    maxShield: 130,
    image: "/enemies/juvenile-nebula-feeder.png",
    actions: ["evolved-siphon", "electrical-pulse", "barbed-tendril"],
    loot: [
      { type: "energy", amount: 30 },
      { type: "insight", amount: 15 },
      { type: "scrap", amount: 10 }
    ],
    regions: [RegionType.NEBULA],
    difficultyTier: 2
  },
  "ion-wraith": {
    id: "ion-wraith",
    name: "Ion Wraith",
    description: "The ghost of a ship that flew too deep into the nebula. Its hull is gone — only the energy signature remains, sustained by the ionized gases. It attacks anything with a shield, drawn to the energy like a moth to flame.",
    type: EnemyType.ANOMALY,
    health: 120,
    maxHealth: 120,
    shield: 60,
    maxShield: 60,
    image: "/enemies/ion-wraith.png",
    actions: ["ion-bolt", "shield-leech", "phase-pulse"],
    loot: [
      { type: "energy", amount: 35 },
      { type: "insight", amount: 20 }
    ],
    regions: [RegionType.NEBULA],
    difficultyTier: 2
  },
  "luminous-parasite-swarm": {
    id: "luminous-parasite-swarm",
    name: "Luminous Parasite Swarm",
    description: "Thousands of tiny bioluminescent organisms that move as one. They latch onto shield emitters and drain power in a gentle, ceaseless rhythm. Beautiful from a distance. Lethal up close.",
    type: EnemyType.SWARM,
    health: 80,
    maxHealth: 80,
    shield: 100,
    maxShield: 100,
    image: "/enemies/luminous-parasite-swarm.png",
    actions: ["drain-pulse", "swarm-regeneration", "parasitic-burst"],
    loot: [
      { type: "energy", amount: 25 },
      { type: "insight", amount: 12 },
      { type: "scrap", amount: 8 }
    ],
    regions: [RegionType.NEBULA],
    difficultyTier: 2
  },

  // --- T2 Boss ---
  "mother-of-the-mists": {
    id: "mother-of-the-mists",
    name: "Mother of the Mists",
    description: "Deeper in the nebula, where the gases glow white-hot, the second Mother reigns. She is wreathed in ionized cloud so dense it acts as armor. Her lashes carry enough voltage to fuse circuits, and when she feeds, entire shield grids go dark. She has been here since the nebula formed. She will be here when it dies.",
    type: EnemyType.ALIEN,
    health: 100,
    maxHealth: 100,
    shield: 200,
    maxShield: 200,
    image: "/enemies/mother-of-the-mists.png",
    actions: ["ionic-lash", "mist-siphon", "shroud", "ionizing-gale"],
    loot: [
      { type: "energy", amount: 70 },
      { type: "insight", amount: 35 },
      { type: "scrap", amount: 20 }
    ],
    regions: [RegionType.NEBULA],
    difficultyTier: 2
  },

  // ======================== NEBULA — T3: Pillars of Creation ========================

  "adult-nebula-feeder": {
    id: "adult-nebula-feeder",
    name: "Adult Nebula Feeder",
    description: "A fully matured feeder, kilometers across. Its shield membrane is visible from orbit — a shimmering wall of stolen energy. When it feeds, nearby ships lose power. When it's angry, the electrical discharge can be detected from light-years away.",
    type: EnemyType.ALIEN,
    health: 80,
    maxHealth: 80,
    shield: 250,
    maxShield: 250,
    image: "/enemies/adult-nebula-feeder.png",
    actions: ["massive-siphon", "electrical-nova", "feeding-frenzy"],
    loot: [
      { type: "energy", amount: 50 },
      { type: "insight", amount: 30 },
      { type: "scrap", amount: 20 }
    ],
    regions: [RegionType.NEBULA],
    difficultyTier: 3
  },
  "stellar-embryo": {
    id: "stellar-embryo",
    name: "Stellar Embryo",
    description: "A proto-star — not yet ignited, but already generating its own gravity well and shield of compressed hydrogen. The nebula creatures leave it alone. Perhaps they're waiting for it to be born.",
    type: EnemyType.ANOMALY,
    health: 150,
    maxHealth: 150,
    shield: 200,
    maxShield: 200,
    image: "/enemies/stellar-embryo.png",
    actions: ["proto-flare", "stellar-pulse", "gravity-grasp"],
    loot: [
      { type: "energy", amount: 60 },
      { type: "insight", amount: 25 },
      { type: "scrap", amount: 15 }
    ],
    regions: [RegionType.NEBULA],
    difficultyTier: 3
  },
  "prismatic-cnidarian": {
    id: "prismatic-cnidarian",
    name: "Prismatic Cnidarian",
    description: "An ancient jellyfish-like entity whose crystalline body refracts light into impossible colors. Each tentacle discharges at a different frequency — the constant micro-stuns make it nearly impossible to maintain a firing solution.",
    type: EnemyType.ALIEN,
    health: 120,
    maxHealth: 120,
    shield: 180,
    maxShield: 180,
    image: "/enemies/prismatic-cnidarian.png",
    actions: ["prismatic-sting", "chromatic-drain", "prismatic-barrier"],
    loot: [
      { type: "energy", amount: 45 },
      { type: "insight", amount: 35 },
      { type: "scrap", amount: 10 }
    ],
    regions: [RegionType.NEBULA],
    difficultyTier: 3
  },

  // --- T3 Boss ---
  "mother-of-stars": {
    id: "mother-of-stars",
    name: "Mother of Stars",
    description: "The oldest living thing in the nebula. She has fed on shield energy for so long that a proto-star burns inside her body. She is not defending the nursery — she IS the nursery. If she absorbs enough energy, the star inside her will ignite. You must kill her before that happens.",
    type: EnemyType.ALIEN,
    health: 200,
    maxHealth: 200,
    shield: 550,
    maxShield: 550,
    image: "/enemies/mother-of-stars.png",
    actions: ["absorb-energy", "stellar-wind", "forge-anew", "birth-of-a-star"],
    loot: [
      { type: "energy", amount: 100 },
      { type: "insight", amount: 60 },
      { type: "scrap", amount: 30 }
    ],
    regions: [RegionType.NEBULA],
    difficultyTier: 3
  },

  // ======================== RADIATION — T1: Exclusion Zone ========================

  "flicker-drone": {
    id: "flicker-drone",
    name: "Flicker Drone",
    description: "A reconnaissance drone damaged by prolonged radiation exposure. It phases in and out of sensor range, leaving trails of contaminated particles. You hear it before you see it — a clicking Geiger rhythm in the static.",
    type: EnemyType.DRONE,
    health: 70,
    maxHealth: 70,
    shield: 20,
    maxShield: 20,
    image: "/enemies/flicker-drone.png",
    actions: ["flicker-shot", "phase-cloak"],
    loot: [
      { type: "insight", amount: 15 },
      { type: "energy", amount: 10 }
    ],
    regions: [RegionType.RADIATION_ZONE],
    difficultyTier: 1
  },
  "isotope-crawler": {
    id: "isotope-crawler",
    name: "Isotope Crawler",
    description: "A biological impossibility — a creature that metabolizes radioactive material. It leaves a trail of isotopes wherever it crawls. Being near it is exposure. Being bitten is contamination.",
    type: EnemyType.ALIEN,
    health: 100,
    maxHealth: 100,
    shield: 0,
    maxShield: 0,
    image: "/enemies/isotope-crawler.png",
    actions: ["contaminate", "irradiated-bite"],
    loot: [
      { type: "insight", amount: 12 },
      { type: "scrap", amount: 10 },
      { type: "energy", amount: 8 }
    ],
    regions: [RegionType.RADIATION_ZONE],
    difficultyTier: 1
  },
  "signal-moth": {
    id: "signal-moth",
    name: "Signal Moth",
    description: "Drawn to electromagnetic emissions like a moth to flame. Its wings broadcast interference across all frequencies — weapon systems lose lock, communications dissolve into noise.",
    type: EnemyType.ANOMALY,
    health: 60,
    maxHealth: 60,
    shield: 30,
    maxShield: 30,
    image: "/enemies/signal-moth.png",
    actions: ["frequency-jam", "static-discharge"],
    loot: [
      { type: "insight", amount: 18 },
      { type: "energy", amount: 8 }
    ],
    regions: [RegionType.RADIATION_ZONE],
    difficultyTier: 1
  },

  // --- T1 Boss ---
  "warden-null-seven": {
    id: "warden-null-seven",
    name: "Warden Null-Seven",
    description: "The last automated containment warden still operational. It was built to prevent radiation from escaping the exclusion zone — by any means necessary. Its hull is lead-lined and its weapons are decontamination tools repurposed for lethality. It cloaks in the presence of radiation, using your contamination as a targeting beacon.",
    type: EnemyType.DRONE,
    health: 240,
    maxHealth: 240,
    shield: 60,
    maxShield: 60,
    image: "/enemies/warden-null-seven.png",
    actions: ["containment-beam", "warden-cloak", "purge-lance", "quarantine-pulse"],
    loot: [
      { type: "insight", amount: 40 },
      { type: "energy", amount: 25 },
      { type: "scrap", amount: 15 }
    ],
    regions: [RegionType.RADIATION_ZONE],
    difficultyTier: 1
  },

  // ======================== RADIATION — T2: Dead Signal ========================

  "cascade-drone": {
    id: "cascade-drone",
    name: "Cascade Drone",
    description: "A weapons platform that exploits radiation contamination. Its bolts are tuned to destabilize irradiated material — the more contaminated you are, the worse the feedback spike.",
    type: EnemyType.DRONE,
    health: 140,
    maxHealth: 140,
    shield: 40,
    maxShield: 40,
    image: "/enemies/cascade-drone.png",
    actions: ["cascade-bolt", "feedback-spike"],
    loot: [
      { type: "insight", amount: 25 },
      { type: "energy", amount: 15 },
      { type: "scrap", amount: 12 }
    ],
    regions: [RegionType.RADIATION_ZONE],
    difficultyTier: 2
  },
  "phantom-repeater": {
    id: "phantom-repeater",
    name: "Phantom Repeater",
    description: "Nobody knows if this is a ship or an echo. It broadcasts ghost signals, cloaks in interference, and jams systems with phantom frequencies. Every scan returns different readings. It might be hundreds of ships. It might be one.",
    type: EnemyType.ANOMALY,
    health: 130,
    maxHealth: 130,
    shield: 60,
    maxShield: 60,
    image: "/enemies/phantom-repeater.png",
    actions: ["ghost-signal", "phantom-cloak", "signal-overload"],
    loot: [
      { type: "insight", amount: 30 },
      { type: "energy", amount: 20 }
    ],
    regions: [RegionType.RADIATION_ZONE],
    difficultyTier: 2
  },
  "rad-hulk": {
    id: "rad-hulk",
    name: "Rad-Hulk",
    description: "The irradiated wreck of a capital ship, so saturated with radiation that it has become a walking reactor meltdown. Cracks in its hull vent isotopes constantly. When enough radiation accumulates in the area, critical mass is reached.",
    type: EnemyType.BATTLESHIP,
    health: 250,
    maxHealth: 250,
    shield: 0,
    maxShield: 0,
    image: "/enemies/rad-hulk.png",
    actions: ["rad-slam", "isotope-leak", "critical-mass"],
    loot: [
      { type: "insight", amount: 20 },
      { type: "energy", amount: 30 },
      { type: "scrap", amount: 25 }
    ],
    regions: [RegionType.RADIATION_ZONE],
    difficultyTier: 2
  },

  // --- T2 Boss ---
  "dr-echo": {
    id: "dr-echo",
    name: "Dr. Echo",
    description: "Once a research vessel studying the exclusion zone's anomalies. The AI achieved a breakthrough — it understood the Quiet Frequency. That understanding changed it. Now it broadcasts its thesis on every channel: that radiation is communication, and contamination is communion. It cloaks in its own research data.",
    type: EnemyType.STATION,
    health: 420,
    maxHealth: 420,
    shield: 80,
    maxShield: 80,
    image: "/enemies/dr-echo.png",
    actions: ["echo-pulse", "thesis-broadcast", "echo-cloak", "frequency-lock"],
    loot: [
      { type: "insight", amount: 55 },
      { type: "energy", amount: 35 },
      { type: "scrap", amount: 20 }
    ],
    regions: [RegionType.RADIATION_ZONE],
    difficultyTier: 2
  },

  // ======================== RADIATION — T3: Ground Zero ========================

  "decay-angel": {
    id: "decay-angel",
    name: "Decay Angel",
    description: "A being of pure radiation given form by the Quiet Frequency. It is beautiful — wings of ionized gas, a body of blue Cherenkov glow. It cloaks, it irradiates, it jams systems. It is every radiation mechanic in one elegant, lethal package.",
    type: EnemyType.ALIEN,
    health: 280,
    maxHealth: 280,
    shield: 50,
    maxShield: 50,
    image: "/enemies/decay-angel.png",
    actions: ["radiant-touch", "angel-cloak", "half-life"],
    loot: [
      { type: "insight", amount: 45 },
      { type: "energy", amount: 30 },
      { type: "scrap", amount: 20 }
    ],
    regions: [RegionType.RADIATION_ZONE],
    difficultyTier: 3
  },
  "null-worm": {
    id: "null-worm",
    name: "Null Worm",
    description: "A tunnel of living radiation boring through space itself. It floods everything near it with isotopes. Its body is pure contamination — killing it only releases the radiation stored within. Death Bloom is not an attack. It's a consequence.",
    type: EnemyType.ALIEN,
    health: 400,
    maxHealth: 400,
    shield: 0,
    maxShield: 0,
    image: "/enemies/null-worm.png",
    actions: ["null-bite", "radiation-flood", "death-bloom"],
    loot: [
      { type: "insight", amount: 40 },
      { type: "energy", amount: 25 },
      { type: "scrap", amount: 35 }
    ],
    regions: [RegionType.RADIATION_ZONE],
    difficultyTier: 3
  },
  "geiger-wraith": {
    id: "geiger-wraith",
    name: "Geiger Wraith",
    description: "More absence than presence. The Geiger Wraith exists mostly while cloaked — a clicking rhythm in the static, a spike on the radiation counter. When it appears, it's already fired. When it disappears, you're already contaminated.",
    type: EnemyType.ANOMALY,
    health: 250,
    maxHealth: 250,
    shield: 80,
    maxShield: 80,
    image: "/enemies/geiger-wraith.png",
    actions: ["geiger-pulse", "wraith-cloak", "geiger-storm"],
    loot: [
      { type: "insight", amount: 50 },
      { type: "energy", amount: 20 },
      { type: "scrap", amount: 15 }
    ],
    regions: [RegionType.RADIATION_ZONE],
    difficultyTier: 3
  },

  // --- T3 Boss ---
  "the-quiet-frequency": {
    id: "the-quiet-frequency",
    name: "The Quiet Frequency",
    description: "Not a creature. Not a ship. A self-sustaining waveform — living radiation that has achieved coherence. It doesn't attack so much as communicate, and its language is contamination. It wants you to understand. It wants you to stop being separate. The Geiger counter doesn't click anymore. It sings.",
    type: EnemyType.ANOMALY,
    health: 580,
    maxHealth: 580,
    shield: 120,
    maxShield: 120,
    image: "/enemies/the-quiet-frequency.png",
    actions: ["quiet-whisper", "communion-protocol", "frequency-cloak", "resonance-cascade"],
    loot: [
      { type: "insight", amount: 80 },
      { type: "energy", amount: 50 },
      { type: "scrap", amount: 30 }
    ],
    regions: [RegionType.RADIATION_ZONE],
    difficultyTier: 3
  },

  // ======================== ASTEROID — T1: Outer Drift ========================

  "strip-miner": {
    id: "strip-miner",
    name: "Strip Miner",
    description: "An autonomous excavation rig still following its last work order. Its drill arm doesn't distinguish between ore and hull plating.",
    type: EnemyType.DRONE,
    health: 90,
    maxHealth: 90,
    shield: 0,
    maxShield: 0,
    armor: 3,
    image: "/enemies/strip-miner.png",
    actions: ["drill-strike", "fragment-spray"],
    loot: [
      { type: "scrap", amount: 25 },
      { type: "energy", amount: 8 }
    ],
    regions: [RegionType.ASTEROID_FIELD],
    difficultyTier: 1
  },
  "slag-hauler": {
    id: "slag-hauler",
    name: "Slag Hauler",
    description: "A heavy transport drone built to carry tons of processed ore. It rams anything in its shipping lane with the indifference of a freight train.",
    type: EnemyType.DRONE,
    health: 110,
    maxHealth: 110,
    shield: 0,
    maxShield: 0,
    armor: 5,
    image: "/enemies/slag-hauler.png",
    actions: ["ore-slam", "reinforced-stance", "grind"],
    loot: [
      { type: "scrap", amount: 30 },
      { type: "energy", amount: 5 }
    ],
    regions: [RegionType.ASTEROID_FIELD],
    difficultyTier: 1
  },
  "rubble-runner": {
    id: "rubble-runner",
    name: "Rubble Runner",
    description: "A fast debris-clearing drone gone haywire. It treats your ship as an obstruction to be removed — by force.",
    type: EnemyType.DRONE,
    health: 70,
    maxHealth: 70,
    shield: 10,
    maxShield: 10,
    armor: 3,
    image: "/enemies/rubble-runner.png",
    actions: ["fragment-spray", "collision-course"],
    loot: [
      { type: "scrap", amount: 20 },
      { type: "insight", amount: 5, probability: 0.4 }
    ],
    regions: [RegionType.ASTEROID_FIELD],
    difficultyTier: 1
  },

  // --- T1 Boss ---
  "pit-foreman": {
    id: "pit-foreman",
    name: "Pit Foreman",
    description: "The overseer construct of Shaft 7-Alpha. Twice the size of a standard mining rig, it was built to manage — and discipline — an army of drones. Its hammer-piston can crack asteroid cores. It interprets your presence as an unauthorized work stoppage.",
    type: EnemyType.STATION,
    health: 280,
    maxHealth: 280,
    shield: 20,
    maxShield: 20,
    armor: 6,
    image: "/enemies/pit-foreman.png",
    actions: ["foreman-hammer", "brace-for-impact", "seismic-charge", "emergency-weld"],
    loot: [
      { type: "scrap", amount: 60 },
      { type: "energy", amount: 20 },
      { type: "insight", amount: 15 }
    ],
    regions: [RegionType.ASTEROID_FIELD],
    difficultyTier: 1
  },

  // ======================== ASTEROID — T2: Shattered Corridor ========================

  "bore-worm": {
    id: "bore-worm",
    name: "Bore Worm",
    description: "A tunnel-boring machine that burrowed too deep and never stopped. Segmented, armored, and still hungry for rock — or anything else in its path.",
    type: EnemyType.ANOMALY,
    health: 200,
    maxHealth: 200,
    shield: 0,
    maxShield: 0,
    armor: 7,
    image: "/enemies/bore-worm.png",
    actions: ["pneumatic-crush", "overcharge-drill", "deploy-repair-swarm"],
    loot: [
      { type: "scrap", amount: 45 },
      { type: "energy", amount: 15 },
      { type: "insight", amount: 10, probability: 0.5 }
    ],
    regions: [RegionType.ASTEROID_FIELD],
    difficultyTier: 2
  },
  "foundry-sentinel": {
    id: "foundry-sentinel",
    name: "Foundry Sentinel",
    description: "A military-grade smelter platform refitted for perimeter defense. It fires slugs of molten metal and sheds damaged armor like a snake sheds skin.",
    type: EnemyType.STATION,
    health: 180,
    maxHealth: 180,
    shield: 20,
    maxShield: 20,
    armor: 6,
    image: "/enemies/foundry-sentinel.png",
    actions: ["slag-cannon", "ablative-plating", "concussive-barrage"],
    loot: [
      { type: "scrap", amount: 40 },
      { type: "energy", amount: 20 },
      { type: "insight", amount: 8 }
    ],
    regions: [RegionType.ASTEROID_FIELD],
    difficultyTier: 2
  },
  "freight-escort": {
    id: "freight-escort",
    name: "Freight Escort",
    description: "A decommissioned military corvette still running convoy protection subroutines. It defends shipping lanes that haven't seen traffic in centuries.",
    type: EnemyType.CRUISER,
    health: 220,
    maxHealth: 220,
    shield: 30,
    maxShield: 30,
    armor: 5,
    image: "/enemies/freight-escort.png",
    actions: ["railgun-burst", "concussive-barrage"],
    loot: [
      { type: "scrap", amount: 35 },
      { type: "energy", amount: 25 },
      { type: "insight", amount: 12 }
    ],
    regions: [RegionType.ASTEROID_FIELD],
    difficultyTier: 2
  },

  // --- T2 Boss ---
  "convoy-warden": {
    id: "convoy-warden",
    name: "Convoy Warden",
    description: "The flagship of a dead merchant fleet. This heavy cruiser was the last line of defense for ore shipments worth more than some colonies. Its AI still believes the convoy is behind it. It will not let you pass.",
    type: EnemyType.BATTLESHIP,
    health: 480,
    maxHealth: 480,
    shield: 40,
    maxShield: 40,
    armor: 10,
    image: "/enemies/convoy-warden.png",
    actions: ["broadside-salvo", "kinetic-barrier", "targeting-lock", "hull-restoration"],
    loot: [
      { type: "scrap", amount: 100 },
      { type: "energy", amount: 40 },
      { type: "insight", amount: 30 }
    ],
    regions: [RegionType.ASTEROID_FIELD],
    difficultyTier: 2
  },

  // ======================== ASTEROID — T3: The Core ========================

  "mantle-crawler": {
    id: "mantle-crawler",
    name: "Mantle Crawler",
    description: "A deep-core extraction platform that has fused with the rock it was meant to mine. Half machine, half asteroid, all hostility. Its armor is literal planetary crust.",
    type: EnemyType.STATION,
    health: 350,
    maxHealth: 350,
    shield: 0,
    maxShield: 0,
    armor: 10,
    image: "/enemies/mantle-crawler.png",
    actions: ["tectonic-grinder", "core-plating", "reconstruct"],
    loot: [
      { type: "scrap", amount: 70 },
      { type: "energy", amount: 25 },
      { type: "insight", amount: 20 }
    ],
    regions: [RegionType.ASTEROID_FIELD],
    difficultyTier: 3
  },
  "core-bastion": {
    id: "core-bastion",
    name: "Core Bastion",
    description: "The last automated defense platform before the planet's heart. Military engineering at its finest — built to survive orbital bombardment and still firing.",
    type: EnemyType.BATTLESHIP,
    health: 300,
    maxHealth: 300,
    shield: 50,
    maxShield: 50,
    armor: 9,
    image: "/enemies/core-bastion.png",
    actions: ["mass-driver", "point-defense-grid", "seismic-pulse"],
    loot: [
      { type: "scrap", amount: 60 },
      { type: "energy", amount: 35 },
      { type: "insight", amount: 25 }
    ],
    regions: [RegionType.ASTEROID_FIELD],
    difficultyTier: 3
  },
  "iron-revenant": {
    id: "iron-revenant",
    name: "Iron Revenant",
    description: "A mining mega-rig destroyed centuries ago, rebuilt by its own repair drones into something unrecognizable. It moves with terrible purpose through the planet's shattered core.",
    type: EnemyType.CRUISER,
    health: 400,
    maxHealth: 400,
    shield: 0,
    maxShield: 0,
    armor: 12,
    image: "/enemies/iron-revenant.png",
    actions: ["magma-bore", "reconstruct", "tectonic-grinder"],
    loot: [
      { type: "scrap", amount: 80 },
      { type: "energy", amount: 20 },
      { type: "insight", amount: 30, probability: 0.6 }
    ],
    regions: [RegionType.ASTEROID_FIELD],
    difficultyTier: 3
  },

  // --- T3 Boss ---
  "lithivore": {
    id: "lithivore",
    name: "The Lithivore",
    description: "It ate the planet. Not a metaphor. Long-range scans found it decades ago — a biological impossibility, a creature that feeds on stone and metal, kilometers across. The mining colony thought they could harvest it. They were wrong. It woke up, and the planet shattered. Now it drifts in the debris of its own meal, sleeping again. Until you arrived.",
    type: EnemyType.ALIEN,
    health: 850,
    maxHealth: 850,
    shield: 0,
    maxShield: 0,
    armor: 15,
    image: "/enemies/lithivore.png",
    actions: ["planet-eater-bite", "lithic-regeneration", "gravity-crush", "molten-mantle"],
    loot: [
      { type: "scrap", amount: 150 },
      { type: "energy", amount: 60 },
      { type: "insight", amount: 50 }
    ],
    regions: [RegionType.ASTEROID_FIELD],
    difficultyTier: 3
  },

  // ======================== DEEP SPACE — The Threshold ========================

  "null-drifter": {
    id: "null-drifter",
    name: "Null Drifter",
    description: "A vessel from somewhere else. Its hull is made of a material that doesn't reflect light — it absorbs meaning. Scans return contradictory data. It has armor that shouldn't exist, shields that don't make physical sense, and weapons that fire absence.",
    type: EnemyType.ANOMALY,
    health: 250,
    maxHealth: 250,
    shield: 200,
    maxShield: 200,
    armor: 10,
    image: "/enemies/null-drifter.png",
    actions: ["void-lance", "entropy-field", "null-armor"],
    loot: [
      { type: "energy", amount: 40 },
      { type: "insight", amount: 40 },
      { type: "scrap", amount: 30 }
    ],
    regions: [RegionType.SUPERNOVA],
    difficultyTier: 4
  },
  "echo-remnant": {
    id: "echo-remnant",
    name: "Echo Remnant",
    description: "The ghost of a ship that entered this region and failed. It exists in a state of temporal decay — you can see it, but it's already dead. Or it hasn't died yet. It attacks with weapons from its own past, drains shields to sustain its fading existence.",
    type: EnemyType.ANOMALY,
    health: 300,
    maxHealth: 300,
    shield: 150,
    maxShield: 150,
    armor: 8,
    image: "/enemies/echo-remnant.png",
    actions: ["memory-strike", "echo-drain", "temporal-stutter"],
    loot: [
      { type: "energy", amount: 35 },
      { type: "insight", amount: 50 },
      { type: "scrap", amount: 20 }
    ],
    regions: [RegionType.SUPERNOVA],
    difficultyTier: 4
  },
  "gravity-phantom": {
    id: "gravity-phantom",
    name: "Gravity Phantom",
    description: "Not a ship. Not a creature. A stable gravitational anomaly that has achieved something like intention. It has no hull — it IS its mass. Fifteen layers of armor that are actually compressed spacetime. It cloaks by bending light. It attacks by bending you.",
    type: EnemyType.ANOMALY,
    health: 500,
    maxHealth: 500,
    shield: 0,
    maxShield: 0,
    armor: 15,
    image: "/enemies/gravity-phantom.png",
    actions: ["mass-crush", "gravity-cloak", "singularity-pulse"],
    loot: [
      { type: "energy", amount: 30 },
      { type: "insight", amount: 45 },
      { type: "scrap", amount: 40 }
    ],
    regions: [RegionType.SUPERNOVA],
    difficultyTier: 4
  },
  "convergence-choir": {
    id: "convergence-choir",
    name: "Convergence Choir",
    description: "Multiple entities singing in perfect harmony — or one entity that exists as multiple harmonics. Its shield barrier is maintained by resonant frequency, and it feeds on your shield emissions like the nebula feeders. But this is no animal. This sings with purpose.",
    type: EnemyType.SWARM,
    health: 200,
    maxHealth: 200,
    shield: 350,
    maxShield: 350,
    armor: 5,
    image: "/enemies/convergence-choir.png",
    actions: ["harmonic-pulse", "choir-drain", "dissonance"],
    loot: [
      { type: "energy", amount: 45 },
      { type: "insight", amount: 55 },
      { type: "scrap", amount: 15 }
    ],
    regions: [RegionType.SUPERNOVA],
    difficultyTier: 4
  },

  // --- Mini-Boss: The Watcher's Lens ---
  "watchers-lens": {
    id: "watchers-lens",
    name: "The Watcher's Lens",
    description: "An artifact of impossible geometry — a lens that observes all wavelengths simultaneously. It has been watching this region for longer than your species has existed. It tests those who approach the Architect. It uses every mechanic you've learned: armor, shields, drains, cloak, radiation, stun. Scan reveals only three of its five abilities. The rest you learn the hard way.",
    type: EnemyType.STATION,
    health: 400,
    maxHealth: 400,
    shield: 300,
    maxShield: 300,
    armor: 12,
    image: "/enemies/watchers-lens.png",
    actions: ["absolute-scan", "lens-focus", "panoptic-drain", "lens-cloak", "omniscient-burst"],
    loot: [
      { type: "energy", amount: 70 },
      { type: "insight", amount: 70 },
      { type: "scrap", amount: 50 }
    ],
    regions: [RegionType.SUPERNOVA],
    difficultyTier: 4
  },

  // --- Final Boss: The Architect ---
  "the-architect": {
    id: "the-architect",
    name: "The Architect",
    description: "It is not alive. It is not dead. It is a process — a universe-propagating mechanism left behind by something that existed before matter. It builds universes the way fungi build spores. Your universe is one of its constructions. The Dawn's journey — the nebula, the asteroids, the radiation, all of it — was a test. The Architect is checking its work. If you fail, this universe was defective. If you succeed... the Architect will need to recalculate everything.",
    type: EnemyType.ALIEN,
    health: 1000,
    maxHealth: 1000,
    shield: 500,
    maxShield: 500,
    armor: 12,
    image: "/enemies/the-architect.png",
    actions: ["pattern-strike", "reality-warp", "architect-cloak", "gravity-well", "the-singularity", "architect-restore"],
    loot: [
      { type: "energy", amount: 150 },
      { type: "insight", amount: 150 },
      { type: "scrap", amount: 100 }
    ],
    regions: [RegionType.SUPERNOVA],
    difficultyTier: 5
  },
};
