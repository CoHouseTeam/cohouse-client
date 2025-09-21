import React, { useState, useEffect, useRef, useMemo } from 'react'
import { Bell, X, Trash2, Check } from 'lucide-react'

import { useAuth } from '../contexts/AuthContext'
import {
  // useCreateNotification,
  useDeleteAllNotifications,
  useMarkNotificationRead,
  useNotificationList,
  useNotifications,
} from '../libs/hooks/useNotifications'

interface NotificationSidebarProps {
  isOpen: boolean
  onClose: () => void
}

export default function NotificationSidebar({ isOpen, onClose }: NotificationSidebarProps) {
  const { isAuthenticated } = useAuth()
  const { updateUnreadCount } = useNotifications()

  const { data: list = [], isLoading, refetch } = useNotificationList()
  const { mutateAsync: markRead } = useMarkNotificationRead()
  const { mutateAsync: clearAll, isPending: deleting } = useDeleteAllNotifications()

  // const { mutateAsync: createTest } = useCreateNotification()

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

  // 사이드바 열릴 때만 최신화
  useEffect(() => {
    if (isOpen && isAuthenticated) refetch()
  }, [isOpen, isAuthenticated, refetch])

  // 목록 기준으로 미읽음 자동 동기화(navBar 뱃지)
  const unreadCount = useMemo(() => list.filter((n) => !n.read).length, [list])
  useEffect(() => {
    if (isOpen) updateUnreadCount(unreadCount)
  }, [isOpen, unreadCount, updateUnreadCount])

  // 알림 읽음 처리
  const handleMarkAsRead = async (notificationId: number) => {
    // 이미 읽음이면 스킵
    const target = list.find((n) => n.id === notificationId)
    if (!target || target.read) return

    try {
      await markRead(notificationId) // 낙관적 업데이트/롤백은 훅 내부에서 처리
      // 미읽음 뱃지는 list 변화에 반응하는 useEffect가 자동 반영
    } catch (error) {
      console.error('알림 읽음 처리 실패:', error)
    }
  }

  // 모든 알림 삭제
  const handleDeleteAll = async () => {
    if (!confirm('모든 알림을 삭제하시겠습니까?')) return
    try {
      await clearAll()
      updateUnreadCount(0) // 즉시 뱃지 0
    } catch (e) {
      console.error('알림 삭제 실패:', e)
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

  // 임시 테스트 알림 생성 버튼 핸들러
  // const handleCreateTest = async () => {
  //   try {
  //     await createTest({
  //       body: {
  //         type: 'SETTLEMENT',
  //         title: '테스트 알림',
  //         content: '프론트에서 직접 생성했어요',
  //       },
  //       // isAppActive: false  // 필요시
  //     })
  //     alert('테스트 알림 생성 요청 보냈습니다 ✅')
  //   } catch (e) {
  //     console.error('❌ 알림 생성 실패:', e)
  //   }
  // }

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
              disabled={deleting || list.length === 0}
              className="btn btn-sm text-red-600 hover:bg-red-50 p-2 sm:p-3 rounded-lg"
              title="모든 알림 삭제"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button onClick={onClose} className="btn btn-ghost btn-sm p-2 sm:p-3" aria-label="닫기">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center p-6 sm:p-8">
              <div className="loading loading-spinner loading-md"></div>
            </div>
          ) : list.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-6 sm:p-8 text-gray-500">
              <Bell className="w-10 h-10 sm:w-12 sm:h-12 mb-4 opacity-50" />
              <p className="text-center text-sm sm:text-base">새로운 알림이 없습니다</p>
            </div>
          ) : (
            <div className="p-3 sm:p-4 space-y-2 sm:space-y-3">
              {list.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 sm:p-4 rounded-lg border transition-all ${
                    notification.read ? 'bg-gray-50 border-gray-200' : 'bg-blue-50 border-blue-200'
                  }`}
                >
                  <div className="flex items-start gap-2 sm:gap-3">
                    <div
                      className={`text-xl sm:text-2xl ${getNotificationColor(notification.type)}`}
                    >
                      {getNotificationIcon(notification.type)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3
                          className={`font-medium text-sm ${
                            notification.read ? 'text-gray-700' : 'text-gray-900'
                          }`}
                        >
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

                      <p
                        className={`text-sm mt-1 ${
                          notification.read ? 'text-gray-600' : 'text-gray-800'
                        }`}
                      >
                        {notification.content}
                      </p>

                      <div className="flex items-center justify-between mt-2">
                        <span
                          className={`text-xs ${
                            notification.read ? 'text-gray-500' : 'text-blue-600'
                          }`}
                        >
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
