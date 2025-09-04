import { useEffect, useState, useCallback } from 'react'
import CalendarBox from '../features/mainpage/components/CalendarBox'
import CalendarDateDetails from '../features/mainpage/components/CalendarDateDetail'
import TodoListBox from '../features/mainpage/components/TodoListBox'
import GroupBox from '../features/mainpage/components/GroupBox'
import { useCalendarStore } from '../app/store'
import { useGroupStore } from '../app/store'
import { fetchMyGroups } from '../libs/api/groups'
import { isAuthenticated } from '../libs/utils/auth'
import LoadingSpinner from '../features/common/LoadingSpinner'
import ErrorCard from '../features/common/ErrorCard'
import { useAuth } from '../libs/hooks/useAuth'

const eventData: { [date: string]: string[] } = {
  '2025-08-04': ['빨래', '설거지', '치킨 배달 정산'],
  '2025-08-05': [],
}

const MainPage = () => {
  const { selectedDate, setSelectedDate } = useCalendarStore()
  const dateKey = selectedDate.toISOString().slice(0, 10)

  const hasGroups = useGroupStore((state) => state.hasGroups)
  const setHasGroups = useGroupStore((state) => state.setHasGroups)
  const { permissions, refreshPermissions } = useAuth()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [userAuthenticated, setUserAuthenticated] = useState(false)

  useEffect(() => {
    setUserAuthenticated(isAuthenticated())
    
    // 네이버/구글 로그인 후 localStorage 인증 상태 확인
    const isAuthFromStorage = localStorage.getItem('isAuthenticated') === 'true'
    if (isAuthFromStorage) {
      setUserAuthenticated(true)
      // 소셜 로그인 후 권한 새로고침
      refreshPermissions()
    }
    
    // localStorage 변경 감지
    const handleStorageChange = () => {
      const isAuth = localStorage.getItem('isAuthenticated') === 'true'
      if (isAuth) {
        setUserAuthenticated(true)
        // 소셜 로그인 후 권한 새로고침
        refreshPermissions()
      }
    }
    
    window.addEventListener('storage', handleStorageChange)
    
    // 주기적 체크 제거 (무한 루프 방지)
    // 필요시 수동으로 체크하거나 이벤트 기반으로 처리
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [refreshPermissions]) // refreshPermissions 의존성 추가

  // 로그인 상태가 변경될 때마다 권한 새로고침 제거 (무한 루프 방지)
  // 권한은 useAuth에서 자동으로 관리됨

  const loadGroups = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const groups = await fetchMyGroups()
      const hasGroup = Array.isArray(groups) ? groups.length > 0 : groups != null
      setHasGroups(hasGroup)
      
      // 그룹 정보 조회 성공 시 권한 새로고침 제거 (무한 루프 방지)
      // 권한은 이미 useAuth에서 관리되고 있음
      
      // 그룹이 없는 경우 에러가 아닌 정상적인 상황
      if (!hasGroup) {
        setError('') // 에러 메시지 제거
      }
    } catch (e: any) {
      console.log('그룹 정보를 불러오는 중 오류가 발생했습니다:', e)
      
      // 404 에러는 그룹이 없는 것이므로 에러가 아님
      if (e.response?.status === 404) {
        setError('') // 에러 메시지 제거
        setHasGroups(false)
      } else {
        setError('그룹 정보가 없습니다.')
        setHasGroups(false)
      }
    } finally {
      setLoading(false)
    }
  }, [setHasGroups]) // refreshPermissions 의존성 제거

  useEffect(() => {
    if (userAuthenticated) {
      loadGroups()
    } else {
      setHasGroups(false)
      setLoading(false)
    }
  }, [userAuthenticated, loadGroups]) // loadGroups 의존성 추가

  // useAuth의 권한과 useGroupStore 동기화
  useEffect(() => {
    if (permissions.canAccessFeatures !== hasGroups) {
      setHasGroups(permissions.canAccessFeatures)
    }
  }, [permissions.canAccessFeatures, hasGroups]) // setHasGroups 의존성 제거

  return (
    <div className="space-y-6">
      {loading && <LoadingSpinner message="그룹 정보 불러오는 중..." />}
      
      {error && <ErrorCard message={error} />}
      
      {!loading && hasGroups && userAuthenticated && (
          <h3 className="text-lg font-semibold text-blue-800 mb-2">반가워요!</h3>
      )}

      {!loading && (hasGroups ? <TodoListBox /> : <GroupBox />)}

      <CalendarBox onDateSelect={setSelectedDate} value={selectedDate} />
      <CalendarDateDetails selectedDate={selectedDate} events={eventData[dateKey] || []} />
    </div>
  )
}

export default MainPage
