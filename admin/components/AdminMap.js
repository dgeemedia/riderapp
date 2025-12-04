// admin/components/AdminMap.js
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// Simple dynamic import for the map
const MapComponent = dynamic(
  () => import('./MapContent'),
  { 
    ssr: false,
    loading: () => <div className="h-[520px] flex items-center justify-center">Loading map...</div>
  }
);

export default function AdminMap({ riders = [], center = [9.0765, 7.3986] }) {
  return <MapComponent riders={riders} center={center} />;
}