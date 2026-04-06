'use client';

import { useEffect, useRef, useState } from 'react';
import type { RankingBridge } from '@/types';

interface WorstConditionMapProps {
  bridges: RankingBridge[];
  height?: number;
}

// Get marker color based on rating
function getRatingColor(rating: number | null): string {
  switch (rating) {
    case 0:
      return '#dc2626'; // red-600 - Failed
    case 1:
      return '#ea580c'; // orange-600 - Imminent Failure
    case 2:
      return '#f97316'; // orange-500 - Critical
    case 3:
      return '#eab308'; // yellow-500 - Serious
    default:
      return '#94a3b8'; // slate-400
  }
}

function getRatingLabel(rating: number | null): string {
  switch (rating) {
    case 0:
      return 'Failed';
    case 1:
      return 'Imminent Failure';
    case 2:
      return 'Critical';
    case 3:
      return 'Serious';
    default:
      return 'Unknown';
  }
}

export default function WorstConditionMap({ bridges, height = 500 }: WorstConditionMapProps) {
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

      // Add OpenStreetMap tile layer (free)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      // Create a layer group for markers
      const markersLayer = L.layerGroup().addTo(map);

      // Add markers for each bridge (limit to first 2000 for performance)
      const bridgesToShow = bridgesWithCoords.slice(0, 2000);

      bridgesToShow.forEach((bridge) => {
        const color = getRatingColor(bridge.lowestRating);
        const label = getRatingLabel(bridge.lowestRating);

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
                Rating ${bridge.lowestRating} — ${label}
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
          <div className="w-10 h-10 border-4 border-red-500 border-t-transparent rounded-full animate-spin mb-3"></div>
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
          <p className="text-xs font-semibold text-slate-700 mb-2">Bridge Rating</p>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full" style={{ backgroundColor: '#dc2626' }}></span>
              <span className="text-xs text-slate-600">0 — Failed</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full" style={{ backgroundColor: '#ea580c' }}></span>
              <span className="text-xs text-slate-600">1 — Imminent Failure</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full" style={{ backgroundColor: '#f97316' }}></span>
              <span className="text-xs text-slate-600">2 — Critical</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full" style={{ backgroundColor: '#eab308' }}></span>
              <span className="text-xs text-slate-600">3 — Serious</span>
            </div>
          </div>
          <p className="text-[10px] text-slate-400 mt-2 pt-2 border-t border-slate-100">
            Showing worst 2,000 bridges
          </p>
        </div>
      )}
    </div>
  );
}
