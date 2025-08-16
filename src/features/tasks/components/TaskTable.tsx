import React, { useState } from 'react'
import DaySelectModal from './DaySelectModal'
import { ChevronRight, PlusCircleFill } from 'react-bootstrap-icons'

const days = ['일', '월', '화', '수', '목', '금', '토']
const initialTasks = ['청소', '분리수거', '설거지']

const TaskTable: React.FC = () => {
  const [tasks, setTasks] = useState<string[]>(initialTasks)
  const [openModal, setOpenModal] = useState<number | null>(null)

  const handleAddTask = () => {
    setTasks((prev) => [...prev, '행추가'])
  }

  const toggleModal = (rowIdx: number) => {
    setOpenModal((prev) => (prev === rowIdx ? null : rowIdx))
  }

  return (
    <div className="relative w-full">
      <table className="w-full text-center border border-gray-300">
        <thead>
          <tr>
            <th className="bg-base-200 border-b border-gray-300 px-1 py-2 text-xs"></th>
            {days.map((day, idx) => (
              <th
                key={idx}
                className="bg-base-200 border-b border-l border-gray-300 whitespace-nowrap px-1 py-2 text-xs"
              >
                {day}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tasks.map((task, rowIdx) => (
            <tr key={rowIdx}>
              <td
                className="bg-base-100 border-t border-gray-300 px-2 py-2.5 text-xs font-normal relative flex items-center justify-between"
                style={{ borderRight: '1px solid #D1D5DB' }}
              >
                <span>{task}</span>
                <div className="relative flex items-center">
                  <button
                    type="button"
                    className="text-gray-400 focus:text-black z-20 -ml-4"
                    onClick={() => toggleModal(rowIdx)}
                  >
                    <ChevronRight
                      size={16}
                      className={openModal === rowIdx ? 'scale-x-[-1] transition-transform' : ''}
                      style={openModal === rowIdx ? { transform: 'scaleX(-1)' } : undefined}
                    />
                  </button>
                  {openModal === rowIdx && (
                    <DaySelectModal
                      days={days}
                      onClose={() => setOpenModal(null)}
                      positionClass="left-full -top-3 ml-2"
                    />
                  )}
                </div>
              </td>
              {days.map((_, colIdx) => (
                <td
                  key={colIdx}
                  className="border-t border-gray-300 p-1"
                  style={{
                    borderRight: colIdx === days.length - 1 ? undefined : '1px solid #D1D5DB',
                  }}
                />
              ))}
            </tr>
          ))}
          <tr>
            <td colSpan={days.length + 1} className="bg-white border-t border-gray-300 p-0">
              <div className="flex justify-center items-center py-2.5">
                <button
                  type="button"
                  onClick={handleAddTask}
                  className="bg-transparent border-none p-0 m-0"
                  style={{ cursor: 'pointer', lineHeight: 1 }}
                >
                  <PlusCircleFill size={18} color="gray" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

export default TaskTable
