// admin/components/AdminMap.js
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// Use a simpler approach for react-leaflet
const Map = dynamic(
  async () => {
    // Dynamically import react-leaflet components
    const { MapContainer, TileLayer, Marker, Popup } = await import('react-leaflet');
    const L = await import('leaflet');
    
    // Fix for leaflet markers
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    });

    // Return a functional component
    return function MapComponent({ riders = [], center = [9.0765, 7.3986] }) {
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
                icon={new L.Icon.Default()}
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
    };
  },
  { 
    ssr: false,
    loading: () => <div className="h-[520px] flex items-center justify-center">Loading map...</div>
  }
);

export default function AdminMap({ riders = [], center = [9.0765, 7.3986] }) {
  return <Map riders={riders} center={center} />;
}