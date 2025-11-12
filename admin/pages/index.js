import { useEffect, useState } from 'react';
import io from 'socket.io-client';

export default function Home() {
  const [riders, setRiders] = useState([]);
  const [log, setLog] = useState([]);
  useEffect(() => {
    fetch('/api/riders').then(r => r.json()).then(setRiders);
    const socket = io(process.env.NEXT_PUBLIC_BACKEND || 'http://localhost:4000', { auth: { role: 'admin' } });
    socket.on('connect', () => setLog(l => ['connected to backend', ...l]));
    socket.on('location:update', (data) => {
      setLog(l => [JSON.stringify(data), ...l].slice(0,50));
      setRiders(prev => {
        const idx = prev.findIndex(p => p.id === data.riderId);
        if (idx === -1) return [{ id: data.riderId, phone: data.phone, name: data.name, lastLocation: data.lastLocation }, ...prev];
        const copy = [...prev];
        copy[idx] = { ...copy[idx], lastLocation: data.lastLocation };
        return copy;
      });
    });
    socket.on('task:accepted', (d) => setLog(l => [`task accepted: ${JSON.stringify(d)}`, ...l]));
    return () => socket.disconnect();
  }, []);

  return (
    <div style={{ padding: 20, fontFamily: 'sans-serif' }}>
      <h1>D Riders — Dispatch Board</h1>
      <p>Minimal admin dashboard. Click "Ping" to send a ping to a rider (which the rider app will receive).</p>
      <div style={{ display: 'flex', gap: 20 }}>
        <div style={{ flex: 1 }}>
          <h2>Riders</h2>
          <ul>
            {riders.map(r => (
              <li key={r.id} style={{ marginBottom: 10, border: '1px solid #ddd', padding: 8 }}>
                <div><strong>{r.name || '(no name)'}</strong> — {r.phone}</div>
                <div>Last: {r.lastLocation ? new Date(r.lastLocation.at).toLocaleString() : 'no location'}</div>
                <div>
                  <button onClick={() => {
                    fetch('/api/ping', { method: 'POST', headers: { 'Content-Type':'application/json' }, body: JSON.stringify({ riderId: r.id, message: 'Please accept tasks' }) })
                  }}>Ping</button>
                  &nbsp;
                  <a href={`tel:${r.phone}`}>Call</a>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div style={{ width: 420 }}>
          <h2>Event Log</h2>
          <div style={{ height: 400, overflow: 'auto', border: '1px solid #eee', padding: 8 }}>
            {log.map((l,i) => <div key={i} style={{ fontSize: 12, marginBottom: 6 }}>{l}</div>)}
          </div>
        </div>
      </div>
    </div>
  );
}
