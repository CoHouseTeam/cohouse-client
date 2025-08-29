export default function handler(req, res) {
  // Set CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,POST,PUT,DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  
  // Handle preflight OPTIONS requests
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  
  // 경로 변환 로직 테스트
  const { path } = req.query;
  const joinedPath = Array.isArray(path) ? path.join('/') : (path || '');
  
  let backendPath = joinedPath;
  if (joinedPath.startsWith('api/')) {
    backendPath = joinedPath.substring(4);
  }
  
  const BACKEND_URL = 'http://52.79.237.86:8080';
  let targetUrl;
  if (backendPath === '') {
    targetUrl = `${BACKEND_URL}/api`;
  } else {
    targetUrl = `${BACKEND_URL}/api/${backendPath}`;
  }
  
  console.log(`[DEBUG] ${req.method} request received`);
  console.log(`[DEBUG] Original path: ${joinedPath}`);
  console.log(`[DEBUG] Transformed path: ${backendPath}`);
  console.log(`[DEBUG] Target URL: ${targetUrl}`);
  console.log(`[DEBUG] Body:`, req.body);
  
  res.status(200).json({ 
    ok: true, 
    method: req.method, 
    ts: Date.now(), 
    where: "/api/proxy/debug",
    originalPath: joinedPath,
    transformedPath: backendPath,
    targetUrl: targetUrl,
    body: req.body,
    message: "Debug endpoint - path transformation test"
  });
}
