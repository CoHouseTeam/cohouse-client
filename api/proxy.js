export default async function handler(req, res) {
  // CORS 설정
  res.setHeader('Access-Control-Allow-Credentials', true)
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization')

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  try {
    // URL에서 경로 추출
    const path = req.url.replace('/api/proxy/', '')
    const apiUrl = `http://52.79.237.86:8080/${path}`
    
    console.log(`[PROXY] ${req.method} ${apiUrl}`)

    // 요청 헤더 준비
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    }

    if (req.headers.authorization) {
      headers.Authorization = req.headers.authorization
    }

    // fetch 요청
    const response = await fetch(apiUrl, {
      method: req.method,
      headers,
      body: req.method !== 'GET' ? JSON.stringify(req.body) : undefined,
    })

    const data = await response.text()
    
    console.log(`[PROXY] Response: ${response.status}`)
    
    // JSON 파싱 시도
    try {
      const jsonData = JSON.parse(data)
      res.status(response.status).json(jsonData)
    } catch {
      res.status(response.status).send(data)
    }

  } catch (error) {
    console.error('[PROXY] Error:', error)
    res.status(500).json({ error: 'Proxy failed', message: error.message })
  }
}
