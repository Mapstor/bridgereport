import { NextRequest, NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';

// Spatial index entry: [id, state, lat, lon, facilityCarried, featuresIntersected, conditionCode]
type SpatialEntry = [string, string, number, number, string, string, number];

// Geographic bounds for US states (south, north, west, east)
const STATE_BOUNDS: Record<string, { south: number; north: number; west: number; east: number }> = {
  AL: { south: 30.22, north: 35.01, west: -88.47, east: -84.89 },
  AK: { south: 51.21, north: 71.39, west: -179.15, east: -129.98 },
  AZ: { south: 31.33, north: 37.00, west: -114.81, east: -109.04 },
  AR: { south: 33.00, north: 36.50, west: -94.62, east: -89.64 },
  CA: { south: 32.53, north: 42.01, west: -124.41, east: -114.13 },
  CO: { south: 36.99, north: 41.00, west: -109.06, east: -102.04 },
  CT: { south: 40.95, north: 42.05, west: -73.73, east: -71.79 },
  DE: { south: 38.45, north: 39.84, west: -75.79, east: -75.05 },
  FL: { south: 24.40, north: 31.00, west: -87.63, east: -80.03 },
  GA: { south: 30.36, north: 35.00, west: -85.61, east: -80.84 },
  HI: { south: 18.91, north: 22.24, west: -160.25, east: -154.81 },
  ID: { south: 41.99, north: 49.00, west: -117.24, east: -111.04 },
  IL: { south: 36.97, north: 42.51, west: -91.51, east: -87.02 },
  IN: { south: 37.77, north: 41.76, west: -88.10, east: -84.78 },
  IA: { south: 40.38, north: 43.50, west: -96.64, east: -90.14 },
  KS: { south: 36.99, north: 40.00, west: -102.05, east: -94.59 },
  KY: { south: 36.50, north: 39.15, west: -89.57, east: -81.96 },
  LA: { south: 28.93, north: 33.02, west: -94.04, east: -88.82 },
  ME: { south: 43.06, north: 47.46, west: -71.08, east: -66.95 },
  MD: { south: 37.91, north: 39.72, west: -79.49, east: -75.05 },
  MA: { south: 41.24, north: 42.89, west: -73.51, east: -69.93 },
  MI: { south: 41.70, north: 48.31, west: -90.42, east: -82.12 },
  MN: { south: 43.50, north: 49.38, west: -97.24, east: -89.49 },
  MS: { south: 30.17, north: 35.00, west: -91.66, east: -88.10 },
  MO: { south: 35.99, north: 40.61, west: -95.77, east: -89.10 },
  MT: { south: 44.36, north: 49.00, west: -116.05, east: -104.04 },
  NE: { south: 40.00, north: 43.00, west: -104.05, east: -95.31 },
  NV: { south: 35.00, north: 42.00, west: -120.01, east: -114.04 },
  NH: { south: 42.70, north: 45.31, west: -72.56, east: -70.70 },
  NJ: { south: 38.93, north: 41.36, west: -75.56, east: -73.89 },
  NM: { south: 31.33, north: 37.00, west: -109.05, east: -103.00 },
  NY: { south: 40.50, north: 45.02, west: -79.76, east: -71.86 },
  NC: { south: 33.84, north: 36.59, west: -84.32, east: -75.46 },
  ND: { south: 45.94, north: 49.00, west: -104.05, east: -96.55 },
  OH: { south: 38.40, north: 42.33, west: -84.82, east: -80.52 },
  OK: { south: 33.62, north: 37.00, west: -103.00, east: -94.43 },
  OR: { south: 41.99, north: 46.29, west: -124.57, east: -116.46 },
  PA: { south: 39.72, north: 42.27, west: -80.52, east: -74.69 },
  RI: { south: 41.15, north: 42.02, west: -71.86, east: -71.12 },
  SC: { south: 32.03, north: 35.22, west: -83.35, east: -78.54 },
  SD: { south: 42.48, north: 45.95, west: -104.06, east: -96.44 },
  TN: { south: 34.98, north: 36.68, west: -90.31, east: -81.65 },
  TX: { south: 25.84, north: 36.50, west: -106.65, east: -93.51 },
  UT: { south: 37.00, north: 42.00, west: -114.05, east: -109.04 },
  VT: { south: 42.73, north: 45.02, west: -73.44, east: -71.46 },
  VA: { south: 36.54, north: 39.47, west: -83.68, east: -75.24 },
  WA: { south: 45.54, north: 49.00, west: -124.85, east: -116.92 },
  WV: { south: 37.20, north: 40.64, west: -82.64, east: -77.72 },
  WI: { south: 42.49, north: 47.08, west: -92.89, east: -86.25 },
  WY: { south: 40.99, north: 45.01, west: -111.06, east: -104.05 },
  DC: { south: 38.79, north: 38.99, west: -77.12, east: -76.91 },
  PR: { south: 17.88, north: 18.52, west: -67.95, east: -65.22 },
};

// Cache the spatial index in memory
let spatialIndex: SpatialEntry[] | null = null;

interface BridgePoint {
  id: string;
  state: string;
  lat: number;
  lon: number;
  facilityCarried: string;
  featuresIntersected: string;
  condition: 'good' | 'fair' | 'poor' | null;
}

function loadSpatialIndex(): SpatialEntry[] {
  if (spatialIndex) return spatialIndex;

  const filePath = join(process.cwd(), 'public', 'spatial-index.json');
  const data = readFileSync(filePath, 'utf-8');
  spatialIndex = JSON.parse(data);
  return spatialIndex!;
}

function decodeCondition(code: number): 'good' | 'fair' | 'poor' | null {
  switch (code) {
    case 2: return 'good';
    case 1: return 'fair';
    case 0: return 'poor';
    default: return null;
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ abbr: string }> }
) {
  const { abbr } = await params;
  const stateAbbr = abbr.toUpperCase();

  const index = loadSpatialIndex();

  // Get state geographic bounds for filtering
  const stateBounds = STATE_BOUNDS[stateAbbr];

  // Filter bridges for this state, also excluding those with coordinates outside state bounds
  const bridges: BridgePoint[] = [];
  for (const entry of index) {
    if (entry[1] === stateAbbr) {
      const lat = entry[2];
      const lon = entry[3];

      // Skip bridges with coordinates outside state bounds (bad data in source)
      if (stateBounds) {
        if (lat < stateBounds.south || lat > stateBounds.north ||
            lon < stateBounds.west || lon > stateBounds.east) {
          continue;
        }
      }

      bridges.push({
        id: entry[0],
        state: entry[1],
        lat,
        lon,
        facilityCarried: entry[4],
        featuresIntersected: entry[5],
        condition: decodeCondition(entry[6]),
      });
    }
  }

  // Use predefined state geographic bounds
  let bounds: { south: number; north: number; west: number; east: number };

  if (stateBounds) {
    bounds = stateBounds;
  } else {
    // Fallback: calculate from data if state not in lookup
    let minLat = 90, maxLat = -90, minLon = 180, maxLon = -180;
    for (const bridge of bridges) {
      if (bridge.lat < minLat) minLat = bridge.lat;
      if (bridge.lat > maxLat) maxLat = bridge.lat;
      if (bridge.lon < minLon) minLon = bridge.lon;
      if (bridge.lon > maxLon) maxLon = bridge.lon;
    }
    bounds = { south: minLat, north: maxLat, west: minLon, east: maxLon };
  }

  // Count by condition
  const stats = {
    total: bridges.length,
    good: bridges.filter(b => b.condition === 'good').length,
    fair: bridges.filter(b => b.condition === 'fair').length,
    poor: bridges.filter(b => b.condition === 'poor').length,
  };

  return NextResponse.json({
    state: stateAbbr,
    bounds,
    stats,
    bridges,
  });
}
