import { useForm } from 'react-hook-form'
import { toast } from 'react-hot-toast'

interface LoginFormData {
  email: string
  password: string
}

export function LoginForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>()

  const onSubmit = (data: LoginFormData) => {
    // TODO: Implement login logic
    console.log('Login data:', data)
    toast.success('로그인 요청이 전송되었습니다.')
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="form-control">
        <label className="label">
          <span className="label-text">이메일</span>
        </label>
        <input
          type="email"
          placeholder="이메일을 입력하세요"
          className="input input-bordered"
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
          <span className="label-text">비밀번호</span>
        </label>
        <input
          type="password"
          placeholder="비밀번호를 입력하세요"
          className="input input-bordered"
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

      <div className="form-control mt-6">
        <button type="submit" className="btn btn-primary">
          로그인
        </button>
      </div>
    </form>
  )
}
