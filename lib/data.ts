/**
 * Data access layer for BridgeReport.org
 * Reads JSON files from the data/ directory at build time
 *
 * NOTE: This module uses Node.js fs module and is for SERVER-SIDE only.
 * For client components, import formatting functions from '@/lib/format' instead.
 */

import { readFileSync, readdirSync, existsSync } from 'fs';
import { join } from 'path';

// Re-export formatting utilities for backwards compatibility (server-side only)
export { formatNumber, formatPct, slugify } from './format';
import type {
  NationalSummary,
  StateSummary,
  CitySummary,
  Bridge,
  RankingState,
  RankingBridge,
  CodeLookups,
  SitemapState,
} from '@/types';

// =============================================================================
// PATH UTILITIES
// =============================================================================

/** Base path to data directory */
const DATA_DIR = join(process.cwd(), 'data');

/** Get path to a data file */
function dataPath(...segments: string[]): string {
  return join(DATA_DIR, ...segments);
}

/** Read and parse JSON file, returns null if not found */
function readJson<T>(path: string): T | null {
  try {
    const content = readFileSync(path, 'utf-8');
    return JSON.parse(content) as T;
  } catch {
    return null;
  }
}

// =============================================================================
// NATIONAL DATA
// =============================================================================

/** Get national summary statistics */
export function getNational(): NationalSummary | null {
  return readJson<NationalSummary>(dataPath('national.json'));
}

// =============================================================================
// STATE DATA
// =============================================================================

/** Get a single state's summary by abbreviation (e.g., "TX", "CA") */
export function getState(abbr: string): StateSummary | null {
  const normalized = abbr.toUpperCase();
  return readJson<StateSummary>(dataPath('states', `${normalized}.json`));
}

/** Get all state summaries */
export function getAllStates(): StateSummary[] {
  const statesDir = dataPath('states');
  const files = readdirSync(statesDir).filter(f => f.endsWith('.json'));

  const states: StateSummary[] = [];
  for (const file of files) {
    const state = readJson<StateSummary>(join(statesDir, file));
    if (state) {
      states.push(state);
    }
  }

  return states.sort((a, b) => a.stateName.localeCompare(b.stateName));
}

/** Get list of all state abbreviations */
export function getAllStateAbbrs(): string[] {
  const statesDir = dataPath('states');
  return readdirSync(statesDir)
    .filter(f => f.endsWith('.json'))
    .map(f => f.replace('.json', ''));
}

// =============================================================================
// CITY DATA
// =============================================================================

/** Check if a place name is a valid city name (not a placeholder) */
function isValidCityName(name: string): boolean {
  // Exclude placeholder names like "Place 12345"
  if (/^Place \d+$/.test(name)) return false;
  return true;
}

/** Get a city's summary by state and place FIPS code */
export function getCity(state: string, fips: string): CitySummary | null {
  const normalized = state.toUpperCase();
  // Pad place FIPS to 5 digits if needed
  const normalizedFips = fips.padStart(5, '0');
  return readJson<CitySummary>(dataPath('cities', normalized, `${normalizedFips}.json`));
}

/** Get all city summaries for a state (excludes placeholder cities) */
export function getCitiesForState(state: string): CitySummary[] {
  const normalized = state.toUpperCase();
  const cityDir = dataPath('cities', normalized);

  if (!existsSync(cityDir)) {
    return [];
  }

  // Load place names to filter out placeholders
  const names = readJson<Record<string, string>>(dataPath('meta', 'fips_places.json')) || {};

  const files = readdirSync(cityDir).filter(f => f.endsWith('.json'));

  const cities: CitySummary[] = [];
  for (const file of files) {
    const fips = file.replace('.json', '');
    const key = `${normalized}-${fips}`;
    const cityName = names[key];

    // Only include cities with valid names (not placeholders)
    if (cityName && isValidCityName(cityName)) {
      const city = readJson<CitySummary>(join(cityDir, file));
      if (city) {
        cities.push(city);
      }
    }
  }

  return cities.sort((a, b) => b.total - a.total); // Sort by bridge count descending
}

