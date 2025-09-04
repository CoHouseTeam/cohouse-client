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
 * 백엔드 API에서 현재 사용자 프로필 정보 가져오기
 */
export const getCurrentUserProfile = async (): Promise<{ memberId: number; email: string; name: string } | null> => {
  try {
    // 동적 import로 순환 참조 방지
    const { default: api } = await import('../api/axios')
    const { PROFILE_ENDPOINTS } = await import('../api/endpoints')
    
    console.log('🔍 백엔드에서 사용자 프로필 가져오기 시도...')
    const response = await api.get(PROFILE_ENDPOINTS.GET)
    console.log('✅ 백엔드 프로필 응답:', response.data)
    
    return response.data
  } catch (error) {
    console.error('❌ 백엔드에서 프로필 가져오기 실패:', error)
    return null
  }
}

/**
 * JWT 토큰에서 사용자 정보 추출
 */
export const getCurrentUser = (): { memberId: number; email: string; name: string } | null => {
  try {
    const token = getAccessToken()
    if (!token) {
      console.log('❌ 액세스 토큰이 없습니다.')
      return null
    }

    console.log('🔍 JWT 토큰 분석 시작:', {
      tokenLength: token.length,
      tokenStart: token.substring(0, 20) + '...',
      tokenEnd: '...' + token.substring(token.length - 20)
    })

    // JWT 토큰 구조 확인
    const tokenParts = token.split('.')
    if (tokenParts.length !== 3) {
      console.error('❌ 잘못된 JWT 토큰 형식:', tokenParts.length, 'parts')
      return null
    }

    console.log('🔍 JWT 토큰 구조:', {
      headerLength: tokenParts[0].length,
      payloadLength: tokenParts[1].length,
      signatureLength: tokenParts[2].length
    })

    // Base64 디코딩 (안전한 방법)
    let payload
    try {
      // Base64 URL 안전 디코딩
      const base64 = tokenParts[1].replace(/-/g, '+').replace(/_/g, '/')
      const jsonPayload = decodeURIComponent(escape(atob(base64)))
      payload = JSON.parse(jsonPayload)
      console.log('✅ Base64 URL 안전 디코딩 성공')
    } catch (decodeError) {
      console.error('❌ JWT 페이로드 디코딩 실패:', decodeError)
      // 대안: 직접 디코딩 시도
      try {
        payload = JSON.parse(atob(tokenParts[1]))
        console.log('✅ 직접 디코딩 성공')
      } catch (fallbackError) {
        console.error('❌ JWT 페이로드 fallback 디코딩도 실패:', fallbackError)
        return null
      }
    }

    console.log('🔍 JWT 페이로드 전체:', payload)
    console.log('🔍 JWT 페이로드 키들:', Object.keys(payload))
    
    // memberId 추출 (여러 가능한 필드명 시도)
    const memberId = payload.memberId || payload.sub || payload.userId || payload.id || payload.member_id
    console.log('🔍 추출된 memberId:', memberId)
    console.log('🔍 시도한 필드들:', {
      memberId: payload.memberId,
      sub: payload.sub,
      userId: payload.userId,
      id: payload.id,
      member_id: payload.member_id
    })
    
    if (!memberId) {
      console.log('⚠️ JWT에 memberId가 없습니다. 사용 가능한 필드:', Object.keys(payload))
      console.log('🔍 JWT 내용:', {
        iss: payload.iss,
        email: payload.email,
        name: payload.name
      })
      
      // memberId가 없는 경우, name을 사용해서 임시 식별
      // 실제로는 백엔드에서 JWT에 memberId를 포함시켜야 합니다
      console.log('�� memberId가 없어서 name으로 임시 식별합니다.')
      return {
        memberId: -1, // 임시 값 (실제로는 사용할 수 없음)
        email: payload.email || '',
        name: payload.name || ''
      }
    }
    
    const result = {
      memberId: Number(memberId),
      email: payload.email || payload.mail || '',
      name: payload.name || ''
    }
    
    console.log('✅ 최종 사용자 정보:', result)
    return result
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
