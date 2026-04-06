'use client';

import { useEffect, useRef, useState } from 'react';
import type { RankingBridge } from '@/types';

interface LongestBridgesMapProps {
  bridges: RankingBridge[];
  height?: number;
}

// Get marker color based on length (in feet)
function getLengthColor(length: number | null): string {
  if (!length) return '#94a3b8'; // slate-400
  if (length >= 10000) return '#7c3aed'; // violet-600 - 10,000+ ft (2+ miles)
  if (length >= 5000) return '#2563eb'; // blue-600 - 5,000-9,999 ft (1-2 miles)
  if (length >= 2500) return '#0891b2'; // cyan-600 - 2,500-4,999 ft (0.5-1 mile)
  if (length >= 1000) return '#059669'; // emerald-600 - 1,000-2,499 ft
  return '#65a30d'; // lime-600 - Under 1,000 ft
}

function getLengthLabel(length: number | null): string {
  if (!length) return 'Unknown';
  if (length >= 10000) return '10,000+ ft (2+ miles)';
  if (length >= 5000) return '5,000-10,000 ft (1-2 miles)';
  if (length >= 2500) return '2,500-5,000 ft (0.5-1 mile)';
  if (length >= 1000) return '1,000-2,500 ft';
  return 'Under 1,000 ft';
}

export default function LongestBridgesMap({ bridges, height = 500 }: LongestBridgesMapProps) {
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

    // If map already exists, just return
    if (mapRef.current) return;

    let map: any = null;

    // Dynamically import Leaflet
    const loadMap = async () => {
      const L = await import('leaflet');
      await import('leaflet/dist/leaflet.css');
      return (L as any).default || L;
    };

    loadMap().then((L) => {
      if (!containerRef.current) return;

      // Check if container already has a map
      if ((containerRef.current as HTMLElement & { _leaflet_id?: number })._leaflet_id) {
        return;
      }

      // US center
      const usCenter: [number, number] = [39.8283, -98.5795];

      // Create map
      map = L.map(containerRef.current, {
        center: usCenter,
        zoom: 4,
        minZoom: 3,
        maxZoom: 18,
        scrollWheelZoom: true,
      });
      mapRef.current = map;

      // Add OpenStreetMap tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      // Create a layer group for markers
      const markersLayer = L.layerGroup().addTo(map);

      // Add markers for bridges (limit for performance)
      const bridgesToShow = bridgesWithCoords.slice(0, 500);

      bridgesToShow.forEach((bridge, index) => {
        const color = getLengthColor(bridge.lengthFt);
        const miles = bridge.lengthFt ? (bridge.lengthFt / 5280).toFixed(1) : null;

        const marker = L.circleMarker([bridge.lat!, bridge.lon!], {
          radius: index < 10 ? 10 : index < 50 ? 8 : 6,
          fillColor: color,
          color: '#fff',
          weight: 1.5,
          opacity: 1,
          fillOpacity: 0.85,
        });

        // Add popup
        marker.bindPopup(`
          <div style="min-width: 200px;">
            <p style="font-weight: 600; margin: 0; font-size: 14px;">#${index + 1}: ${bridge.facilityCarried || 'Unknown Road'}</p>
            <p style="font-size: 0.875rem; color: #64748b; margin: 4px 0 0 0;">over ${bridge.featuresIntersected || 'Unknown'}</p>
            ${bridge.location ? `<p style="font-size: 0.75rem; color: #94a3b8; margin: 4px 0 0 0;">${bridge.location}</p>` : ''}
            <div style="margin-top: 10px;">
              <span style="display: inline-block; padding: 4px 10px; border-radius: 6px; font-size: 0.75rem; font-weight: 600; background: ${color}; color: white;">
                ${bridge.lengthFt ? bridge.lengthFt.toLocaleString() : '—'} ft${miles ? ` (${miles} mi)` : ''}
              </span>
            </div>
            <div style="margin-top: 8px; font-size: 0.75rem; color: #64748b;">
              ${bridge.yearBuilt ? `Built ${bridge.yearBuilt}` : ''}
              ${bridge.yearBuilt && bridge.adt ? ' · ' : ''}
              ${bridge.adt ? `${bridge.adt.toLocaleString()} vehicles/day` : ''}
            </div>
            <a href="/bridge/${bridge.state.toLowerCase()}/${encodeURIComponent(bridge.id)}" style="display: inline-block; margin-top: 10px; font-size: 0.875rem; color: #2563eb; text-decoration: none; font-weight: 500;">
              View bridge details →
            </a>
          </div>
        `);

        markersLayer.addLayer(marker);
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
  }, [bridgesWithCoords]);

  if (bridgesWithCoords.length === 0) {
    return (
      <div
        className="flex items-center justify-center bg-slate-100 rounded-lg"
        style={{ height }}
      >
        <p className="text-slate-500">No location data available.</p>
      </div>
    );
  }

  return (
    <div className="relative" style={{ height }}>
      {isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-100 rounded-lg z-10">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-3"></div>
          <p className="text-slate-500">Loading map...</p>
        </div>
      )}
      <div
        ref={containerRef}
        className="rounded-lg"
        style={{ height: '100%', width: '100%' }}
      />

      {/* Legend */}
      {!isLoading && (
        <div className="absolute bottom-4 right-4 bg-white rounded-lg shadow-lg p-3 z-[1000]">
          <p className="text-xs font-semibold text-slate-700 mb-2">Bridge Length</p>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full" style={{ backgroundColor: '#7c3aed' }}></span>
              <span className="text-xs text-slate-600">10,000+ ft (2+ mi)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full" style={{ backgroundColor: '#2563eb' }}></span>
              <span className="text-xs text-slate-600">5,000-10,000 ft (1-2 mi)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full" style={{ backgroundColor: '#0891b2' }}></span>
              <span className="text-xs text-slate-600">2,500-5,000 ft</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full" style={{ backgroundColor: '#059669' }}></span>
              <span className="text-xs text-slate-600">1,000-2,500 ft</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full" style={{ backgroundColor: '#65a30d' }}></span>
              <span className="text-xs text-slate-600">Under 1,000 ft</span>
            </div>
          </div>
          <p className="text-[10px] text-slate-400 mt-2 pt-2 border-t border-slate-100">
            Showing top 500 bridges
          </p>
        </div>
      )}
    </div>
  );
}
