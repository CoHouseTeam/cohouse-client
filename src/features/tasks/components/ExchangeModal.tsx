import React from 'react'
import { XCircleFill } from 'react-bootstrap-icons'
import { ExchangeModalProps } from '../../../types/tasks'

const ExchangeModal: React.FC<ExchangeModalProps> = ({
  open,
  members,
  selected,
  onSelect,
  onRequest,
  onClose,
}) => {
  if (!open) return null

  // 전체선택 체크 여부: 모든 멤버 선택 시 true, 아닐 경우 false
  const allSelected =
    Array.isArray(selected) && members.length > 0 && selected.length === members.length

  // 전체선택 토글 함수
  const toggleSelectAll = () => {
    if (allSelected) {
      onSelect([]) // 모두 선택 해제
    } else {
      onSelect(members.map((_, idx) => idx)) // 모두 선택
    }
  }

  // 개별 멤버 선택 토글
  const toggleSelect = (idx: number) => {
    if (!Array.isArray(selected)) return
    if (selected.includes(idx)) {
      onSelect(selected.filter((i) => i !== idx))
    } else {
      onSelect([...selected, idx])
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-xl shadow-xl p-6 w-80 relative">
        <button
          className="absolute right-4 top-4 z-10"
          onClick={onClose}
          aria-label="닫기"
          type="button"
        >
          <XCircleFill className="text-xl text-gray-400" />
        </button>
        <div className="space-y-2 mb-5 mt-2">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={allSelected}
              onChange={toggleSelectAll}
              className="checkbox checkbox-sm"
            />
            <span className="text-sm">전체선택</span>
          </label>
          {Array.isArray(members) &&
            members.map((member, idx) => (
              <label
                key={member.name}
                className="flex items-center space-x-3 p-3 bg-base-100 rounded-lg cursor-pointer border mt-2"
              >
                <input
                  type="checkbox"
                  checked={Array.isArray(selected) ? selected.includes(idx) : false}
                  onChange={() => toggleSelect(idx)}
                  className="checkbox checkbox-sm"
                />
                <img
                  src={member.profileImageUrl}
                  alt={member.name}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <span className="text-base">{member.name}</span>
              </label>
            ))}
        </div>
        <button
          className="btn bg-[#242424] w-[60%] text-white rounded-lg mt-2 text-[16px] mx-auto block"
          onClick={onRequest}
        >
          요청하기
        </button>
      </div>
    </div>
  )
}

export default ExchangeModal
