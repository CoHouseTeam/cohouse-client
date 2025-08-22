import { useState } from 'react'
import Calendar from 'react-calendar'
import '../../../styles/Calendar.css'
import CalendarDateDots from './CalendarDateDots'

const CalendarBox = () => {
  const [value, setValue] = useState<Date | null>(new Date())

  const isDay = (date: Date) => {
    const day = new Date()
    return (
      date.getDate() === day.getDate() &&
      date.getMonth() === day.getMonth() &&
      date.getFullYear() === day.getFullYear()
    )
  }

  return (
    <div className="calendar-wrapper">
      <Calendar
        value={value}
        onChange={(date) => setValue(date as Date)}
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
          const fakeDots = ['#E88F7F', '#F8DF9F', '#D5E4AD', '#C6ADD5']
          const dayLength = String(date.getDate()).length
          return <CalendarDateDots colors={fakeDots} dayLength={dayLength} />
        }}
      />
    </div>
  )
}

export default CalendarBox
