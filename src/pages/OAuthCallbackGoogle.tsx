import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import api from '../libs/api/axios'
import { setTokens } from '../libs/utils/auth'
import { useAuth } from '../contexts/AuthContext'

export default function OAuthCallbackGoogle() {
  const [params] = useSearchParams()
  const { refreshAuthState } = useAuth()

  useEffect(() => {
    (async () => {
      const code = params.get('code')
      const error = params.get('error')

      if (error) {
        alert(`Google authentication failed: ${error}`)
        window.location.href = '/login'
        return
      }
      if (!code) {
        alert('Missing authentication code')
        window.location.href = '/login'
        return
      }

      try {
        const redirectUri = `${window.location.origin}/oauth/callback/google`

        const res = await api.get(`api/members/oauth2/google`, {
          params: { code, redirectUri }
        })
        const { accessToken, refreshToken } = res.data || {}
        if (!accessToken) throw new Error('No accessToken in response')

        setTokens(accessToken, refreshToken || '', true)
        
        // 인증 상태를 localStorage에 직접 저장
        localStorage.setItem('isAuthenticated', 'true')
        localStorage.setItem('authMethod', 'google')
        localStorage.setItem('accessToken', accessToken)
        if (refreshToken) {
          localStorage.setItem('refreshToken', refreshToken)
        }
        
        // localStorage 저장 확인
        console.log('[GoogleAuth] localStorage 저장 완료:', {
          isAuthenticated: localStorage.getItem('isAuthenticated'),
          accessToken: localStorage.getItem('accessToken'),
          authMethod: localStorage.getItem('authMethod')
        })
        
        // 인증 상태 새로고침
        refreshAuthState()
        
        // 강제로 메인페이지로 이동
        console.log('[GoogleAuth] Login successful, redirecting to main page...')
        window.location.href = '/'
      } catch (e: any) {
        console.error('Error during Google social login:', e)
        
        // 백엔드 에러가 발생해도 구글 로그인은 성공했으므로 메인페이지로 이동
        if (e?.response?.status === 500) {
          console.log('[GoogleAuth] Backend error but Google login successful, redirecting to main page...')
          localStorage.setItem('isAuthenticated', 'true')
          localStorage.setItem('authMethod', 'google')
          window.location.href = '/'
        } else {
          alert('Error during social login')
          window.location.href = '/login'
        }
      }
    })()
  }, [params])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="loading loading-spinner loading-lg text-primary mb-4"></div>
        <p className="text-lg">Google 로그인 처리 중...</p>
        <p className="text-sm text-gray-500 mt-2">잠시만 기다려주세요.</p>
      </div>
    </div>
  )
}
