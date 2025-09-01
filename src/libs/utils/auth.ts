// 토큰 관리 유틸리티 함수

import { useGroupStore } from '../../app/store'

/**
 * 토큰을 localStorage에 저장
 */
export const setTokens = (accessToken: string, refreshToken?: string, rememberMe: boolean = false) => {
  if (rememberMe) {
    // 로그인 유지하기: localStorage 사용 (장기간 보관)
    localStorage.setItem('accessToken', accessToken)
    localStorage.setItem('rememberMe', 'true')
    console.log('✅ Access Token 저장됨 (로그인 유지)', accessToken)

    if (refreshToken) {
      localStorage.setItem('refreshToken', refreshToken)
      console.log('✅ Refresh Token 저장됨 (로그인 유지)', refreshToken)
    }
  } else {
    // 일반 로그인: sessionStorage 사용 (브라우저 종료 시 삭제)
    sessionStorage.setItem('accessToken', accessToken)
    console.log('✅ Access Token 저장됨 (일반 로그인)', accessToken)

    if (refreshToken) {
      sessionStorage.setItem('refreshToken', refreshToken)
      console.log('✅ Refresh Token 저장됨 (일반 로그인)', refreshToken)
    }
  }
}

/**
 * localStorage에서 액세스 토큰 가져오기
 */
export const getAccessToken = (): string | null => {
  // 로그인 유지하기가 활성화되어 있으면 localStorage에서, 아니면 sessionStorage에서
  const rememberMe = localStorage.getItem('rememberMe') === 'true'
  const storage = rememberMe ? localStorage : sessionStorage
  return storage.getItem('accessToken')
}

/**
 * localStorage에서 리프레시 토큰 가져오기
 */
export const getRefreshToken = (): string | null => {
  // 로그인 유지하기가 활성화되어 있으면 localStorage에서, 아니면 sessionStorage에서
  const rememberMe = localStorage.getItem('rememberMe') === 'true'
  const storage = rememberMe ? localStorage : sessionStorage
  return storage.getItem('refreshToken')
}

/**
 * JWT 토큰에서 사용자 정보 추출
 */
export const getCurrentUser = (): { memberId: number; email: string } | null => {
  try {
    const token = getAccessToken()
    if (!token) {
      console.log('❌ 액세스 토큰이 없습니다.')
      return null
    }

    const payload = JSON.parse(atob(token.split('.')[1]))
    console.log('🔍 JWT 페이로드:', payload)
    
    const memberId = payload.memberId || payload.sub || payload.userId || payload.id
    console.log('🔍 추출된 memberId:', memberId)
    
    return {
      memberId: memberId,
      email: payload.email
    }
  } catch (error) {
    console.error('토큰에서 사용자 정보 추출 실패:', error)
    return null
  }
}

/**
 * 현재 사용자의 memberId 가져오기
 */
export const getCurrentMemberId = (): number | null => {
  const user = getCurrentUser()
  console.log('🔍 getCurrentMemberId 호출 결과:', user)
  return user?.memberId || null
}

/**
 * 모든 토큰 제거 (로그아웃)
 */
export const clearTokens = () => {
  // localStorage와 sessionStorage 모두에서 제거
  localStorage.removeItem('accessToken')
  localStorage.removeItem('refreshToken')
  localStorage.removeItem('rememberMe')
  sessionStorage.removeItem('accessToken')
  sessionStorage.removeItem('refreshToken')
  console.log('🗑️ 모든 토큰 제거됨')
}

/**
 * 로그인 유지하기 상태 확인
 */
export const isRememberMeEnabled = (): boolean => {
  return localStorage.getItem('rememberMe') === 'true'
}

/**
 * 사용자가 로그인되어 있는지 확인
 */
export const isAuthenticated = (): boolean => {
  const token = getAccessToken()
  return !!token
}

/**
 * 토큰 만료 여부 확인 (JWT 디코딩)
 */
export const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    const currentTime = Date.now() / 1000
    return payload.exp < currentTime
  } catch (error) {
    console.error('토큰 파싱 오류:', error)
    return true // 파싱 실패 시 만료된 것으로 간주
  }
}

/**
 * 로그아웃 처리 (백엔드 API 호출)
 */
export const logout = async () => {
  try {
    // 동적 import로 순환 참조 방지
    const { default: api } = await import('../api/axios')
    const { AUTH_ENDPOINTS } = await import('../api/endpoints')

    console.log('로그아웃 API 호출...')
    await api.post(AUTH_ENDPOINTS.LOGOUT)
    console.log('로그아웃 API 호출 완료')
  } catch (error) {
    console.error('로그아웃 API 오류:', error)
    // API 오류가 있어도 로컬 토큰은 제거
  } finally {
    // 항상 로컬 토큰 제거 및 리다이렉트
    clearTokens()
    // 그룹 상태 초기화
    useGroupStore.setState({ hasGroups: false })
    window.location.href = '/login'
  }
}
