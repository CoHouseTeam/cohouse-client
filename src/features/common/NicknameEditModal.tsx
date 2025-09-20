import { useState } from 'react'
import { X } from 'lucide-react'

interface NicknameEditModalProps {
  isOpen: boolean
  onClose: () => void
  currentNickname: string
  onSave: (newNickname: string) => Promise<void>
  isLoading?: boolean
}

export default function NicknameEditModal({
  isOpen,
  onClose,
  currentNickname,
  onSave,
  isLoading = false
}: NicknameEditModalProps) {
  const [nickname, setNickname] = useState(currentNickname)
  const [error, setError] = useState('')

  const handleSave = async () => {
    if (!nickname.trim()) {
      setError('닉네임을 입력해주세요.')
      return
    }

    if (nickname.trim() === currentNickname) {
      setError('현재 닉네임과 동일합니다.')
      return
    }

    if (nickname.trim().length > 20) {
      setError('닉네임은 20자 이하로 입력해주세요.')
      return
    }

    try {
      setError('')
      await onSave(nickname.trim())
      onClose()
    } catch (error: unknown) {
      console.error('닉네임 수정 실패:', error)
      const errorMessage = error instanceof Error ? error.message : '닉네임 수정에 실패했습니다.'
      setError(errorMessage)
    }
  }

  const handleClose = () => {
    setNickname(currentNickname)
    setError('')
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="modal modal-open">
      <div className="modal-box rounded-lg max-w-md animate-fade-in-up shadow-2xl border-2 border-gray-200">
        <div className="flex justify-between items-start mb-6">
          <h3 className="font-bold text-xl">닉네임 수정</h3>
          <button
            className="btn btn-sm btn-circle btn-ghost"
            onClick={handleClose}
            disabled={isLoading}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          {/* 현재 닉네임 표시 */}
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text font-medium">현재 닉네임</span>
            </label>
            <div className="input input-bordered rounded-lg bg-gray-50 text-gray-600">
              {currentNickname}
            </div>
          </div>

          {/* 새 닉네임 입력 */}
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text font-medium">새 닉네임</span>
            </label>
            <input
              type="text"
              placeholder="새 닉네임을 입력하세요"
              className="input input-bordered rounded-lg focus:input-primary"
              value={nickname}
              onChange={(e) => {
                setNickname(e.target.value)
                setError('')
              }}
              disabled={isLoading}
              maxLength={20}
            />
            <label className="label">
              <span className="label-text-alt text-gray-500">
                최대 20자까지 입력 가능합니다
              </span>
            </label>
          </div>

          {/* 에러 메시지 */}
          {error && (
            <div className="alert alert-error rounded-lg">
              <span className="text-sm">{error}</span>
            </div>
          )}
        </div>

        <div className="modal-action">
          <button 
            className="btn btn-ghost btn-sm rounded-lg" 
            onClick={handleClose}
            disabled={isLoading}
          >
            취소
          </button>
          <button 
            className="btn btn-primary btn-sm rounded-lg" 
            onClick={handleSave}
            disabled={isLoading || !nickname.trim()}
          >
            {isLoading ? '수정 중...' : '수정 완료'}
          </button>
        </div>
      </div>
      <div className="modal-backdrop" onClick={handleClose}></div>
    </div>
  )
}
