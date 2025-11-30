// admin/pages/index.js
import { useEffect, useState } from 'react';
import io from 'socket.io-client';

export default function Home() {
  const [riders, setRiders] = useState([]);
  const [log, setLog] = useState([]);
  useEffect(() => {
    const token = (typeof window !== 'undefined') ? localStorage.getItem('admin_token') : null;
    async function load() {
      const res = await fetch('/api/riders', { headers: token ? { Authorization: 'Bearer ' + token } : {} });
      if (res.ok) setRiders(await res.json());
    }
    load();
    let socket;
    if (typeof window !== 'undefined') {
      socket = io(process.env.NEXT_PUBLIC_BACKEND || 'http://localhost:4000', { auth: { role: 'admin', token }});
      socket.on('connect', ()=> setLog(l => ['connected', ...l]));
      socket.on('location:update', data => {
        setLog(l => [JSON.stringify(data), ...l].slice(0,50));
        setRiders(prev => {
          const idx = prev.findIndex(p => p.id === data.riderId);
          if (idx === -1) return [{ id: data.riderId, phone: data.phone, name: data.name, lastLocation: data.lastLocation }, ...prev];
          const copy = [...prev]; copy[idx] = {...copy[idx], lastLocation: data.lastLocation}; return copy;
        });
      });
    }
    return () => socket && socket.disconnect();
  }, []);

  const ping = async (riderId) => {
    const token = localStorage.getItem('admin_token');
    await fetch('/api/ping', { method:'POST', headers: {'content-type':'application/json', Authorization: 'Bearer ' + token}, body: JSON.stringify({ riderId, message: 'Please accept tasks' })});
  };

  return (
    <div style={{padding:20}}>
      <h1>D Riders Admin</h1>
      <div style={{display:'flex', gap:20}}>
        <div style={{flex:1}}>
          <h3>Riders</h3>
          <ul>
            {riders.map(r => (
              <li key={r.id} style={{marginBottom:10,border:'1px solid #ddd',padding:8}}>
                <div><strong>{r.name || '(no name)'}</strong> — {r.phone}</div>
                <div>Last: {r.lastLocation ? new Date(r.lastLocation.at).toLocaleString() : 'no location'}</div>
                <div>
                  <button onClick={()=>ping(r.id)}>Ping</button> &nbsp;
                  <a href={`tel:${r.phone}`}>Call</a>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div style={{width:420}}>
          <h3>Log</h3>
          <div style={{height:400,overflow:'auto',border:'1px solid #eee',padding:8}}>
            {log.map((l,i) => <div key={i} style={{fontSize:12,marginBottom:6}}>{l}</div>)}
          </div>
        </div>
      </div>
    </div>
  );
}
