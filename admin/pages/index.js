// admin/pages/index.js - Simplified version
import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// Only dynamically import components that absolutely need it
const AdminMap = dynamic(() => import('../components/AdminMap'), { 
  ssr: false,
  loading: () => <div className="h-[520px] flex items-center justify-center">Loading map...</div>
});

// Simple AssignModal without dynamic import
function AssignModal({ open, onClose, task, riders = [], onAssign }) {
  const [selected, setSelected] = useState('');

  useEffect(() => {
    setSelected('');
  }, [task]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="mx-auto max-w-md rounded bg-white p-6 shadow">
        <h2 className="text-lg font-semibold">Assign Task</h2>
        <div className="mt-3">
          <div className="text-sm text-slate-600">Task: {task?.id}</div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-slate-700">Select Rider</label>
            <select
              value={selected}
              onChange={e => setSelected(e.target.value)}
              className="mt-1 w-full rounded border p-2"
            >
              <option value="">— choose rider —</option>
              {riders.map(r => (
                <option key={r.id} value={r.id}>
                  {r.name || r.phone} ({r.phone})
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onClose} className="px-3 py-1 rounded border">Cancel</button>
          <button
            disabled={!selected}
            onClick={() => onAssign(selected)}
            className="px-3 py-1 rounded bg-indigo-600 text-white disabled:opacity-50"
          >
            Assign
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [riders, setRiders] = useState([]);
  const [log, setLog] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [assignOpen, setAssignOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const token = localStorage.getItem('admin_token');
    
    async function load() {
      try {
        setIsLoading(true);
        // Load riders
        const ridersRes = await fetch('/api/riders', { 
          headers: token ? { Authorization: 'Bearer ' + token } : {} 
        });
        if (ridersRes.ok) setRiders(await ridersRes.json());

        // Load tasks
        const tasksRes = await fetch((process.env.NEXT_PUBLIC_BACKEND || 'http://localhost:4000') + '/api/tasks');
        if (tasksRes.ok) setTasks(await tasksRes.json());
      } catch (err) {
        console.error('Load error:', err);
      } finally {
        setIsLoading(false);
      }
    }

    load();
  }, []);

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <header className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">MypadiFood — Admin Dashboard</h1>
          <div className="text-sm text-slate-500">Realtime riders, tasks and dispatch</div>
        </div>
        <button 
          onClick={() => { 
            localStorage.removeItem('admin_token'); 
            window.location.href = '/login';
          }} 
          className="px-3 py-1 rounded border"
        >
          Logout
        </button>
      </header>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-8 space-y-4">
          <AdminMap riders={riders} />

          <div className="grid grid-cols-2 gap-4">
            <div className="rounded bg-white p-4 shadow">
              <h3 className="font-medium mb-3">Live Riders</h3>
              <ul className="space-y-3 max-h-64 overflow-auto">
                {riders.map(r => (
                  <li key={r.id} className="flex items-start justify-between">
                    <div>
                      <div className="font-semibold">{r.name || '(no name)'}</div>
                      <div className="text-xs text-slate-500">{r.phone}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      <AssignModal
        open={assignOpen}
        onClose={() => setAssignOpen(false)}
        task={selectedTask}
        riders={riders}
        onAssign={() => {}}
      />
    </div>
  );
}