import { useEffect, useState } from 'react'
import CalendarBox from '../features/mainpage/components/CalendarBox'
import CalendarDateDetails from '../features/mainpage/components/CalendarDateDetail'
import TodoListBox from '../features/mainpage/components/TodoListBox'
import GroupBox from '../features/mainpage/components/GroupBox'
import { useCalendarStore } from '../app/store'
import { useGroupStore } from '../app/store'
import { fetchMyGroups } from '../libs/api/groups'
import { isAuthenticated } from '../libs/utils/auth'

const eventData: { [date: string]: string[] } = {
  '2025-08-04': ['빨래', '설거지', '치킨 배달 정산'],
  '2025-08-05': [],
}

const MainPage = () => {
  const { selectedDate, setSelectedDate } = useCalendarStore()
  const dateKey = selectedDate.toISOString().slice(0, 10)

  const hasGroups = useGroupStore((state) => state.hasGroups)
  const setHasGroups = useGroupStore((state) => state.setHasGroups)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [userAuthenticated, setUserAuthenticated] = useState(false)

  useEffect(() => {
    setUserAuthenticated(isAuthenticated())
  }, [])

  useEffect(() => {
    async function loadGroups() {
      setLoading(true)
      setError('')
      try {
        const groups = await fetchMyGroups()
        const hasGroup = Array.isArray(groups) ? groups.length > 0 : groups != null
        setHasGroups(hasGroup)
      } catch (e) {
        setError('그룹 정보를 불러오는 중 오류가 발생했습니다.')
        setHasGroups(false)
      } finally {
        setLoading(false)
      }
    }

    if (userAuthenticated) {
      loadGroups()
    } else {
      setHasGroups(false)
      setLoading(false)
    }
  }, [userAuthenticated, setHasGroups])

  return (
    <div className="space-y-6">
      <p>Name님 반가워요!</p>

      {loading && <div>그룹 정보 불러오는 중...</div>}
      {error && <div className="text-red-600">{error}</div>}

      {!loading && (hasGroups ? <TodoListBox /> : <GroupBox />)}

      <CalendarBox onDateSelect={setSelectedDate} value={selectedDate} />
      <CalendarDateDetails selectedDate={selectedDate} events={eventData[dateKey] || []} />
    </div>
  )
}

export default MainPage
