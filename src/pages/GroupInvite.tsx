import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import NicknameModal from '../features/mainpage/components/NicknameModal'
import { AxiosError } from 'axios'
import { joinGroupByInvite } from '../libs/api/groups'

const GroupInvite = () => {
  const navigate = useNavigate()
  const [showNicknameModal, setShowNicknameModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState('')
  const [searchParams] = useSearchParams()
  const inviteCode = searchParams.get('code') || ''

  const handleApprove = () => setShowNicknameModal(true)
  const handleReject = () => navigate('/')

  const handleCloseModal = () => {
    setShowNicknameModal(false)
    setApiError('')
  }

  const handleNicknameSubmit = async (nickname: string) => {
    if (!inviteCode) {
      setApiError('유효하지 않은 초대 코드입니다.')
      return
    }
    setApiError('')
    setLoading(true)
    console.log('Sending invite join request:', { inviteCode, nickname })
    await joinGroupByInvite(inviteCode, nickname)

    try {
      // 초대코드 + 닉네임으로 가입 API 호출
      await joinGroupByInvite(inviteCode, nickname)
      setShowNicknameModal(false)
      setTimeout(() => {
        navigate('/')
      }, 100) // 가입 후 그룹 페이지로 이동
    } catch (err) {
      const error = err as AxiosError<{ message?: string }>
      setApiError(error.response?.data?.message || '그룹 가입 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center bg-white min-h-screen px-4">
      <div className="text-center mt-32 mb-6 max-w-md w-full">
        <h2 className="font-bold text-2xl mb-6 leading-snug">
          그룹에 초대되었습니다.
          <br />
          초대 코드는{' '}
          <span className="font-mono bg-gray-100 px-2 py-1 rounded">
            {inviteCode || '없음'}
          </span>{' '}
          입니다.
        </h2>

        <div className="flex justify-center gap-4 mt-8">
          <button
            className="btn bg-black text-white text-[16px] h-10 min-h-0 w-28 rounded-lg hover:bg-gray-700"
            onClick={handleApprove}
            disabled={!inviteCode}
            title={!inviteCode ? '유효한 초대 코드가 없습니다.' : ''}
          >
            수락
          </button>
          <button
            className="btn bg-gray-200 text-black text-[16px] h-10 min-h-0 w-28 rounded-lg hover:bg-gray-300"
            onClick={handleReject}
          >
            거절
          </button>
        </div>

        {apiError && <div className="text-red-500 text-sm mt-4">{apiError}</div>}
      </div>

      {showNicknameModal && (
        <NicknameModal
          onClose={handleCloseModal}
          onSubmit={handleNicknameSubmit}
          loading={loading}
        />
      )}
    </div>
  )
}

export default GroupInvite
