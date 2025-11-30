// admin/pages/api/riders.js
export default async function handler(req,res){
  const backend = process.env.NEXT_PUBLIC_BACKEND || 'http://localhost:4000';
  const tok = req.headers.authorization || '';
  const r = await fetch(backend + '/api/admin/riders', { headers: { Authorization: tok } });
  const data = await r.json();
  res.status(r.status).json(data);
}

