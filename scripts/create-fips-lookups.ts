/**
 * Script to create FIPS county lookup file from Census data
 * Run with: npx tsx scripts/create-fips-lookups.ts
 */

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const DATA_DIR = join(process.cwd(), 'data');

// Read the downloaded FIPS master file
const fipsCsv = readFileSync('/tmp/fips_master.csv', 'utf-8');
const lines = fipsCsv.trim().split('\n');

// Parse header
const header = lines[0];
console.log('Header:', header);

// Build county lookup: "SS-CCC" → "County Name"
const countyLookup: Record<string, string> = {};

for (let i = 1; i < lines.length; i++) {
  const line = lines[i];
  const [fips, name, state] = line.split(',');

  // Skip header row, state-level entries (ending in 000), and national entry
  if (!state || state === 'NA' || fips.length < 4) continue;

  // Pad FIPS to 5 digits (SSCCC format)
  const paddedFips = fips.padStart(5, '0');
  const stateFips = paddedFips.substring(0, 2);
  const countyFips = paddedFips.substring(2, 5);

  // Map state FIPS to state abbreviation
  const stateAbbr = state.trim();
  if (!stateAbbr || stateAbbr.length !== 2) continue;

  // Create the key in our format: "STATE-COUNTYFIPS"
  const key = `${stateAbbr}-${countyFips}`;

  // Clean up county name (remove " County", " Parish", " Borough" suffixes for cleaner display)
  const cleanName = name.trim();

  countyLookup[key] = cleanName;
}

console.log(`Created ${Object.keys(countyLookup).length} county mappings`);

// Write county lookup
const countyOutputPath = join(DATA_DIR, 'meta', 'fips_counties.json');
writeFileSync(countyOutputPath, JSON.stringify(countyLookup, null, 2));
console.log(`Written to ${countyOutputPath}`);

// For places, we need a different approach since they're less standardized
// Create a minimal places lookup using the place FIPS codes we have in our data
// Read all city files to get place FIPS, then we'll need to figure out names

import { readdirSync, existsSync } from 'fs';

const placeLookup: Record<string, string> = {};

// Read all states in cities directory
const citiesDir = join(DATA_DIR, 'cities');
const states = readdirSync(citiesDir).filter(f => !f.startsWith('.'));

for (const state of states) {
  const stateDir = join(citiesDir, state);
  if (!existsSync(stateDir)) continue;

  const files = readdirSync(stateDir).filter(f => f.endsWith('.json'));

  for (const file of files) {
    const placeFips = file.replace('.json', '');
    const key = `${state}-${placeFips}`;

    // For now, just mark with a placeholder - we'll need to enhance this
    // The NBI data doesn't include place names, so we'll need another source
    placeLookup[key] = `Place ${placeFips}`;
  }
}

console.log(`Created ${Object.keys(placeLookup).length} place mappings (placeholder names)`);

// Write place lookup
const placeOutputPath = join(DATA_DIR, 'meta', 'fips_places.json');
writeFileSync(placeOutputPath, JSON.stringify(placeLookup, null, 2));
console.log(`Written to ${placeOutputPath}`);

console.log('\nDone! Note: Place names are placeholders. Need Census place FIPS data for real names.');
