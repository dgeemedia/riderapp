// admin/pages/api/ping.js
export default async function handler(req, res) {
  const backend = process.env.NEXT_PUBLIC_BACKEND || 'http://localhost:4000';
  const body = req.body || {};
  await fetch(backend + '/api/admin/ping', { method: 'POST', headers: {'content-type':'application/json'}, body: JSON.stringify(body) });
  res.status(200).json({ ok:true });
}
