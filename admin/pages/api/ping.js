// admin/pages/api/ping.js
export default async function handler(req,res){
  const backend = process.env.NEXT_PUBLIC_BACKEND || 'http://localhost:4000';
  const tok = req.headers.authorization || '';
  const r = await fetch(backend + '/api/admin/ping', { method:'POST', headers: { 'content-type':'application/json', Authorization: tok }, body: JSON.stringify(req.body) });
  const data = await r.json();
  res.status(r.status).json(data);
}

