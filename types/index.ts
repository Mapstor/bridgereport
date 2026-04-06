/**
 * TypeScript types for BridgeReport.org data layer
 * Based on processed NBI data from process_nbi.py
 */

// =============================================================================
// COMMON TYPES
// =============================================================================

/** Condition category based on lowest structural rating */
export type ConditionCategory = 'good' | 'fair' | 'poor';

/** Distribution record (key → count) */
export type Distribution = Record<string, number>;

// =============================================================================
// SUMMARY STATISTICS (shared across National, State, County, City)
// =============================================================================

/** Base statistics present in all summary types */
export interface BaseSummaryStats {
  total: number;
  good: number;
  fair: number;
  poor: number;
  structurallyDeficient: number;
  goodPct: number;
  fairPct: number;
  poorPct: number;
  sdPct: number;
  materials: Distribution;
  designTypes: Distribution;
  ageDistribution: Distribution;
  owners: Distribution;
  avgAdt: number;
  avgYearBuilt: number;
  avgLengthFt: number;
  ratingDistribution: Distribution;
}

// =============================================================================
// NATIONAL SUMMARY
// =============================================================================

export interface NationalSummary extends BaseSummaryStats {
  totalDailyCrossings: number;
  oldestYear: number;
  newestYear: number;
  generatedAt: string;
  source: string;
  sourceUrl: string;
}

// =============================================================================
// STATE SUMMARY
// =============================================================================

/** Top county entry in state summary */
export interface TopCounty {
  fips: string;
  total: number;
  poor: number;
  poorPct: number;
  avgAdt: number;
}

/** Bridge entry in state's worst/most-trafficked lists */
export interface BridgeListItem {
  id: string;
  state: string;
  stateName: string;
  countyFips: string;
  facilityCarried: string;
  featuresIntersected: string;
  location: string;
  lat: number | null;
  lon: number | null;
  lowestRating: number | null;
  yearBuilt: number | null;
  adt: number | null;
  conditionCategory: ConditionCategory | null;
  structurallyDeficient: boolean;
  materialName: string;
  designTypeName: string;
  lengthFt: number | null;
}

export interface StateSummary extends BaseSummaryStats {
  state: string;
  stateName: string;
  totalDailyCrossings: number;
  oldestYear: number;
  newestYear: number;
  countyCount: number;
  cityCount: number;
  topCounties: TopCounty[];
  worstBridges: BridgeListItem[];
  mostTrafficked: BridgeListItem[];
}

// =============================================================================
// BRIDGE SLIM (for city bridge lists)
// =============================================================================

/** Slim bridge entry in city bridge lists */
export interface BridgeSlim {
  id: string;
  structureNumber: string;
  facilityCarried: string;
  featuresIntersected: string;
  location: string;
  yearBuilt: number | null;
  materialName?: string;
  lowestRating: number | null;
  conditionCategory: ConditionCategory | null;
  structurallyDeficient?: boolean;
  adt: number | null;
  lengthFt: number | null;
  lat?: number | null;
  lon?: number | null;
}

// =============================================================================
// CITY SUMMARY
// =============================================================================

export interface CitySummary extends BaseSummaryStats {
  state: string;
  stateName: string;
  placeFips: string;
  totalDailyCrossings: number;
  oldestYear: number;
  newestYear: number;
  bridges: BridgeSlim[];
}

// =============================================================================
// INDIVIDUAL BRIDGE
// =============================================================================

export interface Bridge {
  id: string;
  structureNumber: string;
  state: string;
  stateFips: string;
  stateName: string;
  countyFips: string;
  placeFips: string;
  location: string;
  featuresIntersected: string;
  facilityCarried: string;
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
  conditionCategory: ConditionCategory | null;
  structurallyDeficient: boolean;
  operatingRating: number | null;
  inventoryRating: number | null;
  toll: boolean;
  historical: string | null;
  historicalName: string | null;
  scourCritical: string;
  detourKm: number | null;
  status: string;
  deckArea: number | null;
}

