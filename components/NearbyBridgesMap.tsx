'use client';

import { useEffect, useRef } from 'react';
import type { Map as LeafletMap } from 'leaflet';
import type { NearbyBridge, ConditionCategory } from '@/types';

function getMarkerColor(condition: ConditionCategory | null): string {
  switch (condition) {
    case 'good': return '#22c55e';
    case 'fair': return '#eab308';
    case 'poor': return '#ef4444';
    default: return '#94a3b8';
  }
}

interface NearbyBridgesMapProps {
  bridges: NearbyBridge[];
  userLat: number;
  userLon: number;
}

export default function NearbyBridgesMap({ bridges, userLat, userLon }: NearbyBridgesMapProps) {
  const mapRef = useRef<LeafletMap | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;

    const initMap = async () => {
      if (!containerRef.current) return;

      // Check if this container already has a map
      if ((containerRef.current as HTMLDivElement & { _leaflet_id?: number })._leaflet_id) {
        return;
      }

      const L = await import('leaflet');

      // Check again after async import - component may have unmounted or another effect may have run
      if (cancelled) return;
      if (!containerRef.current) return;
      if ((containerRef.current as HTMLDivElement & { _leaflet_id?: number })._leaflet_id) {
        return;
      }

      // Fix default marker icon
      // @ts-expect-error - Leaflet icon fix
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      });

      // Calculate bounds
      const allLats = [userLat, ...bridges.map(b => b.lat)];
      const allLons = [userLon, ...bridges.map(b => b.lon)];
      const bounds = L.latLngBounds(
        [Math.min(...allLats), Math.min(...allLons)],
        [Math.max(...allLats), Math.max(...allLons)]
      );

      const map = L.map(containerRef.current).fitBounds(bounds, { padding: [20, 20] });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);

      // User location marker
      L.circleMarker([userLat, userLon], {
        radius: 12,
        fillColor: '#3b82f6',
        color: '#fff',
        weight: 3,
        opacity: 1,
        fillOpacity: 0.9,
      }).addTo(map).bindPopup('<div class="font-semibold">Selected Location</div>');

      // Bridge markers
      bridges.forEach((bridge) => {
        const conditionClass = bridge.conditionCategory === 'good'
          ? 'bg-green-100 text-green-800'
          : bridge.conditionCategory === 'fair'
          ? 'bg-yellow-100 text-yellow-800'
          : bridge.conditionCategory === 'poor'
          ? 'bg-red-100 text-red-800'
          : 'bg-slate-100 text-slate-800';

        const popupContent = `
          <div class="min-w-[200px]">
            <p class="font-semibold">${bridge.facilityCarried}</p>
            <p class="text-sm text-slate-600">over ${bridge.featuresIntersected}</p>
            <p class="text-sm font-medium mt-1">${bridge.distanceMiles.toFixed(1)} miles away</p>
            <div class="mt-2">
              <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${conditionClass}">
                ${bridge.conditionCategory || 'Unknown'}
              </span>
            </div>
            <a href="/bridge/${bridge.state.toLowerCase()}/${bridge.id}" class="mt-2 inline-block text-sm text-blue-600 hover:text-blue-800">
              View details →
            </a>
          </div>
        `;

        L.circleMarker([bridge.lat, bridge.lon], {
          radius: 6,
          fillColor: getMarkerColor(bridge.conditionCategory),
          color: '#fff',
          weight: 2,
          opacity: 1,
          fillOpacity: 0.8,
        }).addTo(map).bindPopup(popupContent);
      });

      mapRef.current = map;
    };

    initMap();

    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [bridges, userLat, userLon]);

  if (bridges.length === 0) {
    return (
      <div className="flex items-center justify-center bg-slate-100 rounded-lg h-[400px]">
        <p className="text-slate-500">No bridges found within 50 miles.</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      style={{ height: 400, width: '100%' }}
      className="rounded-lg bg-slate-100"
    />
  );
}
