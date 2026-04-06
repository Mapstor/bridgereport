'use client';

import { useEffect, useRef, useState } from 'react';
import type { RankingBridge } from '@/types';

interface OldestBridgesMapProps {
  bridges: RankingBridge[];
  height?: number;
}

// Get marker color based on year built (by century/era)
function getYearColor(year: number | null): string {
  if (!year) return '#94a3b8'; // slate-400
  if (year < 1850) return '#7c3aed'; // violet-600 - Pre-1850
  if (year < 1900) return '#a855f7'; // purple-500 - 1850-1899
  if (year < 1920) return '#0ea5e9'; // sky-500 - 1900-1919
  if (year < 1940) return '#14b8a6'; // teal-500 - 1920-1939
  return '#22c55e'; // green-500 - 1940+
}

function getEraLabel(year: number | null): string {
  if (!year) return 'Unknown';
  if (year < 1850) return 'Pre-1850';
  if (year < 1900) return '1850-1899';
  if (year < 1920) return '1900-1919';
  if (year < 1940) return '1920-1939';
  return '1940+';
}

export default function OldestBridgesMap({ bridges, height = 500 }: OldestBridgesMapProps) {
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
      const bridgesToShow = bridgesWithCoords.slice(0, 1000);
      const currentYear = new Date().getFullYear();

      bridgesToShow.forEach((bridge) => {
        const color = getYearColor(bridge.yearBuilt);
        const era = getEraLabel(bridge.yearBuilt);
        const age = bridge.yearBuilt ? currentYear - bridge.yearBuilt : null;

        const marker = L.circleMarker([bridge.lat!, bridge.lon!], {
          radius: 6,
          fillColor: color,
          color: '#fff',
          weight: 1.5,
          opacity: 1,
          fillOpacity: 0.85,
        });

        // Add popup
        marker.bindPopup(`
          <div style="min-width: 200px;">
            <p style="font-weight: 600; margin: 0; font-size: 14px;">${bridge.facilityCarried || 'Unknown Road'}</p>
            <p style="font-size: 0.875rem; color: #64748b; margin: 4px 0 0 0;">over ${bridge.featuresIntersected || 'Unknown'}</p>
            ${bridge.location ? `<p style="font-size: 0.75rem; color: #94a3b8; margin: 4px 0 0 0;">${bridge.location}</p>` : ''}
            <div style="margin-top: 10px;">
              <span style="display: inline-block; padding: 4px 10px; border-radius: 6px; font-size: 0.75rem; font-weight: 600; background: ${color}; color: white;">
                Built ${bridge.yearBuilt}${age ? ` · ${age} years old` : ''}
              </span>
            </div>
            <div style="margin-top: 8px; font-size: 0.75rem; color: #64748b;">
              ${bridge.lengthFt ? `${bridge.lengthFt.toLocaleString()} ft` : ''}
              ${bridge.lengthFt && bridge.adt ? ' · ' : ''}
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
          <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-3"></div>
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
          <p className="text-xs font-semibold text-slate-700 mb-2">Year Built</p>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full" style={{ backgroundColor: '#7c3aed' }}></span>
              <span className="text-xs text-slate-600">Before 1850</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full" style={{ backgroundColor: '#a855f7' }}></span>
              <span className="text-xs text-slate-600">1850-1899</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full" style={{ backgroundColor: '#0ea5e9' }}></span>
              <span className="text-xs text-slate-600">1900-1919</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full" style={{ backgroundColor: '#14b8a6' }}></span>
              <span className="text-xs text-slate-600">1920-1939</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full" style={{ backgroundColor: '#22c55e' }}></span>
              <span className="text-xs text-slate-600">1940+</span>
            </div>
          </div>
          <p className="text-[10px] text-slate-400 mt-2 pt-2 border-t border-slate-100">
            Showing oldest 1,000 bridges
          </p>
        </div>
      )}
    </div>
  );
}
