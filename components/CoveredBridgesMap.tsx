'use client';

import { useEffect, useRef, useState } from 'react';
import type { CoveredBridgeSummary } from '@/lib/data';

interface CoveredBridgesMapProps {
  bridges: CoveredBridgeSummary[];
  height?: number;
}

// Get marker color based on condition
function getConditionColor(condition: string | null): string {
  if (!condition) return '#94a3b8'; // slate-400
  if (condition === 'Good') return '#16a34a'; // green-600
  if (condition === 'Fair') return '#ca8a04'; // yellow-600
  if (condition === 'Poor') return '#ea580c'; // orange-600
  return '#94a3b8';
}

// Use fixed year to avoid hydration mismatch
const CURRENT_YEAR = 2026;

export default function CoveredBridgesMap({ bridges, height = 500 }: CoveredBridgesMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Filter bridges with valid coordinates
  const bridgesWithCoords = bridges.filter(
    (b) => b.lat !== null && b.lat !== undefined && b.lon !== null && b.lon !== undefined
  );

  useEffect(() => {
    if (typeof window === 'undefined' || !containerRef.current) return;
    if (bridgesWithCoords.length === 0) return;
    if (mapRef.current) return;

    let map: any = null;

    const loadMap = async () => {
      const L = await import('leaflet');
      await import('leaflet/dist/leaflet.css');
      return (L as any).default || L;
    };

    loadMap().then((L) => {
      if (!containerRef.current) return;
      if ((containerRef.current as HTMLElement & { _leaflet_id?: number })._leaflet_id) return;

      // Center on US (covered bridges are mostly in Northeast/Midwest)
      const usCenter: [number, number] = [40.0, -82.0];

      map = L.map(containerRef.current, {
        center: usCenter,
        zoom: 5,
        minZoom: 3,
        maxZoom: 18,
        scrollWheelZoom: true,
      });
      mapRef.current = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      const markersLayer = L.layerGroup().addTo(map);
      const bridgesToShow = bridgesWithCoords.slice(0, 500);

      bridgesToShow.forEach((bridge, index) => {
        const color = getConditionColor(bridge.conditionCategory);
        const age = bridge.yearBuilt ? CURRENT_YEAR - bridge.yearBuilt : null;

        const marker = L.circleMarker([bridge.lat!, bridge.lon!], {
          radius: index < 10 ? 10 : index < 50 ? 8 : 6,
          fillColor: '#92400e', // amber-800 - wood color for covered bridges
          color: '#fff',
          weight: 1.5,
          opacity: 1,
          fillOpacity: 0.85,
        });

        marker.bindPopup(`
          <div style="min-width: 200px;">
            <p style="font-weight: 600; margin: 0; font-size: 14px;">${bridge.facilityCarried || 'Unknown Road'}</p>
            <p style="font-size: 0.875rem; color: #64748b; margin: 4px 0 0 0;">over ${bridge.featuresIntersected || 'Unknown'}</p>
            ${bridge.location ? `<p style="font-size: 0.75rem; color: #94a3b8; margin: 4px 0 0 0;">${bridge.location}</p>` : ''}
            <div style="margin-top: 10px; display: flex; gap: 6px; flex-wrap: wrap;">
              ${bridge.yearBuilt ? `
                <span style="display: inline-block; padding: 4px 10px; border-radius: 6px; font-size: 0.75rem; font-weight: 600; background: #1e293b; color: white;">
                  Built ${bridge.yearBuilt}${age ? ` (${age} yrs)` : ''}
                </span>
              ` : ''}
              <span style="display: inline-block; padding: 4px 10px; border-radius: 6px; font-size: 0.75rem; font-weight: 600; background: ${color}; color: white;">
                ${bridge.conditionCategory || 'Unknown'} Condition
              </span>
            </div>
            ${bridge.historical === '1' ? `
              <p style="margin-top: 8px; font-size: 0.75rem; color: #b45309;">
                Listed on National Register of Historic Places
              </p>
            ` : ''}
            <a href="/bridge/${bridge.state.toLowerCase()}/${encodeURIComponent(bridge.structureNumber)}" style="display: inline-block; margin-top: 10px; font-size: 0.875rem; color: #2563eb; text-decoration: none; font-weight: 500;">
              View bridge details
            </a>
          </div>
        `);

        markersLayer.addLayer(marker);
      });

      setIsLoading(false);
    });

    return () => {
      if (map) {
        map.remove();
        mapRef.current = null;
      }
    };
  }, [bridgesWithCoords]);

  if (bridgesWithCoords.length === 0) {
    return (
      <div className="flex items-center justify-center bg-slate-100 rounded-lg" style={{ height }}>
        <p className="text-slate-500">No location data available.</p>
      </div>
    );
  }

  return (
    <div className="relative" style={{ height }}>
      {isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-100 rounded-lg z-10">
          <div className="w-10 h-10 border-4 border-amber-600 border-t-transparent rounded-full animate-spin mb-3"></div>
          <p className="text-slate-500">Loading map...</p>
        </div>
      )}
      <div ref={containerRef} className="rounded-lg" style={{ height: '100%', width: '100%' }} />

      {!isLoading && (
        <div className="absolute bottom-4 right-4 bg-white rounded-lg shadow-lg p-3 z-[1000]">
          <p className="text-xs font-semibold text-slate-700 mb-2">Bridge Condition</p>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full" style={{ backgroundColor: '#16a34a' }}></span>
              <span className="text-xs text-slate-600">Good</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full" style={{ backgroundColor: '#ca8a04' }}></span>
              <span className="text-xs text-slate-600">Fair</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full" style={{ backgroundColor: '#ea580c' }}></span>
              <span className="text-xs text-slate-600">Poor</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
