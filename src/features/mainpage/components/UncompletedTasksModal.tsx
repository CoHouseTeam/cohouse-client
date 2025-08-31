import React from 'react'
import { Group, ModalProps } from '../../../types/main.ts'
import { XCircleFill } from 'react-bootstrap-icons'

const pendingData: Group[] = [
  {
    date: '2025.08.03(일)',
    members: [
      { task: '분리수거', name: '그룹원1', profileImageUrl: '/' },
      { task: '빨래', name: '그룹원2', profileImageUrl: '/' },
    ],
  },
  {
    date: '2025.08.05(월)',
    members: [{ task: '치킨 배달 정산', name: '그룹원3', profileImageUrl: '/' }],
  },
  {
    date: '2025.08.08(금)',
    members: [
      { task: '치킨 배달 정산', name: '그룹원3', profileImageUrl: '/' },
      { task: '분리수거', name: '그룹원1', profileImageUrl: '/' },
      { task: '설거지', name: '그룹원2', profileImageUrl: '/' },
    ],
  },
]

const UncompletedTasksModal: React.FC<ModalProps> = ({ onClose }) => {
  return (
    <dialog open className="modal">
      <div className="modal-box max-w-xs max-h-[90vh] overflow-y-auto relative">
        <button
          className="btn btn-xs btn-circle btn-ghost absolute right-4 top-4 z-50"
          onClick={onClose}
          aria-label="닫기"
          type="button"
        >
          <XCircleFill className="text-xl text-gray-400" />
        </button>

        <h3 className="font-bold text-[24px] text-center mb-6">미이행 내역</h3>

        {pendingData.map((group) => (
          <div key={group.date} className="mb-6">
            <div className="text-[15px] font-bold mb-2 text-gray-800">{group.date}</div>
            <div className="bg-white border border-[#5C5C5C] rounded-lg px-4 py-3">
              {group.members.map((m) => (
                <div key={m.task + m.name} className="flex items-center mb-3 last:mb-0">
                  <img
                    src={m.profileImageUrl}
                    alt={m.task}
                    className="w-8 h-8 rounded-full border mr-3 bg-gray-100 object-cover"
                  />
                  <div>
                    <div className="text-[14px]">{m.task}</div>
                    <div className="text-xs text-gray-500">{m.name}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <form
        method="dialog"
        className="modal-backdrop fixed inset-0 bg-black/40"
        onClick={onClose}
      ></form>
    </dialog>
  )
}

export default UncompletedTasksModal
