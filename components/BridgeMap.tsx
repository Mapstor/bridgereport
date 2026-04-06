'use client';

import { useEffect, useRef, useState } from 'react';
import type { BridgeSlim, ConditionCategory } from '@/types';

interface BridgeMapProps {
  bridges: BridgeSlim[];
  state: string;
  height?: number;
}

// Get marker color based on condition
function getMarkerColor(condition: ConditionCategory | null): string {
  switch (condition) {
    case 'good':
      return '#22c55e';
    case 'fair':
      return '#eab308';
    case 'poor':
      return '#ef4444';
    default:
      return '#94a3b8';
  }
}

export default function BridgeMap({ bridges, state, height = 400 }: BridgeMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Filter bridges with valid coordinates
  const bridgesWithCoords = bridges.filter(
    (b) => b.lat !== null && b.lat !== undefined && b.lon !== null && b.lon !== undefined
  );

  useEffect(() => {
    if (typeof window === 'undefined' || !containerRef.current) return;
    if (bridgesWithCoords.length === 0) return;

    // If map already exists, just return
    if (mapRef.current) return;

    let map: L.Map | null = null;

    // Dynamically import Leaflet
    Promise.all([
      import('leaflet'),
      import('leaflet/dist/leaflet.css'),
    ]).then(([L]) => {
      if (!containerRef.current) return;

      // Check if container already has a map (StrictMode cleanup race)
      if ((containerRef.current as HTMLElement & { _leaflet_id?: number })._leaflet_id) {
        return;
      }

      // Fix default marker icon
      delete (L.Icon.Default.prototype as { _getIconUrl?: unknown })._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      });

      // Calculate bounds
      const lats = bridgesWithCoords.map((b) => b.lat!);
      const lons = bridgesWithCoords.map((b) => b.lon!);
      const bounds = L.latLngBounds(
        L.latLng(Math.min(...lats), Math.min(...lons)),
        L.latLng(Math.max(...lats), Math.max(...lons))
      );

      // Create map
      map = L.map(containerRef.current).fitBounds(bounds, { padding: [20, 20] });
      mapRef.current = map;

      // Add tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      // Add markers for each bridge
      bridgesWithCoords.forEach((bridge) => {
        const marker = L.circleMarker([bridge.lat!, bridge.lon!], {
          radius: 6,
          fillColor: getMarkerColor(bridge.conditionCategory),
          color: '#fff',
          weight: 2,
          opacity: 1,
          fillOpacity: 0.8,
        }).addTo(map!);

        // Add popup
        const conditionClass = bridge.conditionCategory === 'good'
          ? 'background: #dcfce7; color: #166534;'
          : bridge.conditionCategory === 'fair'
          ? 'background: #fef9c3; color: #854d0e;'
          : bridge.conditionCategory === 'poor'
          ? 'background: #fee2e2; color: #991b1b;'
          : 'background: #f1f5f9; color: #334155;';

        marker.bindPopup(`
          <div style="min-width: 200px;">
            <p style="font-weight: 600; margin: 0;">${bridge.facilityCarried || 'Unknown Road'}</p>
            <p style="font-size: 0.875rem; color: #64748b; margin: 4px 0 0 0;">over ${bridge.featuresIntersected || 'Unknown'}</p>
            ${bridge.location ? `<p style="font-size: 0.75rem; color: #94a3b8; margin: 4px 0 0 0;">${bridge.location}</p>` : ''}
            <div style="margin-top: 8px; display: flex; align-items: center; gap: 8px;">
              <span style="display: inline-flex; padding: 2px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: 500; ${conditionClass}">
                ${bridge.conditionCategory || 'Unknown'}
              </span>
              ${bridge.yearBuilt ? `<span style="font-size: 0.75rem; color: #94a3b8;">Built ${bridge.yearBuilt}</span>` : ''}
            </div>
            <a href="/bridge/${state.toLowerCase()}/${encodeURIComponent(bridge.id)}" style="display: inline-block; margin-top: 8px; font-size: 0.875rem; color: #2563eb; text-decoration: none;">
              View details →
            </a>
          </div>
        `);
      });

      setIsLoading(false);
    });

    // Cleanup function
    return () => {
      if (map) {
        map.remove();
        mapRef.current = null;
      }
    };
  }, [bridgesWithCoords, state]);

  if (bridgesWithCoords.length === 0) {
    return (
      <div
        className="flex items-center justify-center bg-slate-100 rounded-lg"
        style={{ height }}
      >
        <p className="text-slate-500">No location data available for bridges in this area.</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {isLoading && (
        <div
          className="absolute inset-0 flex items-center justify-center bg-slate-100 rounded-lg animate-pulse z-10"
          style={{ height }}
        >
          <p className="text-slate-400">Loading map...</p>
        </div>
      )}
      <div
        ref={containerRef}
        className="rounded-lg"
        style={{ height, width: '100%' }}
      />
    </div>
  );
}
