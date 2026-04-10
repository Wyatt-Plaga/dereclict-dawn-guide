#!/bin/bash
# Generate pixel art sprites for all enemies, the player ship, and region art
# Uses the Pixel Lab API (pixflux endpoint for 64x64 sprites)

API_KEY="91e3c17a-cebd-46dd-b34e-c20c0bcded07"
BASE_URL="https://api.pixellab.ai/v1/generate-image-pixflux"
OUT_DIR="$(cd "$(dirname "$0")/.." && pwd)/public/enemies"
SHIP_DIR="$(cd "$(dirname "$0")/.." && pwd)/public"

mkdir -p "$OUT_DIR"

generate() {
  local id="$1"
  local prompt="$2"
  local outdir="$3"
  local outfile="${outdir}/${id}.png"

  if [ -f "$outfile" ]; then
    echo "SKIP $id (already exists)"
    return
  fi

  echo "Generating $id..."
  local response
  response=$(curl -s -X POST "$BASE_URL" \
    -H "Authorization: Bearer $API_KEY" \
    -H "Content-Type: application/json" \
    -d "{
      \"description\": \"${prompt}\",
      \"image_size\": {\"width\": 64, \"height\": 64},
      \"no_background\": true,
      \"shading\": \"medium shading\",
      \"detail\": \"medium detail\",
      \"view\": \"side\",
      \"direction\": \"east\",
      \"text_guidance_scale\": 8
    }" 2>&1)

  local b64
  b64=$(echo "$response" | python3 -c "import sys,json; print(json.load(sys.stdin)['image']['base64'])" 2>/dev/null)

  if [ -n "$b64" ]; then
    echo "$b64" | base64 -d > "$outfile"
    echo "  OK -> $outfile"
  else
    echo "  FAILED: $response" | head -c 200
    echo
  fi

  # Small delay to avoid rate limiting
  sleep 0.3
}

echo "=== ENEMY SPRITES ==="

# Void enemies
generate "scavenger" "a small ramshackle spaceship cobbled together from scrap metal and salvaged parts, sci-fi pixel art, dark hull with rust patches, small weapons" "$OUT_DIR"
generate "patrol-drone" "a small automated security drone spaceship, spherical with antenna and blinking lights, old and damaged, sci-fi pixel art" "$OUT_DIR"
generate "void-lurker" "a dark predatory alien creature in space, sleek black body with glowing red eyes, sharp claws, menacing, sci-fi pixel art" "$OUT_DIR"
generate "guttersnipe-king" "a massive bloated salvage barge spaceship, three times normal size, hull covered in stolen plating from many ships, imposing, sci-fi pixel art boss enemy" "$OUT_DIR"

# Nebula T1
generate "infant-nebula-feeder" "a small bioluminescent space creature, jellyfish-like with glowing purple tentacles, feeding tendrils, nebula creature, sci-fi pixel art" "$OUT_DIR"
generate "plasma-wisp" "a floating ball of bright ionized plasma gas, glowing blue-white energy orb, ethereal, nebula creature, sci-fi pixel art" "$OUT_DIR"
generate "nebula-jellyfish" "a vast translucent space jellyfish with electric tentacles, glowing blue-purple membrane, crackling with electricity, sci-fi pixel art" "$OUT_DIR"
generate "mother-nebula-feeder" "a massive bioluminescent space creature, enormous jellyfish-like being with impenetrable glowing shield membrane, purple and blue, boss enemy, sci-fi pixel art" "$OUT_DIR"

# Nebula T2
generate "juvenile-nebula-feeder" "a large aggressive bioluminescent space creature, evolved jellyfish with sharp feeding tendrils, glowing purple, more dangerous than infant, sci-fi pixel art" "$OUT_DIR"
generate "ion-wraith" "a ghostly ship outline made of pure energy, no hull just glowing blue electromagnetic energy in ship shape, spectral, sci-fi pixel art" "$OUT_DIR"
generate "luminous-parasite-swarm" "a swarm of thousands of tiny bioluminescent organisms moving as one cloud, pink and purple glowing dots, alien parasites, sci-fi pixel art" "$OUT_DIR"
generate "mother-of-the-mists" "a colossal nebula creature wreathed in white-hot ionized cloud, massive boss monster, glowing shield, electric tendrils, sci-fi pixel art boss" "$OUT_DIR"

