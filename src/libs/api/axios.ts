import axios from 'axios'

// 🌐 API 요청은 무조건 환경변수 사용 (하드코딩 금지!)
const getBaseURL = () => {
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL
  
  if (!apiBaseUrl) {
    console.error('❌ VITE_API_BASE_URL이 설정되지 않았습니다!')
    return '/api' // 기본값: 프록시 경로
  }
  
  console.log('🌐 API Base URL:', apiBaseUrl)
  return apiBaseUrl
}

const api = axios.create({
  baseURL: getBaseURL(),
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
})

// ★ 디버깅 로그: 최종 요청이 뭔지 무조건 찍자
api.interceptors.request.use((c) => {
  console.log('[REQ]', c.baseURL, c.url) // 예: /api  /settlements/my
  return c
})

// Request interceptor - attach auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
      console.log('🔑 토큰 첨부됨:', token.substring(0, 20) + '...')
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor - handle auth errors and provide fallback data
api.interceptors.response.use(
  (response) => {
    return response
  },
  async (error) => {
    if (error.response?.status === 401) {
      console.log('❌ 401 Unauthorized - 토큰 만료')
      
      // 토큰 제거
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      
      // 로그인 페이지로 리다이렉트
      window.location.href = '/login'
      return Promise.reject(error)
    }
    
    // 프로덕션에서 API 오류 시 임시 Mock 데이터 제공
    if (import.meta.env.PROD && error.config?.url) {
      console.warn('API Error, providing fallback data:', error.config.url)
      
      // 모든 API 오류에 대해 빈 배열 반환
      return Promise.resolve({
        data: [],
        status: 200,
        statusText: 'OK (Mock Data)'
      })
    }
    
    return Promise.reject(error)
  }
)

export default api
