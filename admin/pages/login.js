// admin/pages/login.js
import { useState } from 'react';
export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  async function submit(e) {
    e.preventDefault();
    const res = await fetch('/api/admin/login', { method: 'POST', headers: {'content-type':'application/json'}, body: JSON.stringify({ email, password })});
    const j = await res.json();
    if (!res.ok) return alert(j.error || 'login failed');
    localStorage.setItem('admin_token', j.token);
    window.location.href = '/';
  }
  return (
    <div style={{padding:20}}>
      <h2>Admin Login</h2>
      <form onSubmit={submit}>
        <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="email" /><br/><br/>
        <input value={password} onChange={e=>setPassword(e.target.value)} placeholder="password" type="password" /><br/><br/>
        <button>Login</button>
      </form>
    </div>
  );
}
