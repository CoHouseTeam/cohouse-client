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

  // path 파라미터에서 실제 API 경로 구성
  const { path } = req.query;
  const apiPath = Array.isArray(path) ? path.join('/') : (path || '');
  const apiUrl = `http://52.79.237.86:8080/${apiPath}`;
  
  console.log('Proxy request:', req.method, apiUrl);
  
  try {
    const headers = {
      'Content-Type': 'application/json',
    };
    
    // Authorization 헤더가 있으면 추가
    if (req.headers.authorization) {
      headers.Authorization = req.headers.authorization;
    }

    const fetchOptions = {
      method: req.method,
      headers,
    };

    // GET이 아닌 경우에만 body 추가
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      fetchOptions.body = JSON.stringify(req.body);
    }

    const response = await fetch(apiUrl, fetchOptions);
    
    // 응답이 JSON인지 확인
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      console.log('Proxy response:', response.status, data);
      res.status(response.status).json(data);
    } else {
      const text = await response.text();
      console.log('Proxy response (text):', response.status, text);
      res.status(response.status).send(text);
    }
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ 
      error: 'Proxy request failed', 
      details: error.message,
      url: apiUrl 
    });
  }
}
