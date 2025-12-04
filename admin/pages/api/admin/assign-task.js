// admin/pages/index.js
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import CallPanel from '../components/CallPanel';
const AdminMap = dynamic(() => import('../components/AdminMap'), { ssr: false });
import AssignModal from '../components/AssignModal';

export default function Home() {
  const [riders, setRiders] = useState([]);
  const [log, setLog] = useState([]);
  const [tasks, setTasks] = useState([]); // basic queue
  const [selectedTask, setSelectedTask] = useState(null);
  const [assignOpen, setAssignOpen] = useState(false);

  useEffect(() => {
    const token = (typeof window !== 'undefined') ? localStorage.getItem('admin_token') : null;

    async function load() {
      // 1) riders
      const r = await fetch('/api/riders', { headers: token ? { Authorization: 'Bearer ' + token } : {} });
      if (r.ok) setRiders(await r.json());

      // 2) tasks - simple fetch from backend tasks table (you might add backend admin /api/tasks later)
      const t = await fetch((process.env.NEXT_PUBLIC_BACKEND || 'http://localhost:4000') + '/api/tasks');
      if (t.ok) setTasks(await t.json());
    }
    load();

    // socket
    let socket;
    if (typeof window !== 'undefined') {
      socket = require('socket.io-client')(process.env.NEXT_PUBLIC_BACKEND || 'http://localhost:4000', { auth: { role: 'admin', token }});
      socket.on('connect', () => setLog(l => ['connected', ...l]));
      socket.on('location:update', data => {
        setLog(l => [JSON.stringify(data), ...l].slice(0,50));
        setRiders(prev => {
          const idx = prev.findIndex(p => p.id === data.riderId);
          if (idx === -1) return [{ id: data.riderId, phone: data.phone, name: data.name, lastLocation: data.lastLocation }, ...prev];
          const copy = [...prev]; copy[idx] = {...copy[idx], lastLocation: data.lastLocation}; return copy;
        });
      });
      socket.on('task:assign', ({ task }) => {
        setLog(l => [`task assigned: ${task.id}`, ...l]);
        // update tasks list
        setTasks(prev => prev.map(p => p.id === task.id ? task : p));
      });
      socket.on('task:accepted', m => setLog(l=>[`task accepted: ${JSON.stringify(m)}`, ...l]));
    }

    return () => socket && socket.disconnect();
  }, []);

  // ping
  async function ping(riderId) {
    const token = localStorage.getItem('admin_token');
    await fetch('/api/ping', { method:'POST', headers: {'content-type':'application/json', Authorization: 'Bearer ' + token}, body: JSON.stringify({ riderId, message: 'Please accept tasks' })});
    setLog(l => [`pinged ${riderId}`, ...l]);
  }

  // open assign modal
  function openAssign(task) {
    setSelectedTask(task);
    setAssignOpen(true);
  }

  async function doAssign(riderId) {
    setAssignOpen(false);
    const token = localStorage.getItem('admin_token');
    const res = await fetch('/api/admin/assign-task', { method:'POST', headers: {'content-type':'application/json', Authorization: 'Bearer ' + token}, body: JSON.stringify({ taskId: selectedTask.id, riderId })});
    const j = await res.json();
    if (!res.ok) return alert(j.error || 'assign failed');
    // update tasks locally
    setTasks(prev => prev.map(t => t.id === j.task.id ? j.task : t));
    setLog(l => [`assigned ${selectedTask.id} -> ${riderId}`, ...l]);
  }

  return (
    <div className="p-6">
      <header className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">MypadiFood — Admin Dashboard</h1>
          <div className="text-sm text-slate-500">Realtime riders, tasks and dispatch</div>
        </div>
        <div className="flex items-center gap-4">
          <div className="px-3 py-1 rounded bg-slate-800 text-sm">Env: {process.env.NODE_ENV}</div>
          <button onClick={()=>{localStorage.removeItem('admin_token'); location.href='/login'}} className="px-3 py-1 rounded border">Logout</button>
        </div>
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
                      <div className="text-xs text-slate-400">{r.lastLocation ? new Date(r.lastLocation.at).toLocaleString() : 'no location'}</div>
                    </div>
                    <div className="flex flex-col gap-2 items-end">
                      <button onClick={()=>ping(r.id)} className="text-sm px-2 py-1 rounded bg-yellow-200">Ping</button>
                      <a href={`tel:${r.phone}`} className="text-sm text-indigo-600">Call</a>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded bg-white p-4 shadow">
              <h3 className="font-medium mb-3">Task Queue</h3>
              <div className="space-y-2 max-h-64 overflow-auto">
                {tasks.length ? tasks.map(t => (
                  <div key={t.id} className="border p-3 rounded flex justify-between items-start">
                    <div>
                      <div className="text-sm font-medium">#{t.id?.slice(0,8)}</div>
                      <div className="text-xs text-slate-500">{t.pickup?.address || 'pickup unknown'} → {t.dropoff?.address || 'dropoff unknown'}</div>
                      <div className="text-xs text-slate-400">status: {t.status} {t.is_chargeable ? '(paid?)' : '(free)'}</div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <button onClick={() => openAssign(t)} className="px-2 py-1 bg-indigo-600 text-white rounded text-sm">Assign</button>
                      <button onClick={() => { localStorage.setItem('call_rider', t.assigned_rider || ''); window.open('/call-demo','_blank') }} className="px-2 py-1 border rounded text-sm">Call</button>
                    </div>
                  </div>
                )) : <div className="text-sm text-slate-500">No tasks yet</div>}
              </div>
            </div>
          </div>

        </div>

        <aside className="col-span-4 space-y-4">
          <div className="rounded bg-white p-4 shadow">
            <h3 className="font-medium mb-3">Quick Call</h3>
            <CallPanel />
          </div>

          <div className="rounded bg-white p-4 shadow">
            <h3 className="font-medium mb-3">Activity Log</h3>
            <div className="text-xs text-slate-600 max-h-64 overflow-auto">
              {log.map((l,i) => <div key={i} className="mb-2">{l}</div>)}
            </div>
          </div>

          <div className="rounded bg-white p-4 shadow">
            <h3 className="font-medium mb-3">Admin Actions</h3>
            <div className="space-y-2">
              <button onClick={() => alert('Export not implemented yet')} className="w-full px-3 py-2 rounded border">Export CSV</button>
              <button onClick={() => alert('Open billing panel later')} className="w-full px-3 py-2 rounded border">Billing</button>
            </div>
          </div>
        </aside>
      </div>

      <AssignModal
        open={assignOpen}
        onClose={() => setAssignOpen(false)}
        task={selectedTask}
        riders={riders}
        onAssign={doAssign}
      />
    </div>
  );
}

export default async function handler(req, res) {
  const backend = process.env.NEXT_PUBLIC_BACKEND || 'http://localhost:4000';
  const token = req.headers.authorization || '';
  
  try {
    const response = await fetch(backend + '/api/admin/assign-task', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': token 
      },
      body: JSON.stringify(req.body)
    });
    
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    console.error('Assign task error:', error);
    res.status(500).json({ error: 'Failed to assign task' });
  }
}