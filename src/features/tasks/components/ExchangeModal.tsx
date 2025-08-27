import React from 'react'

interface Member {
  name: string
  avatarUrl: string
}

interface ExchangeModalProps {
  open: boolean
  members: Member[]
  selected: number | null
  onSelect: (idx: number | null) => void
  onRequest: () => void
  onClose: () => void
}

const ExchangeModal: React.FC<ExchangeModalProps> = ({
  open,
  members,
  selected,
  onSelect,
  onRequest,
  onClose,
}) => {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-xl shadow-xl p-6 w-80 relative">
        <button
          aria-label="닫기"
          onClick={onClose}
          className="btn btn-sm btn-circle absolute right-4 top-4"
        >
          ✕
        </button>
        <div className="space-y-2 mb-5">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="radio"
              name="group"
              checked={selected === null}
              onChange={() => onSelect(null)}
              className="radio radio-sm"
            />
            <span className="text-sm">전체선택</span>
          </label>
          {Array.isArray(members) && members.map((member, idx) => (
            <label
              key={member.name}
              className="flex items-center space-x-3 p-3 bg-base-100 rounded-lg cursor-pointer border mt-2"
            >
              <input
                type="radio"
                name="group"
                checked={selected === idx}
                onChange={() => onSelect(idx)}
                className="radio radio-sm"
              />
              <img
                src={member.avatarUrl}
                alt={member.name}
                className="w-8 h-8 rounded-full object-cover"
              />
              <span className="text-base">{member.name}</span>
            </label>
          ))}
        </div>
        <button className="btn btn-block btn-neutral mt-3" onClick={onRequest}>
          요청하기
        </button>
      </div>
    </div>
  )
}

export default ExchangeModal
