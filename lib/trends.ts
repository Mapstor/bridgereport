/**
 * Multi-year trend data generation and analysis
 *
 * Uses REAL historical NBI data from 2020-2024 when available.
 * Falls back to generated estimates for any missing data.
 *
 * NOTE: This module uses Node.js fs/path modules and can only be
 * imported in server components. Client components should import
 * from '@/lib/trends-utils' instead.
 */

import 'server-only';
import * as fs from 'fs';
import * as path from 'path';
import type {
  Bridge,
  BridgeTrendData,
  BridgeYearSnapshot,
  AggregateTrendData,
  ConditionCategory,
  TrendDirection,
} from '@/types';

// Import and re-export client-safe utilities for convenience in server components
import {
  TREND_YEARS,
  BASELINE_YEAR,
  CURRENT_YEAR,
  getTrendDescription,
  getAggregateTrendDescription,
} from './trends-utils';

export {
  TREND_YEARS,
  BASELINE_YEAR,
  CURRENT_YEAR,
  getTrendDescription,
  getAggregateTrendDescription,
};

// State abbreviation to FIPS code mapping
const STATE_ABBR_TO_CODE: Record<string, string> = {
  'AL': '01', 'AK': '02', 'AZ': '04', 'AR': '05', 'CA': '06',
  'CO': '08', 'CT': '09', 'DE': '10', 'DC': '11', 'FL': '12',
  'GA': '13', 'HI': '15', 'ID': '16', 'IL': '17', 'IN': '18',
  'IA': '19', 'KS': '20', 'KY': '21', 'LA': '22', 'ME': '23',
  'MD': '24', 'MA': '25', 'MI': '26', 'MN': '27', 'MS': '28',
  'MO': '29', 'MT': '30', 'NE': '31', 'NV': '32', 'NH': '33',
  'NJ': '34', 'NM': '35', 'NY': '36', 'NC': '37', 'ND': '38',
  'OH': '39', 'OK': '40', 'OR': '41', 'PA': '42', 'PR': '72',
  'RI': '44', 'SC': '45', 'SD': '46', 'TN': '47', 'TX': '48',
  'UT': '49', 'VT': '50', 'VA': '51', 'WA': '53', 'WV': '54',
  'WI': '55', 'WY': '56', 'VI': '78', 'GU': '66', 'AS': '60', 'MP': '69',
};

// Historical trend data cache
interface HistoricalYearData {
  year: number;
  total: number;
  good: number;
  fair: number;
  poor: number;
}

type HistoricalTrends = Record<string, HistoricalYearData[]>;

let stateTrendsCache: HistoricalTrends | null = null;
let countyTrendsCache: HistoricalTrends | null = null;

/**
 * Load historical state trends from JSON file
 */
function loadStateTrends(): HistoricalTrends {
  if (stateTrendsCache) return stateTrendsCache;

  try {
    const filePath = path.join(process.cwd(), 'data/trends/state-trends.json');
    const data = fs.readFileSync(filePath, 'utf-8');
    stateTrendsCache = JSON.parse(data);
    return stateTrendsCache!;
  } catch {
    console.warn('Could not load state trends file');
    return {};
  }
}

/**
 * Load historical county trends from JSON file
 */
function loadCountyTrends(): HistoricalTrends {
  if (countyTrendsCache) return countyTrendsCache;

  try {
    const filePath = path.join(process.cwd(), 'data/trends/county-trends.json');
    const data = fs.readFileSync(filePath, 'utf-8');
    countyTrendsCache = JSON.parse(data);
    return countyTrendsCache!;
  } catch {
    console.warn('Could not load county trends file');
    return {};
  }
}

/**
 * Get historical trend data for a state
 * @param stateAbbr State abbreviation (e.g., 'CA', 'TX')
 */
export function getStateTrend(stateAbbr: string): AggregateTrendData | null {
  const trends = loadStateTrends();
  const stateCode = STATE_ABBR_TO_CODE[stateAbbr.toUpperCase()];

  if (!stateCode || !trends[stateCode]) {
    return null;
  }

  return convertHistoricalToAggregate(trends[stateCode]);
}

/**
 * Get historical trend data for a county
 * @param countyFips 5-digit county FIPS code
 */
export function getCountyTrend(countyFips: string): AggregateTrendData | null {
  const trends = loadCountyTrends();

  if (!trends[countyFips]) {
    return null;
  }

  return convertHistoricalToAggregate(trends[countyFips]);
}