// =============================================================================
// RANKINGS
// =============================================================================

/** State ranking entry (for worst_states.json, best_states.json) */
export interface RankingState {
  state: string;
  stateName: string;
  total: number;
  good: number;
  fair: number;
  poor: number;
  goodPct: number;
  fairPct: number;
  poorPct: number;
  sdPct: number;
  avgAdt: number;
  avgYearBuilt: number;
}

/** Bridge ranking entry (for longest_bridges.json, oldest_bridges.json, etc.) */
export interface RankingBridge {
  id: string;
  state: string;
  stateName: string;
  countyFips: string;
  facilityCarried: string;
  featuresIntersected: string;
  location: string;
  lat: number | null;
  lon: number | null;
  yearBuilt: number | null;
  lengthFt: number | null;
  maxSpanFt: number | null;
  adt: number | null;
  lowestRating: number | null;
  conditionCategory: ConditionCategory | null;
  structurallyDeficient: boolean;
  materialName: string;
  designTypeName: string;
  historical?: string | null;
  historicalName?: string | null;
}

// =============================================================================
// CODE LOOKUPS
// =============================================================================

export interface CodeLookups {
  materials: Record<string, string>;
  materialGroups: Record<string, string>;
  designs: Record<string, string>;
  owners: Record<string, string>;
  conditions: Record<string, string>;
  historical: Record<string, string>;
  routePrefix: Record<string, string>;
  fipsStates: Record<string, string>;
  stateNames: Record<string, string>;
}

// =============================================================================
// SITEMAP ENTRIES
// =============================================================================

export interface SitemapState {
  state: string;
  stateName: string;
  total: number;
  good: number;
  fair: number;
  poor: number;
  goodPct: number;
  fairPct: number;
  poorPct: number;
  sdPct: number;
  avgAdt: number;
  avgYearBuilt: number;
}


// =============================================================================
// SPATIAL INDEX (for Bridges Near Me feature)
// =============================================================================

/**
 * Minimal bridge entry for spatial search
 * Array format: [id, state, lat, lon, facility, over, condition]
 * condition: 0=poor, 1=fair, 2=good, -1=unknown
 */
export type SpatialBridgeEntry = [
  string, // id
  string, // state abbreviation
  number, // latitude
  number, // longitude
  string, // facilityCarried
  string, // featuresIntersected (over)
  number  // condition code
];

/** Decoded spatial bridge with distance */
export interface NearbyBridge {
  id: string;
  state: string;
  lat: number;
  lon: number;
  facilityCarried: string;
  featuresIntersected: string;
  conditionCategory: 'good' | 'fair' | 'poor' | null;
  distanceMiles: number;
}

// =============================================================================
// MULTI-YEAR TREND DATA (2020-2024)
// =============================================================================

/** Single year's condition snapshot for a bridge */
export interface BridgeYearSnapshot {
  year: number;
  lowestRating: number | null;
  conditionCategory: ConditionCategory | null;
  structurallyDeficient: boolean;
  deckCondition: string | null;
  superstructureCondition: string | null;
  substructureCondition: string | null;
  adt: number | null;
}

/** Multi-year trend data for individual bridges */
export interface BridgeTrendData {
  bridgeId: string;
  years: number[];
  snapshots: BridgeYearSnapshot[];
  trend: 'improving' | 'declining' | 'stable' | 'unknown';
  ratingChange: number; // Change from first to last year (positive = improved)
  statusChanges: string[]; // e.g., ["Entered poor condition in 2022"]
}

/** Aggregate trend data for state/national summaries */
export interface AggregateTrendData {
  years: number[];
  totalBridges: number[];
  poorCount: number[];
  poorPct: number[];
  fairCount: number[];
  fairPct: number[];
  goodCount: number[];
  goodPct: number[];
  avgRating: number[];
  trend: 'improving' | 'declining' | 'stable';
  changeFromBaseline: number; // % change in poor bridges from 2020
}

/** Trend direction with magnitude */
export type TrendDirection = 'improving' | 'declining' | 'stable' | 'unknown';