/** Get list of all place FIPS for a state */
export function getCityFipsForState(state: string): string[] {
  const normalized = state.toUpperCase();
  const cityDir = dataPath('cities', normalized);

  if (!existsSync(cityDir)) {
    return [];
  }

  return readdirSync(cityDir)
    .filter(f => f.endsWith('.json'))
    .map(f => f.replace('.json', ''));
}

/** Generate URL slug from city name (e.g., "Houston" → "houston") */
export function cityNameToSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Get all cities with their slugs for static params generation */
export function getAllCitySlugs(): Array<{ state: string; slug: string; fips: string }> {
  const result: Array<{ state: string; slug: string; fips: string }> = [];

  // Load place names lookup
  const names = readJson<Record<string, string>>(dataPath('meta', 'fips_places.json')) || {};

  // Get all state directories
  const citiesBaseDir = dataPath('cities');
  if (!existsSync(citiesBaseDir)) {
    return result;
  }

  const stateDirs = readdirSync(citiesBaseDir).filter(
    (d) => d.length === 2 && d === d.toUpperCase()
  );

  for (const state of stateDirs) {
    const stateDir = join(citiesBaseDir, state);
    const fipsFiles = readdirSync(stateDir).filter((f) => f.endsWith('.json'));

    for (const file of fipsFiles) {
      const fips = file.replace('.json', '');
      const key = `${state}-${fips}`;
      const cityName = names[key];

      // Only include cities with valid names (not placeholders)
      if (cityName && isValidCityName(cityName)) {
        result.push({
          state: state.toLowerCase(),
          slug: cityNameToSlug(cityName),
          fips,
        });
      }
    }
  }

  return result;
}

/** Find city FIPS by slug for a given state */
export function getCityFipsBySlug(state: string, slug: string): string | null {
  const normalized = state.toUpperCase();
  const names = readJson<Record<string, string>>(dataPath('meta', 'fips_places.json')) || {};

  // Search for matching city name
  for (const [key, name] of Object.entries(names)) {
    if (key.startsWith(`${normalized}-`)) {
      if (cityNameToSlug(name) === slug) {
        return key.split('-')[1]; // Return the FIPS part
      }
    }
  }

  return null;
}

/** Get city by state and slug (convenience function) */
export function getCityBySlug(state: string, slug: string): CitySummary | null {
  const fips = getCityFipsBySlug(state, slug);
  if (!fips) return null;
  return getCity(state, fips);
}

/** Get city name from state and place FIPS (alias for getPlaceName) */
export function getCityName(state: string, placeFips: string): string | null {
  return getPlaceName(state, placeFips);
}

// =============================================================================
// BRIDGE DATA
// =============================================================================

/** Get a single bridge by state and structure ID */
export function getBridge(state: string, structureId: string): Bridge | null {
  const normalized = state.toUpperCase();

  // Handle ID format variations:
  // - IDs may include state prefix (e.g., "NV-B 630" -> "B 630")
  // - Filenames use underscores instead of spaces (e.g., "B 630" -> "B_630.json")
  let filename = structureId;

  // URL decode in case it's still encoded
  try {
    filename = decodeURIComponent(filename);
  } catch {
    // Already decoded or invalid, ignore
  }

  // Strip state prefix if present (e.g., "NV-" from "NV-B 630")
  const statePrefix = `${normalized}-`;
  if (filename.toUpperCase().startsWith(statePrefix)) {
    filename = filename.slice(statePrefix.length);
  }

  // Replace spaces with underscores for filename
  filename = filename.replace(/ /g, '_');

  return readJson<Bridge>(dataPath('bridges', normalized, `${filename}.json`));
}

/**
 * Fallback: find minimal bridge data from state summary lists (worstBridges, mostTrafficked)
 * Used when a bridge doesn't have a full detail JSON file (e.g., bridges < 50ft)
 */
