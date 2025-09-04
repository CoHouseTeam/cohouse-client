import React, { useState, useEffect, useRef } from 'react'
import { Bell, X, Trash2, Check } from 'lucide-react'
import { getNotifications, markNotificationAsRead, deleteAllNotifications } from '../libs/api/notifications'
import { Notification } from '../types/notification'
import { useAuth } from '../contexts/AuthContext'
import { useNotifications } from '../libs/hooks/useNotifications'

interface NotificationSidebarProps {
  isOpen: boolean
  onClose: () => void
}

export default function NotificationSidebar({ isOpen, onClose }: NotificationSidebarProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const { isAuthenticated } = useAuth()
  const { updateUnreadCount } = useNotifications()
  
  // 터치 제스처를 위한 ref와 상태
  const sidebarRef = useRef<HTMLDivElement>(null)
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)

  // 스와이프 제스처 처리
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > 50 // 왼쪽으로 50px 이상 스와이프
    
    if (isLeftSwipe) {
      onClose() // 왼쪽으로 스와이프하면 사이드바 닫기
    }
    
    setTouchStart(null)
    setTouchEnd(null)
  }

  // 알림 목록 조회
  const fetchNotifications = async () => {
    if (!isAuthenticated) return
    
    try {
      setLoading(true)
      const notificationsData = await getNotifications()
      setNotifications(notificationsData)
    } catch (error) {
      console.error('알림 조회 실패:', error)
    } finally {
      setLoading(false)
    }
  }

  // 알림 읽음 처리
  const handleMarkAsRead = async (notificationId: number) => {
    try {
      await markNotificationAsRead(notificationId)
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId 
            ? { ...notif, read: true, readAt: new Date().toISOString() }
            : notif
        )
      )
      
      // 읽지 않은 개수 업데이트
      updateUnreadCount(notifications.filter(n => !n.read).length - 1)
    } catch (error) {
      console.error('알림 읽음 처리 실패:', error)
    }
  }

  // 모든 알림 삭제
  const handleDeleteAll = async () => {
    if (!confirm('모든 알림을 삭제하시겠습니까?')) return
    
    try {
      setDeleting(true)
      await deleteAllNotifications()
      setNotifications([])
      updateUnreadCount(0)
    } catch (error) {
      console.error('알림 삭제 실패:', error)
    } finally {
      setDeleting(false)
    }
  }

  // 알림 타입에 따른 아이콘과 색상
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'TASK':
        return '📋'
      case 'SETTLEMENT':
        return '💰'
      case 'BOARD':
        return '📝'
      case 'GROUP':
        return '👥'
      default:
        return '🔔'
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'TASK':
        return 'text-blue-600'
      case 'SETTLEMENT':
        return 'text-green-600'
      case 'BOARD':
        return 'text-purple-600'
      case 'GROUP':
        return 'text-orange-600'
      default:
        return 'text-gray-600'
    }
  }

  // 날짜 포맷팅
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return '방금 전'
    if (diffInHours < 24) return `${diffInHours}시간 전`
    if (diffInHours < 48) return '어제'
    return date.toLocaleDateString('ko-KR')
  }

  useEffect(() => {
    if (isOpen && isAuthenticated) {
      fetchNotifications()
    }
  }, [isOpen, isAuthenticated])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Overlay */}
      <div 
        className={`absolute inset-0 bg-black transition-all duration-500 ease-in-out ${
          isOpen ? 'bg-opacity-50 opacity-100' : 'bg-opacity-0 opacity-0'
        }`}
        onClick={onClose}
      />
      
      {/* Sidebar - 모바일에서는 모바일 메뉴와 동일한 스타일과 애니메이션, 데스크톱에서는 기존 스타일 */}
      <div 
        ref={sidebarRef}
        className={`absolute right-0 top-0 h-full bg-base-100 min-h-full border-r z-[99999]
                   w-72 sm:w-80 md:w-96 lg:w-96
                   sm:bg-white sm:shadow-xl sm:border-r-0
                   transition-all duration-500 ease-in-out transform
                   ${isOpen ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-3 sm:p-4 border-b">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold">알림</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDeleteAll}
              disabled={deleting || notifications.length === 0}
              className="btn btn-ghost btn-sm text-red-600 hover:bg-red-50 p-2 sm:p-3"
              title="모든 알림 삭제"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="btn btn-ghost btn-sm p-2 sm:p-3"
              aria-label="닫기"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center p-6 sm:p-8">
              <div className="loading loading-spinner loading-md"></div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-6 sm:p-8 text-gray-500">
              <Bell className="w-10 h-10 sm:w-12 sm:h-12 mb-4 opacity-50" />
              <p className="text-center text-sm sm:text-base">새로운 알림이 없습니다</p>
            </div>
          ) : (
            <div className="p-3 sm:p-4 space-y-2 sm:space-y-3">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 sm:p-4 rounded-lg border transition-all ${
                    notification.read 
                      ? 'bg-gray-50 border-gray-200' 
                      : 'bg-blue-50 border-blue-200'
                  }`}
                >
                  <div className="flex items-start gap-2 sm:gap-3">
                    <div className={`text-xl sm:text-2xl ${getNotificationColor(notification.type)}`}>
                      {getNotificationIcon(notification.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className={`font-medium text-sm ${
                          notification.read ? 'text-gray-700' : 'text-gray-900'
                        }`}>
                          {notification.title}
                        </h3>
                        
                        {!notification.read && (
                          <button
                            onClick={() => handleMarkAsRead(notification.id)}
                            className="btn btn-ghost btn-xs text-blue-600 hover:bg-blue-100 p-1.5 sm:p-2"
                            title="읽음 처리"
                          >
                            <Check className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                      
                      <p className={`text-sm mt-1 ${
                        notification.read ? 'text-gray-600' : 'text-gray-800'
                      }`}>
                        {notification.content}
                      </p>
                      
                      <div className="flex items-center justify-between mt-2">
                        <span className={`text-xs ${
                          notification.read ? 'text-gray-500' : 'text-blue-600'
                        }`}>
                          {notification.read ? '읽음' : '읽지 않음'}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatDate(notification.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
