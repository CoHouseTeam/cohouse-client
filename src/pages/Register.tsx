import { useForm } from 'react-hook-form'
import { toast } from 'react-hot-toast'
import { useState } from 'react'
import { X, ArrowLeft } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../libs/api/axios'
import { AUTH_ENDPOINTS } from '../libs/api/endpoints'

interface RegisterForm {
  email: string
  name: string
  password: string
  confirmPassword: string
  marketingAgreement: boolean
  termsAgreement: boolean
  privacyAgreement: boolean
  allAgreement: boolean
}

export default function Register() {
  const navigate = useNavigate()
  const [emailChecked, setEmailChecked] = useState(false)
  const [isCheckingEmail, setIsCheckingEmail] = useState(false)
  const [isRegistering, setIsRegistering] = useState(false)
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false)
  const [showTermsModal, setShowTermsModal] = useState(false)
  const [showPrivacyModal, setShowPrivacyModal] = useState(false)
  const [showMarketingModal, setShowMarketingModal] = useState(false) // 마케팅 모달 상태
  const [modalType, setModalType] = useState<'terms' | 'privacy' | 'marketing'>('terms')

  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm<RegisterForm>({
    defaultValues: {
      email: '',
      name: '',
      password: '',
      confirmPassword: '',
      marketingAgreement: false,
      termsAgreement: false,
      privacyAgreement: false,
      allAgreement: false
    }
  })

  const watchedPassword = watch('password')
  const watchedAllAgreement = watch('allAgreement') || false

  // 전체 동의 체크박스 처리
  const handleAllAgreement = (checked: boolean) => {
    setValue('allAgreement', checked)
    setValue('termsAgreement', checked)
    setValue('privacyAgreement', checked)
    setValue('marketingAgreement', checked)
  }

  // 개별 동의 체크박스 처리
  const handleIndividualAgreement = (field: keyof RegisterForm, checked: boolean) => {
    setValue(field, checked)
    
    // 모든 필수 동의가 체크되었는지 확인
    const termsChecked = field === 'termsAgreement' ? checked : watch('termsAgreement')
    const privacyChecked = field === 'privacyAgreement' ? checked : watch('privacyAgreement')
    const marketingChecked = field === 'marketingAgreement' ? checked : watch('marketingAgreement')
    
    setValue('allAgreement', termsChecked && privacyChecked && marketingChecked)
  }

  // 이메일 중복 확인
  const handleEmailCheck = async () => {
    const email = watch('email')
    
    // 디버깅: 환경 변수 확인
    console.log('Environment Debug:', {
      DEV: import.meta.env.DEV,
      PROD: import.meta.env.PROD,
      VITE_USE_MSW: import.meta.env.VITE_USE_MSW,
      VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL
    })
    
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

    setIsCheckingEmail(true)
    
    try {
      // 환경변수 기반 API 호출
      const response = await api.post(AUTH_ENDPOINTS.CHECK_EMAIL, {
        email: email
      })
      
      if (response.data.isDuplicate) {
        toast.error('이미 사용 중인 이메일입니다.')
        setEmailChecked(false)
      } else {
        toast.success('사용 가능한 이메일입니다.')
        setEmailChecked(true)
      }
    } catch (error) {
      toast.error('이메일 확인에 실패했습니다.')
      setEmailChecked(false)
    } finally {
      setIsCheckingEmail(false)
    }
  }

  // 회원가입 처리
  const handleRegister = async (data: RegisterForm) => {
    // 이메일 중복 확인 여부 체크
    if (!emailChecked) {
      toast.error('이메일 중복 확인을 먼저 해주세요.')
      return
    }

    // 비밀번호 확인
    if (data.password !== data.confirmPassword) {
      toast.error('비밀번호가 일치하지 않습니다.')
      return
    }

    // 필수 약관 동의 확인
    if (!data.termsAgreement || !data.privacyAgreement) {
      toast.error('필수 약관에 동의해주세요.')
      return
    }
    
    setIsRegistering(true)

    try {
      // 환경변수 기반 API 호출
      await api.post(AUTH_ENDPOINTS.SIGNUP, {
        email: data.email,
        name: data.name,
        password: data.password
      })

      toast.success('회원가입이 완료되었습니다!')
      navigate('/login')
    } catch (error: unknown) {
      const axiosError = error as { response?: { status?: number; data?: { message?: string } } }
      if (axiosError.response?.status === 400) {
        toast.error('입력 정보를 다시 확인해주세요.')
      } else if (axiosError.response?.status === 409) {
        toast.error('이미 존재하는 이메일입니다.')
    } else {
        toast.error('회원가입에 실패했습니다.')
      }
    } finally {
      setIsRegistering(false)
    }
  }

  // 모달 열기
  const openModal = (type: 'terms' | 'privacy' | 'marketing') => {
    setModalType(type)
    switch (type) {
      case 'terms':
        setShowTermsModal(true)
        break
      case 'privacy':
        setShowPrivacyModal(true)
        break
      case 'marketing':
        setShowMarketingModal(true)
        break
    }
  }

  // 모달 닫기
  const closeModal = () => {
    setShowTermsModal(false)
    setShowPrivacyModal(false)
    setShowMarketingModal(false)
  }

  const onSubmit = (data: RegisterForm) => {
    handleRegister(data)
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
          
          <h2 className="card-title text-2xl font-bold text-center mb-8 justify-center">회원가입</h2>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* 이메일 입력 */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">이메일</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="이메일을 입력하세요"
                  className="input input-bordered rounded-lg flex-1 focus:input-primary"
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
                  className="btn btn-neutral btn-sm text-xs px-2 h-12 rounded-lg"
                  onClick={handleEmailCheck}
                  disabled={isCheckingEmail}
                >
                  {isCheckingEmail ? '확인 중...' : '중복 확인'}
                </button>
              </div>
              {errors.email && (
                <label className="label">
                  <span className="label-text-alt text-error">{errors.email.message}</span>
                </label>
              )}
              {emailChecked && (
                <label className="label">
                  <span className="label-text-alt text-success">✓ 사용 가능한 이메일입니다</span>
                  </label>
                )}
              </div>

            {/* 이름 입력 */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">이름</span>
              </label>
              <input
                type="text"
                placeholder="이름을 입력하세요"
                className="input input-bordered rounded-lg focus:input-primary"
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

            {/* 비밀번호 입력 */}
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
                    value: 8,
                    message: '비밀번호는 최소 8자 이상이어야 합니다'
                  },
                  pattern: {
                    value: /^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/,
                    message: '영문, 숫자, 특수문자를 포함해야 합니다'
                  }
                })}
                onChange={(e) => {
                  if (e.target.value.length >= 8) {
                    setShowPasswordConfirm(true)
                  } else {
                    setShowPasswordConfirm(false)
                  }
                }}
              />
              {errors.password && (
                <label className="label">
                  <span className="label-text-alt text-error">{errors.password.message}</span>
                </label>
              )}
            </div>

            {/* 비밀번호 확인 입력 */}
            {showPasswordConfirm && (
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">비밀번호 확인</span>
                </label>
                <input
                  type="password"
                  placeholder="비밀번호를 한 번 더 입력하세요"
                  className="input input-bordered rounded-lg focus:input-primary"
                  {...register('confirmPassword', { 
                    required: '비밀번호를 한 번 더 입력해주세요',
                    validate: (value) => value === watchedPassword || '비밀번호가 일치하지 않습니다'
                  })}
                />
                {errors.confirmPassword && (
                  <label className="label">
                    <span className="label-text-alt text-error">{errors.confirmPassword.message}</span>
                  </label>
                )}
              </div>
            )}

            {/* 동의 체크박스들 */}
            <div className="space-y-4">
              {/* 전체 동의 */}
              <div className="form-control">
                <label className="cursor-pointer flex items-center gap-3 p-3 bg-base-100 rounded-lg border border-base-300">
                  <input 
                    type="checkbox" 
                    className="checkbox checkbox-primary rounded"
                    checked={watchedAllAgreement}
                    onChange={(e) => handleAllAgreement(e.target.checked)}
                  />
                  <span className="label-text font-semibold text-base">전체 동의</span>
                </label>
              </div>

              {/* 개별 동의들 */}
              <div className="ml-6 space-y-3 border-l-2 border-primary/20 pl-4">
                <div className="form-control">
                  <label className="cursor-pointer flex items-center gap-3">
                    <input 
                      type="checkbox" 
                      className="checkbox checkbox-primary rounded"
                      checked={watch('termsAgreement') || false}
                      onChange={(e) => handleIndividualAgreement('termsAgreement', e.target.checked)}
                    />
                    <span className="label-text flex-1">이용약관 동의 <span className="text-error">(필수)</span></span>
                    <button
                      type="button"
                      className="btn btn-ghost btn-xs rounded-lg"
                      onClick={() => openModal('terms')}
                    >
                      전문보기
                    </button>
                  </label>
                </div>

                <div className="form-control">
                  <label className="cursor-pointer flex items-center gap-3">
                    <input 
                      type="checkbox" 
                      className="checkbox checkbox-primary rounded"
                      checked={watch('privacyAgreement') || false}
                      onChange={(e) => handleIndividualAgreement('privacyAgreement', e.target.checked)}
                    />
                    <span className="label-text flex-1">개인정보 수집·이용 동의 <span className="text-error">(필수)</span></span>
                    <button
                      type="button"
                      className="btn btn-ghost btn-xs rounded-lg"
                      onClick={() => openModal('privacy')}
                    >
                      전문보기
                    </button>
                  </label>
                </div>

                <div className="form-control">
                  <label className="cursor-pointer flex items-center gap-3">
                    <input 
                      type="checkbox" 
                      className="checkbox checkbox-primary rounded"
                      checked={watch('marketingAgreement') || false}
                      onChange={(e) => handleIndividualAgreement('marketingAgreement', e.target.checked)}
                    />
                    <span className="label-text flex-1">마케팅 정보 수신 동의 <span className="text-info">(선택)</span></span>
                    <button
                      type="button"
                      className="btn btn-ghost btn-xs rounded-lg"
                      onClick={() => openModal('marketing')}
                    >
                      전문보기
                    </button>
                  </label>
                </div>
              </div>
            </div>

            {/* 회원가입 버튼 */}
            <div className="form-control mt-8">
              <button 
                type="submit" 
                className="btn btn-neutral h-12 rounded-lg"
                disabled={isRegistering || !emailChecked}
              >
                {isRegistering ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    회원가입 중...
                  </>
                ) : (
                  '회원가입'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* 약관 모달들 */}
      {(showTermsModal || showPrivacyModal || showMarketingModal) && (
        <div className="modal modal-open">
          <div className="modal-box rounded-lg max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <h3 className="font-bold text-xl">
                {modalType === 'terms' && '이용약관'}
                {modalType === 'privacy' && '개인정보 수집·이용 동의'}
                {modalType === 'marketing' && '마케팅 정보 수신 동의'}
              </h3>
              <button 
                className="btn btn-sm btn-circle btn-ghost rounded-lg"
                onClick={closeModal}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="prose max-w-none text-sm">
              {modalType === 'terms' && (
                <div className="space-y-4">
                  <h4>제1조 (목적)</h4>
                  <p>이 약관은 CoHouse(이하 "회사")가 제공하는 공동주택 관리 서비스의 이용과 관련하여 회사와 회원과의 권리, 의무 및 책임사항, 기타 필요한 사항을 규정함을 목적으로 합니다.</p>
                  
                  <h4>제2조 (정의)</h4>
                  <p>1. "서비스"라 함은 회사가 제공하는 공동주택 관리 관련 모든 서비스를 의미합니다.<br/>
                  2. "회원"이라 함은 회사의 서비스에 접속하여 이 약관에 따라 회사와 이용계약을 체결하고 회사가 제공하는 서비스를 이용하는 고객을 말합니다.</p>
                  
                  <h4>제3조 (약관의 효력 및 변경)</h4>
                  <p>1. 이 약관은 서비스 화면에 게시하거나 기타의 방법으로 회원에게 공지함으로써 효력이 발생합니다.<br/>
                  2. 회사는 필요한 경우 관련법령을 위배하지 않는 범위에서 이 약관을 변경할 수 있습니다.</p>
                  
                  <h4>제4조 (서비스의 제공)</h4>
                  <p>회사는 다음과 같은 서비스를 제공합니다:<br/>
                  - 할일 관리 서비스<br/>
                  - 정산 관리 서비스<br/>
                  - 게시판 서비스<br/>
                  - 기타 회사가 정하는 서비스</p>
                </div>
              )}

              {modalType === 'privacy' && (
                <div className="space-y-4">
                  <h4>1. 개인정보의 수집·이용 목적</h4>
                  <p>회사는 다음의 목적을 위하여 개인정보를 처리합니다. 처리하고 있는 개인정보는 다음의 목적 이외의 용도로는 이용되지 않으며, 이용 목적이 변경되는 경우에는 개인정보보호법 제18조에 따라 별도의 동의를 받는 등 필요한 조치를 이행할 예정입니다.</p>
                  
                  <h4>2. 수집하는 개인정보 항목</h4>
                  <p>- 필수항목: 이메일, 이름, 비밀번호<br/>
                  - 자동수집항목: IP주소, 쿠키, 서비스 이용기록, 접속로그</p>
                  
                  <h4>3. 개인정보의 보유·이용기간</h4>
                  <p>회원 탈퇴 시까지 (단, 관계법령에 따라 보존이 필요한 경우 해당 기간까지)</p>
                  
                  <h4>4. 개인정보의 파기절차 및 방법</h4>
                  <p>개인정보 보유기간의 경과, 처리목적 달성 등 개인정보가 불필요하게 되었을 때에는 지체없이 해당 개인정보를 파기합니다.</p>
                </div>
              )}

              {modalType === 'marketing' && (
                <div className="space-y-4">
                  <h4>마케팅 정보 수신 동의</h4>
                  <p>회사는 회원에게 다양한 혜택과 정보를 제공하기 위해 마케팅 정보를 전달할 수 있습니다.</p>
                  
                  <h4>수신 정보</h4>
                  <p>- 이메일을 통한 서비스 관련 정보 및 혜택 안내<br/>
                  - 새로운 기능 및 서비스 출시 안내<br/>
                  - 이벤트 및 프로모션 정보</p>
                  
                  <h4>수신 거부</h4>
                  <p>마케팅 정보 수신을 원하지 않으시면 언제든지 마이페이지에서 수신 거부할 수 있습니다.</p>
                  
                  <h4>동의 철회</h4>
                  <p>이미 동의한 마케팅 정보 수신에 대해서도 언제든지 철회할 수 있으며, 철회 시 향후 마케팅 정보를 받지 않을 수 있습니다.</p>
                </div>
              )}
            </div>

            <div className="modal-action">
              <button className="btn btn-neutral btn-sm rounded-lg" onClick={closeModal}>
                확인
              </button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={closeModal}></div>
        </div>
      )}
    </div>
  )
}
