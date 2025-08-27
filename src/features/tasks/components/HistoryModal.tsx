import React, { useState, useRef } from 'react'
import { CaretDownFill, XCircleFill } from 'react-bootstrap-icons'
import { HistoryModalProps } from '../../../types/tasks'

const filterOptions = [
  { label: '전체보기', value: 'all' },
  { label: '완료', value: '완료' },
  { label: '미완료', value: '미완료' },
]

const HistoryModal: React.FC<HistoryModalProps> = ({ open, onClose, items }) => {
  const [filter, setFilter] = useState('all')
  const [openDropdown, setOpenDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  if (!open) return null

  const filteredItems = filter === 'all' ? items : items.filter((i) => i.status === filter)

  return (
    <dialog open className="modal">
      <div className="modal-box max-w-lg h-[90vh] px-4 py-7 overflow-y-auto">
        <button
          className="btn btn-xs btn-circle btn-ghost absolute right-4 top-4"
          onClick={onClose}
        >
          <XCircleFill className="text-xl text-gray-400" />
        </button>
        <h2 className="text-center text-2xl font-bold mb-5">업무 내역</h2>

        {/* 필터 드롭다운 */}
        <div className="flex justify-end mb-2 relative" ref={dropdownRef}>
          <button
            className="
    w-32 h-10 border border-gray-200 rounded-lg bg-white
    flex items-center justify-between px-4
  "
            type="button"
            onClick={() => setOpenDropdown((open) => !open)}
          >
            {filterOptions.find((o) => o.value === filter)?.label}
            <CaretDownFill
              className={`ml-2 transition-transform duration-200 ${openDropdown ? 'scale-y-[-1]' : ''}`}
            />
          </button>

          {openDropdown && (
            <ul
              className="
      absolute right-0 top-full w-32
      z-10 py-1 mt-0
      bg-white border rounded-lg shadow flex flex-col
    "
            >
              {filterOptions.map((option) => (
                <li key={option.value}>
                  <button
                    type="button"
                    className={`
              w-full px-4 py-2 text-left text-sm
              ${filter === option.value ? 'bg-gray-100 text-black font-bold' : 'text-gray-500'} hover:bg-gray-200
            `}
                    onClick={() => {
                      setFilter(option.value)
                      setOpenDropdown(false)
                    }}
                  >
                    {option.label}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* 내역 리스트 */}
        <div className="flex flex-col space-y-2">
          {Array.isArray(filteredItems) &&
            filteredItems.map((item, idx) => (
              <div
                key={idx}
                className="
                  card card-bordered bg-base-100 flex-row items-center 
                  px-4 py-2.5 border-[#DEDEDE] shadow-none rounded-lg
                "
              >
                <div className="font-bold mr-1.5 min-w-[100px]">{item.date}</div>
                <div className="flex-1 text-md">{item.task}</div>
                <span
                  className={`
                    badge h-9 w-20
                    py-3 ml-3 rounded-lg
                    font-semibold border-none
                    ${item.status === '완료' ? 'bg-[#757575] text-white' : 'bg-gray-100 text-gray-500'}
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
