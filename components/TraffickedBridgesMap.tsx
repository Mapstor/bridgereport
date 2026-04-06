'use client';

import { useEffect, useRef, useState } from 'react';
import type { RankingBridge } from '@/types';

interface TraffickedBridgesMapProps {
  bridges: RankingBridge[];
  height?: number;
}

// Get marker color based on ADT
function getTrafficColor(adt: number | null): string {
  if (!adt) return '#94a3b8'; // slate-400
  if (adt >= 400000) return '#dc2626'; // red-600 - 400k+
  if (adt >= 300000) return '#ea580c'; // orange-600 - 300-400k
  if (adt >= 250000) return '#ca8a04'; // yellow-600 - 250-300k
  return '#65a30d'; // lime-600 - under 250k
}

export default function TraffickedBridgesMap({ bridges, height = 500 }: TraffickedBridgesMapProps) {
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

      // Center on California since most traffic bridges are there
      const center: [number, number] = [36.7783, -119.4179];

      map = L.map(containerRef.current, {
        center,
        zoom: 6,
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
        const color = getTrafficColor(bridge.adt);

        const marker = L.circleMarker([bridge.lat!, bridge.lon!], {
          radius: index < 10 ? 10 : index < 50 ? 8 : 6,
          fillColor: color,
          color: '#fff',
          weight: 1.5,
          opacity: 1,
          fillOpacity: 0.85,
        });

        marker.bindPopup(`
          <div style="min-width: 200px;">
            <p style="font-weight: 600; margin: 0; font-size: 14px;">#${index + 1}: ${bridge.facilityCarried || 'Unknown Road'}</p>
            <p style="font-size: 0.875rem; color: #64748b; margin: 4px 0 0 0;">over ${bridge.featuresIntersected || 'Unknown'}</p>
            ${bridge.location ? `<p style="font-size: 0.75rem; color: #94a3b8; margin: 4px 0 0 0;">${bridge.location}</p>` : ''}
            <div style="margin-top: 10px;">
              <span style="display: inline-block; padding: 4px 10px; border-radius: 6px; font-size: 0.75rem; font-weight: 600; background: ${color}; color: white;">
                ${bridge.adt ? bridge.adt.toLocaleString() : '—'} vehicles/day
              </span>
            </div>
            <div style="margin-top: 8px; font-size: 0.75rem; color: #64748b;">
              ${bridge.yearBuilt ? `Built ${bridge.yearBuilt}` : ''}
              ${bridge.conditionCategory ? ` · ${bridge.conditionCategory} condition` : ''}
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
          <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin mb-3"></div>
          <p className="text-slate-500">Loading map...</p>
        </div>
      )}
      <div ref={containerRef} className="rounded-lg" style={{ height: '100%', width: '100%' }} />

      {!isLoading && (
        <div className="absolute bottom-4 right-4 bg-white rounded-lg shadow-lg p-3 z-[1000]">
          <p className="text-xs font-semibold text-slate-700 mb-2">Daily Traffic (ADT)</p>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full" style={{ backgroundColor: '#dc2626' }}></span>
              <span className="text-xs text-slate-600">400,000+</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full" style={{ backgroundColor: '#ea580c' }}></span>
              <span className="text-xs text-slate-600">300,000-400,000</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full" style={{ backgroundColor: '#ca8a04' }}></span>
              <span className="text-xs text-slate-600">250,000-300,000</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full" style={{ backgroundColor: '#65a30d' }}></span>
              <span className="text-xs text-slate-600">Under 250,000</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
