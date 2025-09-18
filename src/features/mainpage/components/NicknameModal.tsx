import React, { useState } from 'react'
import { XCircleFill } from 'react-bootstrap-icons'
import { NicknameModalProps } from '../../../types/main'

const NicknameModal: React.FC<NicknameModalProps> = ({ onClose, onSubmit, loading = false }) => {
  const [nickname, setNickname] = useState('')
  const [error, setError] = useState('')

  const handleConfirm = () => {
    if (!nickname.trim()) {
      setError('닉네임을 입력해주세요.')
      return
    }
    setError('')
    if (onSubmit) onSubmit(nickname.trim())
  }

  return (
    <dialog open className="modal">
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="relative bg-white rounded-lg w-[90%] max-w-sm mx-auto px-6 py-8 shadow-lg">
          <button
            className="absolute right-4 top-4 z-10"
            onClick={onClose}
            aria-label="닫기"
            type="button"
          >
            <XCircleFill className="text-xl text-gray-400" />
          </button>

          <h2 className="font-bold text-[24px] text-center mb-3">닉네임 입력</h2>
          <input
            id="nickname"
            type="text"
            className="input input-bordered w-full rounded-lg text-[16px] mb-1"
            placeholder="닉네임을 입력해주세요."
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
          />

          {error && <div className="text-red-600 text-sm text-center mb-2">{error}</div>}

          <button
            className="btn bg-[#242424] w-[60%] text-white rounded-lg mt-2 text-[16px] mx-auto block"
            onClick={handleConfirm}
            disabled={loading}
          >
            확인
          </button>
        </div>
      </div>
      <form
        method="dialog"
        className="modal-backdrop fixed inset-0 bg-black/40"
        onClick={onClose}
      ></form>
    </dialog>
  )
}

export default NicknameModal
