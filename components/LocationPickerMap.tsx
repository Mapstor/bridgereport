'use client';

import { useEffect, useRef } from 'react';
import type { Map as LeafletMap } from 'leaflet';

interface LocationPickerMapProps {
  onLocationSelect: (lat: number, lon: number) => void;
}

export default function LocationPickerMap({ onLocationSelect }: LocationPickerMapProps) {
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

      // Center on continental US
      const map = L.map(containerRef.current, {
        center: [39.8283, -98.5795],
        zoom: 4,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);

      map.on('click', (e) => {
        onLocationSelect(e.latlng.lat, e.latlng.lng);
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
  }, [onLocationSelect]);

  return (
    <div
      ref={containerRef}
      style={{ height: 350, width: '100%' }}
      className="rounded-lg cursor-crosshair bg-slate-100"
    />
  );
}
