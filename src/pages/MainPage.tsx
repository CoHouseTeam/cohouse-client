import { useEffect, useState, useMemo } from 'react'
import CalendarBox from '../features/mainpage/components/CalendarBox'
import CalendarDateDetails from '../features/mainpage/components/CalendarDateDetail'
import TodoListBox from '../features/mainpage/components/TodoListBox'
import GroupBox from '../features/mainpage/components/GroupBox'
import { useCalendarStore } from '../app/tasksStore'
import { fetchMyGroups } from '../libs/api/groups'
import { isAuthenticated } from '../libs/utils/auth'
import { getAssignments } from '../libs/api/tasks'
import { Assignment } from '../types/tasks'
import { useGroupStore } from '../app/store'
import { getMyMemberId, getProfile } from '../libs/api/profile'
import { AxiosError } from 'axios'

const MainPage = () => {
  const { selectedDate, setSelectedDate } = useCalendarStore()
  const dateKey = useMemo(() => selectedDate.toISOString().slice(0, 10), [selectedDate])

  //스토어 상태 저장
  const hasGroups = useGroupStore((state) => state.hasGroups)
  const setHasGroups = useGroupStore((state) => state.setHasGroups)
  const setMyMemberId = useGroupStore((state) => state.setMyMemberId)
  const myMemberId = useGroupStore((state) => state.myMemberId)

  const [loadingGroup, setLoadingGroup] = useState(false)
  const [errorGroup, setErrorGroup] = useState('')

  const [loadingAssignments, setLoadingAssignments] = useState(false)
  const [errorAssignments, setErrorAssignments] = useState('')

  const [userAuthenticated, setUserAuthenticated] = useState(false)
  const [groupId, setGroupId] = useState<number | null>(null)
  const [userName, setUserName] = useState<string>('')

  const [myAssignments, setMyAssignments] = useState<string[]>([])

  // 인증 상태 감지
  useEffect(() => {
    setUserAuthenticated(isAuthenticated())
  }, [])

  //사용자의 프로필
  useEffect(() => {
    async function fetchUser() {
      try {
        const profile = await getProfile()
        setUserName(profile.name || '') // name 필드에 따라 수정
      } catch {
        setUserName('')
      }
    }

    fetchUser()
  }, [])

  //사용자 멤버 ID 조회
  useEffect(() => {
    async function fetchMemberId() {
      try {
        const id = await getMyMemberId()
        setMyMemberId(id)
      } catch {
        setMyMemberId(null)
      }
    }

    fetchMemberId()
  }, [setMyMemberId])

  // 그룹 정보 로딩
  useEffect(() => {
    async function loadGroups() {
      setLoadingGroup(true)
      setErrorGroup('')
      try {
        const groups = await fetchMyGroups()
        const hasGroup = Array.isArray(groups) ? groups.length > 0 : groups != null
        setHasGroups(hasGroup)
        if (hasGroup) {
          setGroupId(groups[0]?.id || null)
          setMyMemberId(groups[0]?.myMemberId || null)
        } else {
          setGroupId(null)
          setMyMemberId(null)
        }
      } catch (e) {
        const error = e as AxiosError
        if (error.response?.status === 404) {
          // 그룹 없음으로 간주
          setHasGroups(false)
          setGroupId(null)
          setMyMemberId(null)
          setErrorGroup('') // 에러 메시지 없이 처리
        } else {
          setErrorGroup('그룹 정보를 불러오는 중 오류가 발생했습니다.')
          setHasGroups(false)
          setGroupId(null)
          setMyMemberId(null)
        }
      } finally {
        setLoadingGroup(false)
      }
    }

    if (userAuthenticated) {
      loadGroups()
    } else {
      setHasGroups(false)
      setGroupId(null)
      setMyMemberId(null)
      setLoadingGroup(false)
    }
  }, [userAuthenticated, setHasGroups])

  // 할당 내역 로딩 & 필터링
  useEffect(() => {
    async function loadMyAssignments() {
      if (!groupId || !myMemberId) {
        setMyAssignments([])
        setErrorAssignments('')
        setLoadingAssignments(false)
        return
      }

      setLoadingAssignments(true)
      setErrorAssignments('')
      try {
        const assignments: Assignment[] = await getAssignments({ groupId })
        const filtered = assignments.filter((a) => {
          const assignmentDate = a.date ? a.date.slice(0, 10) : ''
          return assignmentDate === dateKey && a.groupMemberId === myMemberId
        })
        const tasks = filtered.map((a) => a.category || '할 일')
        setMyAssignments(tasks)
      } catch (e) {
        setErrorAssignments('업무 내역을 불러오는 중 오류가 발생했습니다.')
        setMyAssignments([])
      } finally {
        setLoadingAssignments(false)
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
      <p>{userName ? `${userName}님 반가워요!` : '반가워요!'}</p>

      {loadingGroup && <div>그룹 정보를 불러오는 중...</div>}
      {errorGroup && <div className="text-red-600">{errorGroup}</div>}

      {!loadingGroup && !errorGroup && (!hasGroups ? <GroupBox /> : null)}

      {loadingAssignments && <div>업무 내역을 불러오는 중...</div>}
      {errorAssignments && <div className="text-red-600">{errorAssignments}</div>}

      {!loadingGroup && !errorGroup && !loadingAssignments && !errorAssignments && hasGroups && (
        <TodoListBox />
      )}

      <CalendarBox onDateSelect={setSelectedDate} value={selectedDate} />
      <CalendarDateDetails selectedDate={selectedDate} events={myAssignments} />
    </div>
  )
}

export default MainPage
