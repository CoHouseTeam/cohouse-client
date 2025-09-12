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
  currentUserId,
}) => {
  if (!open) return null

  // 현재 사용자 제외 멤버 필터링
  const filteredMembers = members.filter((m) => m.memberId !== currentUserId)

  // 전체선택 체크 상태 및 토글 함수
  const allSelected =
    Array.isArray(selected) &&
    filteredMembers.length > 0 &&
    selected.length === filteredMembers.length

  const toggleSelectAll = () => {
    if (allSelected) onSelect([])
    else onSelect(filteredMembers.map((m) => m.memberId!))
  }

  // 개별 체크
  const toggleSelect = (id: number) => {
    if (!Array.isArray(selected)) return
    if (selected.includes(id)) {
      onSelect(selected.filter((i) => i !== id))
    } else {
      onSelect([...selected, id])
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
          {filteredMembers.map((member) => (
            <label
              key={member.memberId}
              className="flex items-center space-x-3 p-3 bg-base-100 rounded-lg cursor-pointer border mt-2"
            >
              <input
                type="checkbox"
                checked={Array.isArray(selected) ? selected.includes(member.memberId!) : false}
                onChange={() => toggleSelect(member.memberId!)}
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
