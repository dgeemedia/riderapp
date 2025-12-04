// admin/components/SimpleMap.js
import { useEffect, useState } from 'react';

export default function SimpleMap({ riders = [], center = [9.0765, 7.3986] }) {
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return <div className="h-[520px] flex items-center justify-center">Loading map...</div>;
  }

  return (
    <div className="h-[520px] rounded shadow overflow-hidden">
      <div className="h-full w-full bg-gray-200 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-semibold mb-2">Map View</p>
          <p className="text-sm text-gray-600 mb-4">
            {riders.length} rider{riders.length !== 1 ? 's' : ''} online
          </p>
          <div className="space-y-2">
            {riders.map(r => (
              <div key={r.id} className="bg-white p-3 rounded shadow">
                <div className="font-medium">{r.name || 'Unknown Rider'}</div>
                <div className="text-sm text-gray-600">{r.phone}</div>
                {r.lastLocation && (
                  <div className="text-xs text-gray-500">
                    Location: {r.lastLocation.lat?.toFixed(4)}, {r.lastLocation.lng?.toFixed(4)}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}