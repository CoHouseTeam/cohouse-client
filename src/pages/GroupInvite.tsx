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
  const handleCloseModal = () => setShowNicknameModal(false)

  const handleNicknameSubmit = async (nickname: string) => {
    setApiError('')
    setLoading(true)
    try {
      await joinGroupByInvite(inviteCode, nickname)
      setShowNicknameModal(false)
      navigate('/group')
    } catch (err) {
      const error = err as AxiosError<{ message?: string }>
      setApiError(error.response?.data?.message || '그룹 가입 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center bg-white">
      <div className="text-center mt-32 mb-6">
        <h2 className="font-bold text-2xl mb-6">
          그룹이름 그룹에
          <br />
          초대되었습니다.
        </h2>
        <div className="flex justify-center gap-4 mt-8">
          <button
            className="btn bg-black text-white text-[16px] h-10 min-h-0 w-24 rounded-lg hover:bg-gray-700"
            onClick={handleApprove}
          >
            수락
          </button>
          <button
            className="btn bg-gray-200 text-black text-[16px] h-10 min-h-0 w-24 rounded-lg hover:bg-gray-300"
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
