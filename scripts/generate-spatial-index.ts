/**
 * Script to generate spatial-index.json for the "Bridges Near Me" feature
 * Creates a minimal JSON file with all bridges that have valid coordinates
 *
 * Run with: npx tsx scripts/generate-spatial-index.ts
 */

import { readFileSync, writeFileSync, readdirSync, existsSync } from 'fs';
import { join } from 'path';

const DATA_DIR = join(process.cwd(), 'data');
const COUNTIES_DIR = join(DATA_DIR, 'counties');
const OUTPUT_PATH = join(DATA_DIR, 'spatial-index.json');

interface BridgeSlim {
  id: string;
  facilityCarried: string;
  featuresIntersected: string;
  yearBuilt: number | null;
  lowestRating: number | null;
  conditionCategory: 'good' | 'fair' | 'poor' | null;
  adt: number | null;
  lengthFt: number | null;
  lat?: number | null;
  lon?: number | null;
}

interface CountyData {
  state: string;
  bridges: BridgeSlim[];
}

// Minimal entry format: [id, state, lat, lon, facility, over, condition]
// condition: 0=poor, 1=fair, 2=good, -1=unknown
type SpatialEntry = [string, string, number, number, string, string, number];

function encodeCondition(condition: string | null): number {
  switch (condition) {
    case 'poor': return 0;
    case 'fair': return 1;
    case 'good': return 2;
    default: return -1;
  }
}

function truncate(str: string, maxLen: number): string {
  if (str.length <= maxLen) return str;
  return str.substring(0, maxLen - 1) + '…';
}

console.log('Generating spatial index...');

const allBridges: SpatialEntry[] = [];
let totalProcessed = 0;
let skippedNoCoords = 0;

// Get all state directories
const states = readdirSync(COUNTIES_DIR).filter(f => !f.startsWith('.'));
console.log(`Found ${states.length} state directories`);

for (const state of states) {
  const stateDir = join(COUNTIES_DIR, state);
  if (!existsSync(stateDir)) continue;

  const countyFiles = readdirSync(stateDir).filter(f => f.endsWith('.json'));
  let stateCount = 0;

  for (const countyFile of countyFiles) {
    try {
      const filePath = join(stateDir, countyFile);
      const data: CountyData = JSON.parse(readFileSync(filePath, 'utf-8'));

      if (!data.bridges || !Array.isArray(data.bridges)) continue;

      for (const bridge of data.bridges) {
        totalProcessed++;

        // Skip bridges without valid coordinates
        if (
          bridge.lat === null ||
          bridge.lat === undefined ||
          bridge.lon === null ||
          bridge.lon === undefined ||
          bridge.lat === 0 ||
          bridge.lon === 0
        ) {
          skippedNoCoords++;
          continue;
        }

        // Array format: [id, state, lat, lon, facility, over, condition]
        allBridges.push([
          bridge.id,
          state,
          Math.round(bridge.lat * 10000) / 10000, // 4 decimal places (~11m precision)
          Math.round(bridge.lon * 10000) / 10000,
          truncate(bridge.facilityCarried || 'Unknown', 30),
          truncate(bridge.featuresIntersected || 'Unknown', 30),
          encodeCondition(bridge.conditionCategory),
        ]);

        stateCount++;
      }
    } catch (err) {
      console.error(`Error processing ${state}/${countyFile}:`, err);
    }
  }

  console.log(`  ${state}: ${stateCount.toLocaleString()} bridges`);
}

console.log(`\nTotal bridges processed: ${totalProcessed.toLocaleString()}`);
console.log(`Skipped (no coordinates): ${skippedNoCoords.toLocaleString()}`);
console.log(`Bridges with coordinates: ${allBridges.length.toLocaleString()}`);

// Write output
console.log(`\nWriting to ${OUTPUT_PATH}...`);
const json = JSON.stringify(allBridges);
writeFileSync(OUTPUT_PATH, json);

const sizeBytes = Buffer.byteLength(json, 'utf8');
const sizeMB = (sizeBytes / 1024 / 1024).toFixed(2);
console.log(`Output size: ${sizeMB} MB`);
console.log('Done!');
