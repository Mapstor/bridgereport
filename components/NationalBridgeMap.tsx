'use client';

import { useEffect, useState, useRef } from 'react';

interface StateData {
  state: string;
  stateName: string;
  total: number;
  good: number;
  fair: number;
  poor: number;
  poorPct: number;
}

// Get state fill color based on poor percentage
function getStateColor(poorPct: number): string {
  if (poorPct >= 10) return '#ef4444'; // red-500
  if (poorPct >= 7) return '#f97316'; // orange-500
  if (poorPct >= 5) return '#eab308'; // yellow-500
  if (poorPct >= 3) return '#84cc16'; // lime-500
  return '#22c55e'; // green-500
}

// State name to abbreviation mapping
const STATE_ABBR: Record<string, string> = {
  'Alabama': 'AL', 'Alaska': 'AK', 'Arizona': 'AZ', 'Arkansas': 'AR', 'California': 'CA',
  'Colorado': 'CO', 'Connecticut': 'CT', 'Delaware': 'DE', 'Florida': 'FL', 'Georgia': 'GA',
  'Hawaii': 'HI', 'Idaho': 'ID', 'Illinois': 'IL', 'Indiana': 'IN', 'Iowa': 'IA',
  'Kansas': 'KS', 'Kentucky': 'KY', 'Louisiana': 'LA', 'Maine': 'ME', 'Maryland': 'MD',
  'Massachusetts': 'MA', 'Michigan': 'MI', 'Minnesota': 'MN', 'Mississippi': 'MS', 'Missouri': 'MO',
  'Montana': 'MT', 'Nebraska': 'NE', 'Nevada': 'NV', 'New Hampshire': 'NH', 'New Jersey': 'NJ',
  'New Mexico': 'NM', 'New York': 'NY', 'North Carolina': 'NC', 'North Dakota': 'ND', 'Ohio': 'OH',
  'Oklahoma': 'OK', 'Oregon': 'OR', 'Pennsylvania': 'PA', 'Rhode Island': 'RI', 'South Carolina': 'SC',
  'South Dakota': 'SD', 'Tennessee': 'TN', 'Texas': 'TX', 'Utah': 'UT', 'Vermont': 'VT',
  'Virginia': 'VA', 'Washington': 'WA', 'West Virginia': 'WV', 'Wisconsin': 'WI', 'Wyoming': 'WY',
  'District of Columbia': 'DC', 'Puerto Rico': 'PR',
};

interface NationalBridgeMapProps {
  height?: number;
}

