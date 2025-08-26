import React from 'react'
import Calendar from 'react-calendar'
import { CalendarBoxProps } from '../../../types/main'
import { useCalendarStore } from '../../../app/store'
import CalendarDateDots from './CalendarDateDots'
import '../../../styles/Calendar.css'
import { Value } from 'react-calendar/dist/shared/types.js'

const CalendarBox: React.FC<CalendarBoxProps> = ({ onDateSelect, value }) => {
  const { selectedDate } = useCalendarStore()

  const isDay = (date: Date) => {
    const day = new Date()
    return (
      date.getDate() === day.getDate() &&
      date.getMonth() === day.getMonth() &&
      date.getFullYear() === day.getFullYear()
    )
  }

  const onChangeHandler = (value: Value) => {
    if (!value) return
    if (value instanceof Date) {
      if (onDateSelect) onDateSelect(value)
    } else if (Array.isArray(value)) {
      if (value[0] instanceof Date && onDateSelect) {
        onDateSelect(value[0])
      }
    }
  }

  return (
    <div className="calendar-wrapper">
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
          if (view !== 'month' || !isDay(date)) return null
          const fakeDots = ['#E88F7F', '#F8DF9F', '#D5E4AD']
          const dayLength = String(date.getDate()).length
          return <CalendarDateDots colors={fakeDots} dayLength={dayLength} />
        }}
      />
    </div>
  )
}

export default CalendarBox
