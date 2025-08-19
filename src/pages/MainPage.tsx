import CalendarBox from '../features/mainpage/components/CalendarBox'
import TodoListBox from '../features/mainpage/components/TodoListBox'

const MainPage = () => {
  return (
    <div className="space-y-6">
      <p>Name님 반가워요!</p>
      <TodoListBox />
      <CalendarBox />
    </div>
  )
}

export default MainPage
