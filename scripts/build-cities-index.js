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

const SRC = path.join(__dirname, '..', 'data', 'cities');
const DST = path.join(__dirname, '..', 'data', 'cities-index');

if (!fs.existsSync(SRC)) {
  console.error(`build-cities-index: source dir not found: ${SRC}`);
  process.exit(0); // not fatal — let the build proceed
}

fs.mkdirSync(DST, { recursive: true });

const states = fs.readdirSync(SRC).filter((d) => d.length === 2 && d === d.toUpperCase());
let total = 0;
for (const state of states) {
  const stateDir = path.join(SRC, state);
  const files = fs.readdirSync(stateDir).filter((f) => f.endsWith('.json'));
  const idx = {};
  for (const file of files) {
    const fips = file.replace('.json', '');
    idx[fips] = JSON.parse(fs.readFileSync(path.join(stateDir, file), 'utf-8'));
  }
  fs.writeFileSync(path.join(DST, `${state}.json`), JSON.stringify(idx));
  total += files.length;
}

console.log(`build-cities-index: ${states.length} state index files, ${total} cities`);
