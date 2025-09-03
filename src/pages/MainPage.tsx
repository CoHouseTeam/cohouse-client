import { useEffect, useState, useMemo, useCallback } from 'react'
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

  const dateKey = useMemo(() => {
    const d = selectedDate
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0') // 월 2자리
    const day = String(d.getDate()).padStart(2, '0') // 일 2자리
    return `${year}-${month}-${day}`
  }, [selectedDate])

  const todayKey = useMemo(() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
  }, [])

  // 그룹 및 사용자 상태
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

  const [userName, setUserName] = useState('')
  const [myAssignments, setMyAssignments] = useState<string[]>([])
  const [assignments, setAssignments] = useState<Assignment[]>([]) // 전체 업무 데이터 저장

  // 인증 상태 설정
  useEffect(() => {
    setUserAuthenticated(isAuthenticated())
  }, [])

  // 사용자 프로필 불러오기
  useEffect(() => {
    async function fetchUserProfile() {
      try {
        const profile = await getProfile()
        setUserName(profile.name || '')
      } catch {
        setUserName('')
      }
    }
    fetchUserProfile()
  }, [])

  // 나의 멤버 ID 불러오기
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

  // 그룹 및 그룹 멤버 정보 불러오기
  const loadGroupData = useCallback(async () => {
    if (!userAuthenticated) {
      setErrorGroup('')
      setHasGroups(false)
      setGroupId(null)
      setMyMemberId(null)
      return
    }

    setLoadingGroup(true)
    setErrorGroup('')
    try {
      const myGroupData = await fetchMyGroups()

      if (!myGroupData || !myGroupData.id) {
        // 그룹 정보가 없으면 상태 초기화
        setHasGroups(false)
        setGroupId(null)
        setMyMemberId(null)
        return
      }

      setHasGroups(true)
      setGroupId(myGroupData.id)

      // 그룹 멤버 세팅
      const currentUserMemberId = await getMyMemberId()
      if (!currentUserMemberId) {
        setMyMemberId(null)
      } else {
        setMyMemberId(currentUserMemberId)
      }
    } catch (e) {
      const error = e as AxiosError
      if (error.response?.status === 404) {
        setHasGroups(false)
        setGroupId(null)
        setMyMemberId(null)
        setErrorGroup('')
      } else {
        setErrorGroup('그룹 정보를 불러오는 중 오류가 발생했습니다.')
        setHasGroups(false)
        setGroupId(null)
        setMyMemberId(null)
      }
    } finally {
      setLoadingGroup(false)
    }
  }, [userAuthenticated, setHasGroups, setMyMemberId])

  useEffect(() => {
    loadGroupData()
  }, [loadGroupData])

  // 오늘 할 일
  const todayAssignments = useMemo(
    () =>
      assignments
        .filter((a) => {
          const assignmentDate = a.date ? a.date.slice(0, 10) : ''
          let isAssignedToUser = false
          if (Array.isArray(a.groupMemberId)) {
            isAssignedToUser = a.groupMemberId.includes(myMemberId)
          } else {
            isAssignedToUser = a.groupMemberId === myMemberId
          }
          return assignmentDate === todayKey && isAssignedToUser
        })
        .map((a) => ({
          assignmentId: a.assignmentId,
          category: a.category,
          checked: false,
          status: a.status,
        })),
    [assignments, myMemberId, todayKey]
  )

  // 할당된 업무 조회 및 필터링
  useEffect(() => {
    async function loadAssignments() {
      if (!groupId) {
        setAssignments([])
        setMyAssignments([])
        setErrorAssignments('')
        setLoadingAssignments(false)
        return
      }

      setLoadingAssignments(true)
      setErrorAssignments('')

      try {
        const data: Assignment[] = await getAssignments({ groupId })
        setAssignments(Array.isArray(data) ? data : [])

        if (myMemberId) {
          const todayStr = dateKey
          const filtered = data.filter((a) => {
            const assignmentDate = a.date ? a.date.slice(0, 10) : ''
            let isAssignedToUser = false
            if (Array.isArray(a.groupMemberId)) {
              isAssignedToUser = a.groupMemberId.includes(myMemberId)
            } else {
              isAssignedToUser = a.groupMemberId === myMemberId
            }
            return assignmentDate === todayStr && isAssignedToUser
          })
          setMyAssignments(filtered.map((a) => a.category || '할 일'))
        } else {
          setMyAssignments([])
        }
      } catch (e) {
        setErrorAssignments('업무 내역을 불러오는 중 오류가 발생했습니다.')
        setAssignments([])
        setMyAssignments([])
      } finally {
        setLoadingAssignments(false)
      }
    }

    if (userAuthenticated && groupId) {
      loadAssignments()
    } else {
      setAssignments([])
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
        <TodoListBox todos={todayAssignments} />
      )}

      <CalendarBox onDateSelect={setSelectedDate} value={selectedDate} />
      <CalendarDateDetails selectedDate={selectedDate} events={myAssignments} />
    </div>
  )
}

export default MainPage
