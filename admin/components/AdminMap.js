// admin/components/AdminMap.js - MINIMAL WORKING VERSION
import { useEffect, useState } from 'react';

export default function AdminMap({ riders = [], center = [9.0765, 7.3986] }) {
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return <div className="h-[520px] flex items-center justify-center">Loading map...</div>;
  }

  return (
    <div className="h-[520px] rounded shadow overflow-hidden border">
      <div className="h-full w-full bg-gradient-to-br from-blue-50 to-gray-100 flex flex-col">
        <div className="p-4 bg-white border-b">
          <h3 className="font-semibold">Rider Locations</h3>
          <p className="text-sm text-gray-600">
            {riders.filter(r => r.lastLocation).length} riders with location data
          </p>
        </div>
        <div className="flex-1 overflow-auto p-4">
          {riders.map(r => (
            <div key={r.id} className="mb-3 p-3 bg-white rounded shadow">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-green-500 mr-3"></div>
                <div>
                  <div className="font-medium">{r.name || 'Unknown'}</div>
                  <div className="text-sm text-gray-600">{r.phone}</div>
                </div>
              </div>
              {r.lastLocation ? (
                <div className="mt-2 text-xs text-gray-500">
                  📍 {r.lastLocation.lat?.toFixed(4)}, {r.lastLocation.lng?.toFixed(4)}
                  {r.lastLocation.at && (
                    <div className="mt-1">
                      Last updated: {new Date(r.lastLocation.at).toLocaleTimeString()}
                    </div>
                  )}
                </div>
              ) : (
                <div className="mt-2 text-xs text-gray-400">No location data</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}