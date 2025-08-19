import React from 'react'
import { XCircleFill } from 'react-bootstrap-icons'

export interface TaskHistory {
  date: string
  task: string
  status: '완료' | '미완료'
}
interface HistoryModalProps {
  open: boolean
  onClose: () => void
  items: TaskHistory[]
}

const HistoryModal: React.FC<HistoryModalProps> = ({ open, onClose, items }) => {
  if (!open) return null

  return (
    <dialog open className="modal">
      <div className="modal-box max-w-lg h-[90vh] px-4 py-7 overflow-y-auto">
        <button
          className="btn btn-xs btn-circle btn-ghost absolute right-4 top-4"
          onClick={onClose}
        >
          <XCircleFill className="text-2xl text-gray-400" />
        </button>
        <h2 className="text-center text-2xl font-bold mb-5">업무 내역</h2>

        {/* 필터 */}
        <div className="flex justify-end mb-2">
          <select className="select select-bordered select-sm w-32 bg-base-100" disabled>
            <option>전체보기</option>
          </select>
        </div>

        {/* 내역 리스트 */}
        <div className="flex flex-col space-y-2">
          {items.map((item, idx) => (
            <div
              key={idx}
              className="
                card card-bordered bg-base-100 flex-row items-center 
                px-4 py-2.5 border-gray-100 shadow-none
              "
            >
              <div className="font-bold mr-1.5 min-w-[100px]">{item.date}</div>
              <div className="flex-1 text-md">{item.task}</div>
              <span
                className={`
                  badge h-9 w-20
                  py-3 ml-3 rounded-lg
                  font-semibold border-none
                  ${item.status === '완료' ? 'bg-gray-400 text-white' : 'bg-gray-100 text-gray-500'}
                `}
              >
                {item.status}
              </span>
            </div>
          ))}
        </div>
      </div>
      <form method="dialog" className="modal-backdrop !fixed !inset-0 !bg-black/40">
        <button onClick={onClose}>close</button>
      </form>
    </dialog>
  )
}

export default HistoryModal
