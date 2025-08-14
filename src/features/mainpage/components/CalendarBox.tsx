import { useState } from 'react'
import Calendar from 'react-calendar'
import '../../../styles/Calendar.css'

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
        formatMonthYear={(locale, date) => `${date.getFullYear()}.${date.getMonth() + 1}`}
        formatDay={(locale, date) => String(date.getDate())}
        tileContent={({ date, view }) =>
          view === 'month' && isDay(date) ? <div className="calendar-date-dot" /> : null
        }
      />
    </div>
  )
}

export default CalendarBox
