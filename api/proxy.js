export default async function handler(req, res) {
  // CORS 헤더 설정
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // OPTIONS 요청 처리 (CORS preflight)
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // URL에서 /api/proxy 부분 제거하고 나머지 경로 추출
  const fullPath = req.url.replace('/api/proxy', '') || '/';
  const apiUrl = `http://52.79.237.86:8080${fullPath}`;
  
  console.log('Proxy request:', req.method, apiUrl);
  
  try {
    const headers = {
      'Content-Type': 'application/json',
    };
    
    // Authorization 헤더가 있으면 추가
    if (req.headers.authorization) {
      headers.Authorization = req.headers.authorization;
    }

    const response = await fetch(apiUrl, {
      method: req.method,
      headers,
      body: req.method !== 'GET' && req.method !== 'HEAD' ? JSON.stringify(req.body) : undefined,
    });

    const data = await response.json();
    console.log('Proxy response:', response.status, data);
    
    res.status(response.status).json(data);
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ error: 'Proxy request failed', details: error.message });
  }
}
