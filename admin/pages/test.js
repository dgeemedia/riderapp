// admin/pages/test.js
import React, { useEffect, useState } from 'react';

export default function TestPage() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Test Page</h1>
      <p className="mt-4">If this works, the issue is with one of the components.</p>
      <div className="mt-6">
        <h2 className="text-xl font-semibold">Current state:</h2>
        <p className="mt-2">isClient: {isClient ? 'true' : 'false'}</p>
      </div>
    </div>
  );
}