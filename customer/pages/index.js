// customer/pages/index.js
import { useState } from 'react';
export default function Home(){
  const [phone, setPhone] = useState('');
  const [pickup, setPickup] = useState('');
  const [dropoff, setDropoff] = useState('');
  async function create(){
    // simple create customer or find
    const r0 = await fetch('/api/customer/register', {method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify({ phone })});
    const j0 = await r0.json();
    if (!r0.ok) return alert('failed create customer');
    const customer = j0.customer;
    const res = await fetch('/api/tasks', {method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify({
      customer_id: customer.id,
      pickup: { address: pickup, lat: 0, lng: 0 },
      dropoff: { address: dropoff, lat: 0, lng: 0 },
      created_by_type: 'customer'
    })});
    const j = await res.json();
    if (!res.ok) return alert(j.error || 'failed');
    alert('task posted');
  }
  return (
    <div style={{padding:20}}>
      <h2>Post Task (Customer)</h2>
      <div>
        <input placeholder="+234..." value={phone} onChange={e=>setPhone(e.target.value)} /><br/><br/>
        <input placeholder="Pickup address" value={pickup} onChange={e=>setPickup(e.target.value)} /><br/><br/>
        <input placeholder="Dropoff address" value={dropoff} onChange={e=>setDropoff(e.target.value)} /><br/><br/>
        <button onClick={create}>Post Task</button>
      </div>
    </div>
  );
}
