import api from './axios'
import { NOTIFICATION_ENDPOINTS } from './endpoints'
import { 
  NotificationListResponse, 
  UnreadCountResponse 
} from '../../types/main'

// 🔔 Notification API Functions

// 알림 목록 조회 (타입 및 읽음 상태 필터링)
export const getNotifications = async (params?: {
  page?: number
  size?: number
  type?: string
  read?: boolean
  sort?: string
}): Promise<NotificationListResponse> => {
  const response = await api.get(NOTIFICATION_ENDPOINTS.LIST, { params })
  return response.data
}

// 읽지 않은 알림 개수 조회
export const getUnreadNotificationCount = async (): Promise<UnreadCountResponse> => {
  const response = await api.get(NOTIFICATION_ENDPOINTS.UNREAD_COUNT)
  return response.data
}

// 알림 읽음 처리
export const markNotificationAsRead = async (notificationId: number): Promise<void> => {
  const response = await api.put(NOTIFICATION_ENDPOINTS.MARK_READ(notificationId))
  return response.data
}

// 모든 알림 삭제
export const deleteAllNotifications = async (): Promise<void> => {
  const response = await api.delete(NOTIFICATION_ENDPOINTS.DELETE_ALL)
  return response.data
}
