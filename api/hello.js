export default function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  console.log(`[HELLO] ${req.method} /api/hello`);
  
  res.status(200).json({ 
    ok: true, 
    message: 'Hello from Vercel API!',
    timestamp: new Date().toISOString(),
    method: req.method
  });
}
