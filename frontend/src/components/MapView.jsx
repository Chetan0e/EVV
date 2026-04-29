import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Link } from 'react-router-dom';
import StatusBadge from './StatusBadge';

// Fix for default marker icon in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom animated marker for active rescues
const pulseIcon = new L.DivIcon({
  className: 'custom-div-icon',
  html: '<div style="background-color: var(--accent-coral); width: 16px; height: 16px; border-radius: 50%;" class="pulse-marker"></div>',
  iconSize: [16, 16],
  iconAnchor: [8, 8]
});

const defaultIcon = new L.Icon.Default();

export default function MapView({ center = [19.0760, 72.8777], zoom = 12, items = [], type = 'rescue' }) {
  const [mapCenter, setMapCenter] = useState(center);

  useEffect(() => {
    setMapCenter(center);
  }, [center]);

  return (
    <div className="w-full h-full min-h-[400px] rounded-2xl overflow-hidden border border-[var(--border)] relative z-0">
      <MapContainer center={mapCenter} zoom={zoom} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        {items.map((item) => {
          if (!item.location?.coordinates) return null;
          const position = [item.location.coordinates[1], item.location.coordinates[0]]; // [lat, lng]
          const isCritical = item.severity === 'critical';
          
          return (
            <Marker 
              key={item._id} 
              position={position}
              icon={isCritical ? pulseIcon : defaultIcon}
            >
              <Popup className="custom-popup">
                <div className="text-[var(--bg-primary)] p-1">
                  <h4 className="font-bold mb-1">
                    {type === 'rescue' ? `${item.animal?.type || 'Animal'} Rescue` : item.foodDescription}
                  </h4>
                  <div className="mb-2">
                    <StatusBadge status={item.status} />
                  </div>
                  {type === 'rescue' ? (
                    <Link to={`/report/${item._id}`} className="text-[var(--accent-teal)] font-bold text-xs">View Details</Link>
                  ) : (
                    <p className="text-xs text-gray-600">{item.quantity}</p>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
