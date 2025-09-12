import { useState, useEffect, useCallback } from 'react'
import {
  getNotificationsSettings,
  getUnreadCount,
  NotificationSettings,
  updateNotificationsSettings,
} from '../api/notifications'
import { useAuth } from '../../contexts/AuthContext'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useProfile } from './mypage/useProfile'

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

    const interval = setInterval(
      () => {
        fetchUnreadCount()
      },
      5 * 60 * 1000
    ) // 5분

    return () => clearInterval(interval)
  }, [isAuthenticated, fetchUnreadCount])

  return {
    unreadCount,
    loading,
    fetchUnreadCount,
    updateUnreadCount,
  }
}

export const NOTI_SETTINGS_KEY = ['notifications', 'settings'] as const

/** 알림 설정 조회 (GET /api/notifications/settings) */
export function useNotificationsSettings() {
  const { data: me } = useProfile()
  return useQuery({
    queryKey: [NOTI_SETTINGS_KEY, me?.id],
    queryFn: getNotificationsSettings,
    enabled: !!me?.id,
    staleTime: 0,
    refetchOnMount: 'always',
  })
}

/** 알림 설정 저장 (PUT /api/notifications/settings) */
export function useUpdateNotificationSetting() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: NotificationSettings) => updateNotificationsSettings(body),
    onSuccess: (_data, body) => {
      // 즉시 캐시 갱신
      qc.setQueryData(NOTI_SETTINGS_KEY, body)
      // 저장 후 목록 재검증
      qc.invalidateQueries({ queryKey: NOTI_SETTINGS_KEY })
    },
  })
}
