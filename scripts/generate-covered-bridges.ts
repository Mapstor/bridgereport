/**
 * Generate Covered Bridges Data
 *
 * Identifies covered bridges from NBI data using:
 * - Material: Wood/Timber (code 7)
 * - Design: Truss-Deck (09), Truss-Thru (10), Arch-Deck (11), Arch-Thru (12)
 *
 * Covered bridges are wooden truss or arch structures with enclosed sides
 * and roof to protect the timber from weather.
 *
 * Usage: npx tsx scripts/generate-covered-bridges.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';

const NBI_FILE = path.join(__dirname, '../data/nbi-historical/2024_nbi/2024HwyBridgesDelimitedAllStates.txt');
const OUTPUT_FILE = path.join(__dirname, '../data/rankings/covered_bridges.json');

// State FIPS to abbreviation mapping
const STATE_FIPS: Record<string, string> = {
  '01': 'AL', '02': 'AK', '04': 'AZ', '05': 'AR', '06': 'CA',
  '08': 'CO', '09': 'CT', '10': 'DE', '11': 'DC', '12': 'FL',
  '13': 'GA', '15': 'HI', '16': 'ID', '17': 'IL', '18': 'IN',
  '19': 'IA', '20': 'KS', '21': 'KY', '22': 'LA', '23': 'ME',
  '24': 'MD', '25': 'MA', '26': 'MI', '27': 'MN', '28': 'MS',
  '29': 'MO', '30': 'MT', '31': 'NE', '32': 'NV', '33': 'NH',
  '34': 'NJ', '35': 'NM', '36': 'NY', '37': 'NC', '38': 'ND',
  '39': 'OH', '40': 'OK', '41': 'OR', '42': 'PA', '44': 'RI',
  '45': 'SC', '46': 'SD', '47': 'TN', '48': 'TX', '49': 'UT',
  '50': 'VT', '51': 'VA', '53': 'WA', '54': 'WV', '55': 'WI',
  '56': 'WY', '60': 'AS', '66': 'GU', '69': 'MP', '72': 'PR', '78': 'VI'
};

// State names
const STATE_NAMES: Record<string, string> = {
  'AL': 'Alabama', 'AK': 'Alaska', 'AZ': 'Arizona', 'AR': 'Arkansas', 'CA': 'California',
  'CO': 'Colorado', 'CT': 'Connecticut', 'DE': 'Delaware', 'DC': 'District of Columbia', 'FL': 'Florida',
  'GA': 'Georgia', 'HI': 'Hawaii', 'ID': 'Idaho', 'IL': 'Illinois', 'IN': 'Indiana',
  'IA': 'Iowa', 'KS': 'Kansas', 'KY': 'Kentucky', 'LA': 'Louisiana', 'ME': 'Maine',
  'MD': 'Maryland', 'MA': 'Massachusetts', 'MI': 'Michigan', 'MN': 'Minnesota', 'MS': 'Mississippi',
  'MO': 'Missouri', 'MT': 'Montana', 'NE': 'Nebraska', 'NV': 'Nevada', 'NH': 'New Hampshire',
  'NJ': 'New Jersey', 'NM': 'New Mexico', 'NY': 'New York', 'NC': 'North Carolina', 'ND': 'North Dakota',
  'OH': 'Ohio', 'OK': 'Oklahoma', 'OR': 'Oregon', 'PA': 'Pennsylvania', 'RI': 'Rhode Island',
  'SC': 'South Carolina', 'SD': 'South Dakota', 'TN': 'Tennessee', 'TX': 'Texas', 'UT': 'Utah',
  'VT': 'Vermont', 'VA': 'Virginia', 'WA': 'Washington', 'WV': 'West Virginia', 'WI': 'Wisconsin',
  'WY': 'Wyoming', 'AS': 'American Samoa', 'GU': 'Guam', 'MP': 'Northern Mariana Islands',
  'PR': 'Puerto Rico', 'VI': 'Virgin Islands'
};

// Design type names
const DESIGN_TYPES: Record<string, string> = {
  '09': 'Truss - Deck',
  '10': 'Truss - Thru',
  '11': 'Arch - Deck',
  '12': 'Arch - Thru'
};

// Covered bridge design types (truss and arch with wood material)
const COVERED_DESIGN_TYPES = new Set(['09', '10', '11', '12']);

interface CoveredBridge {
  id: string;
  structureNumber: string;
  state: string;
  stateName: string;
  countyFips: string;
  countyName: string | null;
  facilityCarried: string | null;
  featuresIntersected: string | null;
  location: string | null;
  yearBuilt: number | null;
  lengthFt: number | null;
  maxSpanFt: number | null;
  conditionCategory: string | null;
  lowestRating: number | null;
  historical: string | null;
  historicalName: string | null;
  lat: number | null;
  lon: number | null;
  designTypeName: string | null;
  adt: number | null;
}

function parseCSVLine(line: string): string[] {
  const values: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === "'" && (i === 0 || line[i - 1] === ',')) {
      inQuotes = true;
    } else if (char === "'" && inQuotes && (i === line.length - 1 || line[i + 1] === ',')) {
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

function getConditionCategory(lowestRating: number | null): string | null {
  if (lowestRating === null) return null;
  if (lowestRating >= 7) return 'good';
  if (lowestRating >= 5) return 'fair';
  return 'poor';
}

function getHistoricalName(code: string | null): string | null {
  switch (code) {
    case '1': return 'On National Register of Historic Places';
    case '2': return 'Eligible for National Register';
    case '3': return 'Possibly eligible';
    case '4': return 'Determined not eligible';
    case '5': return 'Not eligible';
    default: return null;
  }
}

async function generateCoveredBridges(): Promise<void> {
  console.log('Generating covered bridges data from NBI...\n');

  const bridges: CoveredBridge[] = [];
  const stateCounts: Map<string, number> = new Map();

  const fileStream = fs.createReadStream(NBI_FILE);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  let headers: string[] = [];
  let lineNum = 0;
  let totalProcessed = 0;
  let woodBridges = 0;
  let coveredBridges = 0;

  // Column indices
  let colIdx: Record<string, number> = {};

  for await (const line of rl) {
    lineNum++;

    const values = parseCSVLine(line);

    if (lineNum === 1) {
      headers = values;
      // Map column names to indices
      headers.forEach((h, i) => {
        colIdx[h] = i;
      });
      continue;
    }

    totalProcessed++;

    // Get values
    const stateFips = values[colIdx['STATE_CODE_001']]?.trim();
    const structureNumber = values[colIdx['STRUCTURE_NUMBER_008']]?.trim();
    const material = values[colIdx['STRUCTURE_KIND_043A']]?.trim();
    const designType = values[colIdx['STRUCTURE_TYPE_043B']]?.trim();

    // Filter: Wood/Timber material (code 7)
    if (material !== '7') continue;
    woodBridges++;

    // Filter: Covered bridge design types (truss or arch)
    if (!COVERED_DESIGN_TYPES.has(designType)) continue;
    coveredBridges++;

    const state = STATE_FIPS[stateFips];
    if (!state) continue;

    // Extract other fields
    const countyFips = values[colIdx['COUNTY_CODE_003']]?.trim() || '';
    const facilityCarried = values[colIdx['FACILITY_CARRIED_007']]?.trim() || null;
    const featuresIntersected = values[colIdx['FEATURES_DESC_006A']]?.trim() || null;
    const location = values[colIdx['LOCATION_009']]?.trim() || null;
    const yearBuiltStr = values[colIdx['YEAR_BUILT_027']]?.trim();
    const yearBuilt = yearBuiltStr ? parseInt(yearBuiltStr, 10) : null;
    const lengthStr = values[colIdx['STRUCTURE_LEN_MT_049']]?.trim();
    const lengthM = lengthStr ? parseFloat(lengthStr) : null;
    const lengthFt = lengthM ? Math.round(lengthM * 3.28084 * 10) / 10 : null;
    const maxSpanStr = values[colIdx['MAX_SPAN_LEN_MT_048']]?.trim();
    const maxSpanM = maxSpanStr ? parseFloat(maxSpanStr) : null;
    const maxSpanFt = maxSpanM ? Math.round(maxSpanM * 3.28084 * 10) / 10 : null;

    // Condition ratings
    const deckCond = values[colIdx['DECK_COND_058']]?.trim();
    const superCond = values[colIdx['SUPERSTRUCTURE_COND_059']]?.trim();
    const subCond = values[colIdx['SUBSTRUCTURE_COND_060']]?.trim();
    const culvertCond = values[colIdx['CULVERT_COND_062']]?.trim();

    const ratings = [deckCond, superCond, subCond, culvertCond]
      .filter(r => r && r !== 'N' && !isNaN(parseInt(r, 10)))
      .map(r => parseInt(r!, 10));
    const lowestRating = ratings.length > 0 ? Math.min(...ratings) : null;

    const historical = values[colIdx['HISTORY_037']]?.trim() || null;

    // Location
    const latStr = values[colIdx['LAT_016']]?.trim();
    const lonStr = values[colIdx['LONG_017']]?.trim();
    let lat: number | null = null;
    let lon: number | null = null;

    if (latStr && latStr.length >= 6) {
      // Format: DDMMSS.SS
      const latDeg = parseInt(latStr.substring(0, 2), 10);
      const latMin = parseInt(latStr.substring(2, 4), 10);
      const latSec = parseFloat(latStr.substring(4));
      lat = latDeg + latMin / 60 + latSec / 3600;
    }

    if (lonStr && lonStr.length >= 7) {
      // Format: DDDMMSS.SS (negative for western hemisphere)
      const lonDeg = parseInt(lonStr.substring(0, 3), 10);
      const lonMin = parseInt(lonStr.substring(3, 5), 10);
      const lonSec = parseFloat(lonStr.substring(5));
      lon = -(lonDeg + lonMin / 60 + lonSec / 3600);
    }

    const adtStr = values[colIdx['ADT_029']]?.trim();
    const adt = adtStr ? parseInt(adtStr, 10) : null;

    const bridge: CoveredBridge = {
      id: `${state}-${structureNumber}`,
      structureNumber,
      state,
      stateName: STATE_NAMES[state] || state,
      countyFips,
      countyName: null, // Would need county lookup
      facilityCarried,
      featuresIntersected,
      location,
      yearBuilt: yearBuilt && yearBuilt > 1700 ? yearBuilt : null,
      lengthFt,
      maxSpanFt,
      conditionCategory: getConditionCategory(lowestRating),
      lowestRating,
      historical,
      historicalName: getHistoricalName(historical),
      lat,
      lon,
      designTypeName: DESIGN_TYPES[designType] || null,
      adt: adt && adt > 0 ? adt : null,
    };

    bridges.push(bridge);
    stateCounts.set(state, (stateCounts.get(state) || 0) + 1);
  }

  console.log(`Processed ${totalProcessed.toLocaleString()} bridges`);
  console.log(`Found ${woodBridges.toLocaleString()} Wood/Timber bridges`);
  console.log(`Found ${coveredBridges.toLocaleString()} covered bridges (Wood + Truss/Arch)\n`);

  // Sort bridges by year built (oldest first)
  bridges.sort((a, b) => {
    if (a.yearBuilt === null && b.yearBuilt === null) return 0;
    if (a.yearBuilt === null) return 1;
    if (b.yearBuilt === null) return -1;
    return a.yearBuilt - b.yearBuilt;
  });

  // Build state summary sorted by count
  const byState = Array.from(stateCounts.entries())
    .map(([state, count]) => ({
      state,
      stateName: STATE_NAMES[state] || state,
      count
    }))
    .sort((a, b) => b.count - a.count);

  // Output
  const output = {
    total: bridges.length,
    byState,
    bridges
  };

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2));
  console.log(`Wrote ${OUTPUT_FILE}`);
  console.log(`\nTotal: ${bridges.length} covered bridges`);
  console.log(`States: ${byState.length}`);
  console.log('\nTop 10 states:');
  byState.slice(0, 10).forEach(s => {
    console.log(`  ${s.state} (${s.stateName}): ${s.count}`);
  });
}

generateCoveredBridges().catch(console.error);
