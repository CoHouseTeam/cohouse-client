import axios from 'axios'

const isMock = import.meta.env.DEV && import.meta.env.VITE_USE_MSW === 'true'

const api = axios.create({
  baseURL: isMock
    ? '/api' // DEV + MSW일 때는 /api (상대경로)로 통일 → MSW가 잡음
    : import.meta.env.PROD 
      ? '/api/proxy' // 프로덕션에서는 프록시 사용
      : import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000',
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
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
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
  (error) => {
    if (error.response?.status === 401) {
      // TODO: Handle 401 unauthorized
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    
    // 프로덕션에서 API 오류 시 임시 Mock 데이터 제공
    if (import.meta.env.PROD && error.config?.url) {
      console.warn('API Error, providing fallback data:', error.config.url)
      
      // settlements API용 Mock 데이터
      if (error.config.url.includes('settlements')) {
        return Promise.resolve({
          data: [],
          status: 200,
          statusText: 'OK (Mock Data)'
        })
      }
      
      // tasks API용 Mock 데이터
      if (error.config.url.includes('tasks')) {
        return Promise.resolve({
          data: [],
          status: 200,
          statusText: 'OK (Mock Data)'
        })
      }
    }
    
    return Promise.reject(error)
  }
)

export default api
