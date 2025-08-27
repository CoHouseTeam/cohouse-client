import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { DaySelectModalProps, RepeatDay } from '../../../types/tasks'
import { daysKr, toEngDay, KorDay } from '../../../libs/utils/dayMapping'

const DaySelectModal: React.FC<DaySelectModalProps> = ({
  days = daysKr,
  templateId,
  onClose,
  positionClass,
}) => {
  const [repeatDays, setRepeatDays] = useState<RepeatDay[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchRepeatDays = async () => {
      setLoading(true)
      const res = await axios.get<RepeatDay[]>(`/api/tasks/templates/${templateId}/repeat-days`)
      setRepeatDays(res.data)
      setLoading(false)
    }
    fetchRepeatDays()
  }, [templateId])

  const checkedDays = Array.isArray(repeatDays) ? repeatDays.map((d) => d.dayOfWeek) : []

  const toggleDay = async (dayKr: KorDay) => {
    const dayEng = toEngDay(dayKr)
    const exist = Array.isArray(repeatDays)
      ? repeatDays.find((d) => d.dayOfWeek === dayEng)
      : undefined
    if (!exist) {
      const res = await axios.post<RepeatDay>(`/api/tasks/templates/${templateId}/repeat-days`, {
        dayOfWeek: dayEng,
      })
      setRepeatDays((prev) => [...prev, res.data])
    } else {
      await axios.delete(`/api/tasks/templates/${templateId}/repeat-days/${exist.repeatDayId}`)
      setRepeatDays((prev) => prev.filter((d) => d.repeatDayId !== exist.repeatDayId))
    }
  }

  const allSelected = checkedDays.length === days.length

  const handleToggleAll = async () => {
    if (allSelected) {
      await Promise.all(
        Array.isArray(repeatDays)
          ? repeatDays.map((d) =>
              axios.delete(`/api/tasks/templates/${templateId}/repeat-days/${d.repeatDayId}`)
            )
          : []
      )
      setRepeatDays([])
    } else {
      const notChecked = days.filter((day) => !checkedDays.includes(toEngDay(day)))
      const responses = await Promise.all(
        notChecked.map((day) =>
          axios.post<RepeatDay>(`/api/tasks/templates/${templateId}/repeat-days`, {
            dayOfWeek: toEngDay(day),
          })
        )
      )
      setRepeatDays([...repeatDays, ...responses.map((r) => r.data)])
    }
  }

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/10" onClick={onClose} />
      <div
        className={`z-50 bg-white shadow-lg rounded-xl border border-gray-200 w-40 absolute ${
          positionClass ?? ''
        }`}
      >
        <div className="flex flex-col py-2">
          <button
            type="button"
            className="btn btn-sm mb-2 mx-3"
            onClick={handleToggleAll}
            disabled={loading}
          >
            {allSelected ? '전체 해제' : '전체 선택'}
          </button>

          <div className="flex flex-col divide-y divide-gray-200">
            {days.map((dayKr) => (
              <label
                key={dayKr}
                className="flex items-center px-4 py-2 cursor-pointer hover:bg-gray-100"
              >
                <input
                  type="checkbox"
                  className="checkbox checkbox-sm checkbox-primary"
                  checked={checkedDays.includes(toEngDay(dayKr))}
                  onChange={() => toggleDay(dayKr)}
                  disabled={loading}
                />
                <span className="ml-2 text-sm font-medium">{dayKr}</span>
              </label>
            ))}
          </div>

          <div className="flex justify-center space-x-2 mt-1 px-1 pt-2 pb-1 border-t border-gray-200">
            <button
              type="button"
              className="btn btn-sm min-w-[60px] btn-primary"
              onClick={onClose}
              disabled={loading}
            >
              확인
            </button>
            <button
              type="button"
              className="btn btn-sm min-w-[60px] btn-outline"
              onClick={onClose}
              disabled={loading}
            >
              취소
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

export default DaySelectModal
