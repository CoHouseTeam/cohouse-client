import React from 'react'
import Calendar from 'react-calendar'
import { useCalendarStore } from '../../../app/tasksStore'
import CalendarDateDots from './CalendarDateDots'
import '../../../styles/Calendar.css'
import { Value } from 'react-calendar/dist/shared/types.js'
import { CalendarBoxProps } from '../../../types/main'

interface ExtendedCalendarBoxProps extends CalendarBoxProps {
  announcementDates?: string[]
  settlementDates?: string[]
}

const CalendarBox: React.FC<ExtendedCalendarBoxProps> = ({
  onDateSelect,
  value,
  scheduledDates,
  announcementDates = [],
  settlementDates = [],
}) => {
  const { selectedDate, setSelectedDate } = useCalendarStore()

  const formatDate = (date: Date) => {
    const yyyy = date.getFullYear()
    const mm = String(date.getMonth() + 1).padStart(2, '0')
    const dd = String(date.getDate()).padStart(2, '0')
    return `${yyyy}-${mm}-${dd}`
  }

  const isScheduledDay = (date: Date) => scheduledDates.includes(formatDate(date))

  const isAnnouncementDay = (date: Date) => announcementDates.includes(formatDate(date))

  const isSettlementDay = (date: Date) => settlementDates?.includes(formatDate(date)) ?? false

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

          const dotsColors: string[] = []
          if (isScheduledDay(date)) dotsColors.push('#E88F7F')
          if (isAnnouncementDay(date)) dotsColors.push('#F8DF9F')
          if (isSettlementDay(date)) dotsColors.push('#D5E4AD')

          return dotsColors.length > 0 ? (
            <CalendarDateDots colors={dotsColors} dayLength={String(date.getDate()).length} />
          ) : null
        }}
      />
    </div>
  )
}

export default CalendarBox
