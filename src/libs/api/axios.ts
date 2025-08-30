import axios from 'axios'
import { getAccessToken } from '../utils/auth'

// 🌐 API 요청은 무조건 환경변수 사용 (하드코딩 금지!)
const getBaseURL = () => {
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL
  
  if (!apiBaseUrl) {
    console.error('❌ VITE_API_BASE_URL이 설정되지 않았습니다!')
    return 'http://52.79.237.86:8080' // Vercel 배포 시 사용될 기본값
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
  console.log('[REQ]', c.baseURL, c.url) // 예: /api/proxy  /members/login
  console.log('[REQ Headers]', c.headers)
  return c
})

// Request interceptor - attach auth token
api.interceptors.request.use(
  (config) => {
    const token = getAccessToken()
    console.log('🔍 토큰 확인:', token ? '토큰 있음' : '토큰 없음')
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
      console.log('🔑 토큰 첨부됨:', token.substring(0, 20) + '...')
      console.log('🔑 Authorization 헤더:', config.headers.Authorization)
    } else {
      console.log('⚠️ 토큰이 없어서 Authorization 헤더가 설정되지 않음')
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
    
    // API 오류 로깅
    console.error('API Error:', error.config?.url, error.response?.status, error.message)
    
    return Promise.reject(error)
  }
)

export default api
