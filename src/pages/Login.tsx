import { useForm } from 'react-hook-form'
import { toast } from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import api from '../libs/api/axios'
import { setTokens } from '../libs/utils/auth'
import { useAuth } from '../contexts/AuthContext'
import { AUTH_ENDPOINTS } from '../libs/api/endpoints'

interface LoginForm {
  email: string
  password: string
}

export default function Login() {
  const navigate = useNavigate()
  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>()
  const { refreshAuthState } = useAuth()

  const onSubmit = async (data: LoginForm) => {
    console.log('Login data:', data)
    try {
      const response = await api.post(AUTH_ENDPOINTS.LOGIN, {
        email: data.email,
        password: data.password
      })

      // 토큰 저장
      const { accessToken, refreshToken } = response.data
      
      if (accessToken) {
        setTokens(accessToken, refreshToken)
        refreshAuthState() // 🔄 인증 상태 즉시 업데이트
      } else {
        console.error('응답에 accessToken이 없습니다:', response.data)
        toast.error('로그인 응답이 올바르지 않습니다.')
        return
      }

      toast.success('로그인이 완료되었습니다!')
      navigate('/')
    } catch (error: any) {
      console.error('로그인 오류:', error)
      
      if (error.response?.status === 401) {
        toast.error('이메일 또는 비밀번호가 잘못되었습니다.')
      } else if (error.response?.status === 400) {
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
                    message: '유효한 이메일을 입력해주세요'
                  }
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
                    message: '비밀번호는 최소 6자 이상이어야 합니다'
                  }
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
                <input type="checkbox" className="checkbox checkbox-primary rounded" />
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