/**
 * Convert historical data array to AggregateTrendData format
 */
function convertHistoricalToAggregate(data: HistoricalYearData[]): AggregateTrendData {
  // Sort by year to ensure correct order
  const sorted = [...data].sort((a, b) => a.year - b.year);

  const years: number[] = [];
  const totalBridges: number[] = [];
  const poorCount: number[] = [];
  const poorPct: number[] = [];
  const fairCount: number[] = [];
  const fairPct: number[] = [];
  const goodCount: number[] = [];
  const goodPct: number[] = [];
  const avgRating: number[] = [];

  for (const yearData of sorted) {
    const total = yearData.total || 1;
    years.push(yearData.year);
    totalBridges.push(yearData.total);
    poorCount.push(yearData.poor);
    poorPct.push(Math.round((yearData.poor / total) * 1000) / 10);
    fairCount.push(yearData.fair);
    fairPct.push(Math.round((yearData.fair / total) * 1000) / 10);
    goodCount.push(yearData.good);
    goodPct.push(Math.round((yearData.good / total) * 1000) / 10);
    // Estimate avg rating from condition distribution
    const estAvgRating = (yearData.good * 7.5 + yearData.fair * 5.5 + yearData.poor * 3) / total;
    avgRating.push(Math.round(estAvgRating * 10) / 10);
  }

  // Calculate trend from poor percentage change
  const firstPoorPct = poorPct[0];
  const lastPoorPct = poorPct[poorPct.length - 1];
  const pctChange = lastPoorPct - firstPoorPct;

  let trend: 'improving' | 'declining' | 'stable' = 'stable';
  if (pctChange <= -0.3) {
    trend = 'improving'; // Fewer poor bridges = improving
  } else if (pctChange >= 0.3) {
    trend = 'declining'; // More poor bridges = declining
  }

  return {
    years: years as [number, number, number, number, number],
    totalBridges,
    poorCount,
    poorPct,
    fairCount,
    fairPct,
    goodCount,
    goodPct,
    avgRating,
    trend,
    changeFromBaseline: Math.round((lastPoorPct - firstPoorPct) * 10) / 10,
  };
}

/**
 * Generate trend data for an individual bridge
 * Uses bridge characteristics to estimate historical condition trajectory
 */
export function generateBridgeTrend(bridge: Bridge): BridgeTrendData {
  const snapshots: BridgeYearSnapshot[] = [];
  const statusChanges: string[] = [];

  // Start from current (2024) condition and work backwards
  const currentRating = bridge.lowestRating ?? 5;
  const age = bridge.yearBuilt ? CURRENT_YEAR - bridge.yearBuilt : 50;
  const wasReconstructed = bridge.yearReconstructed && bridge.yearReconstructed >= 2019;

  // Estimate annual deterioration rate based on age and material
  const deteriorationRate = getDeterioriationRate(bridge.materialGroup, age);

  // If reconstructed recently, condition likely improved
  if (wasReconstructed && bridge.yearReconstructed) {
    const reconstructYear = bridge.yearReconstructed;

    for (const year of TREND_YEARS) {
      if (year < reconstructYear) {
        // Before reconstruction: worse condition
        const yearsBefore = reconstructYear - year;
        const estimatedRating = Math.max(3, currentRating - 1 - (yearsBefore * 0.3));
        snapshots.push(createSnapshot(year, estimatedRating, bridge));
      } else if (year === reconstructYear) {
        // Year of reconstruction: jump to better condition
        snapshots.push(createSnapshot(year, Math.min(8, currentRating + 1), bridge));
        statusChanges.push(`Reconstructed in ${reconstructYear}`);
      } else {
        // After reconstruction: slight natural decline
        const yearsAfter = year - reconstructYear;
        const estimatedRating = Math.max(currentRating, currentRating + 1 - (yearsAfter * 0.2));
        snapshots.push(createSnapshot(year, estimatedRating, bridge));
      }
    }
  } else {
    // No reconstruction: estimate gradual change over time
    for (let i = 0; i < TREND_YEARS.length; i++) {
      const year = TREND_YEARS[i];
      const yearsFromCurrent = CURRENT_YEAR - year;

      // Estimate past rating (bridges typically deteriorate over time)
      // Add some randomness seeded by bridge ID for consistency
      const seed = hashBridgeId(bridge.id, year);
      const variance = (seed % 10 - 5) / 10; // -0.5 to +0.5

      let estimatedRating = currentRating + (yearsFromCurrent * deteriorationRate) + variance;
      estimatedRating = Math.max(0, Math.min(9, Math.round(estimatedRating * 10) / 10));

      snapshots.push(createSnapshot(year, estimatedRating, bridge));
    }
  }

  // Detect status changes
  for (let i = 1; i < snapshots.length; i++) {
    const prev = snapshots[i - 1];
    const curr = snapshots[i];

    if (prev.conditionCategory !== 'poor' && curr.conditionCategory === 'poor') {
      statusChanges.push(`Entered poor condition in ${curr.year}`);
    } else if (prev.conditionCategory === 'poor' && curr.conditionCategory !== 'poor') {
      statusChanges.push(`Exited poor condition in ${curr.year}`);
    }

    if (!prev.structurallyDeficient && curr.structurallyDeficient) {
      statusChanges.push(`Became structurally deficient in ${curr.year}`);
    } else if (prev.structurallyDeficient && !curr.structurallyDeficient) {
      statusChanges.push(`No longer structurally deficient as of ${curr.year}`);
    }
  }

  // Calculate overall trend
  const firstRating = snapshots[0].lowestRating ?? 5;
  const lastRating = snapshots[snapshots.length - 1].lowestRating ?? 5;
  const ratingChange = lastRating - firstRating;

  let trend: TrendDirection = 'stable';
  if (ratingChange >= 0.5) {
    trend = 'improving';
  } else if (ratingChange <= -0.5) {
    trend = 'declining';
  }

  return {
    bridgeId: bridge.id,
    years: [...TREND_YEARS],
    snapshots,
    trend,
    ratingChange: Math.round(ratingChange * 10) / 10,
    statusChanges,
  };
}

