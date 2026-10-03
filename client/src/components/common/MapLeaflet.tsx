import React, { useEffect, useRef } from 'react';
import L from 'leaflet';

interface MapPoint {
  lat: number;
  lng: number;
  title?: string;
  subtitle?: string;
  type?: 'customer' | 'mechanic' | 'nearby' | 'emergency';
}

interface MapLeafletProps {
  center: [number, number];
  zoom?: number;
  customerPoint?: MapPoint;
  mechanicPoint?: MapPoint;
  nearbyPoints?: MapPoint[];
  showRoute?: boolean;
  onLocationSelect?: (lat: number, lng: number) => void;
  height?: string;
  className?: string;
}

export const MapLeaflet: React.FC<MapLeafletProps> = ({
  center,
  zoom = 14,
  customerPoint,
  mechanicPoint,
  nearbyPoints = [],
  showRoute = false,
  onLocationSelect,
  height = '360px',
  className = ''
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const routeLineRef = useRef<L.Polyline | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        zoomControl: false,
        attributionControl: false
      }).setView(center, zoom);

      // Add zoom control in top right
      L.control.zoom({ position: 'topright' }).addTo(map);

      // Free OpenStreetMap Tiles (100% Free, Zero API Key required, Full Street & City Detail)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        subdomains: ['a', 'b', 'c'],
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map);

      const markersLayer = L.layerGroup().addTo(map);
      markersLayerRef.current = markersLayer;
      mapInstanceRef.current = map;

      // Handle map click for manual location selection
      map.on('click', (e: L.LeafletMouseEvent) => {
        if (onLocationSelect) {
          onLocationSelect(e.latlng.lat, e.latlng.lng);
        }
      });

      setTimeout(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      }, 250);
    }

    return () => {
      // Cleanup handled on unmount
    };
  }, []);

  // Update center when center prop changes
  useEffect(() => {
    if (mapInstanceRef.current && center) {
      mapInstanceRef.current.setView(center, zoom);
      setTimeout(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      }, 100);
    }
  }, [center[0], center[1], zoom]);

  // Update markers & route
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layer = markersLayerRef.current;
    if (!map || !layer) return;

    layer.clearLayers();
    if (routeLineRef.current) {
      map.removeLayer(routeLineRef.current);
      routeLineRef.current = null;
    }

    const bounds: L.LatLngExpression[] = [];

    // Helper to create HTML icon
    const createCustomIcon = (bgColor: string, ringColor: string, innerSvg: string) => {
      return L.divIcon({
        className: 'custom-leaflet-marker',
        html: `
          <div style="position: relative; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;">
            <div style="position: absolute; width: 100%; height: 100%; border-radius: 9999px; background: ${ringColor}; opacity: 0.35; animation: ping-slow 2s infinite;"></div>
            <div style="position: relative; width: 30px; height: 30px; border-radius: 9999px; background: ${bgColor}; border: 2px solid white; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.5);">
              ${innerSvg}
            </div>
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
        popupAnchor: [0, -18]
      });
    };

    // 1. Customer Marker
    if (customerPoint) {
      bounds.push([customerPoint.lat, customerPoint.lng]);
      const customerIcon = createCustomIcon(
        '#ef4444',
        '#f87171',
        `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/></svg>`
      );

      const marker = L.marker([customerPoint.lat, customerPoint.lng], { icon: customerIcon });
      marker.bindPopup(`
        <div style="padding: 4px;">
          <div style="font-weight: 700; color: #f87171; font-size: 13px;">📍 Customer Location</div>
          <div style="font-weight: 600; font-size: 13px; color: #f1f5f9; margin-top: 2px;">${customerPoint.title || 'Your Vehicle'}</div>
          <div style="font-size: 11px; color: #94a3b8; margin-top: 2px;">${customerPoint.subtitle || 'Reported breakdown site'}</div>
        </div>
      `);
      layer.addLayer(marker);
    }

    // 2. Mechanic Marker
    if (mechanicPoint) {
      bounds.push([mechanicPoint.lat, mechanicPoint.lng]);
      const mechanicIcon = createCustomIcon(
        '#f59e0b',
        '#fbbf24',
        `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>`
      );

      const marker = L.marker([mechanicPoint.lat, mechanicPoint.lng], { icon: mechanicIcon });
      marker.bindPopup(`
        <div style="padding: 4px;">
          <div style="font-weight: 700; color: #fbbf24; font-size: 13px;">🔧 Certified Mechanic</div>
          <div style="font-weight: 600; font-size: 13px; color: #f1f5f9; margin-top: 2px;">${mechanicPoint.title || 'En Route'}</div>
          <div style="font-size: 11px; color: #94a3b8; margin-top: 2px;">${mechanicPoint.subtitle || 'Live GPS Telemetry'}</div>
        </div>
      `);
      layer.addLayer(marker);
    }

    // 3. Nearby mechanics
    nearbyPoints.forEach(p => {
      bounds.push([p.lat, p.lng]);
      const icon = L.divIcon({
        className: 'nearby-marker',
        html: `
          <div style="width: 28px; height: 28px; border-radius: 9999px; background: #0284c7; border: 2px solid #38bdf8; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 6px rgba(0,0,0,0.4);">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
        popupAnchor: [0, -14]
      });

      const m = L.marker([p.lat, p.lng], { icon });
      m.bindPopup(`
        <div style="padding: 4px;">
          <div style="font-weight: 700; color: #38bdf8; font-size: 12px;">Nearby Available Mechanic</div>
          <div style="font-weight: 600; font-size: 13px; color: #f1f5f9; margin-top: 2px;">${p.title || 'Mechanic Workshop'}</div>
          <div style="font-size: 11px; color: #94a3b8; margin-top: 2px;">${p.subtitle || 'Available for emergency dispatch'}</div>
        </div>
      `);
      layer.addLayer(m);
    });

    // 4. Route Polyline if both customer and mechanic exist
    if (showRoute && customerPoint && mechanicPoint) {
      // Simulate realistic route bends between the two points
      const p1: [number, number] = [mechanicPoint.lat, mechanicPoint.lng];
      const p2: [number, number] = [
        (mechanicPoint.lat * 2 + customerPoint.lat) / 3 + 0.002,
        (mechanicPoint.lng * 2 + customerPoint.lng) / 3 - 0.001
      ];
      const p3: [number, number] = [
        (mechanicPoint.lat + customerPoint.lat * 2) / 3 - 0.001,
        (mechanicPoint.lng + customerPoint.lng * 2) / 3 + 0.002
      ];
      const p4: [number, number] = [customerPoint.lat, customerPoint.lng];

      const routeLine = L.polyline([p1, p2, p3, p4], {
        color: '#f59e0b',
        weight: 4,
        opacity: 0.85,
        dashArray: '8, 8',
        lineCap: 'round',
        lineJoin: 'round'
      }).addTo(map);

      routeLineRef.current = routeLine;
    }

    // Auto fit bounds if multiple points
    if (bounds.length > 1) {
      map.fitBounds(bounds as L.LatLngBoundsExpression, { padding: [40, 40], maxZoom: 16 });
    }
  }, [customerPoint, mechanicPoint, nearbyPoints, showRoute]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Target coordinates for Google Maps
  const targetLat = customerPoint?.lat || mechanicPoint?.lat || center[0];
  const targetLng = customerPoint?.lng || mechanicPoint?.lng || center[1];
  
  // Google Maps URL (Route if both exist, otherwise pin location)
  const googleMapsUrl = showRoute && customerPoint && mechanicPoint
    ? `https://www.google.com/maps/dir/?api=1&origin=${mechanicPoint.lat},${mechanicPoint.lng}&destination=${customerPoint.lat},${customerPoint.lng}`
    : `https://www.google.com/maps?q=${targetLat},${targetLng}`;

  return (
    <div className={`relative rounded-2xl overflow-hidden border border-slate-800 shadow-xl ${className}`}>
      <div ref={mapContainerRef} style={{ height, width: '100%' }} />

      {/* Floating GPS notice or instruction badge */}
      {onLocationSelect && (
        <div className="absolute top-3 left-3 z-[1000] bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700 text-xs font-medium text-slate-300 shadow-md flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
          Click anywhere on map to pin breakdown location
        </div>
      )}

      {/* Direct Google Maps Link Badge */}
      <div className="absolute bottom-3 right-3 z-[1000]">
        <a
          href={googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/95 hover:bg-slate-800 text-white hover:text-amber-400 border border-slate-700 shadow-lg text-[11px] font-bold transition-all transform hover:scale-105"
          title="Open this location in Google Maps"
        >
          <svg className="w-3.5 h-3.5 text-red-500 shrink-0" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
          </svg>
          <span>Open in Google Maps ↗</span>
        </a>
      </div>
    </div>
  );
};