export function getMinimalBridge(state: string, structureId: string): RankingBridge | null {
  const normalized = state.toUpperCase();

  // Build the full bridge ID to search for
  let searchId = structureId;
  try {
    searchId = decodeURIComponent(searchId);
  } catch {
    // Already decoded
  }

  // Ensure ID has state prefix (e.g., "PA-000000000002338")
  const statePrefix = `${normalized}-`;
  if (!searchId.toUpperCase().startsWith(statePrefix)) {
    searchId = `${statePrefix}${searchId}`;
  }

  // Search in the state summary data (worstBridges, mostTrafficked)
  const stateData = readJson<StateSummary>(dataPath('states', `${normalized}.json`));
  if (stateData) {
    for (const list of [stateData.worstBridges, stateData.mostTrafficked]) {
      if (!list) continue;
      const found = list.find(b => b.id === searchId);
      if (found) return found as unknown as RankingBridge;
    }
  }

  // Also check national ranking files as a last resort
  const rankingTypes = ['worst_condition', 'oldest_bridges', 'longest_bridges', 'most_trafficked', 'longest_span', 'historic_bridges'] as const;
  for (const rankType of rankingTypes) {
    const rankings = readJson<RankingBridge[]>(dataPath('rankings', `${rankType}.json`));
    if (rankings) {
      const found = rankings.find(b => b.id === searchId);
      if (found) return found;
    }
  }

  return null;
}

/** Get list of all bridge structure IDs for a state */
export function getBridgeIdsForState(state: string): string[] {
  const normalized = state.toUpperCase();
  const bridgeDir = dataPath('bridges', normalized);

  if (!existsSync(bridgeDir)) {
    return [];
  }

  return readdirSync(bridgeDir)
    .filter(f => f.endsWith('.json'))
    .map(f => f.replace('.json', ''));
}

// =============================================================================
// RANKING DATA
// =============================================================================

/** Ranking types available */
export type RankingType =
  | 'worst_states'
  | 'best_states'
  | 'longest_bridges'
  | 'oldest_bridges'
  | 'most_trafficked'
  | 'worst_condition'
  | 'longest_span'
  | 'historic_bridges';

/** Get state rankings */
export function getStateRanking(type: 'worst_states' | 'best_states'): RankingState[] {
  const data = readJson<RankingState[]>(dataPath('rankings', `${type}.json`));
  return data || [];
}

/** Get bridge rankings */
export function getBridgeRanking(
  type: 'longest_bridges' | 'oldest_bridges' | 'most_trafficked' | 'worst_condition' | 'longest_span' | 'historic_bridges'
): RankingBridge[] {
  const data = readJson<RankingBridge[]>(dataPath('rankings', `${type}.json`));
  return data || [];
}

/** Get paginated bridge ranking data (for server-side initial load) */
export function getBridgeRankingPaginated(
  type: 'longest_bridges' | 'oldest_bridges' | 'most_trafficked' | 'worst_condition' | 'longest_span' | 'historic_bridges',
  limit: number = 100
): { bridges: RankingBridge[]; total: number } {
  const data = readJson<RankingBridge[]>(dataPath('rankings', `${type}.json`));
  if (!data) return { bridges: [], total: 0 };
  return {
    bridges: data.slice(0, limit),
    total: data.length,
  };
}

/** Get worst condition stats without loading full dataset */
export function getWorstConditionStats(): {
  total: number;
  rating0: number;
  rating1: number;
  rating2: number;
  rating3: number;
} {
  // Try to read from a pre-computed stats file first
  const statsPath = dataPath('rankings', 'worst_condition_stats.json');
  const stats = readJson<{ total: number; rating0: number; rating1: number; rating2: number; rating3: number }>(statsPath);
  if (stats) return stats;

  // Fall back to computing from full data (only happens once if stats file doesn't exist)
  const data = readJson<RankingBridge[]>(dataPath('rankings', 'worst_condition.json'));
  if (!data) return { total: 0, rating0: 0, rating1: 0, rating2: 0, rating3: 0 };

  return {
    total: data.length,
    rating0: data.filter(b => b.lowestRating === 0).length,
    rating1: data.filter(b => b.lowestRating === 1).length,
    rating2: data.filter(b => b.lowestRating === 2).length,
    rating3: data.filter(b => b.lowestRating === 3).length,
  };
}

// =============================================================================
// METADATA & CODE LOOKUPS
// =============================================================================

/** Get code lookup tables */
export function getMeta(): CodeLookups | null {
  return readJson<CodeLookups>(dataPath('meta', 'all_codes.json'));
}

