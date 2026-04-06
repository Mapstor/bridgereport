'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import type { SpatialBridgeEntry, NearbyBridge, ConditionCategory } from '@/types';
import ConditionBadge from '@/components/ConditionBadge';

// Dynamically import maps to avoid SSR issues
const LocationPickerMap = dynamic(() => import('@/components/LocationPickerMap'), {
  ssr: false,
  loading: () => (
    <div className="h-[350px] bg-slate-100 rounded-lg animate-pulse flex items-center justify-center">
      <p className="text-slate-400">Loading map...</p>
    </div>
  ),
});

const NearbyBridgesMap = dynamic(() => import('@/components/NearbyBridgesMap'), {
  ssr: false,
  loading: () => (
    <div className="h-[400px] bg-slate-100 rounded-lg animate-pulse flex items-center justify-center">
      <p className="text-slate-400">Loading map...</p>
    </div>
  ),
});

// Haversine distance formula (returns miles)
function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 3959; // Earth radius in miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// US bounding box for validation
const US_BOUNDS = {
  minLat: 24.396308, // Southern tip of Florida Keys
  maxLat: 49.384358, // Northern border with Canada
  minLon: -125.0, // Western coast
  maxLon: -66.93457, // Eastern coast (Maine)
};

// Alaska and Hawaii bounds for additional validation
const ALASKA_BOUNDS = {
  minLat: 51.0,
  maxLat: 71.5,
  minLon: -180.0,
  maxLon: -129.0,
};

const HAWAII_BOUNDS = {
  minLat: 18.5,
  maxLat: 22.5,
  minLon: -160.5,
  maxLon: -154.5,
};

function isInUS(lat: number, lon: number): boolean {
  // Check continental US
  if (lat >= US_BOUNDS.minLat && lat <= US_BOUNDS.maxLat &&
      lon >= US_BOUNDS.minLon && lon <= US_BOUNDS.maxLon) {
    return true;
  }
  // Check Alaska
  if (lat >= ALASKA_BOUNDS.minLat && lat <= ALASKA_BOUNDS.maxLat &&
      lon >= ALASKA_BOUNDS.minLon && lon <= ALASKA_BOUNDS.maxLon) {
    return true;
  }
  // Check Hawaii
  if (lat >= HAWAII_BOUNDS.minLat && lat <= HAWAII_BOUNDS.maxLat &&
      lon >= HAWAII_BOUNDS.minLon && lon <= HAWAII_BOUNDS.maxLon) {
    return true;
  }
  return false;
}

function decodeCondition(code: number): ConditionCategory | null {
  switch (code) {
    case 0: return 'poor';
    case 1: return 'fair';
    case 2: return 'good';
    default: return null;
  }
}

function decodeBridge(entry: SpatialBridgeEntry, userLat: number, userLon: number): NearbyBridge {
  const [id, state, lat, lon, facilityCarried, featuresIntersected, condition] = entry;
  return {
    id,
    state,
    lat,
    lon,
    facilityCarried,
    featuresIntersected,
    conditionCategory: decodeCondition(condition),
    distanceMiles: haversineDistance(userLat, userLon, lat, lon),
  };
}

const RESULTS_LIMIT = 50;
const SEARCH_RADIUS_MILES = 50;

type Status = 'idle' | 'requesting' | 'loading' | 'ready' | 'error';
type LocationMethod = 'geolocation' | 'map-click';

