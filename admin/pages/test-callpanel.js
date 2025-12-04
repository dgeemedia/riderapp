// admin/pages/test-callpanel.js
import React from 'react';
import dynamic from 'next/dynamic';

const CallPanel = dynamic(() => import('../components/CallPanel'), { 
  ssr: false 
});

export default function TestCallPanel() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Test CallPanel</h1>
      <div className="mt-4">
        <CallPanel />
      </div>
    </div>
  );
}