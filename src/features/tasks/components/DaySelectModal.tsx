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
  const [localRepeatDays, setLocalRepeatDays] = useState<RepeatDay[]>([])
  const [loading, setLoading] = useState(false)

  // 초기 로드 시 부모 상태를 로컬 상태로 복사
  useEffect(() => {
    const fetchRepeatDays = async () => {
      setLoading(true)
      try {
        const data = await getRepeatDays(templateId)
        setRepeatDays(data)
        setLocalRepeatDays(data) // 로컬 상태 초기화
      } catch (error) {
        console.error('반복 요일 조회 실패', error)
      } finally {
        setLoading(false)
      }
    }
    fetchRepeatDays()
  }, [templateId])

  // 로컬 상태에 있는 요일 리스트에서 선택된 요일만 뽑기
  const checkedDays = localRepeatDays.map((d) => d.dayOfWeek)

  // 로컬 상태만 업데이트
  const toggleDay = (dayKr: KorDay) => {
    const dayEng = toEngDay(dayKr)
    const exist = localRepeatDays.find((d) => d.dayOfWeek === dayEng)
    if (exist) {
      setLocalRepeatDays((prev) => prev.filter((d) => d.dayOfWeek !== dayEng))
    } else {
      setLocalRepeatDays((prev) => [...prev, { repeatDayId: 0, dayOfWeek: dayEng, templateId }])
    }
  }

  // 전체 선택/해제
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
        const responsesWithTemplate = responses.map((d) => ({
          ...d,
          templateId,
        }))
        setRepeatDays([...repeatDays, ...responsesWithTemplate])
      }
    } catch (error) {
      console.error('전체 선택/해제 실패', error)
    } finally {
      setLoading(false)
    }
  }

  // 확인 눌렀을 때 실제 API 반영
  const handleConfirm = async () => {
    setLoading(true)
    try {
      // 기존 repeatDays 중 로컬에 없는 건 삭제
      const toDelete = repeatDays.filter(
        (d) => !localRepeatDays.some((ld) => ld.dayOfWeek === d.dayOfWeek)
      )
      await Promise.all(toDelete.map((d) => deleteRepeatDay(templateId, d.repeatDayId)))

      // 로컬에 새로 추가된 건 생성
      const toAdd = localRepeatDays.filter(
        (ld) => !repeatDays.some((d) => d.dayOfWeek === ld.dayOfWeek)
      )
      const created = await Promise.all(
        toAdd.map((ld) => createRepeatDay(templateId, ld.dayOfWeek))
      )

      // 상태 업데이트
      setRepeatDays([...repeatDays.filter((d) => !toDelete.includes(d)), ...created])
      setLocalRepeatDays([...repeatDays.filter((d) => !toDelete.includes(d)), ...created])
      onClose()
    } catch (error) {
      console.error('반복 요일 저장 실패', error)
    } finally {
      setLoading(false)
    }
  }

  // 취소는 단순히 로컬 상태 초기화 후 닫기
  const handleCancel = () => {
    setLocalRepeatDays(repeatDays)
    onClose()
  }

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/10" onClick={handleCancel} />
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
              onClick={handleConfirm}
              disabled={loading}
            >
              확인
            </button>
            <button
              type="button"
              className="btn btn-sm min-w-[60px] btn-outline rounded-lg"
              onClick={handleCancel}
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
