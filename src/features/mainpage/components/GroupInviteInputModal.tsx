import React, { useState } from 'react'
import { XCircleFill } from 'react-bootstrap-icons'
import { ModalProps } from '../../../types/main'
import { toast } from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import { getAccessToken } from '../../../libs/utils/auth'
import { joinGroup } from '../../../libs/utils/group'

const GroupInviteInputModal: React.FC<ModalProps> = ({ onClose }) => {
  const [inviteCode, setInviteCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async () => {
    if (!inviteCode.trim()) {
      setError('초대 코드를 입력해주세요.')
      return
    }

    setError('')
    setLoading(true)

    try {
      const accessToken = getAccessToken()
      const nickname = localStorage.getItem('memberName')

      if (!accessToken || !nickname) {
        setError('인증 정보가 없습니다. 다시 로그인해주세요.')
        return
      }

      await joinGroup(accessToken, nickname, inviteCode.trim())

      // On success, navigate to homepage
      toast.success('그룹 참여가 완료되었습니다!')
      navigate((window.location.href = '/'))
      onClose()
    } catch (err: any) {
      toast.error(err.message || '그룹 참여에 실패했습니다.')
      setError(err.message || '그룹 참여에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit()
    }
  }

  return (
    <dialog open className="modal">
      <div className="modal-box w-11/12 max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg">그룹 초대 코드 입력</h3>
          <button onClick={onClose} className="btn btn-sm btn-circle btn-ghost" aria-label="닫기">
            <XCircleFill className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="label">
              <span className="label-text">초대 코드</span>
            </label>
            <input
              type="text"
              placeholder="초대 코드를 입력하세요"
              className="input input-bordered w-full"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              onKeyPress={handleKeyPress}
              autoFocus
            />
            {error && (
              <label className="label">
                <span className="label-text-alt text-error">{error}</span>
              </label>
            )}
          </div>

          <div className="text-sm text-gray-500">
            <p>• 그룹장으로부터 받은 초대 코드를 입력하세요</p>
            <p>• 초대 코드는 URL의 마지막 부분입니다</p>
            <p>• 예: https://example.com/invite?code=ABC123 → ABC123</p>
          </div>
        </div>

        <div className="modal-action">
          <button className="btn btn-ghost" onClick={onClose}>
            취소
          </button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
            {loading ? '참여 중...' : '그룹 참여하기'}
          </button>
        </div>
      </div>
      <div className="modal-backdrop" onClick={onClose}></div>
    </dialog>
  )
}

export default GroupInviteInputModal
