import { useForm } from 'react-hook-form'
import { toast } from 'react-hot-toast'
import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import { AUTH_ENDPOINTS } from '../libs/api/endpoints'
import api from '../libs/api/axios'

interface ForgotPasswordForm {
  name: string
  email: string
}

export default function ForgotPassword() {
  const { register, handleSubmit, formState: { errors } } = useForm<ForgotPasswordForm>()

  const onSubmit = async (data: ForgotPasswordForm) => {
    try {
      const response = await api.post(AUTH_ENDPOINTS.FORGOT_PASSWORD, {
        email: data.email,
        name: data.name
      })
      
      toast.success(response.data.message || '임시 비밀번호가 이메일로 전송되었습니다.')
    } catch (error: unknown) {
      console.error('비밀번호 찾기 실패:', error)
      const errorMessage = error instanceof Error && 'response' in error 
        ? (error as { response?: { data?: { message?: string } } }).response?.data?.message 
        : '비밀번호 찾기에 실패했습니다.'
      toast.error(errorMessage || '비밀번호 찾기에 실패했습니다.')
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-8 px-4">
      <div className="card w-full max-w-md bg-base-200 shadow-xl">
        <div className="card-body p-6 sm:p-8">
          {/* 뒤로가기 버튼 */}
          <div className="mb-4">
            <Link to="/login" className="btn btn-ghost btn-sm gap-2 rounded-lg">
              <ArrowLeft className="w-4 h-4" />
              로그인으로 돌아가기
            </Link>
          </div>
          
          <h2 className="card-title text-2xl font-bold text-center mb-8 justify-center">비밀번호 찾기</h2>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* 이름 입력 */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">이름</span>
              </label>
              <input
                type="text"
                placeholder="이름을 입력하세요"
                className="input input-bordered focus:input-primary rounded-lg"
                {...register('name', { 
                  required: '이름을 입력해주세요',
                  minLength: {
                    value: 2,
                    message: '이름은 최소 2자 이상이어야 합니다'
                  }
                })}
              />
              {errors.name && (
                <label className="label">
                  <span className="label-text-alt text-error">{errors.name.message}</span>
                </label>
              )}
            </div>

            {/* 이메일 입력 */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">이메일</span>
              </label>
              <input
                type="email"
                placeholder="이메일을 입력하세요"
                className="input input-bordered focus:input-primary rounded-lg"
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

            {/* 비밀번호 찾기 버튼 */}
            <div className="form-control mt-8">
              <button 
                type="submit" 
                className="btn btn-primary h-12 rounded-lg"
              >
                임시 비밀번호 발송
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
