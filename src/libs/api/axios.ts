import axios, { AxiosRequestHeaders } from 'axios'
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
  // headers: { 'Content-Type': 'application/json' },
})

// ────────────────────────────────────────────────────────────────────────────
// Content-Type 자동 분기 인터셉터
//  - FormData이면 Content-Type 제거 → 브라우저/axios가 boundary 포함해 자동 세팅
//  - 그 외(JSON 등)에는 명시가 없을 때 기본 'application/json' 부여
//  - 호출부에서 일부러 Content-Type을 지정한 경우(예: 파일 아닌 특수타입)는 존중
// ────────────────────────────────────────────────────────────────────────────
api.interceptors.request.use((config) => {
  // headers 객체 보정
  config.headers = config.headers ?? {}

  const headers = config.headers as AxiosRequestHeaders

  // 호출부가 이미 Content-Type을 명시했는지 확인
  const hasExplicitCT = Object.keys(config.headers).some((k) => k.toLowerCase() === 'content-type')

  const isFormData = typeof FormData !== 'undefined' && config.data instanceof FormData

  if (isFormData) {
    // 멀티파트는 절대 수동 지정 금지 → 삭제하여 boundary 자동 세팅 유도
    Object.keys(config.headers).forEach((k) => {
      if (k.toLowerCase() === 'content-type') {
        delete headers[k] // [중요]
      }
    })
  } else {
    // JSON 계열: 호출부에서 명시 안 했다면 기본값 부여
    if (!hasExplicitCT) {
      headers['Content-Type'] = 'application/json'
    }
  }

  return config
})

// ★ 디버깅 로그: 최종 요청이 뭔지 무조건 찍자
api.interceptors.request.use((c) => {
  // API 요청 로그
  return c
})

// Request interceptor - attach auth token
api.interceptors.request.use(
  (config) => {
    const token = getAccessToken()
    // 토큰 확인

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
      // 토큰 첨부됨
    } else {
      // 토큰이 없어서 Authorization 헤더가 설정되지 않음
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
