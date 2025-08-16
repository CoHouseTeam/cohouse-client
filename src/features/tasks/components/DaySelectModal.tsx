import React, { useState } from 'react'

interface DaySelectModalProps {
  days: string[]
  onClose: () => void
  positionClass?: string
}

const DaySelectModal: React.FC<DaySelectModalProps> = ({ days, onClose, positionClass }) => {
  const [checkedDays, setCheckedDays] = useState<string[]>([])

  const toggleDay = (day: string) => {
    setCheckedDays((prev) => (prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]))
  }

  const allSelected = checkedDays.length === days.length

  const handleToggleAll = () => {
    if (allSelected) setCheckedDays([])
    else setCheckedDays([...days])
  }

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/10" onClick={onClose} />
      <div
        className={`z-50 bg-white shadow-lg rounded-xl border border-gray-200 w-40 absolute ${positionClass || ''}`}
      >
        <div className="flex flex-col py-2">
          <button type="button" className={`btn btn-sm mb-2 mx-3`} onClick={handleToggleAll}>
            {allSelected ? '전체 해제' : '전체 선택'}
          </button>

          <div className="flex flex-col divide-y divide-gray-200">
            {days.map((day) => (
              <label
                key={day}
                className="flex items-center px-4 py-2 cursor-pointer hover:bg-gray-100"
              >
                <input
                  type="checkbox"
                  className="checkbox checkbox-sm checkbox-primary"
                  checked={checkedDays.includes(day)}
                  onChange={() => toggleDay(day)}
                />
                <span className="ml-2 text-sm font-medium">{day}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}

export default DaySelectModal
