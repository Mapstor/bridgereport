/**
 * Process Historical NBI Data
 *
 * Extracts bridge condition data from 2020-2024 NBI files and generates
 * historical trend data for states and counties.
 *
 * Usage: npx tsx scripts/process-historical-nbi.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';

const DATA_DIR = path.join(__dirname, '../data/nbi-historical');
const OUTPUT_DIR = path.join(__dirname, '../data/trends');

const YEARS = [2020, 2021, 2022, 2023, 2024];

interface YearlyStats {
  year: number;
  total: number;
  good: number;
  fair: number;
  poor: number;
}

interface StateStats {
  [stateCode: string]: YearlyStats[];
}

interface CountyStats {
  [key: string]: YearlyStats[]; // key = "stateCode-countyCode"
}

async function processNbiFile(year: number): Promise<{
  states: Map<string, { good: number; fair: number; poor: number }>;
  counties: Map<string, { good: number; fair: number; poor: number }>;
}> {
  const filePath = path.join(DATA_DIR, `${year}_nbi`, `${year}HwyBridgesDelimitedAllStates.txt`);

  const states = new Map<string, { good: number; fair: number; poor: number }>();
  const counties = new Map<string, { good: number; fair: number; poor: number }>();

  const fileStream = fs.createReadStream(filePath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  let headers: string[] = [];
  let stateIdx = -1;
  let countyIdx = -1;
  let conditionIdx = -1;
  let lineNum = 0;

  for await (const line of rl) {
    lineNum++;

    // Parse CSV (handle quoted values with single quotes as text qualifier)
    const values = parseCSVLine(line);

    if (lineNum === 1) {
      headers = values;
      stateIdx = headers.indexOf('STATE_CODE_001');
      countyIdx = headers.indexOf('COUNTY_CODE_003');
      conditionIdx = headers.indexOf('BRIDGE_CONDITION');

      if (stateIdx === -1 || countyIdx === -1 || conditionIdx === -1) {
        throw new Error(`Missing required columns in ${year} file. State: ${stateIdx}, County: ${countyIdx}, Condition: ${conditionIdx}`);
      }
      continue;
    }

    const stateCode = values[stateIdx]?.trim();
    const countyCode = values[countyIdx]?.trim();
    const condition = values[conditionIdx]?.trim().toUpperCase();

    if (!stateCode || !countyCode || !condition) continue;

    // State stats
    if (!states.has(stateCode)) {
      states.set(stateCode, { good: 0, fair: 0, poor: 0 });
    }
    const stateStats = states.get(stateCode)!;

    // County stats (key: stateCode-countyCode for 5-digit FIPS)
    const countyKey = `${stateCode.padStart(2, '0')}${countyCode.padStart(3, '0')}`;
    if (!counties.has(countyKey)) {
      counties.set(countyKey, { good: 0, fair: 0, poor: 0 });
    }
    const countyStats = counties.get(countyKey)!;

    // Count by condition
    if (condition === 'G') {
      stateStats.good++;
      countyStats.good++;
    } else if (condition === 'F') {
      stateStats.fair++;
      countyStats.fair++;
    } else if (condition === 'P') {
      stateStats.poor++;
      countyStats.poor++;
    }
    // Note: Some bridges may have 'N' (Not applicable) or blank - skip those
  }

  console.log(`Processed ${year}: ${lineNum - 1} bridges`);
  return { states, counties };
}

function parseCSVLine(line: string): string[] {
  const values: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === "'" && (i === 0 || line[i - 1] === ',')) {
      // Start of quoted value
      inQuotes = true;
    } else if (char === "'" && inQuotes && (i === line.length - 1 || line[i + 1] === ',')) {
      // End of quoted value
      inQuotes = false;
    } else if (char === ',' && !inQuotes) {
      values.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  values.push(current);

  return values;
}

async function main() {
  console.log('Processing historical NBI data...\n');

  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const stateTrends: StateStats = {};
  const countyTrends: CountyStats = {};

  for (const year of YEARS) {
    const { states, counties } = await processNbiFile(year);

    // Aggregate state data
    for (const [stateCode, stats] of states) {
      const total = stats.good + stats.fair + stats.poor;
      if (!stateTrends[stateCode]) {
        stateTrends[stateCode] = [];
      }
      stateTrends[stateCode].push({
        year,
        total,
        good: stats.good,
        fair: stats.fair,
        poor: stats.poor,
      });
    }

    // Aggregate county data
    for (const [countyFips, stats] of counties) {
      const total = stats.good + stats.fair + stats.poor;
      if (!countyTrends[countyFips]) {
        countyTrends[countyFips] = [];
      }
      countyTrends[countyFips].push({
        year,
        total,
        good: stats.good,
        fair: stats.fair,
        poor: stats.poor,
      });
    }
  }

  // Write state trends
  const stateOutputPath = path.join(OUTPUT_DIR, 'state-trends.json');
  fs.writeFileSync(stateOutputPath, JSON.stringify(stateTrends, null, 2));
  console.log(`\nWrote state trends to ${stateOutputPath}`);
  console.log(`States: ${Object.keys(stateTrends).length}`);

  // Write county trends
  const countyOutputPath = path.join(OUTPUT_DIR, 'county-trends.json');
  fs.writeFileSync(countyOutputPath, JSON.stringify(countyTrends, null, 2));
  console.log(`Wrote county trends to ${countyOutputPath}`);
  console.log(`Counties: ${Object.keys(countyTrends).length}`);

  // Sample output for verification
  console.log('\n--- Sample Output ---');
  const sampleState = '06'; // California
  if (stateTrends[sampleState]) {
    console.log(`\nCalifornia (06) trends:`);
    for (const yearData of stateTrends[sampleState]) {
      const poorPct = ((yearData.poor / yearData.total) * 100).toFixed(1);
      console.log(`  ${yearData.year}: ${yearData.total} bridges, ${yearData.poor} poor (${poorPct}%)`);
    }
  }

  const sampleCounty = '06037'; // Los Angeles County
  if (countyTrends[sampleCounty]) {
    console.log(`\nLos Angeles County (06037) trends:`);
    for (const yearData of countyTrends[sampleCounty]) {
      const poorPct = ((yearData.poor / yearData.total) * 100).toFixed(1);
      console.log(`  ${yearData.year}: ${yearData.total} bridges, ${yearData.poor} poor (${poorPct}%)`);
    }
  }
}

main().catch(console.error);
