import React from 'react'
import Calendar from 'react-calendar'
import { useCalendarStore } from '../../../app/tasksStore'
import CalendarDateDots from './CalendarDateDots'
import '../../../styles/Calendar.css'
import { Value } from 'react-calendar/dist/shared/types.js'
import { CalendarBoxProps } from '../../../types/main'

const CalendarBox: React.FC<CalendarBoxProps> = ({ onDateSelect, value, scheduledDates }) => {
  const { selectedDate, setSelectedDate } = useCalendarStore()

  const isScheduledDay = (date: Date) => {
    const yyyy = date.getFullYear()
    const mm = String(date.getMonth() + 1).padStart(2, '0')
    const dd = String(date.getDate()).padStart(2, '0')
    return scheduledDates.includes(`${yyyy}-${mm}-${dd}`)
  }

  const onChangeHandler = (value: Value) => {
    if (!value) return
    if (value instanceof Date) {
      setSelectedDate(value)
      if (onDateSelect) onDateSelect(value)
    } else if (Array.isArray(value)) {
      if (value[0] instanceof Date) {
        setSelectedDate(value[0])
        if (onDateSelect) onDateSelect(value[0])
      }
    }
  }

  return (
    <div className="calendar-wrapper rounded-lg">
      <Calendar
        value={value || selectedDate}
        onChange={onChangeHandler}
        calendarType="gregory"
        locale="ko-KR"
        showNeighboringMonth={true}
        prevLabel="<"
        nextLabel=">"
        prev2Label={null}
        next2Label={null}
        formatMonthYear={(_locale, date) => `${date.getFullYear()}.${date.getMonth() + 1}`}
        formatDay={(_locale, date) => String(date.getDate())}
        tileContent={({ date, view }) => {
          if (view !== 'month') return null
          if (isScheduledDay(date)) {
            return (
              <CalendarDateDots colors={['#E88F7F']} dayLength={String(date.getDate()).length} />
            )
          }
          return null
        }}
      />
    </div>
  )
}

export default CalendarBox
