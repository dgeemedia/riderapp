export default async function handler(req, res) {
  const backend = process.env.NEXT_PUBLIC_BACKEND || 'http://localhost:4000';
  const r = await fetch(backend + '/api/admin/riders');
  const data = await r.json();
  res.status(200).json(data);
}
