// Vercel Serverless Function for API Proxy
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

  try {
    // URL에서 /api/proxy 이후의 경로를 추출
    const { url } = req;
    const apiPath = url.replace('/api/proxy/', '').replace('/api/proxy', '');
    const targetUrl = `http://52.79.237.86:8080/${apiPath}`;
    
    console.log('🔄 Proxy Request:', req.method, targetUrl);
    
    // 헤더 설정
    const headers = {
      'Content-Type': 'application/json',
    };
    
    // Authorization 헤더 전달
    if (req.headers.authorization) {
      headers.Authorization = req.headers.authorization;
    }

    // Fetch 옵션 구성
    const fetchOptions = {
      method: req.method,
      headers,
    };

    // POST, PUT 등의 경우 body 추가
    if (req.method !== 'GET' && req.method !== 'HEAD' && req.body) {
      fetchOptions.body = JSON.stringify(req.body);
    }

    // 실제 API 서버로 요청
    const response = await fetch(targetUrl, fetchOptions);
    const data = await response.json();
    
    console.log('✅ Proxy Response:', response.status, data);
    
    // 응답 반환
    res.status(response.status).json(data);
    
  } catch (error) {
    console.error('❌ Proxy Error:', error);
    res.status(500).json({ 
      error: 'Proxy request failed', 
      details: error.message 
    });
  }
}
