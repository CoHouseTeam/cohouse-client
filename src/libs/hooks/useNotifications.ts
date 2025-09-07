import { useState, useEffect, useCallback } from 'react'
import { getUnreadCount } from '../api/notifications'
import { useAuth } from '../../contexts/AuthContext'

export const useNotifications = () => {
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const { isAuthenticated } = useAuth()

  const fetchUnreadCount = useCallback(async () => {
    if (!isAuthenticated) {
      setUnreadCount(0)
      return
    }

    try {
      setLoading(true)
      const response = await getUnreadCount()
      setUnreadCount(response.count)
    } catch (error) {
      console.error('읽지 않은 알림 개수 조회 실패:', error)
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated])

  const updateUnreadCount = useCallback((count: number) => {
    setUnreadCount(count)
  }, [])

  // 로그인 상태가 변경될 때마다 읽지 않은 알림 개수 조회
  useEffect(() => {
    fetchUnreadCount()
  }, [fetchUnreadCount])

  // 주기적으로 알림 개수 업데이트 (5분마다)
  useEffect(() => {
    if (!isAuthenticated) return

    const interval = setInterval(() => {
      fetchUnreadCount()
    }, 5 * 60 * 1000) // 5분

    return () => clearInterval(interval)
  }, [isAuthenticated, fetchUnreadCount])

  return {
    unreadCount,
    loading,
    fetchUnreadCount,
    updateUnreadCount
  }
}
