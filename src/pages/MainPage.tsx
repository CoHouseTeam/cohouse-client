import { useEffect, useState } from 'react'
import CalendarBox from '../features/mainpage/components/CalendarBox'
import CalendarDateDetails from '../features/mainpage/components/CalendarDateDetail'
import TodoListBox from '../features/mainpage/components/TodoListBox'
import GroupBox from '../features/mainpage/components/GroupBox'
import { useCalendarStore } from '../app/store'
import { useGroupStore } from '../app/store'
import { fetchMyGroups } from '../libs/api/groups'

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

  useEffect(() => {
    async function loadGroups() {
      setLoading(true)
      setError('')
      try {
        const groups = await fetchMyGroups()
        // 그룹 응답이 배열인지 단일 객체인지 판단 후 설정
        const hasGroup = Array.isArray(groups) ? groups.length > 0 : groups != null
        setHasGroups(hasGroup)
      } catch (e) {
        setError('그룹 정보를 불러오는 중 오류가 발생했습니다.')
        setHasGroups(false)
      } finally {
        setLoading(false)
      }
    }

    loadGroups()
  }, [setHasGroups])

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