/** Get sitemap states list */
export function getSitemapStates(): SitemapState[] {
  const data = readJson<SitemapState[]>(dataPath('meta', 'sitemap_states.json'));
  return data || [];
}

// =============================================================================
// FIPS NAME LOOKUPS
// =============================================================================

// Cache for FIPS lookups (loaded once per build)
let countyNames: Record<string, string> | null = null;
let placeNames: Record<string, string> | null = null;

/** Get county name from state and county FIPS */
export function getCountyName(state: string, countyFips: string): string | null {
  if (!countyNames) {
    countyNames = readJson<Record<string, string>>(dataPath('meta', 'fips_counties.json')) || {};
  }

  const normalized = state.toUpperCase();
  const normalizedFips = countyFips.padStart(3, '0');
  const key = `${normalized}-${normalizedFips}`;

  return countyNames[key] || null;
}

/** Clean up Census place name for display by removing type suffixes */
function cleanPlaceNameForDisplay(name: string): string {
  // Remove common Census place type suffixes
  // Keep the core name without "city", "town", "CDP", "village", etc.
  return name
    .replace(/ (city|town|village|borough|CDP|municipality|city and borough)$/i, '')
    .trim();
}

/** Get place/city name from state and place FIPS */
export function getPlaceName(state: string, placeFips: string): string | null {
  if (!placeNames) {
    placeNames = readJson<Record<string, string>>(dataPath('meta', 'fips_places.json')) || {};
  }

  const normalized = state.toUpperCase();
  const normalizedFips = placeFips.padStart(5, '0');
  const key = `${normalized}-${normalizedFips}`;

  const rawName = placeNames[key];
  if (!rawName) return null;

  // Return cleaned name for display (removes "city", "CDP", etc. suffixes)
  return cleanPlaceNameForDisplay(rawName);
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/** Convert state abbreviation to full name */
export function getStateName(abbr: string): string | null {
  const meta = getMeta();
  if (!meta) return null;
  return meta.stateNames[abbr.toUpperCase()] || null;
}

// =============================================================================
// COVERED BRIDGES
// =============================================================================

/**
 * Check if a bridge is a covered bridge
 * Criteria: Wood/Timber material (code 7) + Truss design (codes 09 or 10)
 */
export function isCoveredBridge(bridge: Bridge): boolean {
  return bridge.material === '7' && (bridge.designType === '09' || bridge.designType === '10' || bridge.designType === '11' || bridge.designType === '12');
}

/** Covered bridge summary for listings */
export interface CoveredBridgeSummary {
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
  conditionCategory: string | null;
  lowestRating: number | null;
  historical: string | null;
  historicalName: string | null;
  lat: number | null;
  lon: number | null;
  maxSpanFt: number | null;
  designTypeName: string | null;
  adt: number | null;
}

/** Pre-computed covered bridges data cache */
let coveredBridgesCache: {
  total: number;
  byState: Array<{ state: string; stateName: string; count: number }>;
  bridges: CoveredBridgeSummary[];
} | null = null;

/** Load pre-computed covered bridges data */
function loadCoveredBridgesData(): typeof coveredBridgesCache {
  if (coveredBridgesCache) return coveredBridgesCache;

  const data = readJson<{
    total: number;
    byState: Array<{ state: string; stateName: string; count: number }>;
    bridges: CoveredBridgeSummary[];
  }>(dataPath('rankings', 'covered_bridges.json'));

  if (data) {
    coveredBridgesCache = data;
    return data;
  }

  // Fallback to empty if file doesn't exist
  return { total: 0, byState: [], bridges: [] };
}

/** Get all covered bridges for a state */
export function getCoveredBridgesForState(state: string): CoveredBridgeSummary[] {
  const normalized = state.toUpperCase();
  const data = loadCoveredBridgesData();
  if (!data) return [];

  // Filter bridges for this state
  return data.bridges.filter(b => b.state === normalized);
}

/** Get covered bridge count for a state (faster than loading all) */
export function getCoveredBridgeCountForState(state: string): number {
  const normalized = state.toUpperCase();
  const data = loadCoveredBridgesData();
  if (!data) return 0;

  // Look up in byState array for O(1) lookup
  const stateData = data.byState.find(s => s.state === normalized);
  return stateData?.count || 0;
}

/** Get all covered bridges nationally with counts per state */
export function getAllCoveredBridges(): {
  total: number;
  byState: Array<{ state: string; stateName: string; count: number }>;
  bridges: CoveredBridgeSummary[];
} {
  const data = loadCoveredBridgesData();
  return data || { total: 0, byState: [], bridges: [] };
}

/** Get condition color class for Tailwind */
export function getConditionColorClass(condition: string | null): string {
  switch (condition) {
    case 'good':
      return 'text-green-600 bg-green-50';
    case 'fair':
      return 'text-yellow-600 bg-yellow-50';
    case 'poor':
      return 'text-red-600 bg-red-50';
    default:
      return 'text-slate-600 bg-slate-50';
  }
}

// =============================================================================
// BRIDGE MATERIAL TYPE PAGES
// =============================================================================

/** Material type metadata */
export interface MaterialType {
  slug: string;
  name: string;
  codes: string[];
  description: string;
}

/** All material types with their codes */
export const MATERIAL_TYPES: MaterialType[] = [
  {
    slug: 'concrete',
    name: 'Concrete',
    codes: ['1', '2'],
    description: 'Reinforced concrete and concrete continuous bridges',
  },
  {
    slug: 'steel',
    name: 'Steel',
    codes: ['3', '4'],
    description: 'Structural steel and steel continuous bridges',
  },
  {
    slug: 'prestressed-concrete',
    name: 'Prestressed Concrete',
    codes: ['5', '6'],
    description: 'Prestressed and post-tensioned concrete bridges',
  },
  {
    slug: 'wood',
    name: 'Wood/Timber',
    codes: ['7'],
    description: 'Wooden and timber bridges including covered bridges',
  },
  {
    slug: 'masonry',
    name: 'Masonry',
    codes: ['8'],
    description: 'Stone and brick arch bridges',
  },
  {
    slug: 'metal',
    name: 'Metal (Other)',
    codes: ['9'],
    description: 'Aluminum, wrought iron, and cast iron bridges',
  },
  {
    slug: 'other',
    name: 'Other Materials',
    codes: ['0'],
    description: 'Bridges with other or mixed materials',
  },
];

/** Get material type by slug */
export function getMaterialType(slug: string): MaterialType | null {
  return MATERIAL_TYPES.find((m) => m.slug === slug) || null;
}

/** Summary of a bridge for material type pages */
export interface MaterialBridgeSummary {
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
  conditionCategory: string | null;
  lowestRating: number | null;
  designTypeName: string | null;
  adt: number | null;
  lat: number | null;
  lon: number | null;
}

/** Get bridges by material codes for a state */
export function getBridgesByMaterialForState(
  state: string,
  materialCodes: string[]
): MaterialBridgeSummary[] {
  const bridgesDir = dataPath('bridges', state);
  if (!existsSync(bridgesDir)) return [];

  const bridges: MaterialBridgeSummary[] = [];
  const files = readdirSync(bridgesDir);

  for (const file of files) {
    if (!file.endsWith('.json')) continue;
    const bridge = readJson<Bridge>(join(bridgesDir, file));
    if (!bridge) continue;

    if (materialCodes.includes(bridge.material)) {
      bridges.push({
        id: bridge.id,
        structureNumber: bridge.structureNumber,
        state: bridge.state,
        stateName: bridge.stateName,
        countyFips: bridge.countyFips,
        countyName: getCountyName(bridge.state, bridge.countyFips),
        facilityCarried: bridge.facilityCarried,
        featuresIntersected: bridge.featuresIntersected,
        location: bridge.location,
        yearBuilt: bridge.yearBuilt,
        lengthFt: bridge.lengthFt,
        conditionCategory: bridge.conditionCategory,
        lowestRating: bridge.lowestRating,
        designTypeName: bridge.designTypeName,
        adt: bridge.adt,
        lat: bridge.lat,
        lon: bridge.lon,
      });
    }
  }

  // Sort by year built (oldest first)
  bridges.sort((a, b) => (a.yearBuilt || 9999) - (b.yearBuilt || 9999));

  return bridges;
}

/** Get count of bridges by material for a state */
export function getMaterialBridgeCountForState(
  state: string,
  materialCodes: string[]
): number {
  const stateData = getState(state);
  if (!stateData) return 0;

  let count = 0;
  for (const code of materialCodes) {
    count += stateData.materials[code] || 0;
  }
  return count;
}

/** Get all bridges of a material type nationally with state breakdown */
export function getAllBridgesByMaterial(materialSlug: string): {
  total: number;
  byState: Array<{ state: string; stateName: string; count: number }>;
  topBridges: MaterialBridgeSummary[];
  stats: {
    good: number;
    fair: number;
    poor: number;
    avgAge: number;
    oldestYear: number;
  };
} {
  const materialType = getMaterialType(materialSlug);
  if (!materialType) {
    return {
      total: 0,
      byState: [],
      topBridges: [],
      stats: { good: 0, fair: 0, poor: 0, avgAge: 0, oldestYear: 9999 },
    };
  }

  const states = getAllStateAbbrs();
  const byState: Array<{ state: string; stateName: string; count: number }> = [];
  const allBridges: MaterialBridgeSummary[] = [];
  let good = 0;
  let fair = 0;
  let poor = 0;
  let totalAge = 0;
  let ageCount = 0;
  let oldestYear = 9999;

  for (const state of states) {
    const count = getMaterialBridgeCountForState(state, materialType.codes);
    if (count > 0) {
      const stateName = getStateName(state) || state;
      byState.push({ state, stateName, count });

      // Get bridges for stats (sample for very large states)
      const bridges = getBridgesByMaterialForState(state, materialType.codes);
      for (const bridge of bridges) {
        if (bridge.conditionCategory === 'good') good++;
        else if (bridge.conditionCategory === 'fair') fair++;
        else if (bridge.conditionCategory === 'poor') poor++;

        if (bridge.yearBuilt) {
          totalAge += 2024 - bridge.yearBuilt;
          ageCount++;
          if (bridge.yearBuilt < oldestYear) {
            oldestYear = bridge.yearBuilt;
          }
        }
      }
      allBridges.push(...bridges);
    }
  }

  // Sort states by count (most first)
  byState.sort((a, b) => b.count - a.count);

  // Sort bridges by year built and take top 50 oldest
  allBridges.sort((a, b) => (a.yearBuilt || 9999) - (b.yearBuilt || 9999));
  const topBridges = allBridges.slice(0, 50);

  const total = byState.reduce((sum, s) => sum + s.count, 0);

  return {
    total,
    byState,
    topBridges,
    stats: {
      good,
      fair,
      poor,
      avgAge: ageCount > 0 ? Math.round(totalAge / ageCount) : 0,
      oldestYear: oldestYear === 9999 ? 0 : oldestYear,
    },
  };
}

/** Get national material distribution summary */
export function getNationalMaterialDistribution(): Array<{
  slug: string;
  name: string;
  count: number;
  percentage: number;
}> {
  const national = getNational();
  if (!national) return [];

  const results: Array<{
    slug: string;
    name: string;
    count: number;
    percentage: number;
  }> = [];

  for (const material of MATERIAL_TYPES) {
    let count = 0;
    for (const code of material.codes) {
      count += national.materials[code] || 0;
    }
    if (count > 0) {
      results.push({
        slug: material.slug,
        name: material.name,
        count,
        percentage: Math.round((count / national.total) * 1000) / 10,
      });
    }
  }

  // Sort by count descending
  results.sort((a, b) => b.count - a.count);

  return results;
}

// ============================================================================
// DESIGN TYPE FUNCTIONS
// ============================================================================

/** Design type definition */
export interface DesignType {
  slug: string;
  name: string;
  description: string;
}

/** All bridge design types based on NBI structure type classification */
export const DESIGN_TYPES: DesignType[] = [
  {
    slug: 'slab',
    name: 'Slab',
    description: 'Simple flat concrete or timber slab bridges, common for short spans',
  },
  {
    slug: 'stringer',
    name: 'Stringer/Multi-beam or Girder',
    description: 'Parallel beams (stringers) supporting the deck, the most common bridge type',
  },
  {
    slug: 'girder-floorbeam',
    name: 'Girder and Floorbeam',
    description: 'Main girders with perpendicular floorbeams, often used for railroad bridges',
  },
  {
    slug: 'tee-beam',
    name: 'Tee Beam',
    description: 'T-shaped concrete beams integrated with the deck slab',
  },
  {
    slug: 'box-beam-multiple',
    name: 'Box Beam - Multiple',
    description: 'Multiple adjacent hollow box beams, efficient for medium spans',
  },
  {
    slug: 'box-beam-single',
    name: 'Box Beam - Single/Spread',
    description: 'Single or spread hollow box beams with wider spacing',
  },
  {
    slug: 'frame',
    name: 'Frame',
    description: 'Rigid frame bridges where deck and supports act as one unit',
  },
  {
    slug: 'orthotropic',
    name: 'Orthotropic',
    description: 'Steel deck plate stiffened with ribs, used on major long-span bridges',
  },
  {
    slug: 'truss-deck',
    name: 'Truss - Deck',
    description: 'Truss with roadway on top, common for covered bridges',
  },
  {
    slug: 'truss-thru',
    name: 'Truss - Thru',
    description: 'Through truss with roadway between overhead triangular framework',
  },
  {
    slug: 'arch-deck',
    name: 'Arch - Deck',
    description: 'Deck arch with roadway on top of the arch structure',
  },
  {
    slug: 'arch-thru',
    name: 'Arch - Thru',
    description: 'Through arch with roadway suspended below the arch',
  },
  {
    slug: 'suspension',
    name: 'Suspension',
    description: 'Iconic bridges with deck hung from cables between towers',
  },
  {
    slug: 'cable-stayed',
    name: 'Cable-Stayed',
    description: 'Modern bridges with deck supported by cables directly from towers',
  },
  {
    slug: 'movable-bascule',
    name: 'Movable - Bascule',
    description: 'Drawbridges that pivot upward to allow boat passage',
  },
  {
    slug: 'movable-swing',
    name: 'Movable - Swing',
    description: 'Bridges that rotate horizontally to open a navigation channel',
  },
  {
    slug: 'movable-lift',
    name: 'Movable - Lift',
    description: 'Vertical lift bridges where the span rises between towers',
  },
  {
    slug: 'culvert',
    name: 'Culvert',
    description: 'Box or pipe structures for drainage and small stream crossings',
  },
  {
    slug: 'channel-beam',
    name: 'Channel Beam',
    description: 'C-shaped channel beams, often used for railroad bridges',
  },
  {
    slug: 'segmental-box',
    name: 'Segmental Box Girder',
    description: 'Precast concrete segments assembled into continuous box girders',
  },
  {
    slug: 'other',
    name: 'Other',
    description: 'Bridges with mixed or unusual structural designs',
  },
];

/** Get design type by slug */
export function getDesignType(slug: string): DesignType | null {
  return DESIGN_TYPES.find((d) => d.slug === slug) || null;
}

/** Summary of a bridge for design type pages (reuses MaterialBridgeSummary structure) */
export type DesignBridgeSummary = MaterialBridgeSummary;

/** Get bridges by design type name for a state */
export function getBridgesByDesignForState(
  state: string,
  designName: string
): DesignBridgeSummary[] {
  const bridgesDir = dataPath('bridges', state);
  if (!existsSync(bridgesDir)) return [];

  const bridges: DesignBridgeSummary[] = [];
  const files = readdirSync(bridgesDir);

  for (const file of files) {
    if (!file.endsWith('.json')) continue;
    const bridge = readJson<Bridge>(join(bridgesDir, file));
    if (!bridge) continue;

    if (bridge.designTypeName === designName) {
      bridges.push({
        id: bridge.id,
        structureNumber: bridge.structureNumber,
        state: bridge.state,
        stateName: bridge.stateName,
        countyFips: bridge.countyFips,
        countyName: getCountyName(bridge.state, bridge.countyFips),
        facilityCarried: bridge.facilityCarried,
        featuresIntersected: bridge.featuresIntersected,
        location: bridge.location,
        yearBuilt: bridge.yearBuilt,
        lengthFt: bridge.lengthFt,
        conditionCategory: bridge.conditionCategory,
        lowestRating: bridge.lowestRating,
        designTypeName: bridge.designTypeName,
        adt: bridge.adt,
        lat: bridge.lat,
        lon: bridge.lon,
      });
    }
  }

  // Sort by year built (oldest first)
  bridges.sort((a, b) => (a.yearBuilt || 9999) - (b.yearBuilt || 9999));

  return bridges;
}

/** Get count of bridges by design type for a state from summary data */
export function getDesignBridgeCountForState(state: string, designName: string): number {
  const stateData = getState(state);
  if (!stateData) return 0;
  return stateData.designTypes[designName] || 0;
}

/** Get all bridges of a design type nationally with state breakdown */
export function getAllBridgesByDesign(designSlug: string): {
  total: number;
  byState: Array<{ state: string; stateName: string; count: number }>;
  topBridges: DesignBridgeSummary[];
  stats: {
    good: number;
    fair: number;
    poor: number;
    avgAge: number;
    oldestYear: number;
  };
} {
  const designType = getDesignType(designSlug);
  if (!designType) {
    return {
      total: 0,
      byState: [],
      topBridges: [],
      stats: { good: 0, fair: 0, poor: 0, avgAge: 0, oldestYear: 9999 },
    };
  }

  const designName = designType.name;
  const states = getAllStateAbbrs();
  const byState: Array<{ state: string; stateName: string; count: number }> = [];
  const allBridges: DesignBridgeSummary[] = [];
  let good = 0;
  let fair = 0;
  let poor = 0;
  let totalAge = 0;
  let ageCount = 0;
  let oldestYear = 9999;

  for (const state of states) {
    const count = getDesignBridgeCountForState(state, designName);
    if (count > 0) {
      const stateName = getStateName(state) || state;
      byState.push({ state, stateName, count });

      // Get bridges for stats and top list
      const bridges = getBridgesByDesignForState(state, designName);
      for (const bridge of bridges) {
        if (bridge.conditionCategory === 'good') good++;
        else if (bridge.conditionCategory === 'fair') fair++;
        else if (bridge.conditionCategory === 'poor') poor++;

        if (bridge.yearBuilt) {
          totalAge += 2024 - bridge.yearBuilt;
          ageCount++;
          if (bridge.yearBuilt < oldestYear) {
            oldestYear = bridge.yearBuilt;
          }
        }
      }

      // Add oldest bridges from this state to the pool
      allBridges.push(...bridges.slice(0, 5));
    }
  }

  // Sort byState by count descending
  byState.sort((a, b) => b.count - a.count);

  // Sort all collected bridges by year and get top 20
  allBridges.sort((a, b) => (a.yearBuilt || 9999) - (b.yearBuilt || 9999));
  const topBridges = allBridges.slice(0, 20);

  const total = byState.reduce((sum, s) => sum + s.count, 0);

  return {
    total,
    byState,
    topBridges,
    stats: {
      good,
      fair,
      poor,
      avgAge: ageCount > 0 ? Math.round(totalAge / ageCount) : 0,
      oldestYear: oldestYear === 9999 ? 0 : oldestYear,
    },
  };
}

/** Get national design type distribution summary */
export function getNationalDesignDistribution(): Array<{
  slug: string;
  name: string;
  count: number;
  percentage: number;
}> {
  const national = getNational();
  if (!national) return [];

  const results: Array<{
    slug: string;
    name: string;
    count: number;
    percentage: number;
  }> = [];

  for (const designType of DESIGN_TYPES) {
    const count = national.designTypes[designType.name] || 0;
    if (count > 0) {
      results.push({
        slug: designType.slug,
        name: designType.name,
        count,
        percentage: Math.round((count / national.total) * 1000) / 10,
      });
    }
  }

  // Sort by count descending
  results.sort((a, b) => b.count - a.count);

  return results;
}

// formatNumber, formatPct, and slugify are re-exported from './format'
