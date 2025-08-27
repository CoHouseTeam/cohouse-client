import { useForm } from 'react-hook-form'
import { toast } from 'react-hot-toast'
import { useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'

interface ForgotPasswordForm {
  name: string
  email: string
  verificationCode: string
}

export default function ForgotPassword() {
  const [showVerification, setShowVerification] = useState(false)
  const [verificationSent, setVerificationSent] = useState(false)
  const [isVerified, setIsVerified] = useState(false)

  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm<ForgotPasswordForm>()

  // 이메일 인증 요청
  const handleEmailVerification = () => {
    const email = watch('email')
    const name = watch('name')
    
    if (!name) {
      toast.error('이름을 먼저 입력해주세요.')
      return
    }
    
    if (!email) {
      toast.error('이메일을 먼저 입력해주세요.')
      return
    }
    
    // 이메일 형식 검증
    const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i
    if (!emailRegex.test(email)) {
      toast.error('유효한 이메일을 입력해주세요.')
      return
    }

    setShowVerification(true)
    setVerificationSent(true)
    toast.success('인증번호가 이메일로 전송되었습니다.')
  }

  // 인증번호 확인
  const handleVerificationConfirm = () => {
    const code = watch('verificationCode')
    if (!code) {
      toast.error('인증번호를 입력해주세요.')
      return
    }
    
    // 실제로는 서버에서 인증번호를 확인해야 함
    if (code === '123456') { // 테스트용 인증번호
      setIsVerified(true)
      toast.success('이메일 인증이 완료되었습니다.')
    } else {
      toast.error('인증번호가 올바르지 않습니다.')
    }
  }

  const onSubmit = (data: ForgotPasswordForm) => {
    if (!isVerified) {
      toast.error('이메일 인증을 완료해주세요.')
      return
    }
    
    console.log('Forgot password data:', data)
    toast.success('임시 비밀번호가 이메일로 전송되었습니다.')
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
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="이메일을 입력하세요"
                  className="input input-bordered flex-1 focus:input-primary rounded-lg"
                  {...register('email', { 
                    required: '이메일을 입력해주세요',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: '유효한 이메일을 입력해주세요'
                    }
                  })}
                />
                <button
                  type="button"
                  className="btn btn-primary btn-sm whitespace-nowrap h-12 rounded-lg text-sm"
                  onClick={handleEmailVerification}
                >
                  인증
                </button>
              </div>
              {errors.email && (
                <label className="label">
                  <span className="label-text-alt text-error">{errors.email.message}</span>
                </label>
              )}
            </div>

            {/* 인증번호 입력 */}
            {showVerification && (
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">인증번호</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="인증번호를 입력하세요"
                    className="input input-bordered flex-1 focus:input-primary rounded-lg"
                    {...register('verificationCode', { 
                      required: '인증번호를 입력해주세요'
                    })}
                  />
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm whitespace-nowrap h-12 rounded-lg text-sm"
                    onClick={handleVerificationConfirm}
                  >
                    확인
                  </button>
                </div>
                {errors.verificationCode && (
                  <label className="label">
                    <span className="label-text-alt text-error">{errors.verificationCode.message}</span>
                  </label>
                )}
                {verificationSent && (
                  <label className="label">
                    <span className="label-text-alt text-info">인증번호: 123456 (테스트용)</span>
                  </label>
                )}
                {isVerified && (
                  <label className="label">
                    <span className="label-text-alt text-success">✓ 이메일 인증 완료</span>
                  </label>
                )}
              </div>
            )}

            {/* 비밀번호 찾기 버튼 */}
            <div className="form-control mt-8">
              <button 
                type="submit" 
                className="btn btn-primary h-12 rounded-lg"
                disabled={!isVerified}
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
