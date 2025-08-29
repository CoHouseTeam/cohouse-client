// Complete Vercel Proxy Handler for catch-all routing
// Handles health checks and proxies all other requests to the backend server

const BACKEND_URL = 'http://52.79.237.86:8080';

export default async function handler(req, res) {
  // Set CORS headers for all requests
  const origin = req.headers.origin || "*";
  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Authorization, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );

  // Handle preflight OPTIONS requests
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // Extract the path from the query parameters (Vercel dynamic routing)
  const { path } = req.query;
  const joinedPath = Array.isArray(path) ? path.join('/') : (path || '');
  
  console.log(`[PROXY] ${req.method} /${joinedPath}`);

  // Health check endpoint
  if (joinedPath === '__health') {
    return res.status(200).json({
      ok: true,
      method: req.method,
      ts: Date.now(),
      message: "Vercel proxy function is healthy and running",
      path: joinedPath
    });
  }

  // Construct the target URL for the backend
  const targetUrl = `${BACKEND_URL}/${joinedPath}`;
  const urlWithQuery = new URL(targetUrl);
  
  // Add query parameters if they exist
  if (req.url) {
    const requestUrl = new URL(req.url, `http://${req.headers.host}`);
    requestUrl.searchParams.forEach((value, key) => {
      urlWithQuery.searchParams.set(key, value);
    });
  }

  // Prepare headers for the backend request
  const headers = {
    'Content-Type': req.headers['content-type'] || 'application/json',
    'User-Agent': req.headers['user-agent'] || 'Vercel-Proxy/1.0',
  };

  // Copy relevant headers from the original request
  const headersToForward = [
    'authorization',
    'accept',
    'accept-language',
    'accept-encoding',
    'cache-control',
    'x-api-key',
    'x-requested-with'
  ];

  headersToForward.forEach(headerName => {
    if (req.headers[headerName]) {
      headers[headerName] = req.headers[headerName];
    }
  });

  try {
    // Prepare the request configuration
    const requestConfig = {
      method: req.method,
      headers: headers,
    };

    // Add body for non-GET requests
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      // Vercel 환경에서 req.body 처리
      if (req.body !== undefined && req.body !== null) {
        // 이미 객체인 경우 (Vercel이 자동으로 파싱한 경우)
        if (typeof req.body === 'object') {
          requestConfig.body = JSON.stringify(req.body);
          headers['Content-Type'] = 'application/json';
        } 
        // 문자열인 경우 (raw body)
        else if (typeof req.body === 'string') {
          // JSON 문자열인지 확인
          try {
            const parsed = JSON.parse(req.body);
            requestConfig.body = JSON.stringify(parsed);
            headers['Content-Type'] = 'application/json';
          } catch (e) {
            // JSON이 아닌 경우 문자열 그대로 사용
            requestConfig.body = req.body;
          }
        }
        
        console.log(`[PROXY] Request body:`, req.body);
        console.log(`[PROXY] Final body:`, requestConfig.body);
      }
    }

    console.log(`[PROXY] Forwarding to: ${urlWithQuery.href}`);
    console.log(`[PROXY] Request config:`, {
      method: requestConfig.method,
      headers: requestConfig.headers,
      hasBody: !!requestConfig.body
    });

    // Make the request to the backend
    const response = await fetch(urlWithQuery.href, requestConfig);

    // Forward the status code
    res.status(response.status);

    // Forward response headers (excluding problematic ones)
    const headersToSkip = ['content-encoding', 'transfer-encoding', 'connection'];
    response.headers.forEach((value, key) => {
      if (!headersToSkip.includes(key.toLowerCase())) {
        res.setHeader(key, value);
      }
    });

    // Get response body
    const responseBody = await response.text();

    // Try to parse as JSON, fallback to text
    try {
      const jsonBody = JSON.parse(responseBody);
      return res.json(jsonBody);
    } catch {
      return res.send(responseBody);
    }

  } catch (error) {
    console.error('[PROXY] Error occurred during proxying:', error);
    
    return res.status(500).json({
      error: 'Failed to proxy request',
      message: error.message,
      path: joinedPath,
      timestamp: Date.now()
    });
  }
}
