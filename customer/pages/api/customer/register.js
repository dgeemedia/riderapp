// customer/pages/api/customer/register.js
export default async function handler(req,res){
  const backend = process.env.NEXT_PUBLIC_BACKEND || 'http://localhost:4000';
  const r = await fetch(backend + '/api/customers/register', { method:'POST', headers: {'content-type':'application/json'}, body: JSON.stringify(req.body) });
  const j = await r.json();
  res.status(r.status).json(j);
}