/**
 * Generate aggregate trend data from multiple bridge trends
 */
export function generateAggregateTrend(bridges: Bridge[]): AggregateTrendData {
  const yearData: Map<number, { poor: number; fair: number; good: number; totalRating: number; count: number }> = new Map();

  // Initialize year buckets
  for (const year of TREND_YEARS) {
    yearData.set(year, { poor: 0, fair: 0, good: 0, totalRating: 0, count: 0 });
  }

  // Aggregate bridge data by year
  for (const bridge of bridges) {
    const trend = generateBridgeTrend(bridge);

    for (const snapshot of trend.snapshots) {
      const data = yearData.get(snapshot.year);
      if (data) {
        data.count++;
        data.totalRating += snapshot.lowestRating ?? 5;

        if (snapshot.conditionCategory === 'poor') {
          data.poor++;
        } else if (snapshot.conditionCategory === 'fair') {
          data.fair++;
        } else if (snapshot.conditionCategory === 'good') {
          data.good++;
        }
      }
    }
  }

  // Build arrays
  const totalBridges: number[] = [];
  const poorCount: number[] = [];
  const poorPct: number[] = [];
  const fairCount: number[] = [];
  const fairPct: number[] = [];
  const goodCount: number[] = [];
  const goodPct: number[] = [];
  const avgRating: number[] = [];

  for (const year of TREND_YEARS) {
    const data = yearData.get(year)!;
    const total = data.count || 1;

    totalBridges.push(data.count);
    poorCount.push(data.poor);
    poorPct.push(Math.round((data.poor / total) * 1000) / 10);
    fairCount.push(data.fair);
    fairPct.push(Math.round((data.fair / total) * 1000) / 10);
    goodCount.push(data.good);
    goodPct.push(Math.round((data.good / total) * 1000) / 10);
    avgRating.push(Math.round((data.totalRating / total) * 10) / 10);
  }

  // Calculate overall trend from poor percentage change
  const firstPoorPct = poorPct[0];
  const lastPoorPct = poorPct[poorPct.length - 1];
  const pctChange = lastPoorPct - firstPoorPct;

  let trend: 'improving' | 'declining' | 'stable' = 'stable';
  if (pctChange <= -0.5) {
    trend = 'improving'; // Fewer poor bridges = improving
  } else if (pctChange >= 0.5) {
    trend = 'declining'; // More poor bridges = declining
  }

  return {
    years: [...TREND_YEARS],
    totalBridges,
    poorCount,
    poorPct,
    fairCount,
    fairPct,
    goodCount,
    goodPct,
    avgRating,
    trend,
    changeFromBaseline: Math.round((lastPoorPct - firstPoorPct) * 10) / 10,
  };
}

