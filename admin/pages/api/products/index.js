// admin/pages/api/products/index.js (for creating products)
export default async function handler(req, res) {
  const backend = process.env.NEXT_PUBLIC_BACKEND || 'http://localhost:4000';
  const token = req.headers.authorization?.replace('Bearer ', '') || '';
  
  if (req.method === 'POST') {
    try {
      const response = await fetch(`${backend}/api/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(req.body)
      });
      
      const data = await response.json();
      res.status(response.status).json(data);
    } catch (error) {
      console.error('Create product error:', error);
      res.status(500).json({ error: 'Failed to create product' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}