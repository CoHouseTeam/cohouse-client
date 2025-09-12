import React, { useState } from 'react'
import { XCircleFill } from 'react-bootstrap-icons'
import { ModalProps } from '../../../types/main'
import { useNavigate } from 'react-router-dom'
import { AxiosError } from 'axios'
import { useGroupStore } from '../../../app/store'
import { createGroup } from '../../../libs/api/groups'

const SUCCESS_REDIRECT_ROUTE = '/create-complete'

const GroupCreateModal: React.FC<ModalProps> = ({ onClose }) => {
  const [groupName, setGroupName] = useState('')
  const [leaderNickname, setLeaderNickname] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const setHasGroups = useGroupStore((state) => state.setHasGroups)

  const handleCreate = async () => {
    if (!groupName.trim()) {
      setError('그룹명을 입력해주세요.')
      return
    }
    if (!leaderNickname.trim()) {
      setError('닉네임을 입력해주세요.')
      return
    }
    setError('')
    setLoading(true)
    try {
      await createGroup(groupName.trim(), leaderNickname.trim())
      setHasGroups(true)
      navigate(SUCCESS_REDIRECT_ROUTE)
    } catch (e: unknown) {
      const err = e as AxiosError<{ message?: string }>
      setError(err.response?.data?.message || err.message || '그룹 생성 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
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
          <h2 className="font-bold text-[24px] text-center mb-3">그룹 생성</h2>
          {/* 그룹명 입력 */}
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
            disabled={loading}
          />
          <div className="text-right text-xs text-gray-400 mb-1">{groupName.length}/20</div>
          {/* 닉네임 입력 */}
          <label className="block text-left text-base mb-2" htmlFor="leaderNickname">
            닉네임
          </label>
          <input
            id="leaderNickname"
            type="text"
            className="input input-bordered w-full rounded-lg text-[16px] mb-1"
            placeholder="닉네임을 입력해주세요."
            value={leaderNickname}
            onChange={(e) => setLeaderNickname(e.target.value)}
            disabled={loading}
          />
          {error && <div className="text-red-600 text-sm text-center mb-2">{error}</div>}
          <button
            className="btn btn-primary w-[60%] rounded-lg mt-3 text-[16px] mx-auto block"
            onClick={handleCreate}
            disabled={loading}
          >
            {loading ? '생성 중...' : '생성하기'}
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

export default GroupCreateModal
