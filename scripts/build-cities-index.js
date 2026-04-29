#!/usr/bin/env node
/**
 * Consolidates per-city JSON files (data/cities/{STATE}/{FIPS}.json — 21K files)
 * into per-state index files (data/cities-index/{STATE}.json — 53 files).
 *
 * Vercel's outputFileTracing reliably bundles 53 files but silently drops 21K of them,
 * which is why /city/[state]/[slug] returned 404 in production before this script existed.
 *
 * Runs as a prebuild step (npm scripts: prebuild, prebuild:vercel).
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SRC = path.join(ROOT, 'data', 'cities');
const DST = path.join(ROOT, 'data', 'cities-index');
const BRIDGES = path.join(ROOT, 'data', 'bridges');

if (!fs.existsSync(SRC)) {
  console.error(`build-cities-index: source dir not found: ${SRC}`);
  process.exit(0); // not fatal — let the build proceed
}

fs.mkdirSync(DST, { recursive: true });

const states = fs.readdirSync(SRC).filter((d) => d.length === 2 && d === d.toUpperCase());
let totalCities = 0;
let totalEnriched = 0;
for (const state of states) {
  // Build state-wide bridge lat/lon lookup once. data/bridges/<state>/ has the
  // full bridge records; the per-city BridgeSlim records strip lat/lon, which
  // blocked geo coordinates on the city Place schema.
  const bridgeStateDir = path.join(BRIDGES, state);
  const coordMap = {};
  if (fs.existsSync(bridgeStateDir)) {
    const bridgeFiles = fs.readdirSync(bridgeStateDir).filter((f) => f.endsWith('.json'));
    for (const bf of bridgeFiles) {
      try {
        const b = JSON.parse(fs.readFileSync(path.join(bridgeStateDir, bf), 'utf-8'));
        if (b && b.id && b.lat != null && b.lon != null) {
          coordMap[b.id] = { lat: b.lat, lon: b.lon };
        }
      } catch {
        /* skip malformed */
      }
    }
  }

  const stateDir = path.join(SRC, state);
  const files = fs.readdirSync(stateDir).filter((f) => f.endsWith('.json'));
  const idx = {};
  for (const file of files) {
    const fips = file.replace('.json', '');
    const city = JSON.parse(fs.readFileSync(path.join(stateDir, file), 'utf-8'));
    // Inject lat/lon into each BridgeSlim entry so PlaceJsonLd can compute centroid.
    if (Array.isArray(city.bridges)) {
      for (const slim of city.bridges) {
        const c = coordMap[slim.id];
        if (c) {
          slim.lat = c.lat;
          slim.lon = c.lon;
          totalEnriched++;
        }
      }
    }
    idx[fips] = city;
  }
  fs.writeFileSync(path.join(DST, `${state}.json`), JSON.stringify(idx));
  totalCities += files.length;
}

console.log(`build-cities-index: ${states.length} state index files, ${totalCities} cities, ${totalEnriched} bridges enriched with lat/lon`);