# Nebula T3
generate "adult-nebula-feeder" "an enormous mature space creature kilometers across, massive shimmering shield membrane visible from orbit, deep purple bioluminescence, sci-fi pixel art" "$OUT_DIR"
generate "stellar-embryo" "a proto-star being born, compressed glowing hydrogen sphere with its own gravity, bright white-yellow core, space creature, sci-fi pixel art" "$OUT_DIR"
generate "prismatic-cnidarian" "an ancient crystalline jellyfish-like entity, body refracts light into rainbow colors, many tentacles each glowing different color, sci-fi pixel art" "$OUT_DIR"
generate "mother-of-stars" "the oldest creature in the nebula, massive with a burning proto-star visible inside translucent body, ultimate boss, glowing with creation energy, sci-fi pixel art" "$OUT_DIR"

# Radiation T1
generate "flicker-drone" "a damaged reconnaissance drone that phases in and out, glitchy appearance, radiation-damaged, trailing green contaminated particles, sci-fi pixel art" "$OUT_DIR"
generate "isotope-crawler" "a biological creature that eats radiation, insectoid, glowing green veins, leaving trail of isotopes, alien horror, sci-fi pixel art" "$OUT_DIR"
generate "signal-moth" "a large moth-like alien creature with electromagnetic wings, broadcasting interference patterns, wings glow with radio waves, sci-fi pixel art" "$OUT_DIR"
generate "warden-null-seven" "a heavy automated containment warden robot, lead-lined armor, repurposed decontamination weapons, military design, bulky and threatening, sci-fi pixel art" "$OUT_DIR"

# Radiation T2
generate "cascade-drone" "a weapons platform drone covered in radiation warning symbols, firing glowing green bolts, angular military design, sci-fi pixel art" "$OUT_DIR"
generate "phantom-repeater" "a ghostly ship that phases in and out of existence, broadcasting phantom signals, translucent hull with static interference, sci-fi pixel art" "$OUT_DIR"
generate "rad-hulk" "the irradiated wreck of a massive capital ship, cracks in hull venting green radiation, walking reactor meltdown, sci-fi pixel art" "$OUT_DIR"
generate "dr-echo" "a research vessel AI gone mad, ship covered in antenna broadcasting research data, eerie blue glow, cloaked in data streams, sci-fi pixel art" "$OUT_DIR"

# Radiation T3
generate "decay-angel" "an angel made of pure radiation, beautiful wings of ionized green gas, body of blue Cherenkov glow, ethereal and lethal, sci-fi pixel art" "$OUT_DIR"
generate "null-worm" "a tunnel of living green radiation boring through space, worm-like pure contamination entity, glowing intensely, sci-fi pixel art" "$OUT_DIR"
generate "geiger-wraith" "an almost invisible wraith, barely visible outline, clicking radiation aura, ghostly green shimmer, more absence than presence, sci-fi pixel art" "$OUT_DIR"
generate "the-quiet-frequency" "a self-sustaining waveform of living coherent radiation, abstract entity of pure green energy patterns, hypnotic, alien, sci-fi pixel art boss" "$OUT_DIR"

# Asteroid T1
generate "strip-miner" "an autonomous mining excavation rig robot, heavy drill arm, industrial yellow-orange coloring, mechanical, sci-fi pixel art" "$OUT_DIR"
generate "slag-hauler" "a heavy industrial transport drone, massive and bulky, built to carry ore, armored front for ramming, orange-brown, sci-fi pixel art" "$OUT_DIR"
generate "rubble-runner" "a fast small debris-clearing drone, agile with cutting tools, yellow warning stripes, industrial design, sci-fi pixel art" "$OUT_DIR"
generate "pit-foreman" "a massive overseer mining construct, twice normal size, huge hammer-piston arm, industrial boss robot, imposing yellow-orange, sci-fi pixel art boss" "$OUT_DIR"

