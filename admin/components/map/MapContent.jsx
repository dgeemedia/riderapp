// admin/components/map/MapContent.jsx
import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for leaflet markers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: '/images/marker-icon-2x.png',
  iconUrl: '/images/marker-icon.png',
  shadowUrl: '/images/marker-shadow.png',
});

// Create a custom icon to avoid CDN issues
const createIcon = () => {
  return new L.Icon({
    iconUrl: '/images/marker-icon.png',
    iconRetinaUrl: '/images/marker-icon-2x.png',
    shadowUrl: '/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });
};

export default function MapContent({ riders, center }) {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="h-[520px] flex items-center justify-center">Loading map...</div>;
  }

  const first = riders.find(r => r.lastLocation && r.lastLocation.lat && r.lastLocation.lng);
  const start = first ? [first.lastLocation.lat, first.lastLocation.lng] : center;

  return (
    <div className="h-[520px] rounded shadow overflow-hidden">
      <MapContainer 
        center={start} 
        zoom={13} 
        style={{ height: '100%', width: '100%' }}
        key={JSON.stringify(start)}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {riders.map(r => r.lastLocation && r.lastLocation.lat && r.lastLocation.lng ? (
          <Marker 
            key={r.id} 
            position={[r.lastLocation.lat, r.lastLocation.lng]}
            icon={createIcon()}
          >
            <Popup>
              <div className="text-sm">
                <strong>{r.name || '(no name)'}</strong><br />
                {r.phone}<br/>
                {r.lastLocation.at ? new Date(r.lastLocation.at).toLocaleString() : ''}
              </div>
            </Popup>
          </Marker>
        ) : null)}
      </MapContainer>
    </div>
  );
}