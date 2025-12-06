// admin/components/map/AdminMap.jsx
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// Modern dynamic import with skeleton loading
const MapComponent = dynamic(
  () => import('./MapContent'),
  { 
    ssr: false,
    loading: () => (
      <div className="h-[520px] rounded-2xl overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900 animate-pulse"></div>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-full gradient-primary mb-4 flex items-center justify-center animate-bounce">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Loading Live Map</h3>
          <p className="text-sm text-slate-400">Fetching rider locations...</p>
        </div>
      </div>
    )
  }
);

export default function AdminMap({ riders = [], center = [9.0765, 7.3986] }) {
  const [mapKey, setMapKey] = useState(0);

  // Refresh map when riders change
  useEffect(() => {
    setMapKey(prev => prev + 1);
  }, [riders]);

  return (
    <div className="relative">
      <div className="absolute top-4 left-4 z-10 bg-slate-900/90 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-slate-700/50">
        <div className="flex items-center space-x-3">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <div>
            <p className="text-sm font-medium text-white">{riders.length} Riders Online</p>
            <p className="text-xs text-slate-400">Live tracking active</p>
          </div>
        </div>
      </div>

      <div key={mapKey} className="h-[520px] rounded-2xl overflow-hidden border border-slate-700/50 shadow-2xl">
        <MapComponent riders={riders} center={center} />
      </div>

      {/* Map Controls */}
      <div className="absolute bottom-4 right-4 z-10 flex space-x-2">
        <button className="w-10 h-10 rounded-full bg-slate-900/90 backdrop-blur-sm border border-slate-700/50 flex items-center justify-center hover:bg-slate-800 transition-colors">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>
        <button className="w-10 h-10 rounded-full bg-slate-900/90 backdrop-blur-sm border border-slate-700/50 flex items-center justify-center hover:bg-slate-800 transition-colors">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
          </svg>
        </button>
      </div>
    </div>
  );
}