// admin/pages/api/products.js
export default async function handler(req, res) {
  const backend = process.env.NEXT_PUBLIC_BACKEND || 'http://localhost:4000';
  const token = req.headers.authorization?.replace('Bearer ', '') || '';
  
  try {
    const response = await fetch(`${backend}/api/products`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    console.error('Products API error:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
}


