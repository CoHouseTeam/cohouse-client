import { useEffect, useState, useMemo, useCallback } from 'react'
import CalendarBox from '../features/mainpage/components/CalendarBox'
import CalendarDateDetails from '../features/mainpage/components/CalendarDateDetail'
import TodoListBox from '../features/mainpage/components/TodoListBox'
import GroupBox from '../features/mainpage/components/GroupBox'
import { useCalendarStore } from '../app/tasksStore'
import { fetchMyGroups } from '../libs/api/groups'
import { isAuthenticated } from '../libs/utils/auth'
import LoadingSpinner from '../features/common/LoadingSpinner'
import ErrorCard from '../features/common/ErrorCard'
import { useAuth } from '../libs/hooks/useAuth'
import { getAssignments } from '../libs/api/tasks'
import { Assignment } from '../types/tasks'
import { useGroupStore } from '../app/store'
import { getProfile } from '../libs/api/profile'
import { AxiosError } from 'axios'


const MainPage = () => {
  const { selectedDate, setSelectedDate } = useCalendarStore()
  const { permissions } = useAuth()

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

  const [loadingGroup, setLoadingGroup] = useState(false)
  const [errorGroup, setErrorGroup] = useState('')

  const [loadingAssignments, setLoadingAssignments] = useState(false)
  const [errorAssignments, setErrorAssignments] = useState('')

  const [userAuthenticated, setUserAuthenticated] = useState(false)
  const [groupId, setGroupId] = useState<number | null>(null)

  const [userName, setUserName] = useState('')
  const [myAssignments, setMyAssignments] = useState<string[]>([])
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [myMemberId, setMyMemberId] = useState<number | null>(null)

  const assignmentDates: string[] = useMemo(() => {
    if (!myMemberId) return []
    
    return assignments
      .filter((a) => {
        if (Array.isArray(a.groupMemberId)) {
          return a.groupMemberId.includes(myMemberId)
        } else {
          return a.groupMemberId === myMemberId
        }
      })
      .map((a) => a.date?.slice(0, 10))
      .filter((d): d is string => !!d)
      .filter((d, i, arr) => arr.indexOf(d) === i) // 중복 제거
  }, [assignments, myMemberId])

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
      if (myGroupData.memberId) {
        setMyMemberId(myGroupData.memberId)
      } else {
        setMyMemberId(null)
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
  }, [userAuthenticated, setHasGroups])

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

    if (groupId) {
      loadAssignments()
    }
  }, [groupId, myMemberId, dateKey])

  // useAuth의 권한과 useGroupStore 동기화
  useEffect(() => {
    if (permissions?.canAccessFeatures !== hasGroups) {
      setHasGroups(permissions?.canAccessFeatures || false)
    }
  }, [permissions?.canAccessFeatures, hasGroups, setHasGroups])

  return (
    <div className="space-y-6">
      {loadingGroup && <LoadingSpinner message="그룹 정보 불러오는 중..." />}
      
      {errorGroup && <ErrorCard message={errorGroup} />}
      
      {!loadingGroup && hasGroups && userAuthenticated && (
          <h3 className="text-lg font-semibold text-blue-800 mb-2">
            반가워요, {userName || '사용자'}님!
          </h3>
      )}

      {!loadingGroup && !errorGroup && (!hasGroups ? <GroupBox /> : null)}

      {loadingAssignments && <div>업무 내역을 불러오는 중...</div>}
      {errorAssignments && <div className="text-red-600">{errorAssignments}</div>}

      {!loadingGroup && !errorGroup && !loadingAssignments && !errorAssignments && hasGroups && (
        <TodoListBox todos={todayAssignments} groupId={groupId} memberId={myMemberId} />
      )}

      <CalendarBox
        onDateSelect={setSelectedDate}
        value={selectedDate}
        scheduledDates={assignmentDates}
      />
      <CalendarDateDetails selectedDate={selectedDate} events={myAssignments} />
    </div>
  )
}

export default MainPage
