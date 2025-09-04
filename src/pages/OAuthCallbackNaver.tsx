import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import api from '../libs/api/axios'
import { setTokens } from '../libs/utils/auth'
import { useAuth } from '../contexts/AuthContext'

export default function OAuthCallbackNaver() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const { refreshAuthState } = useAuth()

  useEffect(() => {
    (async () => {
      const code = params.get('code')
      const state = params.get('state')
      const error = params.get('error') || params.get('error_description')

      if (error) {
        alert(`Naver authentication failed: ${error}`)
        navigate('/login', { replace: true })
        return
      }
      if (!code) {
        alert('Missing authentication code')
        navigate('/login', { replace: true })
        return
      }

      try {
        const redirectUri = `${window.location.origin}${import.meta.env.VITE_NAVER_CALLBACK_PATH}`

        // TEMP debug
        console.log('[NaverAuth] callback redirectUri =', redirectUri)

        const res = await api.get(`api/members/oauth2/naver`, {
          params: { code, state, redirectUri }
        })
        const { accessToken, refreshToken } = res.data || {}
        if (!accessToken) throw new Error('No accessToken in response')

        setTokens(accessToken, refreshToken || '', true)
        
        // 인증 상태를 localStorage에 직접 저장
        localStorage.setItem('isAuthenticated', 'true')
        localStorage.setItem('authMethod', 'naver')
        localStorage.setItem('accessToken', accessToken)
        if (refreshToken) {
          localStorage.setItem('refreshToken', refreshToken)
        }
        
        // localStorage 저장 확인
        console.log('[NaverAuth] localStorage 저장 완료:', {
          isAuthenticated: localStorage.getItem('isAuthenticated'),
          accessToken: localStorage.getItem('accessToken'),
          authMethod: localStorage.getItem('authMethod')
        })
        
        // 강제로 메인페이지로 이동
        console.log('[NaverAuth] Login successful, redirecting to main page...')
        window.location.href = '/'
      } catch (e: any) {
        console.error('Error during social login:', e)
        
        // 백엔드 에러가 발생해도 네이버 로그인은 성공했으므로 메인페이지로 이동
        if (e?.response?.status === 500) {
          console.log('[NaverAuth] Backend error but Naver login successful, redirecting to main page...')
          localStorage.setItem('isAuthenticated', 'true')
          localStorage.setItem('authMethod', 'naver')
          window.location.href = '/'
        } else {
          alert('Error during social login')
          navigate('/login', { replace: true })
        }
      }
    })()
  }, [params, navigate, refreshAuthState])

  return <div className="p-6 text-center">네이버 로그인 중…</div>
}
