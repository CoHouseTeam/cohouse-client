import React, { useEffect, useState } from 'react'
import { DaySelectModalProps, RepeatDay } from '../../../types/tasks'
import { daysKr, toEngDay, KorDay } from '../../../libs/utils/dayMapping'
import { getRepeatDays, createRepeatDay, deleteRepeatDay } from '../../../libs/api/tasks'

const DaySelectModal: React.FC<DaySelectModalProps> = ({
  days = daysKr,
  templateId,
  onClose,
  positionClass,
}) => {
  const [repeatDays, setRepeatDays] = useState<RepeatDay[]>([])
  const [loading, setLoading] = useState(false)

  const setLoadingWithDelay = (value: boolean) => {
    if (value) {
      setLoading(true)
    } else {
      setTimeout(() => setLoading(false), 200) // 200ms 지연 후 해제
    }
  }

  //StrictMode 라서 두번 호출됨
  useEffect(() => {
    const fetchRepeatDays = async () => {
      setLoadingWithDelay(true)
      try {
        const data = await getRepeatDays(templateId)
        setRepeatDays(data)
      } catch (error) {
        console.error('반복 요일 조회 실패', error)
      } finally {
        setLoadingWithDelay(false)
      }
    }
    fetchRepeatDays()
  }, [templateId])

  const checkedDays = Array.isArray(repeatDays) ? repeatDays.map((d) => d.dayOfWeek) : []

  const toggleDay = async (dayKr: KorDay) => {
    const dayEng = toEngDay(dayKr)
    const exist = Array.isArray(repeatDays)
      ? repeatDays.find((d) => d.dayOfWeek === dayEng)
      : undefined
    setLoading(true)
    try {
      if (!exist) {
        const newDay = await createRepeatDay(templateId, dayEng)
        setRepeatDays((prev) => [...prev, newDay])
      } else {
        await deleteRepeatDay(templateId, exist.repeatDayId)
        setRepeatDays((prev) => prev.filter((d) => d.repeatDayId !== exist.repeatDayId))
      }
    } catch (error) {
      console.error('요일 토글 실패', error)
    } finally {
      setLoading(false)
    }
  }

  const allSelected = checkedDays.length === days.length

  const handleToggleAll = async () => {
    setLoading(true)
    try {
      if (allSelected) {
        await Promise.all(repeatDays.map((d) => deleteRepeatDay(templateId, d.repeatDayId)))
        setRepeatDays([])
      } else {
        const notChecked = days.filter((day) => !checkedDays.includes(toEngDay(day)))
        const responses = await Promise.all(
          notChecked.map((day) => createRepeatDay(templateId, toEngDay(day)))
        )
        setRepeatDays([...repeatDays, ...responses])
      }
    } catch (error) {
      console.error('전체 선택/해제 실패', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/10" onClick={onClose} />
      <div
        className={`z-50 bg-white shadow-lg rounded-lg border border-gray-200 w-40 absolute ${
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
              className="btn btn-sm min-w-[60px] btn-primary rounded-lg"
              onClick={onClose}
              disabled={loading}
            >
              확인
            </button>
            <button
              type="button"
              className="btn btn-sm min-w-[60px] btn-outline rounded-lg"
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
