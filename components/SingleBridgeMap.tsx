'use client';

import { useEffect, useRef, useState } from 'react';
import type { ConditionCategory } from '@/types';

interface SingleBridgeMapProps {
  lat: number;
  lon: number;
  condition: ConditionCategory | null;
  facilityCarried: string;
  featuresIntersected: string;
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

export default function SingleBridgeMap({
  lat,
  lon,
  condition,
  facilityCarried,
  featuresIntersected,
  height = 300,
}: SingleBridgeMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined' || !containerRef.current) return;

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

      // Create map
      map = L.map(containerRef.current).setView([lat, lon], 15);
      mapRef.current = map;

      // Add tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      // Add circle marker
      const marker = L.circleMarker([lat, lon], {
        radius: 10,
        fillColor: getMarkerColor(condition),
        color: '#fff',
        weight: 3,
        opacity: 1,
        fillOpacity: 0.9,
      }).addTo(map);

      // Add popup
      marker.bindPopup(`
        <div style="min-width: 150px;">
          <p style="font-weight: 600; margin: 0;">${facilityCarried || 'Unknown Road'}</p>
          <p style="font-size: 0.875rem; color: #64748b; margin: 4px 0 0 0;">over ${featuresIntersected || 'Unknown'}</p>
        </div>
      `);

      setIsLoading(false);
    });

    // Cleanup function
    return () => {
      if (map) {
        map.remove();
        mapRef.current = null;
      }
    };
  }, [lat, lon, condition, facilityCarried, featuresIntersected]);

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
