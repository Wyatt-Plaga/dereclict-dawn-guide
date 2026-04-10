# Region & Enemy Design Document

## Region Identity Map

| Region | Tiers | Identity | Drops | Playstyle |
|--------|-------|----------|-------|-----------|
| Void | 1 | Fundamentals | Relics | Generalist foundation |
| Nebula | 3 | Shields & Sustain | Plasma Cores | Tank/Sustain |
| Asteroid | 3 | Burst & Armor | Alloy Composites | Burst/DPS |
| Radiation | 3 | DoTs & Control | Exotic Data | Control/Attrition |
| Deep Space | 1 | Mastery | Stellar Fragments | Capstone |

## Cross-Pollination

- Nebula shields → survive Asteroid burst and Radiation DoTs
- Asteroid kinetics → punch through Nebula enemy shields  
- Radiation cyber → reveal/disable enemies everywhere
- Deep Space requires investment from all three

## Mechanics

### Armor (Asteroid) — IMPLEMENTED
`actualDamage = max(1, incomingDamage - armor)`

### Radiation Stacks (Radiation)
- Each stack = 1-2 hull dmg/sec, bypasses shields
- Stacks decay 1 per 5 seconds
- Max ~20 stacks (lethal)
- Player abilities can cleanse stacks

### System Jam (Radiation)
- Disables one specific ability slot for N seconds
- Different from stun (which blocks ALL abilities)

### Cloak (Radiation/Deep Space)
- Enemy untargetable for N seconds
- Scan can reveal cloaked enemies early

### Gravity Well (Deep Space)
- Slows all player cooldowns by X%

### Reality Warp (Architect boss)
- Inverts hull/shield damage types for 15 seconds

## Damage Calibration

| Label | Shield Dmg | Hull Dmg |
|-------|-----------|----------|
| Very Low | 3-5 | 3-5 |
| Low | 8-12 | 8-12 |
| Medium | 15-25 | 15-25 |
| High | 30-45 | 30-45 |
| Massive | 60-80 | 60-80 |

---

## VOID (1 tier)

### Enemies
- Scavenger (20s/35h), Patrol Drone (35s/20h), Void Lurker (0s/60h)

### Boss: Guttersnipe King (40s/140h)
Bloated salvage barge. Three staggered attacks teaching multi-timer management.
- Junk Cannon (10h/8s, 2.5s), Ramming Prow (15h/5s, 4s), Salvage Flare (5h/12s, 3s)
- **Relic: Hoarder's Manifest** — cargo list with your ship's registry as final entry

---

## NEBULA (3 tiers)

### Tier Names
Stellar Nursery → Ionized Mists → Pillars of Creation

### Narrative
The nebula is alive — a stellar nursery where creatures feed on shield energy. The "Mothers" are immune responses to foreign bodies. The Mother of Stars is building a star inside herself.

### T1 �� Stellar Nursery
| Enemy | S/H | Key Mechanic |
|-------|-----|-------------|
| Infant Nebula Feeder | 80/20 | Shield Siphon + stun if unshielded |
| Plasma Wisp | 0/100 | Self-Implosion when player has no shields |
| Nebula Jellyfish | 75/25 | Passive shield regen + stun on sting |
| **Mother Nebula Feeder** | 160/80 | Drain/stun cycle + passive 3s/sec regen |

Relic: **Nursery's Last Breath**

### T2 — Ionized Mists
| Enemy | S/H | Key Mechanic |
|-------|-----|-------------|
| Juvenile Nebula Feeder | 130/40 | Evolved siphon + ability disable |
| Ion Wraith | 60/120 | Split damage + shield leech |
| Luminous Parasite Swarm | 100/80 | Rapid 0.5s drain + 4s/sec regen |
| **Mother of the Mists** | 200/100 | Ion Barrier (absorbs 3 hits) + mist siphon |

Relic: **Ionic Membrane**

### T3 — Pillars of Creation
| Enemy | S/H | Key Mechanic |
|-------|-----|-------------|
| Adult Nebula Feeder | 250/80 | 45s siphon + electrical nova |
| Stellar Embryo | 200/150 | Proto-star tank + 5s/sec regen |
| Prismatic Cnidarian | 180/120 | Micro-stuns during drain |
| **Mother of Stars** | 550/200 | Energy accumulation → Main Sequence → Birth of a Star (instant kill) |

Relic: **Heart of the First Light**

---

## ASTEROID (3 tiers) — IMPLEMENTED IN CODE

### Tier Names
Outer Drift → Shattered Corridor → The Core

### Narrative
Shattered planet. Automated miners still operate. The Lithivore ate the planet from inside.

### T1 — Outer Drift
| Enemy | S/H | Armor | Key Mechanic |
|-------|-----|-------|-------------|
| Strip Miner | 0/90 | 3 | Basic heavy hits |
| Slag Hauler | 0/110 | 5 | Reinforced Stance (+4 armor) |
| Rubble Runner | 10/70 | 3 | Collision Course finisher |
| **Pit Foreman** | 20/280 | 6 | Brace for Impact (+6 armor cycling) |

Relic: **Last Foreman's Badge**

