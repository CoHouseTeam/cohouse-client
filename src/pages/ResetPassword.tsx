import { ChangeEvent, FormEvent, useState } from 'react'
import ConfirmModal from '../features/common/ConfirmModal'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useResetPassword } from '../libs/hooks/mypage/useProfile'

export default function ResetPassword() {
  const [pw, setPw] = useState('')
  const [pw2, setPw2] = useState('')
  const [pwMatch, setPwMatch] = useState<null | boolean>(null)
  const [pwValid, setPwValid] = useState<null | boolean>(null)

  const [params] = useSearchParams()
  const token = params.get('token') || ''
  const navigate = useNavigate()

  const { mutateAsync: resetPassword } = useResetPassword()

  const [alertOpen, setAlertOpen] = useState(false)
  const [alertMsg, setAlertMsg] = useState('')
  const [lastActionSuccess, setLastActionSuccess] = useState(false)

  const showAlert = (msg: string) => {
    setAlertMsg(msg)
    setAlertOpen(true)
  }

  const closeAlert = () => {
    setAlertMsg('')
    setAlertOpen(false)

    if (lastActionSuccess) {
      setLastActionSuccess(false)
      navigate('/login')
    }
  }

  const passwordRegex = /^(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/

  const handlePwChange = (e: ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value
    setPw(v)

    if (v === '') {
      setPwValid(null) // 아무것도 안쓰면 표시 x
    } else {
      setPwValid(passwordRegex.test(v)) // 규칙 통과여부 체크
    }

    // 확인칸이 이미 입력되어 있으면 동시에 비교
    if (pw2) {
      setPwMatch(v === pw2)
    }
  }

  const handlePw2Change = (e: ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value
    setPw2(v)
    if (pw) {
      setPwMatch(v === pw) // 확인칸에 값이 있으면 즉시 비교
    } else {
      setPwMatch(null) // 원본 비밀번호가 비어있으면 비교하지 않음
    }
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (!token) {
      showAlert('토큰이 없습니다. 메일의 링크로 다시 접속해주세요.')
      return
    }

    if (!pw || !pw2) {
      showAlert('새 비밀번호를 입력해 주세요.')
      return
    }

    if (pw !== pw2) {
      showAlert('새 비밀번호가 서로 다릅니다.')
      return
    }

    if (!passwordRegex.test(pw)) {
      showAlert('비밀번호는 최소 8자 이상이며, 특수문자를 1개 이상 포함해야 합니다.')
      return
    }

    try {
      await resetPassword({ newPassword: pw, token })
      showAlert('비밀번호가 변경되었습니다. 다시 로그인해 주세요.')
      setLastActionSuccess(true)
    } catch (e) {
      showAlert('비밀번호 변경에 실패했습니다. 다시 시도해 주세요.')
    }
  }

  return (
    <div className="flex flex-col mx-auto max-w-md px-4 py-8 min-h-[80vh] bg-base-200 shadow-xl rounded-lg">
      <h1 className="text-2xl font-bold mb-6 text-center">비밀번호 재설정</h1>

      <form onSubmit={onSubmit} className="flex-1 flex flex-col gap-4">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2 text-xs border p-3 rounded-lg text-gray-500">
            <p>- 최소 8자 이상 입력해 주세요</p>
            <p>- 특수문자 최소 1개 포함하여 입력해 주세요</p>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-sm p-1">새 비밀번호</span>
            <input
              type="password"
              className="input input-bordered h-10 md:max-w-md text-sm rounded-lg"
              placeholder="새 비밀번호를 입력해 주세요"
              value={pw}
              onChange={handlePwChange}
            />

            {pwValid === false && (
              <p className="text-xs text-red-500">
                비밀번호는 최소 8자 이상이며 특수문자를 1개 이상 포함해야 합니다.
              </p>
            )}
            {pwValid === true && (
              <p className="text-xs text-green-600">사용 가능한 비밀번호입니다.</p>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-sm">새 비밀번호 확인</span>
            <input
              type="password"
              className="input input-bordered h-10 md:max-w-md text-sm rounded-lg"
              placeholder="새 비밀번호를 다시 입력해 주세요"
              value={pw2}
              onChange={handlePw2Change}
            />
            {pwMatch === false && <p className="text-xs text-red-500">비밀번호가 서로 다릅니다.</p>}
            {pwMatch === true && <p className="text-xs text-green-600">비밀번호가 일치합니다. </p>}
          </div>
        </div>

        <div className="mt-auto mx-auto">
          <button type="submit" className="btn btn-sm btn-secondary rounded-lg w-36">
            비밀번호 변경
          </button>
        </div>
      </form>

      <ConfirmModal
        open={alertOpen}
        title="안내"
        message={alertMsg}
        confirmText="확인"
        cancelText="취소"
        onConfirm={closeAlert}
        onCancel={closeAlert}
      />
    </div>
  )
}
