import { useState } from 'react'
import CalendarBox from '../features/mainpage/components/CalendarBox'
import CalendarDateDetails from '../features/mainpage/components/CalendarDateDetail'
import TodoListBox from '../features/mainpage/components/TodoListBox'
import { useCalendarStore } from '../app/store'
import GroupBox from '../features/mainpage/components/GroupBox'

const eventData: { [date: string]: string[] } = {
  '2025-08-04': ['빨래', '설거지', '치킨 배달 정산'],
  '2025-08-05': [],
}

const MainPage = () => {
  const { selectedDate, setSelectedDate } = useCalendarStore()
  const dateKey = selectedDate.toISOString().slice(0, 10)

  // 나중에 API 연결 후 대체
  const [hasGroups] = useState(false)

  return (
    <div className="space-y-6">
      <p>Name님 반가워요!</p>
      {hasGroups ? <TodoListBox /> : <GroupBox />}
      <CalendarBox onDateSelect={setSelectedDate} value={selectedDate} />
      <CalendarDateDetails selectedDate={selectedDate} events={eventData[dateKey] || []} />
    </div>
  )
}

export default MainPage
