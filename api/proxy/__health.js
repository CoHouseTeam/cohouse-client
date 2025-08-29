export default function handler(req, res) {
  // Set CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,POST,PUT,DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  
  // Handle preflight OPTIONS requests
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  
  res.status(200).json({ 
    ok: true, 
    method: req.method, 
    ts: Date.now(), 
    where: "/api/proxy/__health (direct)",
    environment: process.env.NODE_ENV || 'development',
    body: req.body || null,
    headers: req.headers
  });
}