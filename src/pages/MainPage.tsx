import { useState } from 'react'
import CalendarBox from '../features/mainpage/components/CalendarBox'
import CalendarDateDetails from '../features/mainpage/components/CalendarDateDetail'
import TodoListBox from '../features/mainpage/components/TodoListBox'

const eventData: { [date: string]: string[] } = {
  '2025-08-04': ['빨래', '설거지', '치킨 배달 정산'],
  '2025-08-05': [],
}

const MainPage = () => {
  const [selectedDate, setSelectedDate] = useState('2025-08-04')

  return (
    <div className="space-y-6">
      <p>Name님 반가워요!</p>
      <TodoListBox />
      <CalendarBox onDateSelect={(date) => setSelectedDate(date.toISOString().slice(0, 10))} />
      <CalendarDateDetails selectedDate={selectedDate} events={eventData[selectedDate] || []} />
    </div>
  )
}

export default MainPage