export default function BridgesNearMePage() {
  const [status, setStatus] = useState<Status>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [userLat, setUserLat] = useState<number | null>(null);
  const [userLon, setUserLon] = useState<number | null>(null);
  const [locationMethod, setLocationMethod] = useState<LocationMethod | null>(null);
  const [spatialData, setSpatialData] = useState<SpatialBridgeEntry[] | null>(null);

  // Request geolocation
  const requestLocation = () => {
    setStatus('requesting');
    setErrorMessage('');
    setLocationMethod('geolocation');

    if (!navigator.geolocation) {
      setStatus('error');
      setErrorMessage('Geolocation is not supported by your browser. Use the map below to select a location.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        if (!isInUS(lat, lon)) {
          setStatus('error');
          setErrorMessage('Your location appears to be outside the United States. This tool only covers US bridges. Use the map below to select a US location.');
          return;
        }

        setUserLat(lat);
        setUserLon(lon);
        setStatus('loading');
      },
      (error) => {
        setStatus('error');
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setErrorMessage('Location access was denied. Use the map below to select a location manually.');
            break;
          case error.POSITION_UNAVAILABLE:
            setErrorMessage('Location information is unavailable. Use the map below to select a location.');
            break;
          case error.TIMEOUT:
            setErrorMessage('Location request timed out. Use the map below to select a location.');
            break;
          default:
            setErrorMessage('An unknown error occurred. Use the map below to select a location.');
        }
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 300000, // Cache for 5 minutes
      }
    );
  };

  // Handle map click location selection
  const handleMapLocationSelect = useCallback((lat: number, lon: number) => {
    if (!isInUS(lat, lon)) {
      setStatus('error');
      setErrorMessage('Please select a location within the United States.');
      return;
    }

    setUserLat(lat);
    setUserLon(lon);
    setLocationMethod('map-click');
    setStatus('loading');
    setErrorMessage('');
  }, []);

  // Load spatial data when we have coordinates
  useEffect(() => {
    if (status !== 'loading' || userLat === null || userLon === null) return;

    fetch('/spatial-index.json')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load bridge data');
        return res.json();
      })
      .then((data: SpatialBridgeEntry[]) => {
        setSpatialData(data);
      })
      .catch((err) => {
        console.error('Error loading spatial data:', err);
        setStatus('error');
        setErrorMessage('Failed to load bridge data. Please try again.');
      });
  }, [status, userLat, userLon]);

  // Find nearest bridges
  const nearbyBridges = useMemo(() => {
    if (!spatialData || userLat === null || userLon === null) return [];

    // Pre-filter by rough bounding box (~1 degree ≈ ~69 miles)
    const latDelta = SEARCH_RADIUS_MILES / 69;
    const lonDelta = SEARCH_RADIUS_MILES / (69 * Math.cos((userLat * Math.PI) / 180));

    const candidates = spatialData.filter((entry) => {
      const lat = entry[2];
      const lon = entry[3];
      return (
        lat >= userLat - latDelta &&
        lat <= userLat + latDelta &&
        lon >= userLon - lonDelta &&
        lon <= userLon + lonDelta
      );
    });

    // Decode and calculate actual distances
    const decoded = candidates
      .map((entry) => decodeBridge(entry, userLat, userLon))
      .filter((b) => b.distanceMiles <= SEARCH_RADIUS_MILES);

    // Sort by distance and take top results
    decoded.sort((a, b) => a.distanceMiles - b.distanceMiles);
    return decoded.slice(0, RESULTS_LIMIT);
  }, [spatialData, userLat, userLon]);

  // Mark as ready when we have data
  useEffect(() => {
    if (spatialData && nearbyBridges.length >= 0 && status === 'loading') {
      setStatus('ready');
    }
  }, [spatialData, nearbyBridges, status]);

  return (
    <>
      {/* Hero Section */}
      <section className="bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <nav className="mb-6 text-sm">
            <Link href="/" className="text-slate-400 hover:text-white">
              Home
            </Link>
            <span className="text-slate-600 mx-2">/</span>
            <span className="text-slate-300">Bridges Near Me</span>
          </nav>

          <h1 className="text-4xl font-bold mb-4">Bridges Near Me</h1>

          <p className="text-xl text-slate-300 mb-2 max-w-3xl">
            Find highway bridges near any location in the United States. View bridge conditions,
            distances, and access detailed inspection data from the National Bridge Inventory.
          </p>
          <p className="text-sm text-slate-400 mb-8">
            Covers 623,000+ bridges across all 50 states, Puerto Rico, and US territories.
          </p>

          {/* Location Status */}
          <div className="bg-slate-800 rounded-lg p-6 max-w-lg">
            {status === 'idle' && (
              <>
                <p className="text-slate-300 mb-4">
                  Use your current location or click the map below to choose any location in the US.
                </p>
                <button
                  onClick={requestLocation}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                >
                  Use My Current Location
                </button>
              </>
            )}

            {status === 'requesting' && (
              <div className="flex items-center gap-3">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-400" />
                <p className="text-slate-300">Requesting your location...</p>
              </div>
            )}

            {status === 'loading' && (
              <div className="flex items-center gap-3">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-400" />
                <p className="text-slate-300">Loading bridge data...</p>
              </div>
            )}

            {status === 'error' && (
              <div>
                <p className="text-red-400 mb-4">{errorMessage}</p>
                <button
                  onClick={requestLocation}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                >
                  Try Again
                </button>
              </div>
            )}

            {status === 'ready' && userLat !== null && userLon !== null && (
              <div>
                <p className="text-green-400 font-medium mb-2">
                  {locationMethod === 'map-click' ? 'Location selected!' : 'Location found!'}
                </p>
                <p className="text-slate-400 text-sm">
                  {nearbyBridges.length} bridges within {SEARCH_RADIUS_MILES} miles
                </p>
                <button
                  onClick={() => {
                    setStatus('idle');
                    setUserLat(null);
                    setUserLon(null);
                    setLocationMethod(null);
                    setSpatialData(null);
                  }}
                  className="mt-3 text-sm text-blue-400 hover:text-blue-300 underline"
                >
                  Choose a different location
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Location Picker Map - shown when idle or error */}
      {(status === 'idle' || status === 'error') && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <section className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-2">
              Or Select a Location on the Map
            </h2>
            <p className="text-slate-600 text-sm mb-4">
              Click anywhere on the map to find bridges within {SEARCH_RADIUS_MILES} miles of that location.
            </p>
            <LocationPickerMap onLocationSelect={handleMapLocationSelect} />
          </section>
        </div>
      )}

      {/* Results Section */}
      {status === 'ready' && userLat !== null && userLon !== null && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Map */}
          <section className="bg-white rounded-xl border border-slate-200 p-6 mb-8">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">
              Bridges Within {SEARCH_RADIUS_MILES} Miles
            </h2>
            <div className="mb-4">
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-blue-500" />
                  <span className="text-slate-600">Your location</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-green-500" />
                  <span className="text-slate-600">Good condition</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-yellow-500" />
                  <span className="text-slate-600">Fair condition</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-red-500" />
                  <span className="text-slate-600">Poor condition</span>
                </div>
              </div>
            </div>
            <NearbyBridgesMap bridges={nearbyBridges} userLat={userLat} userLon={userLon} />
          </section>

          {/* Bridge List */}
          <section className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">
              Nearest {Math.min(nearbyBridges.length, RESULTS_LIMIT)} Bridges
            </h2>

            {nearbyBridges.length === 0 ? (
              <p className="text-slate-600">
                No bridges found within {SEARCH_RADIUS_MILES} miles of your location.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50">
                      <th className="py-3 px-4 text-left font-medium text-slate-600">Bridge</th>
                      <th className="py-3 px-4 text-right font-medium text-slate-600">Distance</th>
                      <th className="py-3 px-4 text-center font-medium text-slate-600">Condition</th>
                      <th className="py-3 px-4 text-center font-medium text-slate-600">State</th>
                    </tr>
                  </thead>
                  <tbody>
                    {nearbyBridges.map((bridge) => (
                      <tr key={bridge.id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="py-3 px-4">
                          <Link
                            href={`/bridge/${bridge.state.toLowerCase()}/${bridge.id}`}
                            className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                          >
                            {bridge.facilityCarried}
                          </Link>
                          <p className="text-xs text-slate-500 mt-0.5">
                            over {bridge.featuresIntersected}
                          </p>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="font-mono">
                            {bridge.distanceMiles.toFixed(1)} mi
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <ConditionBadge condition={bridge.conditionCategory} />
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Link
                            href={`/state/${bridge.state.toLowerCase()}`}
                            className="text-blue-600 hover:underline"
                          >
                            {bridge.state}
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* Tips Section */}
          <section className="bg-slate-50 rounded-xl p-6 mt-8">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">About Bridge Conditions</h2>
            <div className="grid md:grid-cols-3 gap-6 text-sm text-slate-600">
              <div>
                <h3 className="font-semibold text-slate-900 mb-2">Good Condition</h3>
                <p>
                  Bridges rated 7-9. Well-maintained structures with minor or no deficiencies.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 mb-2">Fair Condition</h3>
                <p>
                  Bridges rated 5-6. Showing some deterioration but still safe for normal traffic.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 mb-2">Poor Condition</h3>
                <p>
                  Bridges rated 0-4. May have weight restrictions or be prioritized for repair. Still safe if open to traffic.
                </p>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* About Section for SEO */}
      {status === 'idle' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* US Only Notice */}
          <section className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-8">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-amber-900 mb-2">United States Bridges Only</h2>
                <p className="text-amber-800">
                  This tool exclusively covers bridges within the United States, including all 50 states, Puerto Rico, Guam,
                  the U.S. Virgin Islands, and other U.S. territories. The data comes from the National Bridge Inventory (NBI),
                  a federal database maintained by the Federal Highway Administration that tracks only bridges on U.S. public roads.
                  If you are looking for bridge information in Canada, Mexico, or other countries, you will need to consult
                  those nations&apos; respective transportation departments, as international bridge data is not included in this database.
                </p>
              </div>
            </div>
          </section>

          {/* How It Works */}
          <section className="bg-white rounded-xl border border-slate-200 p-6 mb-8">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">
              How This Tool Works
            </h2>
            <div className="prose prose-slate max-w-none text-sm">
              <p className="text-slate-600 leading-relaxed mb-4">
                The &quot;Bridges Near Me&quot; tool uses geolocation technology combined with the National Bridge Inventory database
                to help you discover highway bridges in your vicinity. When you click &quot;Use My Current Location,&quot; your browser
                requests permission to access your device&apos;s GPS coordinates. These coordinates are processed entirely within
                your browser—we never transmit, store, or log your location data on any server. Your privacy is fully protected.
              </p>
              <p className="text-slate-600 leading-relaxed mb-4">
                Once your location is determined (or you select a point on the map), the tool searches through our comprehensive
                database of 623,000+ U.S. bridges to find all structures within a 50-mile radius. The search uses the Haversine
                formula—a mathematical equation that calculates the great-circle distance between two points on Earth&apos;s surface,
                accounting for the planet&apos;s curvature. This ensures accurate distance measurements whether you&apos;re searching
                in flat terrain like Kansas or mountainous regions like Colorado.
              </p>
              <p className="text-slate-600 leading-relaxed mb-4">
                Results are sorted by distance, with the closest bridges appearing first. Each bridge displays its name (the road
                or facility it carries), what it crosses over (a river, highway, railroad, etc.), its current condition rating,
                and the state where it&apos;s located. The condition ratings—Good, Fair, or Poor—are derived from federal inspection
                data that evaluates three key components: the deck (driving surface), superstructure (the load-carrying framework),
                and substructure (piers, abutments, and foundations). The lowest rating among these three determines the overall
                condition category.
              </p>
              <p className="text-slate-600 leading-relaxed mb-4">
                Clicking on any bridge in the results takes you to a detailed profile page with comprehensive inspection data,
                including construction year, traffic volume, structural design type, material composition, and historical condition
                trends. This information comes directly from the National Bridge Inventory, which requires all bridges on public
                roads longer than 20 feet to undergo professional inspection at least once every 24 months.
              </p>
            </div>
          </section>

          {/* Examples Section */}
          <section className="bg-white rounded-xl border border-slate-200 p-6 mb-8">
            <h2 className="text-xl font-semibold text-slate-900 mb-6">
              Example Searches: How People Use This Tool
            </h2>

            {/* Example 1 */}
            <div className="mb-8 pb-8 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900 mb-3">
                Example 1: A Commuter in Pittsburgh, Pennsylvania
              </h3>
              <p className="text-slate-600 leading-relaxed mb-3">
                Sarah commutes daily across the Birmingham Bridge over the Monongahela River in Pittsburgh. After hearing news
                reports about aging infrastructure in Pennsylvania, she decides to learn more about the bridges she crosses
                regularly. Using this tool from her home in the South Side neighborhood, she discovers 47 bridges within
                a 10-mile radius of her location.
              </p>
              <p className="text-slate-600 leading-relaxed mb-3">
                She finds that the Birmingham Bridge, built in 1976, is currently rated in &quot;Fair&quot; condition. Clicking
                through to the detailed profile, she learns that while the superstructure shows some deterioration typical
                of its age, the bridge underwent significant rehabilitation work and remains safe for its current traffic
                load of approximately 20,000 vehicles per day. She also discovers several other bridges on her alternate
                routes, including the Hot Metal Bridge (a converted railroad bridge now carrying pedestrians and light rail)
                and the Tenth Street Bridge, allowing her to make informed decisions about her commute.
              </p>
              <p className="text-slate-600 leading-relaxed">
                Pittsburgh, with its three rivers and hilly terrain, has more bridges per capita than any other city in
                the world—over 440 within city limits. This tool helps residents like Sarah understand the condition of
                this extensive bridge network that makes daily life in the city possible.
              </p>
            </div>

            {/* Example 2 */}
            <div className="mb-8 pb-8 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900 mb-3">
                Example 2: A Truck Driver Planning Routes in Rural Texas
              </h3>
              <p className="text-slate-600 leading-relaxed mb-3">
                Marcus operates an 18-wheeler hauling agricultural equipment across West Texas. His loads often exceed
                80,000 pounds, and he needs to know which bridges along his routes can safely accommodate his truck.
                Using the map selection feature, he clicks on a point near Lubbock to survey the bridge infrastructure
                in the region.
              </p>
              <p className="text-slate-600 leading-relaxed mb-3">
                The search reveals 38 bridges within 50 miles, mostly spanning irrigation canals, dry creek beds, and
                the occasional underpass beneath railroad tracks. Marcus notices that several bridges on Farm-to-Market
                roads show &quot;Poor&quot; condition ratings. Clicking on one—a small concrete slab bridge over Yellow House
                Draw—he finds that it has posted weight restrictions of 40,000 pounds, well below his typical load weight.
              </p>
              <p className="text-slate-600 leading-relaxed">
                By reviewing the bridge inventory before his trip, Marcus can plan alternate routes that avoid
                weight-restricted structures. The detailed bridge profiles show not just condition ratings but also
                design load capacities, helping professional drivers make safe routing decisions. This is especially
                valuable in rural areas where GPS navigation systems may not account for bridge limitations on secondary roads.
              </p>
            </div>

            {/* Example 3 */}
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">
                Example 3: A History Enthusiast Exploring Covered Bridges in Vermont
              </h3>
              <p className="text-slate-600 leading-relaxed mb-3">
                David, a retired architect with a passion for historic structures, is planning a road trip through
                Vermont to photograph covered bridges. He knows the state has numerous historic wooden bridges, but
                wants to locate them efficiently. Using the map feature, he clicks on Bennington in southwestern Vermont
                to begin his search.
              </p>
              <p className="text-slate-600 leading-relaxed mb-3">
                The results show 23 bridges within his search radius. By reviewing the detailed profiles, David can
                identify which ones are timber construction—the telltale sign of a covered bridge. He finds the
                Silk Road Covered Bridge, built in 1840, and the Paper Mill Village Bridge from 1889. The condition
                data shows both are well-maintained despite their age, testament to Vermont&apos;s commitment to preserving
                these historic structures.
              </p>
              <p className="text-slate-600 leading-relaxed">
                Each bridge profile includes construction year, material type, and design classification. For covered
                bridges, David can learn whether they use Town lattice, Burr arch, or other historic truss designs.
                This information enriches his photography project with historical context and helps him prioritize
                which bridges to visit. He creates a driving route that visits eight covered bridges across two
                counties, each one offering unique architectural details and photographic opportunities.
              </p>
            </div>
          </section>

          {/* About Finding Bridges */}
          <section className="bg-white rounded-xl border border-slate-200 p-6 mb-8">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">
              Understanding America&apos;s Bridge Network
            </h2>
            <div className="prose prose-slate max-w-none text-sm">
              <p className="text-slate-600 leading-relaxed mb-4">
                The United States maintains over 623,000 highway bridges, making it one of the most extensive bridge networks
                in the world. These structures are catalogued in the National Bridge Inventory (NBI), a database established
                by the Federal Highway Administration in 1971 following the tragic collapse of the Silver Bridge in West Virginia,
                which killed 46 people. Since then, federal law has required every bridge on a public road longer than 20 feet
                to undergo professional inspection at least once every 24 months, with results reported to the federal government.
              </p>
              <p className="text-slate-600 leading-relaxed mb-4">
                American bridges vary enormously in age, size, and design. The oldest bridges still in service date back to
                the early 1800s—stone arch structures built before the Civil War that continue carrying traffic today. The newest
                bridges incorporate advanced materials like high-performance concrete and weathering steel, designed to last
                100 years with minimal maintenance. Between these extremes are hundreds of thousands of structures built throughout
                the 20th century, each reflecting the engineering practices and materials available at the time of construction.
              </p>
              <p className="text-slate-600 leading-relaxed mb-4">
                Bridge conditions across America vary significantly by region. States in the Northeast and Midwest, where
                harsh winters accelerate deterioration through freeze-thaw cycles and road salt corrosion, tend to have older
                bridge stocks requiring more extensive maintenance. Sunbelt states generally have newer infrastructure but face
                their own challenges from heat expansion, hurricane exposure, and rapid population growth that increases traffic
                loads beyond original design specifications.
              </p>
              <p className="text-slate-600 leading-relaxed mb-4">
                The condition rating system uses a 0-9 scale for each major component: the deck (the driving surface you travel on),
                the superstructure (beams, girders, or trusses that support the deck), and the substructure (piers, columns, and
                abutments that transfer loads to the ground). A rating of 9 indicates excellent condition with no problems noted.
                Ratings of 7-8 indicate good condition with minor deterioration. Ratings of 5-6 indicate fair condition with some
                section loss or deterioration. Ratings of 4 or below indicate poor condition requiring priority attention.
              </p>
              <p className="text-slate-600 leading-relaxed mb-4">
                Importantly, a &quot;poor&quot; condition rating does not mean a bridge is unsafe. Federal regulations require any
                bridge with safety concerns to be either repaired immediately, posted with weight and speed restrictions, or
                closed to traffic entirely. A poor rating indicates that significant deterioration has occurred and the bridge
                should be prioritized for repair or replacement funding. Many poor-condition bridges remain safely in service
                for years with appropriate restrictions while awaiting rehabilitation.
              </p>
              <p className="text-slate-600 leading-relaxed">
                As of the most recent data, approximately 7.5% of U.S. bridges are rated in poor condition, representing
                about 46,000 structures. These bridges carry 178 million trips per day. The percentage has been steadily
                declining over the past decade as states invest in infrastructure improvements, though the aging of
                Interstate Highway System bridges built in the 1960s and 1970s continues to challenge transportation departments.
                Understanding the condition of bridges in your community helps inform public discussions about infrastructure
                investment and ensures awareness of the structures that make daily transportation possible.
              </p>
            </div>
          </section>

          {/* Data Source Info */}
          <section className="bg-slate-50 rounded-xl p-6 mb-8">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">About the Data</h2>
            <div className="grid md:grid-cols-2 gap-6 text-sm">
              <div>
                <h3 className="font-semibold text-slate-900 mb-2">Source</h3>
                <p className="text-slate-600">
                  All bridge data comes from the National Bridge Inventory (NBI), maintained by the Federal Highway
                  Administration (FHWA). This is the same data used by state departments of transportation and federal
                  agencies for infrastructure planning.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 mb-2">Coverage</h3>
                <p className="text-slate-600">
                  The database includes 623,000+ bridges across all 50 U.S. states, Washington D.C., Puerto Rico,
                  Guam, American Samoa, the U.S. Virgin Islands, and the Northern Mariana Islands. Private bridges
                  and structures under 20 feet in length are not included.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 mb-2">Updates</h3>
                <p className="text-slate-600">
                  Inspection data is updated annually as states submit their inspection reports to the FHWA.
                  Each bridge must be inspected at least once every 24 months, with some high-priority structures
                  inspected more frequently.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 mb-2">Accuracy</h3>
                <p className="text-slate-600">
                  Bridge locations are based on latitude/longitude coordinates provided in the NBI. While generally
                  accurate, some rural bridges may have coordinates that place them slightly off from their actual
                  position on mapping services.
                </p>
              </div>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-6">
              Frequently Asked Questions
            </h2>
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-slate-900 mb-2">
                  How do I find bridges near me?
                </h3>
                <p className="text-slate-600">
                  Click &quot;Use My Current Location&quot; and allow location access when prompted by your browser,
                  or click anywhere on the map to select a location manually. The tool will display all highway
                  bridges within 50 miles of that location, sorted by distance from closest to farthest. You can
                  click on any bridge to view its complete inspection profile.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 mb-2">
                  What types of bridges are included?
                </h3>
                <p className="text-slate-600">
                  The database includes all bridges on public roads that are longer than 20 feet, as required by
                  federal regulation. This encompasses highway bridges, overpasses, viaducts, pedestrian bridges
                  on public rights-of-way, and culverts. Private bridges, railroad bridges not carrying highway
                  traffic, and small structures under 20 feet are not included in the National Bridge Inventory.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 mb-2">
                  Is my location data stored or shared?
                </h3>
                <p className="text-slate-600">
                  No. Your location coordinates are processed entirely within your web browser to calculate
                  distances to nearby bridges. We do not transmit, store, log, or share your location data
                  with any server or third party. Your privacy is fully protected.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 mb-2">
                  Why can&apos;t I find bridges outside the United States?
                </h3>
                <p className="text-slate-600">
                  This tool uses data exclusively from the National Bridge Inventory, which only tracks bridges
                  within the United States and its territories. Bridge data for Canada, Mexico, and other countries
                  is maintained by their respective national transportation agencies and is not included in this
                  database. If you select a location outside U.S. boundaries, you&apos;ll be prompted to choose
                  a location within the United States.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 mb-2">
                  What does it mean when a bridge is rated &quot;Poor&quot;?
                </h3>
                <p className="text-slate-600">
                  A &quot;Poor&quot; rating indicates that one or more bridge components have deteriorated to a
                  condition rating of 4 or below on the 0-9 scale. This does not mean the bridge is unsafe—federal
                  law requires unsafe bridges to be immediately repaired, posted with restrictions, or closed.
                  A poor rating means the bridge has been prioritized for rehabilitation or replacement funding.
                  Many poor-condition bridges remain safely in service with appropriate load restrictions.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 mb-2">
                  How current is the bridge condition data?
                </h3>
                <p className="text-slate-600">
                  The National Bridge Inventory is updated annually as states submit their inspection reports.
                  Each bridge must be inspected at least once every 24 months by a certified bridge inspector.
                  Some bridges with known deficiencies or unusual conditions may be inspected more frequently.
                  The data shown reflects the most recent inspection results available in the federal database.
                </p>
              </div>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
