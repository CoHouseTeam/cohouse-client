import { useEffect, useMemo } from 'react'
import { Users } from 'lucide-react'
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">

      {/* 메인 컨텐츠 */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
        {loadingGroup && (
          <div className="flex justify-center items-center py-16">
            <LoadingSpinner />
          </div>
        )}
        
        {errorGroup && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 sm:p-6 text-center">
            <p className="text-red-600 font-medium text-sm sm:text-base">{errorGroup}</p>
          </div>
        )}

        {!loadingGroup && !errorGroup && (
          <>
            {!hasGroups ? (
              <div className="space-y-6">

                {/* 그룹 참여 섹션 */}
                <div className="w-full">
                  <GroupBox />
                </div>

                {/* 기능 소개 섹션 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mt-8">
                  <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 text-center shadow-sm hover:shadow-md transition-all duration-300">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Users className="w-6 h-6 text-blue-600" />
                    </div>
                    <h3 className="font-semibold text-gray-800 mb-2 text-sm sm:text-base">그룹 관리</h3>
                    <p className="text-gray-600 text-xs sm:text-sm">동료들과 함께 그룹을 만들어 효율적으로 관리하세요</p>
                  </div>
                  
                  <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 text-center shadow-sm hover:shadow-md transition-all duration-300">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-gray-800 mb-2 text-sm sm:text-base">일정 관리</h3>
                    <p className="text-gray-600 text-xs sm:text-sm">캘린더로 일정을 한눈에 보고 체계적으로 관리하세요</p>
                  </div>
                  
                  <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 text-center shadow-sm hover:shadow-md transition-all duration-300 sm:col-span-2 lg:col-span-1">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-gray-800 mb-2 text-sm sm:text-base">업무 관리</h3>
                    <p className="text-gray-600 text-xs sm:text-sm">할 일을 체계적으로 정리하고 팀원들과 공유하세요</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4 sm:space-y-8">
                {/* 로딩 상태들 */}
                {loadingAssignments && (
                  <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
                    <div className="flex items-center justify-center py-6 sm:py-8">
                      <LoadingSpinner />
                      <span className="ml-3 text-gray-600 text-sm sm:text-base">업무를 불러오는 중...</span>
                    </div>
                  </div>
                )}
                
                {errorAssignments && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4 sm:p-6">
                    <p className="text-red-600 font-medium text-sm sm:text-base">{errorAssignments}</p>
                  </div>
                )}

                {loadingAnnouncements && (
                  <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
                    <div className="flex items-center justify-center py-6 sm:py-8">
                      <LoadingSpinner />
                      <span className="ml-3 text-gray-600 text-sm sm:text-base">공지사항을 불러오는 중...</span>
                    </div>
                  </div>
                )}
                
                {errorAnnouncements && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4 sm:p-6">
                    <p className="text-red-600 font-medium text-sm sm:text-base">{errorAnnouncements}</p>
                  </div>
                )}

                {loadingSettlements && (
                  <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
                    <div className="flex items-center justify-center py-6 sm:py-8">
                      <LoadingSpinner />
                      <span className="ml-3 text-gray-600 text-sm sm:text-base">정산 내역을 불러오는 중...</span>
                    </div>
                  </div>
                )}
                
                {errorSettlements && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4 sm:p-6">
                    <p className="text-red-600 font-medium text-sm sm:text-base">{errorSettlements}</p>
                  </div>
                )}

                {/* 오늘의 할 일 */}
                {!loadingAssignments && !errorAssignments && (
                  <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                    <div className="p-4 sm:p-6 border-b border-gray-100">
                      <h2 className="text-lg sm:text-xl font-bold text-black">오늘의 할 일</h2>
                      <p className="text-gray-600 mt-1 text-sm sm:text-base">오늘 해야 할 업무를 확인해보세요</p>
                    </div>
                    <div className="p-4 sm:p-6">
                      <TodoListBox todos={todayAssignments} groupId={groupId} memberId={myMemberId} />
                    </div>
                  </div>
                )}

                {/* 캘린더 섹션 */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="p-4 sm:p-6 border-b border-gray-100">
                    <h2 className="text-lg sm:text-xl font-bold text-black">캘린더</h2>
                    <p className="text-gray-600 mt-1 text-sm sm:text-base">일정과 이벤트를 한눈에 확인하세요</p>
                  </div>
                  <div className="p-4 sm:p-6">
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
                  <div className="p-4 sm:p-6 border-b border-gray-100">
                    <h2 className="text-lg sm:text-xl font-bold text-black">
                      {selectedDate.toLocaleDateString('ko-KR', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric',
                        weekday: 'long'
                      })}
                    </h2>
                    <p className="text-gray-600 mt-1 text-sm sm:text-base">선택한 날짜의 이벤트와 할 일입니다</p>
                  </div>
                  <div className="p-4 sm:p-6">
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
