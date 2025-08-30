import { useForm } from 'react-hook-form'
import { toast } from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import api from '../libs/api/axios'
import { setTokens, isRememberMeEnabled } from '../libs/utils/auth'
import { useAuth } from '../contexts/AuthContext'
import { AUTH_ENDPOINTS, GROUP_ENDPOINTS } from '../libs/api/endpoints'
import { useGroupStore } from '../app/store'

interface LoginForm {
  email: string
  password: string
}

export default function Login() {
  const navigate = useNavigate()
  const [rememberMe, setRememberMe] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>()
  const { refreshAuthState } = useAuth()
  const setHasGroups = useGroupStore((state) => state.setHasGroups)

  // 컴포넌트 마운트 시 기존 로그인 유지하기 상태 확인
  useEffect(() => {
    const wasRememberMeEnabled = isRememberMeEnabled()
    setRememberMe(wasRememberMeEnabled)
  }, [])

  // 구글 소셜로그인
  const handleGoogleLogin = () => {
    try {
      // 구글 OAuth URL로 리다이렉트
      const googleAuthUrl = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'}/api/members/oauth2/google`
      window.location.href = googleAuthUrl
    } catch (error) {
      console.error('구글 로그인 오류:', error)
      toast.error('구글 로그인에 실패했습니다.')
    }
  }

  // 네이버 소셜로그인
  const handleNaverLogin = () => {
    try {
      // 네이버 OAuth URL로 리다이렉트
      const naverAuthUrl = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'}/api/members/oauth2/naver`
      window.location.href = naverAuthUrl
    } catch (error) {
      console.error('네이버 로그인 오류:', error)
      toast.error('네이버 로그인에 실패했습니다.')
    }
  }

  const onSubmit = async (data: LoginForm) => {
    console.log('Login data:', data)
    try {
      const response = await api.post(AUTH_ENDPOINTS.LOGIN, {
        email: data.email,
        password: data.password,
      })

      // 토큰 저장 (로그인 유지하기 옵션 포함)
      const { accessToken, refreshToken } = response.data

      if (accessToken) {
        setTokens(accessToken, refreshToken, rememberMe)
        refreshAuthState() // 🔄 인증 상태 즉시 업데이트
        //그룹 상태 확인
        try {
          const groupRes = await api.get(GROUP_ENDPOINTS.MY_GROUPS)
          const data = groupRes.data
          const hasGroups = Array.isArray(data) ? data.length > 0 : data != null
          setHasGroups(hasGroups)
        } catch (e) {
          console.error('그룹 목록 조회 중 에러:', e)
          setHasGroups(false)
        }
      } else {
        console.error('응답에 accessToken이 없습니다:', response.data)
        toast.error('로그인 응답이 올바르지 않습니다.')
        return
      }

      toast.success('로그인이 완료되었습니다!')
      navigate('/')
    } catch (error: unknown) {
      console.error('로그인 오류:', error)

      const axiosError = error as { response?: { status?: number; data?: { message?: string } } }
      if (axiosError.response?.status === 401) {
        toast.error('이메일 또는 비밀번호가 잘못되었습니다.')
      } else if (axiosError.response?.status === 400) {
        toast.error('입력 정보를 확인해주세요.')
      } else {
        toast.error('로그인에 실패했습니다. 다시 시도해주세요.')
      }
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-8 px-4">
      <div className="card w-full max-w-md bg-base-200 shadow-xl">
        <div className="card-body p-6 sm:p-8">
          <h2 className="card-title text-2xl font-bold text-center mb-8 justify-center">로그인</h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">이메일</span>
              </label>
              <input
                type="email"
                placeholder="이메일을 입력하세요"
                className="input input-bordered rounded-lg focus:input-primary"
                {...register('email', {
                  required: '이메일을 입력해주세요',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: '유효한 이메일을 입력해주세요',
                  },
                })}
              />
              {errors.email && (
                <label className="label">
                  <span className="label-text-alt text-error">{errors.email.message}</span>
                </label>
              )}
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">비밀번호</span>
              </label>
              <input
                type="password"
                placeholder="비밀번호를 입력하세요"
                className="input input-bordered rounded-lg focus:input-primary"
                {...register('password', {
                  required: '비밀번호를 입력해주세요',
                  minLength: {
                    value: 6,
                    message: '비밀번호는 최소 6자 이상이어야 합니다',
                  },
                })}
              />
              {errors.password && (
                <label className="label">
                  <span className="label-text-alt text-error">{errors.password.message}</span>
                </label>
              )}
            </div>

            <div className="form-control">
              <label className="cursor-pointer flex items-center gap-3">
                <input 
                  type="checkbox" 
                  className="checkbox checkbox-primary rounded" 
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span className="label-text">로그인 유지하기</span>
              </label>
            </div>

            <div className="form-control mt-8 rounded-lg">
              <button type="submit" className="btn btn-custom btn-primary h-12">
                로그인
              </button>
            </div>
          </form>

          <div className="divider my-6">또는</div>

          {/* 소셜 로그인 */}
          <div className="space-y-3">
            {/* 구글 로그인 */}
            <button 
              type="button"
              onClick={handleGoogleLogin}
              className="btn btn-outline w-full h-12 rounded-lg border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 hover:scale-[1.02]"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              구글로 로그인
            </button>

            {/* 네이버 로그인 */}
            <button 
              type="button"
              onClick={handleNaverLogin}
              className="btn w-full h-12 rounded-lg transition-all duration-200 text-white border-0 hover:scale-[1.02] hover:opacity-90"
              style={{ backgroundColor: '#03C75A' }}
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M16.273 12.845 7.376 0H0v24h7.726V11.156L16.624 24H24V0h-7.727v12.845Z"/>
              </svg>
              네이버로 로그인
            </button>
          </div>

          <div className="divider my-6">계정이 없으신가요?</div>
        
          <div className="flex justify-between">
            <a href="/register" className="link link-primary font-medium">
              회원가입
            </a>
            <a href="/forgot-password" className="link link-primary font-medium">
              비밀번호 찾기
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
