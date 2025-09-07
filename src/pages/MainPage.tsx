import { useEffect, useMemo } from 'react'
import CalendarBox from '../features/mainpage/components/CalendarBox'
import CalendarDateDetails from '../features/mainpage/components/CalendarDateDetail'
import TodoListBox from '../features/mainpage/components/TodoListBox'
import GroupBox from '../features/mainpage/components/GroupBox'
import { useCalendarStore } from '../app/tasksStore'
import { useTaskStore } from '../app/tasksStore'
import { useGroupStore } from '../app/store'
import { useUserProfile } from '../libs/hooks/mainpage/useUserProfile'
import { useGroupData } from '../libs/hooks/mainpage/useGroupData'
import { formatDateKey } from '../libs/utils/dateKey'
import LoadingSpinner from '../features/common/LoadingSpinner'
import { getAssignments } from '../libs/api/tasks'

const MainPage = () => {
  const { selectedDate, setSelectedDate } = useCalendarStore()
  const { userAuthenticated, userName } = useUserProfile()
  const { loadingGroup, errorGroup, hasGroups, groupId } = useGroupData(userAuthenticated)
  const myMemberId = useGroupStore((state) => state.myMemberId)

  const assignments = useTaskStore((state) => state.assignments)
  const setAssignments = useTaskStore((state) => state.setAssignments)
  const loadingAssignments = useTaskStore((state) => state.loadingAssignments)
  const setLoadingAssignments = useTaskStore((state) => state.setLoadingAssignments)
  const errorAssignments = useTaskStore((state) => state.errorAssignments)
  const setErrorAssignments = useTaskStore((state) => state.setErrorAssignments)
  const myAssignments = useTaskStore((state) => state.myAssignments)
  const setMyAssignments = useTaskStore((state) => state.setMyAssignments)

  const dateKey = useMemo(() => formatDateKey(selectedDate), [selectedDate])
  const todayKey = useMemo(() => formatDateKey(new Date()), [])

  const isAssignedToUser = (assignment: (typeof assignments)[number], memberId: number | null) => {
    if (!memberId) return false
    if (Array.isArray(assignment.groupMemberId)) {
      return assignment.groupMemberId.includes(memberId)
    }
    return assignment.groupMemberId === memberId
  }

  const assignmentDates = useMemo(() => {
    return Array.from(
      new Set(
        assignments
          .filter((a) => isAssignedToUser(a, myMemberId))
          .map((a) => (a.date ? formatDateKey(new Date(a.date)) : ''))
          .filter(Boolean)
      )
    )
  }, [assignments, myMemberId])

  const todayAssignments = useMemo(
    () =>
      assignments
        .filter((a) => {
          if (!a.date) return false
          const assignmentDate = formatDateKey(new Date(a.date))
          return isAssignedToUser(a, myMemberId) && assignmentDate === todayKey
        })
        .map((a) => ({
          assignmentId: a.assignmentId,
          category: a.category,
          checked: false,
          status: a.status,
        })),
    [assignments, myMemberId, todayKey]
  )

  useEffect(() => {
    async function loadAssignments() {
      if (!groupId) {
        setAssignments([])
        setMyAssignments([])
        setLoadingAssignments(false)
        setErrorAssignments('')
        return
      }
      setLoadingAssignments(true)
      setErrorAssignments('')

      try {
        const data = await getAssignments({ groupId })
        const assignmentList = Array.isArray(data) ? data : []
        setAssignments(assignmentList)

        // 오늘 날짜 할 일 카테고리만 추출해서 저장
        if (myMemberId) {
          const filteredCategories = assignmentList
            .filter((a) => {
              if (!a.date) return false
              return isAssignedToUser(a, myMemberId) && formatDateKey(new Date(a.date)) === dateKey
            })
            .map((a) => a.category || '할 일')
          setMyAssignments(filteredCategories)
        } else {
          setMyAssignments([])
        }
      } catch {
        setAssignments([])
        setMyAssignments([])
        setErrorAssignments('업무 내역을 불러오는 중 오류가 발생했습니다.')
      } finally {
        setLoadingAssignments(false)
      }
    }

    if (userAuthenticated && groupId) {
      loadAssignments()
    } else {
      setAssignments([])
      setMyAssignments([])
      setLoadingAssignments(false)
      setErrorAssignments('')
    }
  }, [
    userAuthenticated,
    groupId,
    myMemberId,
    dateKey,
    setAssignments,
    setErrorAssignments,
    setLoadingAssignments,
    setMyAssignments,
  ])

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-blue-800 mb-2">
        반가워요, {userName || '사용자'}님!
      </h3>

      {loadingGroup && <LoadingSpinner />}
      {errorGroup && <div className="text-red-600">{errorGroup}</div>}

      {!loadingGroup && !errorGroup && (
        <>
          {!hasGroups ? (
            <GroupBox />
          ) : (
            <>
              {loadingAssignments && <LoadingSpinner />}
              {errorAssignments && <div className="text-red-600">{errorAssignments}</div>}

              {!loadingAssignments && !errorAssignments && (
                <TodoListBox todos={todayAssignments} groupId={groupId} memberId={myMemberId} />
              )}

              <CalendarBox
                onDateSelect={setSelectedDate}
                value={selectedDate}
                scheduledDates={assignmentDates}
              />
              <CalendarDateDetails selectedDate={selectedDate} events={myAssignments} />
            </>
          )}
        </>
      )}
    </div>
  )
}

export default MainPage
