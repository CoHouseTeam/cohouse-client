import { useState, useEffect, useCallback } from 'react'
import {
  createNotification,
  deleteAllNotifications,
  getNotifications,
  getNotificationsSettings,
  getUnreadCount,
  markNotificationAsRead,
  NotificationSettings,
  updateNotificationsSettings,
} from '../api/notifications'
import { useAuth } from '../../contexts/AuthContext'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useProfile } from './mypage/useProfile'
import {
  CreateNotificationRequest,
  Notification as AppNotification,
} from '../../types/notification'

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
  const { data: me } = useProfile()
  return useMutation({
    mutationFn: (body: NotificationSettings) => updateNotificationsSettings(body),
    onSuccess: (_data, body) => {
      // 즉시 캐시 갱신
      qc.setQueryData([NOTI_SETTINGS_KEY, me?.id], body)
      // 저장 후 목록 재검증
      qc.invalidateQueries({ queryKey: [NOTI_SETTINGS_KEY, me?.id] })
    },
  })
}

export const NOTI_LIST_KEY = ['notifications', 'list'] as const
export const NOTI_UNREAD_KEY = ['notifications', 'unread-count'] as const

// 알림 목록 조회
export function useNotificationList() {
  return useQuery<AppNotification[]>({
    queryKey: NOTI_LIST_KEY,
    queryFn: () => getNotifications(),
    staleTime: 0,
    refetchOnWindowFocus: true,
  })
}

/** 단건 읽음 처리 */
export function useMarkNotificationRead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => markNotificationAsRead(id),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: NOTI_LIST_KEY })
      const prev = qc.getQueryData<AppNotification[]>(NOTI_LIST_KEY)
      qc.setQueryData<AppNotification[]>(NOTI_LIST_KEY, (old) =>
        (old ?? []).map((n) =>
          n.id === id ? { ...n, read: true, readAt: new Date().toISOString() } : n
        )
      )
      qc.setQueryData(NOTI_UNREAD_KEY, (c: { count: number } | undefined) =>
        c ? { count: Math.max(0, c.count - 1) } : c
      )
      return { prev }
    },
    onError: (_e, _id, ctx) => {
      if (ctx?.prev) qc.setQueryData(NOTI_LIST_KEY, ctx.prev)
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: NOTI_LIST_KEY })
      qc.invalidateQueries({ queryKey: NOTI_UNREAD_KEY })
    },
  })
}

/** 전체 삭제 */
export function useDeleteAllNotifications() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => deleteAllNotifications(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: NOTI_LIST_KEY })
      qc.invalidateQueries({ queryKey: NOTI_UNREAD_KEY })
    },
  })
}

/** 알림 생성 (테스트/관리자 UI용) */
export function useCreateNotification() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (args: { body: CreateNotificationRequest; isAppActive?: boolean }) =>
      createNotification(args.body, args.isAppActive ?? false),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: NOTI_LIST_KEY })
      qc.invalidateQueries({ queryKey: NOTI_UNREAD_KEY })
    },
  })
}