export default function NationalBridgeMap({ height = 500 }: NationalBridgeMapProps) {
  const [stateData, setStateData] = useState<Map<string, StateData>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hoveredState, setHoveredState] = useState<StateData | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const geoJsonLayerRef = useRef<any>(null);
  const leafletRef = useRef<any>(null);

  // US center (shifted slightly for better view with Alaska/Hawaii)
  const usCenter: [number, number] = [39.8283, -98.5795];

  // Fetch state data
  useEffect(() => {
    const fetchStateData = async () => {
      try {
        const response = await fetch('/api/bridges/viewport?zoom=4&bounds=-90,-180,90,180');
        const data = await response.json();

        if (data.type === 'states') {
          const stateMap = new Map<string, StateData>();
          for (const state of data.data) {
            const poorPct = state.total > 0 ? (state.poor / state.total) * 100 : 0;
            stateMap.set(state.state, {
              state: state.state,
              stateName: Object.entries(STATE_ABBR).find(([_, abbr]) => abbr === state.state)?.[0] || state.state,
              total: state.total,
              good: state.good,
              fair: state.fair,
              poor: state.poor,
              poorPct,
            });
          }
          setStateData(stateMap);
        }
      } catch (err) {
        console.error('Failed to fetch state data:', err);
      }
    };

    fetchStateData();
  }, []);

  // Initialize Leaflet map
  useEffect(() => {
    if (typeof window === 'undefined' || !containerRef.current) return;

    let isMounted = true;

    const initMap = async () => {
      try {
        const L = await import('leaflet');
        if (!isMounted || !containerRef.current) return;

        leafletRef.current = L;

        // Clean up any existing map
        if (containerRef.current && (containerRef.current as any)._leaflet_id) {
          if (mapRef.current) {
            mapRef.current.remove();
          }
          delete (containerRef.current as any)._leaflet_id;
        }

        // Create the map
        const map = L.map(containerRef.current, {
          center: usCenter,
          zoom: 4,
          minZoom: 3,
          maxZoom: 7,
          maxBounds: [
            [15, -180],
            [72, -50],
          ],
          scrollWheelZoom: true,
          zoomControl: true,
        });

        mapRef.current = map;

        // Add Voyager basemap for context
        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
          subdomains: 'abcd',
          maxZoom: 20,
        }).addTo(map);

        // Fetch US states GeoJSON
        const geoJsonResponse = await fetch('https://raw.githubusercontent.com/PublicaMundi/MappingAPI/master/data/geojson/us-states.json');
        const geoJsonData = await geoJsonResponse.json();

        if (!isMounted) return;

        // Create GeoJSON layer
        const geoJsonLayer = L.geoJSON(geoJsonData, {
          style: (feature) => {
            const stateName = feature?.properties?.name;
            const stateAbbr = STATE_ABBR[stateName];
            const data = stateData.get(stateAbbr);
            const poorPct = data?.poorPct || 0;

            return {
              fillColor: getStateColor(poorPct),
              weight: 1,
              opacity: 1,
              color: '#fff',
              fillOpacity: 0.7,
            };
          },
          onEachFeature: (feature, layer) => {
            const stateName = feature?.properties?.name;
            const stateAbbr = STATE_ABBR[stateName];

            layer.on({
              mouseover: (e: any) => {
                const layer = e.target;
                layer.setStyle({
                  weight: 3,
                  color: '#1e40af',
                  fillOpacity: 0.85,
                });
                layer.bringToFront();

                const data = stateData.get(stateAbbr);
                if (data) {
                  setHoveredState(data);
                  // Get mouse position relative to container
                  const containerRect = containerRef.current?.getBoundingClientRect();
                  if (containerRect) {
                    setTooltipPos({
                      x: e.originalEvent.clientX - containerRect.left,
                      y: e.originalEvent.clientY - containerRect.top,
                    });
                  }
                }
              },
              mouseout: (e: any) => {
                geoJsonLayer.resetStyle(e.target);
                setHoveredState(null);
              },
              mousemove: (e: any) => {
                const containerRect = containerRef.current?.getBoundingClientRect();
                if (containerRect) {
                  setTooltipPos({
                    x: e.originalEvent.clientX - containerRect.left,
                    y: e.originalEvent.clientY - containerRect.top,
                  });
                }
              },
              click: () => {
                if (stateAbbr) {
                  window.location.href = `/state/${stateAbbr.toLowerCase()}`;
                }
              },
            });
          },
        }).addTo(map);

        geoJsonLayerRef.current = geoJsonLayer;
        setIsLoading(false);
      } catch (err) {
        console.error('Failed to load map:', err);
        if (isMounted) {
          setError('Failed to load map');
          setIsLoading(false);
        }
      }
    };

    initMap();

    return () => {
      isMounted = false;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [stateData]);

  // Update GeoJSON styles when state data changes
  useEffect(() => {
    if (geoJsonLayerRef.current && stateData.size > 0) {
      geoJsonLayerRef.current.setStyle((feature: any) => {
        const stateName = feature?.properties?.name;
        const stateAbbr = STATE_ABBR[stateName];
        const data = stateData.get(stateAbbr);
        const poorPct = data?.poorPct || 0;

        return {
          fillColor: getStateColor(poorPct),
          weight: 1,
          opacity: 1,
          color: '#fff',
          fillOpacity: 0.7,
        };
      });
    }
  }, [stateData]);

  if (error) {
    return (
      <div
        className="flex items-center justify-center bg-red-50 rounded-lg border border-red-200"
        style={{ height }}
      >
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="relative" style={{ height }}>
      {/* Map container */}
      <div
        ref={containerRef}
        className="rounded-lg"
        style={{ height: '100%', width: '100%' }}
      />

      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-100 rounded-lg">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-slate-500">Loading map...</p>
        </div>
      )}

      {/* Hover tooltip */}
      {hoveredState && (
        <div
          className="absolute pointer-events-none z-[1000] bg-white rounded-lg shadow-xl border border-slate-200 p-4 min-w-[220px]"
          style={{
            left: Math.min(tooltipPos.x + 15, (containerRef.current?.offsetWidth || 400) - 240),
            top: Math.min(tooltipPos.y + 15, (containerRef.current?.offsetHeight || 300) - 200),
          }}
        >
          <p className="font-bold text-slate-900 text-lg">{hoveredState.stateName}</p>
          <p className="text-sm text-slate-500 mb-3">{hoveredState.total.toLocaleString()} bridges</p>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Good</span>
              <div className="flex items-center gap-2">
                <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 rounded-full"
                    style={{ width: `${(hoveredState.good / hoveredState.total) * 100}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-slate-700 w-12 text-right">
                  {((hoveredState.good / hoveredState.total) * 100).toFixed(1)}%
                </span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Fair</span>
              <div className="flex items-center gap-2">
                <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yellow-500 rounded-full"
                    style={{ width: `${(hoveredState.fair / hoveredState.total) * 100}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-slate-700 w-12 text-right">
                  {((hoveredState.fair / hoveredState.total) * 100).toFixed(1)}%
                </span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Poor</span>
              <div className="flex items-center gap-2">
                <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-red-500 rounded-full"
                    style={{ width: `${(hoveredState.poor / hoveredState.total) * 100}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-slate-700 w-12 text-right">
                  {hoveredState.poorPct.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>

          <p className="text-xs text-blue-600 mt-3 font-medium">Click to view details →</p>
        </div>
      )}

      {/* Legend */}
      {!isLoading && (
        <div className="absolute bottom-4 right-4 bg-white rounded-lg shadow-lg p-3 z-[1000]">
          <p className="text-xs font-semibold text-slate-700 mb-2">% Bridges in Poor Condition</p>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-4 h-3 rounded" style={{ backgroundColor: '#22c55e' }}></span>
              <span className="text-xs text-slate-600">&lt; 3%</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-3 rounded" style={{ backgroundColor: '#84cc16' }}></span>
              <span className="text-xs text-slate-600">3-5%</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-3 rounded" style={{ backgroundColor: '#eab308' }}></span>
              <span className="text-xs text-slate-600">5-7%</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-3 rounded" style={{ backgroundColor: '#f97316' }}></span>
              <span className="text-xs text-slate-600">7-10%</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-3 rounded" style={{ backgroundColor: '#ef4444' }}></span>
              <span className="text-xs text-slate-600">&gt; 10%</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
