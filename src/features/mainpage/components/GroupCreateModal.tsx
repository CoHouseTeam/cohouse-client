import React, { useState } from 'react'
import { XCircleFill } from 'react-bootstrap-icons'
import { ModalProps } from '../../../types/main'
import { useNavigate } from 'react-router-dom'

const GroupCreateModal: React.FC<ModalProps> = ({ onClose }) => {
  const [groupName, setGroupName] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleCreate = () => {
    if (!groupName.trim()) {
      setError('그룹명을 입력해주세요.')
      return
    }
    setError('')
    navigate('/complete')
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/40">
      <div className="relative bg-white rounded-lg w-[90%] max-w-sm mx-auto px-6 py-8 shadow-lg">
        <button
          className="absolute right-4 top-4 z-10"
          onClick={onClose}
          aria-label="닫기"
          type="button"
        >
          <XCircleFill className="text-2xl text-gray-400" />
        </button>

        <h2 className="font-bold text-[24px] text-center mb-3">그룹 생성</h2>

        <label className="block text-left text-base mb-2" htmlFor="groupName">
          그룹명
        </label>
        <input
          id="groupName"
          type="text"
          className="input input-bordered w-full rounded-lg text-[16px] mb-1"
          placeholder="그룹명을 입력해주세요."
          maxLength={20}
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
        />
        <div className="text-right text-xs text-gray-400 mb-1">{groupName.length}/20</div>

        {error && <div className="text-red-600 text-sm text-center mb-2">{error}</div>}

        <button
          className="btn bg-[#242424] w-[60%] text-white rounded-lg mt-2 text-[16px] mx-auto block"
          onClick={handleCreate}
        >
          생성하기
        </button>
      </div>
    </div>
  )
}
export default GroupCreateModal
