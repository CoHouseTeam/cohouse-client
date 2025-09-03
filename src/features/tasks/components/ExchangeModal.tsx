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

  const allSelected = Array.isArray(members) && selected.length === members.length

  const toggleSelectAll = () => {
    if (allSelected) {
      onSelect([])
    } else {
      onSelect(members.map((_, idx) => idx))
    }
  }

  const toggleSelect = (idx: number) => {
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
          {/* 전체선택 체크박스 */}
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={allSelected}
              onChange={toggleSelectAll}
              className="checkbox checkbox-sm"
            />
            <span className="text-sm">전체선택</span>
          </label>

          {/* 멤버별 체크박스 */}
          {Array.isArray(members) &&
            members.map((member, idx) => (
              <label
                key={member.name}
                className="flex items-center space-x-3 p-3 bg-base-100 rounded-lg cursor-pointer border mt-2"
              >
                <input
                  type="checkbox"
                  checked={selected.includes(idx)}
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
          onClick={() => onRequest(selected)}
          disabled={selected.length === 0}
        >
          요청하기
        </button>
      </div>
    </div>
  )
}

export default ExchangeModal
