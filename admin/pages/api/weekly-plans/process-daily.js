// admin/pages/api/weekly-plans/process-daily.js
export default async function handler(req, res) {
  const backend = process.env.NEXT_PUBLIC_BACKEND || 'http://localhost:4000';
  const token = req.headers.authorization?.replace('Bearer ', '') || '';
  
  try {
    const response = await fetch(`${backend}/api/weekly-plans/process-daily`, {
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
    console.error('Process daily orders error:', error);
    res.status(500).json({ error: 'Failed to process daily orders' });
  }
}