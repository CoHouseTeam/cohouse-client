import React from 'react'
import { useCalendarStore } from '../../../app/tasksStore'
import { CalendarDateDetailsProps } from '../../../types/main.ts'

const CalendarDateDetails: React.FC<CalendarDateDetailsProps> = ({ events }) => {
  const { selectedDate } = useCalendarStore()
  //중복 제거
  const uniqueEvents = Array.from(new Set(events))

  function formatDateWithDay(date: Date) {
    const day = date.getDate()
    const weekDays = ['일', '월', '화', '수', '목', '금', '토']
    const weekDay = weekDays[date.getDay()]
    return `${day}일 (${weekDay})`
  }

  return (
    <div className="border rounded-lg mt-4 p-4 bg-base-100">
      <div className="mb-2">{formatDateWithDay(selectedDate)}</div>
      {events.length === 0 ? (
        <p className="text-gray-500">일정이 없어요</p>
      ) : (
        <ul className="list-disc pl-4">
          {uniqueEvents.map((event, idx) => (
            <li key={idx}>{event}</li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default CalendarDateDetails
