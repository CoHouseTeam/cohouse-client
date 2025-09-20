import { useEffect, useMemo } from 'react'
import CalendarBox from '../features/mainpage/components/CalendarBox'
import CalendarDateDetails from '../features/mainpage/components/CalendarDateDetail'
import TodoListBox from '../features/mainpage/components/TodoListBox'
import GroupBox from '../features/mainpage/components/GroupBox'
import {
  useAnnouncementStore,
  useCalendarStore,
  useSettlementStore,
  useTaskStore,
} from '../app/tasksStore'

import { useUserProfile } from '../libs/hooks/mainpage/useUserProfile'
import { useGroupData } from '../libs/hooks/mainpage/useGroupData'
import { formatDateKey } from '../libs/utils/dateKey'
import LoadingSpinner from '../features/common/LoadingSpinner'
import { announcementsSummary, fetchMySimple } from '../libs/api'
import { MemberAssignmentsHistories } from '../libs/api/tasks'
import { useGroupStore } from '../app/store'
import { safeArray } from '../libs/utils/safeArray'

const MainPage = () => {
  const { selectedDate, setSelectedDate } = useCalendarStore()
  const { userAuthenticated } = useUserProfile()
  const { loadingGroup, errorGroup, hasGroups, groupId } = useGroupData(userAuthenticated)
  const myMemberId = useGroupStore((state) => state.myMemberId)

  // Task Store
  const assignments = useTaskStore((state) => state.assignments)
  const setAssignments = useTaskStore((state) => state.setAssignments)
  const loadingAssignments = useTaskStore((state) => state.loadingAssignments)
  const setLoadingAssignments = useTaskStore((state) => state.setLoadingAssignments)
  const errorAssignments = useTaskStore((state) => state.errorAssignments)
  const setErrorAssignments = useTaskStore((state) => state.setErrorAssignments)
  const myAssignments = useTaskStore((state) => state.myAssignments)
  const setMyAssignments = useTaskStore((state) => state.setMyAssignments)

  // Announcement Store
  const announcements = useAnnouncementStore((state) => state.announcements)
  const setAnnouncements = useAnnouncementStore((state) => state.setAnnouncements)
  const loadingAnnouncements = useAnnouncementStore((state) => state.loadingAnnouncements)
  const setLoadingAnnouncements = useAnnouncementStore((state) => state.setLoadingAnnouncements)
  const errorAnnouncements = useAnnouncementStore((state) => state.errorAnnouncements)
  const setErrorAnnouncements = useAnnouncementStore((state) => state.setErrorAnnouncements)

  // Settlement Store
  const simpleSettlements = useSettlementStore((state) => state.simpleSettlements)
  const setSimpleSettlements = useSettlementStore((state) => state.setSimpleSettlements)
  const loadingSettlements = useSettlementStore((state) => state.loadingSettlements)
  const setLoadingSettlements = useSettlementStore((state) => state.setLoadingSettlements)
  const errorSettlements = useSettlementStore((state) => state.errorSettlements)
  const setErrorSettlements = useSettlementStore((state) => state.setErrorSettlements)

  const todayKey = useMemo(() => formatDateKey(new Date()), [])
  const selectedDateKey = useMemo(() => formatDateKey(selectedDate), [selectedDate])

  const isAssignedToUser = (assignment: (typeof assignments)[number], memberId: number | null) => {
    if (!memberId) return false
    if (Array.isArray(assignment.groupMemberId)) {
      return assignment.groupMemberId.includes(memberId)
    }
    return assignment.groupMemberId === memberId
  }

  // 할당된 날짜 리스트
  const assignmentDates = useMemo(() => {
    const dates = assignments
      .map((a) => (a.date ? formatDateKey(new Date(a.date)) : ''))
      .filter(Boolean)
    return Array.from(new Set(dates))
  }, [assignments])

  // 공지 날짜 배열
  const announcementDates = useMemo(() => {
    return announcements.map((a) => a.date)
  }, [announcements])

  // 선택한 날짜 공지 제목 리스트
  const announcementSelectedDate = useMemo(() => {
    const safeAnnouncements = safeArray(announcements) as any[]
    if (safeAnnouncements.length === 0) return []
    return safeAnnouncements.filter((a: any) => a.date === selectedDateKey).map((a: any) => a.title)
  }, [announcements, selectedDateKey])

  // 오늘 날짜 내 할당 업무
  const todayAssignments = useMemo(
    () =>
      (safeArray(assignments) as any[])
        .filter((a: any) => {
          if (!a.date) return false
          const assignmentDate = formatDateKey(new Date(a.date))
          return isAssignedToUser(a, myMemberId) && assignmentDate === todayKey
        })
        .map((a: any) => ({
          assignmentId: a.assignmentId,
          category: a.category,
          checked: false,
          status: a.status,
        })),
    [assignments, myMemberId, todayKey]
  )

  // 선택 날짜 정산 제목 리스트 및 날짜 목록
  const settlementDates = useMemo(
    () => simpleSettlements.map((s) => formatDateKey(new Date(s.createdAt))),
    [simpleSettlements]
  )

  const selectedDaySettlementTitles = useMemo(
    () =>
      (safeArray(simpleSettlements) as any[])
        .filter((s: any) => formatDateKey(new Date(s.createdAt)) === selectedDateKey)
        .map((s: any) => s.title),
    [simpleSettlements, selectedDateKey]
  )

  // 업무 내역 조회
  useEffect(() => {
    async function loadAssignments() {
      if (!groupId || !myMemberId) {
        setAssignments([])
        setMyAssignments([])
        setLoadingAssignments(false)
        setErrorAssignments('')
        return
      }
      setLoadingAssignments(true)
      setErrorAssignments('')

      try {
        const data = await MemberAssignmentsHistories({ groupId, memberId: myMemberId })
        const assignmentList = Array.isArray(data) ? data : []
        setAssignments(assignmentList)

        const filteredCategories = assignmentList
          .filter((a) => {
            if (!a.date) return false
            return (
              isAssignedToUser(a, myMemberId) && formatDateKey(new Date(a.date)) === selectedDateKey
            )
          })
          .map((a) => a.category || '할 일')
        setMyAssignments(filteredCategories)
      } catch {
        setAssignments([])
        setMyAssignments([])
        setErrorAssignments('업무 내역을 불러오는 중 오류가 발생했습니다.')
      } finally {
        setLoadingAssignments(false)
      }
    }

    if (userAuthenticated && groupId && myMemberId) {
      loadAssignments()
    } else {
      setAssignments([])
      setMyAssignments([])
      setLoadingAssignments(false)
      setErrorAssignments('')
    }
  }, [userAuthenticated, groupId, myMemberId, selectedDateKey]) // selectedDateKey로 변경

  // 공지사항 호출
  useEffect(() => {
    if (!groupId) return
    setLoadingAnnouncements(true)
    setErrorAnnouncements('')

    announcementsSummary(groupId)
      .then((data) => {
        setAnnouncements(Array.isArray(data) ? data : [])
      })
      .catch(() => setErrorAnnouncements('공지사항을 불러오는 중 오류가 발생했습니다.'))
      .finally(() => setLoadingAnnouncements(false))
  }, [groupId])

  // 정산 내역 호출
  useEffect(() => {
    if (!userAuthenticated || !groupId || !myMemberId || !selectedDate) {
      setSimpleSettlements([])
      setLoadingSettlements(false)
      setErrorSettlements('')
      return
    }
    setLoadingSettlements(true)
    setErrorSettlements('')

    fetchMySimple()
      .then((data) => setSimpleSettlements(Array.isArray(data) ? data : []))
      .catch(() => setErrorSettlements('정산 히스토리 조회 실패'))
      .finally(() => setLoadingSettlements(false))
  }, [userAuthenticated, groupId, myMemberId, selectedDate])

  return (
    <div className="min-h-screen bg-gray-50">

      {/* 메인 컨텐츠 */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {loadingGroup && (
          <div className="flex justify-center items-center py-16">
            <LoadingSpinner />
          </div>
        )}
        
        {errorGroup && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <p className="text-red-600 font-medium">{errorGroup}</p>
          </div>
        )}

        {!loadingGroup && !errorGroup && (
          <>
            {!hasGroups ? (
              <GroupBox />
            ) : (
              <div className="space-y-8">
                {/* 로딩 상태들 */}
                {loadingAssignments && (
                  <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="flex items-center justify-center py-8">
                      <LoadingSpinner />
                      <span className="ml-3 text-gray-600">업무를 불러오는 중...</span>
                    </div>
                  </div>
                )}
                
                {errorAssignments && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                    <p className="text-red-600 font-medium">{errorAssignments}</p>
                  </div>
                )}

                {loadingAnnouncements && (
                  <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="flex items-center justify-center py-8">
                      <LoadingSpinner />
                      <span className="ml-3 text-gray-600">공지사항을 불러오는 중...</span>
                    </div>
                  </div>
                )}
                
                {errorAnnouncements && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                    <p className="text-red-600 font-medium">{errorAnnouncements}</p>
                  </div>
                )}

                {loadingSettlements && (
                  <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="flex items-center justify-center py-8">
                      <LoadingSpinner />
                      <span className="ml-3 text-gray-600">정산 내역을 불러오는 중...</span>
                    </div>
                  </div>
                )}
                
                {errorSettlements && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                    <p className="text-red-600 font-medium">{errorSettlements}</p>
                  </div>
                )}

                {/* 오늘의 할 일 */}
                {!loadingAssignments && !errorAssignments && (
                  <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                    <div className="p-6 border-b border-gray-100">
                      <h2 className="text-xl font-bold text-black">오늘의 할 일</h2>
                      <p className="text-gray-600 mt-1">오늘 해야 할 업무를 확인해보세요</p>
                    </div>
                    <div className="p-6">
                      <TodoListBox todos={todayAssignments} groupId={groupId} memberId={myMemberId} />
                    </div>
                  </div>
                )}

                {/* 캘린더 섹션 */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-black">캘린더</h2>
                    <p className="text-gray-600 mt-1">일정과 이벤트를 한눈에 확인하세요</p>
                  </div>
                  <div className="p-6">
                    <CalendarBox
                      onDateSelect={setSelectedDate}
                      value={selectedDate}
                      scheduledDates={assignmentDates}
                      announcementDates={announcementDates}
                      settlementDates={settlementDates}
                    />
                  </div>
                </div>

                {/* 선택한 날짜 상세 */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-black">
                      {selectedDate.toLocaleDateString('ko-KR', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric',
                        weekday: 'long'
                      })}
                    </h2>
                    <p className="text-gray-600 mt-1">선택한 날짜의 이벤트와 할 일입니다</p>
                  </div>
                  <div className="p-6">
                    <CalendarDateDetails
                      selectedDate={selectedDate}
                      events={[
                        ...myAssignments,
                        ...announcementSelectedDate,
                        ...selectedDaySettlementTitles,
                      ]}
                    />
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default MainPage