# Asteroid T2
generate "bore-worm" "a segmented mechanical tunnel-boring machine worm, armored segments, drill head, massive and serpentine in space, industrial sci-fi pixel art" "$OUT_DIR"
generate "foundry-sentinel" "a military-grade smelter platform, fires molten metal slugs, shedding damaged armor plates, red-hot glow, industrial military, sci-fi pixel art" "$OUT_DIR"
generate "freight-escort" "a decommissioned military corvette warship, running old patrol subroutines, worn military hull with faded markings, sci-fi pixel art" "$OUT_DIR"
generate "convoy-warden" "a heavy military cruiser flagship, massive armored warship with heavy weapons, last line of defense, imposing, sci-fi pixel art boss" "$OUT_DIR"

# Asteroid T3
generate "mantle-crawler" "a deep-core extraction platform fused with asteroid rock, half machine half stone, planetary crust armor, sci-fi pixel art" "$OUT_DIR"
generate "core-bastion" "the ultimate automated defense platform, military fortress design, built to survive orbital bombardment, heavily armored, sci-fi pixel art" "$OUT_DIR"
generate "iron-revenant" "a mining mega-rig rebuilt by repair drones into something unrecognizable, frankenstein machine horror, moving with terrible purpose, sci-fi pixel art" "$OUT_DIR"
generate "lithivore" "an enormous creature that eats planets, kilometers across, biological impossibility, stone and metal body, sleeping titan, sci-fi pixel art boss" "$OUT_DIR"

# Supernova / Threshold
generate "null-drifter" "a vessel from another dimension, hull absorbs light, alien and wrong-looking, made of impossible dark material, sci-fi pixel art" "$OUT_DIR"
generate "echo-remnant" "a ghost ship in temporal decay, flickering between existing and not, translucent hull showing its own past, haunting, sci-fi pixel art" "$OUT_DIR"
generate "gravity-phantom" "a stable gravitational anomaly with intention, not a ship but compressed spacetime given form, distorting light around it, abstract, sci-fi pixel art" "$OUT_DIR"
generate "convergence-choir" "multiple harmonious entities singing together, crystalline beings resonating at different frequencies, musical and alien, sci-fi pixel art" "$OUT_DIR"
generate "watchers-lens" "an artifact of impossible geometry, a cosmic lens observing all wavelengths, geometric alien structure, ancient and powerful, sci-fi pixel art boss" "$OUT_DIR"
generate "the-architect" "a universe-building entity, abstract cosmic being of pure pattern and concept, vast beyond comprehension, geometric fractal design, god-like, sci-fi pixel art final boss" "$OUT_DIR"

echo ""
echo "=== PLAYER SHIP ==="
generate "dawn-ship" "a colony starship called the Dawn, sleek but damaged hull, blue engine glow, heroic design, medium-sized spacecraft, sci-fi pixel art" "$SHIP_DIR"

echo ""
echo "=== REGION ART ==="
REGION_DIR="$(cd "$(dirname "$0")/.." && pwd)/public/regions"
mkdir -p "$REGION_DIR"

generate "void" "deep empty space with distant stars, dark and lonely void, subtle nebula wisps in the distance, pixel art space background" "$REGION_DIR"
generate "nebula" "a colorful stellar nursery nebula, purple and blue glowing gas clouds, newborn stars, bioluminescent creatures in distance, pixel art space" "$REGION_DIR"
generate "asteroid" "a shattered asteroid belt, remains of a broken planet, mining rigs and debris, orange and brown rocks floating in space, pixel art" "$REGION_DIR"
generate "deepspace" "a radiation exclusion zone in space, eerie green glow, containment beacons, warning signals, contaminated space, pixel art" "$REGION_DIR"
generate "blackhole" "a stellar graveyard near a black hole, dead dark stars, warped spacetime, reality bending, gravitational distortion, cosmic horror, pixel art" "$REGION_DIR"

echo ""
echo "=== DONE ==="
echo "Generated sprites in $OUT_DIR, $SHIP_DIR, $REGION_DIR"