/**
 * Create a year snapshot from estimated rating
 */
function createSnapshot(year: number, rating: number, bridge: Bridge): BridgeYearSnapshot {
  const roundedRating = Math.round(rating);
  const category = ratingToCategory(roundedRating);

  // Estimate component conditions based on overall rating
  const deckVariance = (hashBridgeId(bridge.id, year * 2) % 3) - 1;
  const superVariance = (hashBridgeId(bridge.id, year * 3) % 3) - 1;
  const subVariance = (hashBridgeId(bridge.id, year * 5) % 3) - 1;

  return {
    year,
    lowestRating: roundedRating,
    conditionCategory: category,
    structurallyDeficient: roundedRating <= 4,
    deckCondition: String(Math.max(0, Math.min(9, roundedRating + deckVariance))),
    superstructureCondition: String(Math.max(0, Math.min(9, roundedRating + superVariance))),
    substructureCondition: String(Math.max(0, Math.min(9, roundedRating + subVariance))),
    adt: bridge.adt, // ADT typically doesn't change much year-to-year
  };
}

/**
 * Convert numeric rating to condition category
 */
function ratingToCategory(rating: number): ConditionCategory | null {
  if (rating >= 7) return 'good';
  if (rating >= 5) return 'fair';
  if (rating >= 0) return 'poor';
  return null;
}

/**
 * Get estimated annual deterioration rate based on material and age
 * Positive values mean the bridge was in better condition in the past
 */
function getDeterioriationRate(materialGroup: string, age: number): number {
  // Base deterioration rates by material (rating points per year)
  const materialRates: Record<string, number> = {
    'Concrete': 0.08,
    'Steel': 0.10,
    'Prestressed Concrete': 0.06,
    'Timber': 0.15,
    'Other': 0.10,
  };

  let baseRate = materialRates[materialGroup] ?? 0.08;

  // Older bridges deteriorate faster
  if (age > 75) {
    baseRate *= 1.3;
  } else if (age > 50) {
    baseRate *= 1.1;
  } else if (age < 20) {
    baseRate *= 0.7;
  }

  return baseRate;
}

/**
 * Simple hash function to generate consistent pseudo-random values
 * based on bridge ID and year for reproducibility
 */
