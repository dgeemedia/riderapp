// admin/pages/admin-login.js
import { useState } from 'react';
import Router from 'next/router';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const onLogin = async () => {
    const res = await fetch('/api/admin/login', { method: 'POST', headers: {'content-type':'application/json'}, body: JSON.stringify({ email, password })});
    const j = await res.json();
    if (!res.ok) return alert(j.error || 'login failed');
    // store token in localStorage and redirect to home
    localStorage.setItem('admin_token', j.token);
    Router.push('/');
  };
  return (
    <div style={{ padding: 24 }}>
      <h1>Admin Login</h1>
      <input placeholder="email" value={email} onChange={(e) => setEmail(e.target.value)} /><br/>
      <input placeholder="password" value={password} onChange={(e) => setPassword(e.target.value)} type="password" /><br/>
      <button onClick={onLogin}>Login</button>
    </div>
  );
}
