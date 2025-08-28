import React from 'react'
import Calendar from 'react-calendar'
import { useCalendarStore } from '../../../app/store'
import CalendarDateDots from './CalendarDateDots'
import '../../../styles/Calendar.css'
import { Value } from 'react-calendar/dist/shared/types.js'
import { CalendarBoxProps } from '../../../types/main'

const CalendarBox: React.FC<CalendarBoxProps> = ({ onDateSelect, value }) => {
  const { selectedDate, setSelectedDate } = useCalendarStore()

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
