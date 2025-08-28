export default async function handler(req, res) {
  // --- CORS (loose; adjust if you need credentials) ---
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
    const raw = req.query.path || [];              // e.g. ['api','members','login']
    const path = Array.isArray(raw) ? raw.join('/') : String(raw);
    const apiUrl = `http://52.79.237.86:8080/${path}`;

    // Build headers for upstream
    const headers = {
      Accept: req.headers.accept || 'application/json',
      'Content-Type': req.headers['content-type'] || 'application/json',
      ...(req.headers.authorization ? { Authorization: req.headers.authorization } : {}),
    };

    // Decide body usage
    const bodyAllowed = !['GET', 'HEAD'].includes((req.method || 'GET').toUpperCase());

    // Normalize body (RHF/axios may give object or string)
    let body;
    if (bodyAllowed) {
      if (typeof req.body === 'string') body = req.body;
      else if (req.body && Object.keys(req.body).length) body = JSON.stringify(req.body);
      else body = undefined;
    }

    console.log(`[PROXY] ${req.method} ${apiUrl}`);
    const upstream = await fetch(apiUrl, {
      method: req.method,
      headers,
      body,
    });

    const text = await upstream.text();
    console.log(`[PROXY] Response: ${upstream.status}`);

    // Try JSON, fallback to text
    try {
      const json = JSON.parse(text);
      res.status(upstream.status).json(json);
    } catch {
      res.status(upstream.status).send(text);
    }
  } catch (err) {
    console.error('[PROXY] Error:', err);
    res.status(500).json({ error: 'Proxy failed', message: err?.message || String(err) });
  }
}
