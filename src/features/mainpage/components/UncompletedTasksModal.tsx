import React from 'react'

type Member = {
  name: string
  role: string
  avatar: string
}

type Group = {
  date: string
  members: Member[]
}

const pendingData: Group[] = [
  {
    date: '2025.08.03(일)',
    members: [
      { name: '분리수거', role: '그룹원1', avatar: '/' },
      { name: '빨래', role: '그룹원2', avatar: '/' },
    ],
  },
  {
    date: '2025.08.05(월)',
    members: [{ name: '치킨 배달 정산', role: '그룹원3', avatar: '/' }],
  },
]

interface UncompletedTasksModalProps {
  onClose: () => void
}

const UncompletedTasksModal: React.FC<UncompletedTasksModalProps> = ({ onClose }) => {
  return (
    <div className="modal modal-open">
      <div className="modal-box rounded-lg max-w-xs max-h-[90vh] overflow-y-auto relative">
        <button
          onClick={onClose}
          className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2 rounded-lg"
          aria-label="닫기"
        >
          ✕
        </button>

        <h3 className="font-bold text-lg text-center mb-4">미이행 내역</h3>

        {pendingData.map((group) => (
          <div key={group.date} className="mb-4">
            <div className="text-sm font-semibold text-gray-800 mb-2">{group.date}</div>
            <div className="card bg-base-200 shadow-sm rounded-lg">
              <div className="card-body p-4">
                {group.members.map((m) => (
                  <div key={m.name} className="flex items-center mb-3 last:mb-0">
                    <img src={m.avatar} alt={m.name} className="w-8 h-8 rounded-full border mr-3" />
                    <div>
                      <div className="font-semibold">{m.name}</div>
                      <div className="text-xs text-gray-500">{m.role}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="modal-backdrop" onClick={onClose}></div>
    </div>
  )
}

export default UncompletedTasksModal