function hashBridgeId(id: string, seed: number): number {
  let hash = seed;
  for (let i = 0; i < id.length; i++) {
    hash = ((hash << 5) - hash + id.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

/**
 * Generate aggregate trend data from summary stats (good/fair/poor counts)
 * Tries to use real historical NBI data first, falls back to estimates.
 *
 * @param good - Current good bridge count
 * @param fair - Current fair bridge count
 * @param poor - Current poor bridge count
 * @param avgYearBuilt - Average year built for estimation fallback
 * @param name - Region name for estimation fallback
 * @param options - Optional identifiers to look up real historical data
 */
export function generateAggregateTrendFromSummary(
  good: number,
  fair: number,
  poor: number,
  avgYearBuilt: number,
  name: string = 'region',
  options?: { stateAbbr?: string; countyFips?: string }
): AggregateTrendData {
  // Try to use real historical data first
  if (options?.countyFips) {
    const realTrend = getCountyTrend(options.countyFips);
    if (realTrend) {
      return realTrend;
    }
  }

  if (options?.stateAbbr) {
    const realTrend = getStateTrend(options.stateAbbr);
    if (realTrend) {
      return realTrend;
    }
  }

  // Fall back to estimated data
  const total = good + fair + poor;
  if (total === 0) {
    // Return empty/stable trend for no data
    return {
      years: [...TREND_YEARS],
      totalBridges: TREND_YEARS.map(() => 0),
      poorCount: TREND_YEARS.map(() => 0),
      poorPct: TREND_YEARS.map(() => 0),
      fairCount: TREND_YEARS.map(() => 0),
      fairPct: TREND_YEARS.map(() => 0),
      goodCount: TREND_YEARS.map(() => 0),
      goodPct: TREND_YEARS.map(() => 0),
      avgRating: TREND_YEARS.map(() => 5),
      trend: 'stable',
      changeFromBaseline: 0,
    };
  }

  // Current (2024) percentages
  const currentPoorPct = (poor / total) * 100;
  const currentFairPct = (fair / total) * 100;
  const currentGoodPct = (good / total) * 100;

  // Estimate trend direction based on infrastructure age and current state
  // Older infrastructure tends to have been improving due to federal programs
  // Areas with high poor % tend to be declining
  const avgAge = CURRENT_YEAR - avgYearBuilt;
  const seed = hashString(name);
  const randomFactor = ((seed % 100) - 50) / 100; // -0.5 to +0.5

  // Base annual change in poor percentage
  // Positive = more poor bridges (declining), negative = fewer poor (improving)
  let annualPoorChange: number;

  if (currentPoorPct > 12) {
    // High poor % areas tend to be declining or stable
    annualPoorChange = 0.2 + randomFactor * 0.3;
  } else if (currentPoorPct < 5) {
    // Low poor % areas tend to be stable or improving
    annualPoorChange = -0.15 + randomFactor * 0.2;
  } else {
    // Average areas: mixed trends
    annualPoorChange = randomFactor * 0.4;
  }

  // Older infrastructure tends to show improvement (investment catching up)
  if (avgAge > 50) {
    annualPoorChange -= 0.1;
  }

  // Generate yearly data working backwards from current
  const totalBridges: number[] = [];
  const poorCount: number[] = [];
  const poorPct: number[] = [];
  const fairCount: number[] = [];
  const fairPct: number[] = [];
  const goodCount: number[] = [];
  const goodPct: number[] = [];
  const avgRating: number[] = [];

  for (let i = 0; i < TREND_YEARS.length; i++) {
    const year = TREND_YEARS[i];
    const yearsFromCurrent = CURRENT_YEAR - year;

    // Estimate past poor percentage
    const yearVariance = ((hashString(name + year) % 20) - 10) / 100;
    let estPoorPct = currentPoorPct + (yearsFromCurrent * annualPoorChange) + yearVariance;
    estPoorPct = Math.max(0, Math.min(100, estPoorPct));

    // Distribute remaining between fair and good based on current ratios
    const remainingPct = 100 - estPoorPct;
    const goodFairRatio = currentGoodPct / Math.max(0.1, currentGoodPct + currentFairPct);
    let estGoodPct = remainingPct * goodFairRatio;
    let estFairPct = remainingPct - estGoodPct;

    // Small year-to-year variations
    const goodVariance = ((hashString(name + 'good' + year) % 10) - 5) / 10;
    estGoodPct = Math.max(0, Math.min(100 - estPoorPct, estGoodPct + goodVariance));
    estFairPct = 100 - estPoorPct - estGoodPct;

    // Estimate counts
    const estTotal = total; // Assume total count roughly stable
    const estPoor = Math.round((estPoorPct / 100) * estTotal);
    const estFair = Math.round((estFairPct / 100) * estTotal);
    const estGood = estTotal - estPoor - estFair;

    // Estimate average rating (higher = better)
    const estAvgRating = (estGoodPct * 7.5 + estFairPct * 5.5 + estPoorPct * 3) / 100;

    totalBridges.push(estTotal);
    poorCount.push(estPoor);
    poorPct.push(Math.round(estPoorPct * 10) / 10);
    fairCount.push(estFair);
    fairPct.push(Math.round(estFairPct * 10) / 10);
    goodCount.push(estGood);
    goodPct.push(Math.round(estGoodPct * 10) / 10);
    avgRating.push(Math.round(estAvgRating * 10) / 10);
  }

  // Calculate overall trend
  const firstPoorPct = poorPct[0];
  const lastPoorPct = poorPct[poorPct.length - 1];
  const pctChange = lastPoorPct - firstPoorPct;

  let trend: 'improving' | 'declining' | 'stable' = 'stable';
  if (pctChange <= -0.5) {
    trend = 'improving';
  } else if (pctChange >= 0.5) {
    trend = 'declining';
  }

  return {
    years: [...TREND_YEARS],
    totalBridges,
    poorCount,
    poorPct,
    fairCount,
    fairPct,
    goodCount,
    goodPct,
    avgRating,
    trend,
    changeFromBaseline: Math.round((lastPoorPct - firstPoorPct) * 10) / 10,
  };
}

/**
 * Simple string hash for consistent pseudo-random values
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}
