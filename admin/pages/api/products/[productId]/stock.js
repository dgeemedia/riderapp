// admin/pages/api/products/[productId]/stock.js
export default async function handler(req, res) {
  const { productId } = req.query;
  const backend = process.env.NEXT_PUBLIC_BACKEND || 'http://localhost:4000';
  const token = req.headers.authorization?.replace('Bearer ', '') || '';
  
  try {
    const response = await fetch(`${backend}/api/products/${productId}/stock`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(req.body)
    });
    
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    console.error('Update product stock error:', error);
    res.status(500).json({ error: 'Failed to update product stock' });
  }
}
