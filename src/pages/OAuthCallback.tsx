import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { setTokens } from '../libs/utils/auth'
import { useAuth } from '../contexts/AuthContext'

export default function OAuthCallback() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { refreshAuthState } = useAuth()

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        // URL에서 토큰 정보 추출
        const accessToken = searchParams.get('access_token')
        const refreshToken = searchParams.get('refresh_token')
        const error = searchParams.get('error')

        if (error) {
          console.error('OAuth 에러:', error)
          toast.error('소셜 로그인에 실패했습니다.')
          navigate('/login')
          return
        }

        if (accessToken) {
          // 토큰 저장
          setTokens(accessToken, refreshToken || '')
          refreshAuthState() // 인증 상태 업데이트
          
          toast.success('로그인이 완료되었습니다!')
          navigate('/')
        } else {
          throw new Error('토큰을 받지 못했습니다.')
        }
      } catch (error) {
        console.error('OAuth 콜백 처리 오류:', error)
        toast.error('로그인 처리 중 오류가 발생했습니다.')
        navigate('/login')
      }
    }

    handleOAuthCallback()
  }, [searchParams, navigate, refreshAuthState])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="loading loading-spinner loading-lg text-primary mb-4"></div>
        <p className="text-lg">로그인 처리 중...</p>
        <p className="text-sm text-gray-500 mt-2">잠시만 기다려주세요.</p>
      </div>
    </div>
  )
}
