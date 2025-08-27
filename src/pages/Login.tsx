import { useForm } from 'react-hook-form'
import { toast } from 'react-hot-toast'

interface LoginForm {
  email: string
  password: string
}

export default function Login() {
  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>()

  const onSubmit = (data: LoginForm) => {
    // TODO: Implement login logic
    console.log('Login data:', data)
    toast.success('로그인 요청이 전송되었습니다.')
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
