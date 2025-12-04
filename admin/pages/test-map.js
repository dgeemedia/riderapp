// admin/pages/test-map.js
import React from 'react';
import dynamic from 'next/dynamic';

const AdminMap = dynamic(() => import('../components/AdminMap'), { 
  ssr: false 
});

export default function TestMap() {
  const riders = [
    {
      id: '1',
      name: 'Test Rider',
      phone: '1234567890',
      lastLocation: {
        lat: 9.0765,
        lng: 7.3986,
        at: new Date().toISOString()
      }
    }
  ];
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Test Map</h1>
      <div className="mt-4" style={{ height: '520px' }}>
        <AdminMap riders={riders} />
      </div>
    </div>
  );
}