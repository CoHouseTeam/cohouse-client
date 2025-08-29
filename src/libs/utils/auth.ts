// 토큰 관리 유틸리티 함수

import { useGroupStore } from '../../app/store'

/**
 * 토큰을 localStorage에 저장
 */
export const setTokens = (accessToken: string, refreshToken?: string) => {
  localStorage.setItem('accessToken', accessToken)
  console.log('✅ Access Token 저장됨', accessToken)

  if (refreshToken) {
    localStorage.setItem('refreshToken', refreshToken)
    console.log('✅ Refresh Token 저장됨', refreshToken)
  }
}

/**
 * localStorage에서 액세스 토큰 가져오기
 */
export const getAccessToken = (): string | null => {
  return localStorage.getItem('accessToken')
}

/**
 * localStorage에서 리프레시 토큰 가져오기
 */
export const getRefreshToken = (): string | null => {
  return localStorage.getItem('refreshToken')
}

/**
 * 모든 토큰 제거 (로그아웃)
 */
export const clearTokens = () => {
  localStorage.removeItem('accessToken')
  localStorage.removeItem('refreshToken')
  console.log('🗑️ 모든 토큰 제거됨')
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
