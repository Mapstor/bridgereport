#!/usr/bin/env npx tsx
/**
 * Generate Covered Bridges Data + Individual Bridge Files
 *
 * Reads from RAW NBI data (not filtered bridge JSON) to find all covered bridges:
 * - Material: Wood/Timber (code 7)
 * - Design: Truss-Deck (09), Truss-Thru (10), Arch-Deck (11), Arch-Thru (12)
 *
 * This creates an EXCEPTION to the 50ft minimum length rule for covered bridges
 * because they are culturally significant/historic structures.
 *
 * Outputs:
 * - data/rankings/covered_bridges.json - ranking file with all covered bridges
 * - data/bridges/{STATE}/{structureNumber}.json - individual bridge files (created if missing)
 *
 * Usage: npx tsx scripts/generate-covered-bridges.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';

const NBI_FILE = path.join(__dirname, '../data/nbi-historical/2024_nbi/2024HwyBridgesDelimitedAllStates.txt');
const BRIDGES_DIR = path.join(__dirname, '../data/bridges');
const OUTPUT_FILE = path.join(__dirname, '../data/rankings/covered_bridges.json');

// FIPS to State abbreviation
const FIPS_TO_STATE: Record<string, string> = {
  '01': 'AL', '02': 'AK', '04': 'AZ', '05': 'AR', '06': 'CA', '08': 'CO', '09': 'CT',
  '10': 'DE', '11': 'DC', '12': 'FL', '13': 'GA', '15': 'HI', '16': 'ID', '17': 'IL',
  '18': 'IN', '19': 'IA', '20': 'KS', '21': 'KY', '22': 'LA', '23': 'ME', '24': 'MD',
  '25': 'MA', '26': 'MI', '27': 'MN', '28': 'MS', '29': 'MO', '30': 'MT', '31': 'NE',
  '32': 'NV', '33': 'NH', '34': 'NJ', '35': 'NM', '36': 'NY', '37': 'NC', '38': 'ND',
  '39': 'OH', '40': 'OK', '41': 'OR', '42': 'PA', '44': 'RI', '45': 'SC', '46': 'SD',
  '47': 'TN', '48': 'TX', '49': 'UT', '50': 'VT', '51': 'VA', '53': 'WA', '54': 'WV',
  '55': 'WI', '56': 'WY', '66': 'GU', '72': 'PR', '78': 'VI',
};

const STATE_NAMES: Record<string, string> = {
  'AL': 'Alabama', 'AK': 'Alaska', 'AZ': 'Arizona', 'AR': 'Arkansas', 'CA': 'California',
  'CO': 'Colorado', 'CT': 'Connecticut', 'DE': 'Delaware', 'DC': 'District of Columbia',
  'FL': 'Florida', 'GA': 'Georgia', 'HI': 'Hawaii', 'ID': 'Idaho', 'IL': 'Illinois',
  'IN': 'Indiana', 'IA': 'Iowa', 'KS': 'Kansas', 'KY': 'Kentucky', 'LA': 'Louisiana',
  'ME': 'Maine', 'MD': 'Maryland', 'MA': 'Massachusetts', 'MI': 'Michigan', 'MN': 'Minnesota',
  'MS': 'Mississippi', 'MO': 'Missouri', 'MT': 'Montana', 'NE': 'Nebraska', 'NV': 'Nevada',
  'NH': 'New Hampshire', 'NJ': 'New Jersey', 'NM': 'New Mexico', 'NY': 'New York',
  'NC': 'North Carolina', 'ND': 'North Dakota', 'OH': 'Ohio', 'OK': 'Oklahoma',
  'OR': 'Oregon', 'PA': 'Pennsylvania', 'RI': 'Rhode Island', 'SC': 'South Carolina',
  'SD': 'South Dakota', 'TN': 'Tennessee', 'TX': 'Texas', 'UT': 'Utah', 'VT': 'Vermont',
  'VA': 'Virginia', 'WA': 'Washington', 'WV': 'West Virginia', 'WI': 'Wisconsin',
  'WY': 'Wyoming', 'GU': 'Guam', 'PR': 'Puerto Rico', 'VI': 'U.S. Virgin Islands',
};

const MATERIAL_CODES: Record<string, string> = {
  '1': 'Concrete', '2': 'Concrete Continuous', '3': 'Steel', '4': 'Steel Continuous',
  '5': 'Prestressed Concrete', '6': 'Prestressed Concrete Continuous',
  '7': 'Wood or Timber', '8': 'Masonry', '9': 'Aluminum/Wrought Iron/Cast Iron', '0': 'Other',
};

const MATERIAL_GROUPS: Record<string, string> = {
  '1': 'Concrete', '2': 'Concrete', '3': 'Steel', '4': 'Steel',
  '5': 'Prestressed Concrete', '6': 'Prestressed Concrete',
  '7': 'Wood/Timber', '8': 'Masonry', '9': 'Metal (Other)', '0': 'Other',
};

const DESIGN_CODES: Record<string, string> = {
  '01': 'Slab', '02': 'Stringer/Multi-beam or Girder', '03': 'Girder and Floorbeam',
  '04': 'Tee Beam', '05': 'Box Beam - Multiple', '06': 'Box Beam - Single/Spread',
  '07': 'Frame', '08': 'Orthotropic', '09': 'Truss - Deck', '10': 'Truss - Thru',
  '11': 'Arch - Deck', '12': 'Arch - Thru', '13': 'Suspension', '14': 'Cable-Stayed',
  '15': 'Movable - Lift', '16': 'Movable - Bascule', '17': 'Movable - Swing',
  '18': 'Tunnel', '19': 'Culvert', '20': 'Mixed Types', '21': 'Segmental Box Girder',
  '22': 'Channel Beam', '00': 'Other',
};

const OWNER_CODES: Record<string, string> = {
  '01': 'State Highway Agency', '02': 'County Highway Agency',
  '03': 'Town/Township', '04': 'City/Municipal', '11': 'State Park/Forest',
  '12': 'Local Park/Forest', '21': 'Other State', '25': 'Other Local',
  '26': 'Private', '27': 'Railroad', '31': 'State Toll Authority',
  '32': 'Local Toll Authority', '60': 'Other Federal', '61': 'Tribal',
  '62': 'Bureau of Indian Affairs', '63': 'Fish and Wildlife',
  '64': 'U.S. Forest Service', '66': 'National Park Service',
  '67': 'TVA', '68': 'Bureau of Land Management', '69': 'Bureau of Reclamation',
  '70': 'Corps of Engineers', '80': 'Unknown',
};

const HISTORICAL_CODES: Record<string, string> = {
  '1': 'On National Register of Historic Places', '2': 'Eligible for NRHP',
  '3': 'Possibly eligible', '4': 'Not determined', '5': 'Not eligible',
};

const ROUTE_PREFIX: Record<string, string> = {
  '1': 'Interstate', '2': 'US Highway', '3': 'State Highway', '4': 'County Road',
  '5': 'City Street', '6': 'Federal Lands', '7': 'State Lands', '8': 'Other',
};

// Covered bridge criteria
const WOOD_MATERIAL_CODE = '7';
const COVERED_DESIGN_CODES = new Set(['09', '10', '11', '12']);

interface ColumnMap {
  [key: string]: number;
}

interface BridgeRecord {
  id: string;
  structureNumber: string;
  state: string;
  stateFips: string;
  stateName: string;
  countyFips: string;
  placeFips: string;
  location: string | null;
  featuresIntersected: string | null;
  facilityCarried: string | null;
  lat: number | null;
  lon: number | null;
  routePrefix: string;
  routePrefixName: string;
  routeNumber: string;
  owner: string;
  ownerName: string;
  functionalClass: string;
  yearBuilt: number | null;
  yearReconstructed: number | null;
  material: string;
  materialName: string;
  materialGroup: string;
  designType: string;
  designTypeName: string;
  lanesOn: number;
  lanesUnder: number;
  maxSpanM: number | null;
  maxSpanFt: number | null;
  lengthM: number | null;
  lengthFt: number | null;
  deckWidthM: number | null;
  deckWidthFt: number | null;
  roadwayWidthM: number | null;
  adt: number | null;
  adtYear: number | null;
  truckPct: number | null;
  futureAdt: number | null;
  deckCondition: string | null;
  superstructureCondition: string | null;
  substructureCondition: string | null;
  culvertCondition: string | null;
  channelCondition: string | null;
  lowestRating: number | null;
  conditionCategory: string | null;
  structurallyDeficient: boolean;
  operatingRating: number | null;
  inventoryRating: number | null;
  toll: boolean;
  historical: string | null;
  historicalName: string | null;
  scourCritical: string | null;
  detourKm: number | null;
  status: string;
  deckArea: number | null;
}

interface CoveredBridgeSummary {
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

function safeInt(val: string, defaultVal = 0): number {
  const parsed = parseInt(val.trim(), 10);
  return isNaN(parsed) ? defaultVal : parsed;
}

function safeFloat(val: string, defaultVal = 0.0): number {
  const parsed = parseFloat(val.trim());
  return isNaN(parsed) ? defaultVal : parsed;
}

function parseLat(raw: string): number | null {
  try {
    raw = raw.trim();
    if (raw.length < 6) return null;
    const dd = parseInt(raw.slice(0, 2), 10);
    const mm = parseInt(raw.slice(2, 4), 10);
    const ss = parseFloat(raw.slice(4));
    const dec = dd + mm / 60 + ss / 3600;
    return dec > 0 ? Math.round(dec * 1000000) / 1000000 : null;
  } catch {
    return null;
  }
}

function parseLon(raw: string): number | null {
  try {
    raw = raw.trim();
    if (raw.length < 7) return null;
    const ddd = parseInt(raw.slice(0, 3), 10);
    const mm = parseInt(raw.slice(3, 5), 10);
    const ss = parseFloat(raw.slice(5));
    const dec = -(ddd + mm / 60 + ss / 3600); // Western hemisphere = negative
    return dec !== 0 ? Math.round(dec * 1000000) / 1000000 : null;
  } catch {
    return null;
  }
}

function conditionCategory(rating: number | null): string | null {
  if (rating === null) return null;
  if (rating >= 7) return 'good';
  if (rating >= 5) return 'fair';
  return 'poor';
}

function isStructurallyDeficient(deck: string, superstructure: string, substructure: string, culvert: string): boolean {
  for (const rating of [deck, superstructure, substructure, culvert]) {
    try {
      const r = parseInt(rating.trim(), 10);
      if (!isNaN(r) && r <= 4) return true;
    } catch {
      continue;
    }
  }
  return false;
}

function overallCondition(deck: string, superstructure: string, substructure: string, culvert: string): number | null {
  const ratings: number[] = [];
  for (const r of [deck, superstructure, substructure, culvert]) {
    const parsed = parseInt(r.trim(), 10);
    if (!isNaN(parsed)) ratings.push(parsed);
  }
  return ratings.length > 0 ? Math.min(...ratings) : null;
}

function detectColumns(headerRow: string[]): ColumnMap {
  const colMap: ColumnMap = {};
  for (let idx = 0; idx < headerRow.length; idx++) {
    const colName = headerRow[idx].trim().replace(/^['"]|['"]$/g, '').toUpperCase();
    colMap[colName] = idx;
  }
  return colMap;
}

function getValue(row: string[], colMap: ColumnMap, ...fieldNames: string[]): string {
  for (const fieldName of fieldNames) {
    // Try exact match
    if (fieldName in colMap) {
      const idx = colMap[fieldName];
      if (idx < row.length) {
        return row[idx].trim().replace(/^'|'$/g, '');
      }
    }
    // Try partial match
    for (const [key, idx] of Object.entries(colMap)) {
      if (key.includes(fieldName)) {
        if (idx < row.length) {
          return row[idx].trim().replace(/^'|'$/g, '');
        }
      }
    }
  }
  return '';
}

function parseBridge(row: string[], colMap: ColumnMap): BridgeRecord | null {
  const get = (...fields: string[]) => getValue(row, colMap, ...fields);

  const stateFips = get('STATE_CODE_001', 'STATE_CODE').padStart(2, '0');
  const stateAbbr = FIPS_TO_STATE[stateFips];
  if (!stateAbbr) return null;

  const structureNum = get('STRUCTURE_NUMBER_008', 'STRUCTURE_NUMBER');
  if (!structureNum) return null;

  const countyFips = get('COUNTY_CODE_003', 'COUNTY_CODE').padStart(3, '0');
  const placeFips = get('PLACE_CODE_004', 'PLACE_CODE').padStart(5, '0');
  const location = get('LOCATION_009', 'LOCATION') || null;
  const features = get('FEATURES_DESC_006A', 'FEATURES_DESC') || null;
  const facility = get('FACILITY_CARRIED_007', 'FACILITY_CARRIED') || null;

  const lat = parseLat(get('LAT_016', 'LAT'));
  const lon = parseLon(get('LONG_017', 'LONG'));

  const routePrefix = get('ROUTE_PREFIX_005B', 'ROUTE_PREFIX');
  const routeNumber = get('ROUTE_NUMBER_005D', 'ROUTE_NUMBER').replace(/^0+/, '') || '0';
  const owner = get('OWNER_022', 'OWNER').padStart(2, '0');
  const funcClass = get('FUNCTIONAL_CLASS_026', 'FUNCTIONAL_CLASS');

  const yearBuilt = safeInt(get('YEAR_BUILT_027', 'YEAR_BUILT'));
  const yearReconstructed = safeInt(get('YEAR_RECONSTRUCTED_106', 'YEAR_RECONSTRUCTED'));
  const material = get('STRUCTURE_KIND_043A', 'STRUCTURE_KIND');
  const designType = get('STRUCTURE_TYPE_043B', 'STRUCTURE_TYPE').padStart(2, '0');
  const lanesOn = safeInt(get('TRAFFIC_LANES_ON_028A', 'TRAFFIC_LANES_ON'));
  const lanesUnder = safeInt(get('TRAFFIC_LANES_UND_028B', 'TRAFFIC_LANES_UND'));

  // Dimensions (NBI stores these in meters with one decimal place)
  const maxSpan = safeFloat(get('MAX_SPAN_LEN_MT_048', 'MAX_SPAN_LEN'));
  const structureLen = safeFloat(get('STRUCTURE_LEN_MT_049', 'STRUCTURE_LEN'));
  const deckWidth = safeFloat(get('DECK_WIDTH_MT_052', 'DECK_WIDTH'));
  const roadwayWidth = safeFloat(get('ROADWAY_WIDTH_MT_051', 'ROADWAY_WIDTH'));

  // Traffic
  const adt = safeInt(get('ADT_029', 'ADT'));
  const adtYear = safeInt(get('YEAR_ADT_030', 'YEAR_ADT'));
  const truckPct = safeInt(get('PERCENT_ADT_TRUCK_109', 'PERCENT_ADT_TRUCK'));
  const futureAdt = safeInt(get('FUTURE_ADT_114', 'FUTURE_ADT'));

  // Condition ratings
  const deckCond = get('DECK_COND_058', 'DECK_COND');
  const superCond = get('SUPERSTRUCTURE_COND_059', 'SUPERSTRUCTURE_COND');
  const subCond = get('SUBSTRUCTURE_COND_060', 'SUBSTRUCTURE_COND');
  const culvertCond = get('CULVERT_COND_062', 'CULVERT_COND');
  const channelCond = get('CHANNEL_COND_061', 'CHANNEL_COND');

  const lowest = overallCondition(deckCond, superCond, subCond, culvertCond);
  const sd = isStructurallyDeficient(deckCond, superCond, subCond, culvertCond);
  const condCat = conditionCategory(lowest);

  const opRating = safeFloat(get('OPERATING_RATING_064', 'OPERATING_RATING'));
  const invRating = safeFloat(get('INVENTORY_RATING_066', 'INVENTORY_RATING'));

  const toll = get('TOLL_020', 'TOLL');
  const historical = get('HISTORY_037', 'HISTORY') || null;
  const scour = get('SCOUR_CRITICAL_113', 'SCOUR_CRITICAL') || null;
  const deckArea = safeFloat(get('DECK_AREA', 'CAT29'));
  const detourKm = safeInt(get('DETOUR_KILOS_019', 'DETOUR_KILOS'));
  const status = get('OPEN_CLOSED_POSTED_041', 'OPEN_CLOSED_POSTED');

  return {
    id: `${stateAbbr}-${structureNum}`,
    structureNumber: structureNum,
    state: stateAbbr,
    stateFips: stateFips,
    stateName: STATE_NAMES[stateAbbr] || '',
    countyFips: countyFips,
    placeFips: placeFips,
    location: location,
    featuresIntersected: features,
    facilityCarried: facility,
    lat: lat,
    lon: lon,
    routePrefix: routePrefix,
    routePrefixName: ROUTE_PREFIX[routePrefix] || 'Other',
    routeNumber: routeNumber,
    owner: owner,
    ownerName: OWNER_CODES[owner] || 'Unknown',
    functionalClass: funcClass,
    yearBuilt: yearBuilt > 1800 ? yearBuilt : null,
    yearReconstructed: yearReconstructed > 1800 ? yearReconstructed : null,
    material: material,
    materialName: MATERIAL_CODES[material] || 'Unknown',
    materialGroup: MATERIAL_GROUPS[material] || 'Other',
    designType: designType,
    designTypeName: DESIGN_CODES[designType] || 'Unknown',
    lanesOn: lanesOn,
    lanesUnder: lanesUnder,
    maxSpanM: maxSpan > 0 ? Math.round(maxSpan * 10) / 10 : null,
    maxSpanFt: maxSpan > 0 ? Math.round(maxSpan * 3.28084 * 10) / 10 : null,
    lengthM: structureLen > 0 ? Math.round(structureLen * 10) / 10 : null,
    lengthFt: structureLen > 0 ? Math.round(structureLen * 3.28084 * 10) / 10 : null,
    deckWidthM: deckWidth > 0 ? Math.round(deckWidth * 10) / 10 : null,
    deckWidthFt: deckWidth > 0 ? Math.round(deckWidth * 3.28084 * 10) / 10 : null,
    roadwayWidthM: roadwayWidth > 0 ? Math.round(roadwayWidth * 10) / 10 : null,
    adt: adt > 0 ? adt : null,
    adtYear: adtYear > 1900 ? adtYear : null,
    truckPct: truckPct > 0 ? truckPct : null,
    futureAdt: futureAdt > 0 ? futureAdt : null,
    deckCondition: deckCond && deckCond !== 'N' ? deckCond : null,
    superstructureCondition: superCond && superCond !== 'N' ? superCond : null,
    substructureCondition: subCond && subCond !== 'N' ? subCond : null,
    culvertCondition: culvertCond && culvertCond !== 'N' ? culvertCond : null,
    channelCondition: channelCond && channelCond !== 'N' ? channelCond : null,
    lowestRating: lowest,
    conditionCategory: condCat,
    structurallyDeficient: sd,
    operatingRating: opRating > 0 ? Math.round(opRating * 10) / 10 : null,
    inventoryRating: invRating > 0 ? Math.round(invRating * 10) / 10 : null,
    toll: toll === '1' || toll === '2',
    historical: historical,
    historicalName: historical ? HISTORICAL_CODES[historical] || null : null,
    scourCritical: scour,
    detourKm: detourKm > 0 ? detourKm : null,
    status: status,
    deckArea: deckArea > 0 ? Math.round(deckArea * 10) / 10 : null,
  };
}

function parseCSVLine(line: string): string[] {
  const fields: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === "'" && !inQuotes) {
      inQuotes = true;
    } else if (char === "'" && inQuotes) {
      inQuotes = false;
    } else if (char === ',' && !inQuotes) {
      fields.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  fields.push(current);

  return fields;
}

async function generateCoveredBridges(): Promise<void> {
  console.log('Generating covered bridges data from raw NBI file...\n');
  console.log(`Input: ${NBI_FILE}\n`);

  if (!fs.existsSync(NBI_FILE)) {
    console.error(`ERROR: NBI file not found at ${NBI_FILE}`);
    process.exit(1);
  }

  const coveredBridges: BridgeRecord[] = [];
  const stateCounts = new Map<string, number>();
  let totalProcessed = 0;
  let woodBridges = 0;
  let bridgesCreated = 0;

  const fileStream = fs.createReadStream(NBI_FILE, { encoding: 'utf-8' });
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

  let colMap: ColumnMap | null = null;
  let isFirstLine = true;

  for await (const line of rl) {
    if (isFirstLine) {
      const header = parseCSVLine(line);
      colMap = detectColumns(header);
      console.log(`Detected ${Object.keys(colMap).length} columns`);
      isFirstLine = false;
      continue;
    }

    totalProcessed++;
    if (totalProcessed % 100000 === 0) {
      console.log(`  Processed ${totalProcessed.toLocaleString()} rows...`);
    }

    const row = parseCSVLine(line);
    const bridge = parseBridge(row, colMap!);

    if (!bridge) continue;

    // Check if wood/timber material
    if (bridge.material !== WOOD_MATERIAL_CODE) continue;
    woodBridges++;

    // Check if covered bridge design (truss or arch)
    if (!COVERED_DESIGN_CODES.has(bridge.designType)) continue;

    // This is a covered bridge!
    coveredBridges.push(bridge);
    stateCounts.set(bridge.state, (stateCounts.get(bridge.state) || 0) + 1);

    // Create individual bridge JSON file if it doesn't exist
    const safeId = bridge.structureNumber.replace(/\//g, '_').replace(/\\/g, '_').replace(/ /g, '_');
    const bridgeDir = path.join(BRIDGES_DIR, bridge.state);
    const bridgeFile = path.join(bridgeDir, `${safeId}.json`);

    if (!fs.existsSync(bridgeDir)) {
      fs.mkdirSync(bridgeDir, { recursive: true });
    }

    if (!fs.existsSync(bridgeFile)) {
      fs.writeFileSync(bridgeFile, JSON.stringify(bridge));
      bridgesCreated++;
    }
  }

  console.log(`\nProcessed ${totalProcessed.toLocaleString()} bridge records`);
  console.log(`Found ${woodBridges.toLocaleString()} Wood/Timber bridges`);
  console.log(`Found ${coveredBridges.length.toLocaleString()} covered bridges (Wood + Truss/Arch)`);
  console.log(`Created ${bridgesCreated} new bridge JSON files`);

  // Sort bridges by year built (oldest first)
  coveredBridges.sort((a, b) => {
    if (a.yearBuilt === null && b.yearBuilt === null) return 0;
    if (a.yearBuilt === null) return 1;
    if (b.yearBuilt === null) return -1;
    return a.yearBuilt - b.yearBuilt;
  });

  // Build summary for ranking file
  const bridges: CoveredBridgeSummary[] = coveredBridges.map(b => ({
    id: b.id,
    structureNumber: b.structureNumber,
    state: b.state,
    stateName: b.stateName,
    countyFips: b.countyFips,
    countyName: null,
    facilityCarried: b.facilityCarried,
    featuresIntersected: b.featuresIntersected,
    location: b.location,
    yearBuilt: b.yearBuilt,
    lengthFt: b.lengthFt,
    maxSpanFt: b.maxSpanFt,
    conditionCategory: b.conditionCategory,
    lowestRating: b.lowestRating,
    historical: b.historical,
    historicalName: b.historicalName,
    lat: b.lat,
    lon: b.lon,
    designTypeName: b.designTypeName,
    adt: b.adt,
  }));

  // Build state summary sorted by count
  const byState = Array.from(stateCounts.entries())
    .map(([state, count]) => ({
      state,
      stateName: STATE_NAMES[state] || state,
      count
    }))
    .sort((a, b) => b.count - a.count);

  // Output ranking file
  const output = {
    total: bridges.length,
    byState,
    bridges
  };

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2));
  console.log(`\nWrote ${OUTPUT_FILE}`);
  console.log(`\nTotal: ${bridges.length} covered bridges`);
  console.log(`States: ${byState.length}`);
  console.log('\nTop 10 states:');
  byState.slice(0, 10).forEach(s => {
    console.log(`  ${s.state} (${s.stateName}): ${s.count}`);
  });
}

generateCoveredBridges().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
