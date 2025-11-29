// admin/pages/api/riders.js
export default async function handler(req, res) {
  const backend = process.env.NEXT_PUBLIC_BACKEND || 'http://localhost:4000';
  // read token from cookies or from request header forwarded by client
  const token = req.headers.authorization || '';
  const headers = token ? { Authorization: token } : {};
  const r = await fetch(backend + '/api/admin/riders', { headers });
  const data = await r.json();
  res.status(r.status).json(data);
}
