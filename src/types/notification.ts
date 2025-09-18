export interface Notification {
  id: number
  type: 'TASK' | 'SETTLEMENT' | 'BOARD' | 'GROUP'
  title: string
  content: string
  read: boolean
  readAt: string | null
  createdAt: string
}

export interface UnreadCountResponse {
  count: number
}

export interface CreateNotificationRequest {
  type: 'TASK' | 'SETTLEMENT' | 'BOARD' | 'GROUP'
  title: string
  content: string
  recipientId?: number  // 수신자 ID (선택적)
  groupId?: number      // 그룹 ID (선택적)
}

export interface CreateNotificationResponse extends Notification {}
