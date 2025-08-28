export default async function handler(req, res) {
  // --- CORS Headers ---
  const origin = req.headers.origin || '*';
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Authorization, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );
  
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    // [...path] is captured by Vercel
    const raw = req.query.path || [];
    const path = Array.isArray(raw) ? raw.join('/') : String(raw);
    
    // Health endpoint
    if (path === '__health') {
      console.log('[PROXY] Health check');
      return res.status(200).json({ ok: true, timestamp: new Date().toISOString() });
    }

    const apiUrl = `http://52.79.237.86:8080/${path}`;

    // Build headers for upstream
    const headers = {
      'Accept': req.headers.accept || 'application/json',
      'Content-Type': req.headers['content-type'] || 'application/json',
      'User-Agent': 'Vercel-Proxy/1.0',
    };

    // Add authorization if present
    if (req.headers.authorization) {
      headers.Authorization = req.headers.authorization;
    }

    // Read raw body for non-GET requests
    let body;
    const bodyAllowed = !['GET', 'HEAD'].includes((req.method || 'GET').toUpperCase());
    
    if (bodyAllowed) {
      // Read raw body from request
      if (req.body !== undefined) {
        // Vercel already parsed it
        body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
      } else {
        // Fallback: read chunks manually
        const chunks = [];
        req.on('data', chunk => chunks.push(chunk));
        await new Promise(resolve => req.on('end', resolve));
        body = Buffer.concat(chunks).toString();
      }
    }

    console.log(`[PROXY] ${req.method} ${apiUrl}`);
    console.log(`[PROXY] Headers:`, JSON.stringify(headers, null, 2));
    if (body) console.log(`[PROXY] Body:`, body);

    const upstream = await fetch(apiUrl, {
      method: req.method,
      headers,
      body: bodyAllowed ? body : undefined,
    });

    const text = await upstream.text();
    console.log(`[PROXY] Response: ${upstream.status} ${upstream.statusText}`);
    console.log(`[PROXY] Response body:`, text);

    // Forward response headers
    upstream.headers.forEach((value, key) => {
      if (!key.toLowerCase().startsWith('access-control-')) {
        res.setHeader(key, value);
      }
    });

    // Try JSON, fallback to text
    try {
      const json = JSON.parse(text);
      res.status(upstream.status).json(json);
    } catch {
      res.status(upstream.status).send(text);
    }
  } catch (err) {
    console.error('[PROXY] Error:', err);
    res.status(500).json({ 
      error: 'Proxy failed', 
      message: err?.message || String(err),
      stack: process.env.NODE_ENV === 'development' ? err?.stack : undefined
    });
  }
}
