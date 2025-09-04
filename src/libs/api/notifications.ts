import api from './axios'
import { Notification, UnreadCountResponse, CreateNotificationRequest, CreateNotificationResponse } from '../../types/notification'

// 알림 목록 조회
export const getNotifications = async (): Promise<Notification[]> => {
  const response = await api.get('/api/notifications')
  return response.data
}

// 읽지 않은 알림 개수 조회
export const getUnreadCount = async (): Promise<UnreadCountResponse> => {
  const response = await api.get('/api/notifications/unread-count')
  return response.data
}

// 알림 읽음 처리
export const markNotificationAsRead = async (notificationId: number): Promise<void> => {
  await api.put(`/api/notifications/${notificationId}/read`)
}

// 새 알림 생성
export const createNotification = async (data: CreateNotificationRequest, isAppActive: boolean = false): Promise<CreateNotificationResponse> => {
  try {
    console.log('📤 알림 생성 요청 데이터:', data)
    console.log('📤 isAppActive:', isAppActive)
    
    const response = await api.post('/api/notifications', data, {
      headers: {
        'isAppActive': isAppActive.toString()
      }
    })
    
    console.log('✅ 알림 생성 성공:', response.data)
    return response.data
  } catch (error: any) {
    console.error('❌ 알림 생성 실패 상세 정보:')
    console.error('에러 객체:', error)
    console.error('응답 상태:', error.response?.status)
    console.error('응답 데이터:', error.response?.data)
    console.error('응답 헤더:', error.response?.headers)
    console.error('요청 설정:', error.config)
    
    // 서버에서 반환한 구체적인 에러 메시지가 있다면 사용
    if (error.response?.data?.message) {
      throw new Error(`알림 생성 실패: ${error.response.data.message}`)
    } else if (error.response?.data?.error) {
      throw new Error(`알림 생성 실패: ${error.response.data.error}`)
    } else {
      throw error
    }
  }
}

// 모든 알림 삭제
export const deleteAllNotifications = async (): Promise<void> => {
  await api.delete('/api/notifications/all')
}