### T2 — Shattered Corridor
| Enemy | S/H | Armor | Key Mechanic |
|-------|-----|-------|-------------|
| Bore Worm | 0/200 | 7 | Repair Swarm heal + heavy hits |
| Foundry Sentinel | 20/180 | 6 | Ablative Plating + stun |
| Freight Escort | 30/220 | 5 | Military railgun burst |
| **Convoy Warden** | 40/480 | 10 | Targeting Lock + self-heal |

Relic: **Convoy Manifest**

### T3 — The Core
| Enemy | S/H | Armor | Key Mechanic |
|-------|-----|-------|-------------|
| Mantle Crawler | 0/350 | 10 | Core Plating (+10=20 armor) + heal |
| Core Bastion | 50/300 | 9 | Mass Driver (60h) + stun combo |
| Iron Revenant | 0/400 | 12 | Highest armor regular + heal |
| **The Lithivore** | 0/850 | 15 | 60 HP heals + Molten Mantle (+15=30 armor) |

Relic: **Molten Heart**

---

## RADIATION (3 tiers)

### Tier Names
Exclusion Zone → Dead Signal → Ground Zero

### Narrative
Not an accident. Living radiation born from a catastrophe. The Quiet Frequency is a self-sustaining waveform that wants you to "stop being separate."

### T1 — Exclusion Zone
| Enemy | S/H | Key Mechanic |
|-------|-----|-------------|
| Flicker Drone | 20/70 | Cloak + mild radiation |
| Isotope Crawler | 0/100 | +3 stacks/5s passive radiation |
| Signal Moth | 30/60 | System jam (weapon slot) |
| **Warden Null-Seven** | 60/240 | Cloak when player irradiated |

Relic: **The Warden's Black Box**

### T2 — Dead Signal
| Enemy | S/H | Key Mechanic |
|-------|-----|-------------|
| Cascade Drone | 40/140 | Feedback Spike at 5+ stacks |
| Phantom Repeater | 60/130 | Cloak + jam + ghost signals |
| Rad-Hulk | 0/250 | +4 stacks/6s, Critical Mass at 10+ |
| **Dr. Echo** | 80/420 | Double jam + cloak pauses stack decay |

Relic: **Thesis of the Quiet Frequency**

### T3 — Ground Zero
| Enemy | S/H | Key Mechanic |
|-------|-----|-------------|
| Decay Angel | 50/280 | All 3 mechanics (stacks+jam+cloak) |
| Null Worm | 0/400 | +5 stacks/5s + Death Bloom on kill |
| Geiger Wraith | 80/250 | Cloaked >50% of fight, jam every 10s |
| **The Quiet Frequency** | 120/580 | Communion Protocol (doubles rad dmg at 8+ stacks) |

Relic: **Geiger's Last Reading**

---

## DEEP SPACE (1 tier: The Threshold)

### Narrative
Cosmic horror. The enemies are failed candidates. The Architect is a universe-propagating process.

### Enemies
| Enemy | S/H | Armor | Tests Branches |
|-------|-----|-------|---------------|
| Null Drifter | 200/250 | 10 | Nebula + Asteroid + Radiation |
| Echo Remnant | 150/300 | 8 | Nebula + Radiation |
| Gravity Phantom | 0/500 | 15 | Asteroid + Radiation + Scan |
| Convergence Choir | 350/200 | 5 | Nebula + Radiation |

### Mini-Boss: The Watcher's Lens (300s/400h, armor 12)
All mechanics combined. Scan only reveals 3/5 abilities.
- Relic: **Omniscient Iris** — Scan reveals all + 10% bonus dmg

### Final Boss: The Architect (500s/1000h, armor 12) — 4 PHASES
- Phase 1 (100-75%): The Pattern — learn the rhythm
- Phase 2 (75-50%): The Warp — Reality Warp inverts damage types 15s
- Phase 3 (50-25%): The Test — cloak + gravity well + stun + radiation
- Phase 4 (25-0%): The Singularity — Reality Warp again + 180s enrage timer
- **Relic: The First Signal** — capstone relic, reframes the entire narrative

---

## Relic Summary

| Region | Boss | Relic | Theme |
|--------|------|-------|-------|
| Void | Guttersnipe King | Hoarder's Manifest | Your ship was targeted |
| Nebula T1 | Mother Nebula Feeder | Nursery's Last Breath | Bio-shield buffer |
| Nebula T2 | Mother of the Mists | Ionic Membrane | Shield scatter |
| Nebula T3 | Mother of Stars | Heart of the First Light | Proto-star power |
| Asteroid T1 | Pit Foreman | Last Foreman's Badge | Machine authority |
| Asteroid T2 | Convoy Warden | Convoy Manifest | Memory of the lost |
| Asteroid T3 | The Lithivore | Molten Heart | Planetary core fragment |
| Radiation T1 | Warden Null-Seven | Warden's Black Box | The cover-up |
| Radiation T2 | Dr. Echo | Thesis of the Quiet Frequency | The discovery |
| Radiation T3 | The Quiet Frequency | Geiger's Last Reading | First contact |
| Deep Space | Watcher's Lens | Omniscient Iris | True sight |
| Deep Space | The Architect | The First Signal | The loop closes |
