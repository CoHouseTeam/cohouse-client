import { useEffect, useState } from 'react'
import CalendarBox from '../features/mainpage/components/CalendarBox'
import CalendarDateDetails from '../features/mainpage/components/CalendarDateDetail'
import TodoListBox from '../features/mainpage/components/TodoListBox'
import GroupBox from '../features/mainpage/components/GroupBox'
import { useCalendarStore } from '../app/store'
import { useGroupStore } from '../app/store'
import { fetchMyGroups } from '../libs/api/groups'
import { isAuthenticated } from '../libs/utils/auth'
import { getAssignments } from '../libs/api/tasks'
import { Assignment } from '../types/tasks'

const MainPage = () => {
  const { selectedDate, setSelectedDate } = useCalendarStore()
  const dateKey = selectedDate.toISOString().slice(0, 10)

  const hasGroups = useGroupStore((state) => state.hasGroups)
  const setHasGroups = useGroupStore((state) => state.setHasGroups)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [userAuthenticated, setUserAuthenticated] = useState(false)
  const [groupId, setGroupId] = useState<number | null>(null)
  const [myMemberId, setMyMemberId] = useState<number | null>(null)

  const [myAssignments, setMyAssignments] = useState<string[]>([])

  // 인증 상태 감지
  useEffect(() => {
    setUserAuthenticated(isAuthenticated())
  }, [])

  // 그룹 정보 + 내 멤버ID 로드
  useEffect(() => {
    async function loadGroups() {
      setLoading(true)
      setError('')
      try {
        const groups = await fetchMyGroups()
        const hasGroup = Array.isArray(groups) ? groups.length > 0 : groups != null
        setHasGroups(hasGroup)
        if (hasGroup) {
          setGroupId(groups[0]?.id || null)
          setMyMemberId(groups[0]?.myMemberId || null) // 내 멤버 ID 저장
        }
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

  // 내 할당된 할일 불러오기 & 날짜별 필터링
  useEffect(() => {
    async function loadMyAssignments() {
      if (!groupId || !myMemberId) {
        setMyAssignments([])
        return
      }

      setLoading(true)
      setError('')
      try {
        const assignments: Assignment[] = await getAssignments({ groupId })

        // 날짜와 내 멤버 ID로 필터링
        const filtered = assignments.filter((a) => {
          const assignmentDate = a.date ? a.date.slice(0, 10) : ''
          const isSameDate = assignmentDate === dateKey
          const isMyAssignment = a.groupMemberId === myMemberId
          return isSameDate && isMyAssignment
        })

        // 할 일 제목 배열
        const tasks = filtered.map((a) => a.category || '할 일')

        setMyAssignments(tasks)
      } catch (e) {
        setError('업무 내역을 불러오는 중 오류가 발생했습니다.')
        setMyAssignments([])
      } finally {
        setLoading(false)
      }
    }

    if (userAuthenticated && groupId && myMemberId) {
      loadMyAssignments()
    } else {
      setMyAssignments([])
    }
  }, [userAuthenticated, groupId, myMemberId, dateKey])

  return (
    <div className="space-y-6">
      <p>Name님 반가워요!</p>

      {loading && <div>그룹 정보 및 업무 내역 불러오는 중...</div>}
      {error && <div className="text-red-600">{error}</div>}

      {!loading && (hasGroups ? <TodoListBox /> : <GroupBox />)}

      <CalendarBox onDateSelect={setSelectedDate} value={selectedDate} />
      <CalendarDateDetails selectedDate={selectedDate} events={myAssignments} />
    </div>
  )
}

export default MainPage
