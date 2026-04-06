'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

interface BridgePoint {
  id: string;
  state: string;
  lat: number;
  lon: number;
  facilityCarried: string;
  featuresIntersected: string;
  condition: 'good' | 'fair' | 'poor' | null;
}

interface Bounds {
  south: number;
  north: number;
  west: number;
  east: number;
}

interface StateBridgeMapProps {
  bridges: BridgePoint[];
  bounds: Bounds;
  selectedBridge: string | null;
  onSelectBridge: (id: string | null) => void;
  stateAbbr: string;
}

function getMarkerColor(condition: 'good' | 'fair' | 'poor' | null): string {
  switch (condition) {
    case 'good': return '#22c55e';
    case 'fair': return '#eab308';
    case 'poor': return '#ef4444';
    default: return '#94a3b8';
  }
}

function ConditionBadge({ condition }: { condition: 'good' | 'fair' | 'poor' | null }) {
  const classes = {
    good: 'bg-green-100 text-green-800',
    fair: 'bg-yellow-100 text-yellow-800',
    poor: 'bg-red-100 text-red-800',
    null: 'bg-slate-100 text-slate-600',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${classes[condition || 'null']}`}>
      {condition || 'N/A'}
    </span>
  );
}

export default function StateBridgeMap({
  bridges,
  bounds,
  selectedBridge,
  onSelectBridge,
  stateAbbr,
}: StateBridgeMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    let isMounted = true;

    // Dynamic import Leaflet
    Promise.all([
      import('leaflet'),
      import('leaflet/dist/leaflet.css'),
    ]).then(([L]) => {
      if (!isMounted || !mapRef.current) return;

      // Fix default marker icon issue
      // @ts-expect-error - Leaflet icon fix
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      });

      const mapBounds: L.LatLngBoundsLiteral = [
        [bounds.south, bounds.west],
        [bounds.north, bounds.east],
      ];

      const map = L.map(mapRef.current, {
        scrollWheelZoom: true,
      }).fitBounds(mapBounds);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);

      // Add markers
      bridges.forEach((bridge) => {
        const isSelected = selectedBridge === bridge.id;
        const marker = L.circleMarker([bridge.lat, bridge.lon], {
          radius: isSelected ? 10 : 5,
          fillColor: getMarkerColor(bridge.condition),
          color: isSelected ? '#1e40af' : '#fff',
          weight: isSelected ? 3 : 1.5,
          opacity: 1,
          fillOpacity: 0.8,
        }).addTo(map);

        marker.on('click', () => {
          onSelectBridge(bridge.id);
        });

        marker.bindPopup(`
          <div style="min-width: 200px">
            <p style="font-weight: 600; margin: 0 0 4px 0;">${bridge.facilityCarried || 'Unknown Road'}</p>
            <p style="font-size: 12px; color: #64748b; margin: 0 0 8px 0;">over ${bridge.featuresIntersected || 'Unknown'}</p>
            <span style="display: inline-flex; align-items: center; padding: 2px 8px; border-radius: 4px; font-size: 12px; font-weight: 500; background: ${
              bridge.condition === 'good' ? '#dcfce7' :
              bridge.condition === 'fair' ? '#fef9c3' :
              bridge.condition === 'poor' ? '#fee2e2' : '#f1f5f9'
            }; color: ${
              bridge.condition === 'good' ? '#166534' :
              bridge.condition === 'fair' ? '#854d0e' :
              bridge.condition === 'poor' ? '#991b1b' : '#475569'
            };">
              ${bridge.condition || 'N/A'}
            </span>
            <br/>
            <a href="/bridge/${stateAbbr.toLowerCase()}/${bridge.id}" style="display: inline-block; margin-top: 8px; font-size: 12px; color: #2563eb;">
              View details →
            </a>
          </div>
        `);
      });

      mapInstanceRef.current = map;
      setIsReady(true);
    });

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update markers when selection changes
  useEffect(() => {
    // This would require more complex marker management
    // For now, rely on popup for selection feedback
  }, [selectedBridge]);

  return (
    <div
      ref={mapRef}
      className="rounded-lg"
      style={{ height: 400, width: '100%', background: '#f1f5f9' }}
    >
      {!isReady && (
        <div className="h-full flex items-center justify-center">
          <p className="text-slate-400">Loading map...</p>
        </div>
      )}
    </div>
  );
}
