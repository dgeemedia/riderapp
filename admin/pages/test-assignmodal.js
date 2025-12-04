// admin/pages/test-assignmodal.js
import React, { useState } from 'react';
import dynamic from 'next/dynamic';

const AssignModal = dynamic(() => import('../components/AssignModal'), { 
  ssr: false 
});

export default function TestAssignModal() {
  const [open, setOpen] = useState(false);
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Test AssignModal</h1>
      <button 
        onClick={() => setOpen(true)}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
      >
        Open Modal
      </button>
      
      <AssignModal
        open={open}
        onClose={() => setOpen(false)}
        task={{ id: 'test-task-123' }}
        riders={[
          { id: '1', name: 'Rider 1', phone: '1234567890' },
          { id: '2', name: 'Rider 2', phone: '0987654321' }
        ]}
        onAssign={(riderId) => {
          console.log('Assign to:', riderId);
          setOpen(false);
        }}
      />
    </div>
  );
}