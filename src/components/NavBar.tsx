import React from 'react'
import { useRef, useState, useEffect } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Menu, Bell, Share2, Copy, Check, LogOut, User, ChevronDown } from 'lucide-react'
import { logout } from '../libs/utils/auth'
import { useAuth as useAuthContext } from '../contexts/AuthContext'
import { useAuth } from '../libs/hooks/useAuth'
import { createGroupInvitation, getCurrentGroupId } from '../libs/api/groups'
import { withdrawUser } from '../libs/api/profile'
import NotificationSidebar from './NotificationSidebar'
import { useNotifications } from '../libs/hooks/useNotifications'
import ConfirmModal from '../features/common/ConfirmModal'

type NavBarProps = {
  children?: React.ReactNode
}

export default function NavBar({ children }: NavBarProps) {
  const drawerToggleRef = useRef<HTMLInputElement>(null)
  const [showShareDropdown, setShowShareDropdown] = useState(false)
  const [showCopiedToast, setShowCopiedToast] = useState(false)
  const [showNotificationSidebar, setShowNotificationSidebar] = useState(false)
  const [showWithdrawModal, setShowWithdrawModal] = useState(false)
  const [showWithdrawSuccessModal, setShowWithdrawSuccessModal] = useState(false)
  // Context에서 인증 상태 가져오기
  const { isAuthenticated: isLoggedIn, refreshAuthState } = useAuthContext()

  // 권한 정보 가져오기
  const { permissions } = useAuth()

  // 알림 관련 훅 사용
  const { unreadCount } = useNotifications()

  const handleLogout = async () => {
    await logout() // 백엔드 API 호출 후 토큰 제거 및 리다이렉트
    refreshAuthState() // 인증 상태 새로고침
  }

  // 회원 탈퇴 확인 모달 열기
  const handleWithdrawClick = () => {
    setShowWithdrawModal(true)
  }

  // 회원 탈퇴 처리
  const handleWithdraw = async () => {
    try {
      await withdrawUser()
      setShowWithdrawModal(false)
      setShowWithdrawSuccessModal(true)
    } catch (error) {
      console.error('회원 탈퇴 실패:', error)
      alert('회원 탈퇴에 실패했습니다. 다시 시도해주세요.')
    }
  }

  // 회원 탈퇴 완료 후 처리
  const handleWithdrawSuccess = async () => {
    setShowWithdrawSuccessModal(false)
    await logout()
    refreshAuthState()
  }

  // 알림 사이드바 열기
  const handleNotificationClick = () => {
    setShowNotificationSidebar(true)
  }

  // 알림 사이드바 닫기
  const handleNotificationClose = () => {
    setShowNotificationSidebar(false)
  }

  const closeDrawer = () => {
    if (drawerToggleRef.current) drawerToggleRef.current.checked = false
  }

  const handleShare = async () => {
    try {
      // 동적으로 현재 그룹 ID를 가져오기
      const groupId = await getCurrentGroupId()

      // 그룹이 없는 경우 처리
      if (!groupId) {
        alert('그룹에 속해있지 않습니다.')
        return
      }

      const invitationData = await createGroupInvitation(groupId)
      const inviteCode = invitationData.inviteCode

      // 전체 초대 URL 생성
      const inviteUrl = `${inviteCode}`

      // 초대 URL을 클립보드에 복사
      await navigator.clipboard.writeText(inviteUrl)
      setShowCopiedToast(true)
      setShowShareDropdown(false)

      // 3초 후 토스트 숨기기
      setTimeout(() => {
        setShowCopiedToast(false)
      }, 3000)
    } catch (error) {
      console.error('Failed to create invitation:', error)
      // 폴백: 구식 브라우저 지원
      try {
        const groupId = await getCurrentGroupId()

        // 그룹이 없는 경우 처리
        if (!groupId) {
          alert('그룹에 속해있지 않습니다.')
          return
        }

        const invitationData = await createGroupInvitation(groupId)
        const inviteCode = invitationData.inviteCode

        // 전체 초대 URL 생성
        const inviteUrl = `${window.location.origin}/invite?code=${inviteCode}`

        const textArea = document.createElement('textarea')
        textArea.value = inviteUrl
        document.body.appendChild(textArea)
        textArea.select()
        document.execCommand('copy')
        document.body.removeChild(textArea)

        setShowCopiedToast(true)
        setShowShareDropdown(false)

        setTimeout(() => {
          setShowCopiedToast(false)
        }, 3000)
      } catch (fallbackError) {
        console.error('Fallback copy failed:', fallbackError)
        alert('초대 코드 생성에 실패했습니다.')
      }
    }
  }

  // 드롭다운 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (!target.closest('.dropdown')) {
        setShowShareDropdown(false)
      }
    }

    if (showShareDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showShareDropdown])

  // 사이드 메뉴 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      const drawerToggle = document.getElementById('app-drawer') as HTMLInputElement

      // 사이드 메뉴가 열려있고, 클릭한 요소가 사이드 메뉴가 아닌 경우
      if (
        drawerToggle?.checked &&
        !target.closest('.drawer-side') &&
        !target.closest('[for="app-drawer"]') &&
        !target.closest('.drawer-overlay')
      ) {
        drawerToggle.checked = false
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const commonLinks = [
    { to: '/tasks', label: '할 일', requireGroup: true },
    { to: '/settlements', label: '정산하기', requireGroup: true },
    { to: '/board', label: '보드 게시판', requireGroup: true },
  ]

  // 권한에 따라 메뉴 항목 필터링
  const filteredCommonLinks = commonLinks.filter((link) => {
    if (link.requireGroup) {
      return permissions.canAccessFeatures
    }
    return true
  })

  return (
    <div className="drawer">
      {/* Drawer toggle checkbox drives DaisyUI drawer */}
      <input id="app-drawer" type="checkbox" className="drawer-toggle" ref={drawerToggleRef} />

      {/* Page content */}
      <div className="drawer-content flex flex-col">
        <div className="navbar bg-base-200 shadow-lg">
          {/* left: hamburger (mobile) + brand */}
          <div className="navbar-start">
            <label
              htmlFor="app-drawer"
              className="btn btn-ghost btn-square lg:hidden rounded-lg"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </label>
            <Link to="/" className="btn btn-ghost text-xl rounded-lg">
              CoHouse
            </Link>
          </div>

          {/* center: desktop horizontal menu */}
          <div className="navbar-center hidden lg:flex">
            <ul className="menu menu-horizontal px-1">
              {filteredCommonLinks.map(({ to, label }) => (
                <li key={to}>
                  <NavLink
                    to={to}
                    className={({ isActive }) =>
                      `hover:rounded-lg ${isActive ? 'font-semibold' : ''}`
                    }
                  >
                    {label}
                  </NavLink>
                </li>
              ))}

              <li className="mx-2 opacity-60 pt-2">|</li>

              {!isLoggedIn ? (
                <li>
                  <NavLink
                    to="/login"
                    className={({ isActive }) =>
                      `hover:rounded-lg ${isActive ? 'font-semibold' : ''}`
                    }
                  >
                    로그인
                  </NavLink>
                </li>
              ) : (
                permissions.canAccessFeatures && (
                  <li>
                    <NavLink
                      to="/mypage"
                      className={({ isActive }) =>
                        `hover:rounded-lg ${isActive ? 'font-semibold' : ''}`
                      }
                    >
                      마이페이지
                    </NavLink>
                  </li>
                )
              )}
            </ul>
          </div>

          {/* right: icons / login button */}
          <div className="navbar-end gap-1">
            {isLoggedIn ? (
              <>
                <button
                  className="btn btn-ghost btn-square rounded-lg"
                  aria-label="Notifications"
                  onClick={handleNotificationClick}
                >
                  <div className="indicator">
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span
                        className="indicator-item badge bg-red-500 text-white badge-xs rounded-lg text-xs relative z-0"
                        aria-label={`${unreadCount} unread`}
                      >
                        {unreadCount}
                      </span>
                    )}
                  </div>
                </button>

                {/* 공유 버튼 - 그룹장만 표시 */}
                {permissions.canShareGroup && (
                  <div className="dropdown dropdown-end">
                    <button
                      className="btn btn-ghost btn-square rounded-lg"
                      aria-label="Share"
                      onClick={() => setShowShareDropdown(!showShareDropdown)}
                    >
                      <Share2 className="w-5 h-5" />
                    </button>

                    {showShareDropdown && (
                      <ul className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52 mt-2">
                        <li>
                          <button onClick={handleShare} className="flex items-center gap-2">
                            <Copy className="w-4 h-4" />
                            초대 코드 복사하기
                          </button>
                        </li>
                      </ul>
                    )}
                  </div>
                )}

                {/* 그룹이 있는 사용자: 로그아웃 버튼 */}
                {permissions.canAccessFeatures && (
                  <button
                    className="btn btn-ghost btn-sm rounded-lg"
                    onClick={handleLogout}
                    aria-label="Logout"
                  >
                    <LogOut size={16} />
                    로그아웃
                  </button>
                )}

                {/* 그룹이 없는 사용자: 사용자 관리 드롭다운 */}
                {!permissions.canAccessFeatures && (
                  <div className="dropdown dropdown-end">
                    <button
                      className="btn btn-ghost btn-sm rounded-lg"
                      aria-label="User Management"
                    >
                      <User size={16} />
                      <ChevronDown size={14} />
                    </button>

                    <ul className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-48 mt-2">
                      <li>
                        <button onClick={handleLogout} className="flex items-center gap-2">
                          <LogOut size={16} />
                          로그아웃
                        </button>
                      </li>
                      <li>
                        <button
                          onClick={handleWithdrawClick}
                          className="flex items-center gap-2 text-red-600 hover:text-red-700"
                        >
                          <User size={16} />
                          회원 탈퇴
                        </button>
                      </li>
                    </ul>
                  </div>
                )}
              </>
            ) : (
              <Link to="/login" className="btn btn-custom btn-sm rounded-lg">
                로그인
              </Link>
            )}
          </div>
        </div>
        {children}
      </div>

      {/* Drawer side panel */}
      <div className="drawer-side absolute">
        {/* Clicking the overlay closes the drawer */}
        <label
          htmlFor="app-drawer"
          className="z-[70] drawer-overlay"
          aria-label="Close menu"
        ></label>

        <aside className="w-72 bg-base-100 min-h-full border-r relative z-[99999]">
          <div className="px-6 pt-6 pb-3 text-lg font-semibold">CoHouse</div>

          <ul className="menu p-2">
            {filteredCommonLinks.map(({ to, label }) => (
              <li key={to}>
                <NavLink to={to} onClick={closeDrawer} className="rounded-lg">
                  {label}
                </NavLink>
              </li>
            ))}

            <li>
              <div className="divider my-3"></div>
            </li>

            {!isLoggedIn ? (
              <li>
                <NavLink to="/login" onClick={closeDrawer} className="rounded-lg">
                  로그인/회원가입
                </NavLink>
              </li>
            ) : (
              <>
                {permissions.canAccessFeatures && (
                  <li>
                    <NavLink to="/mypage" onClick={closeDrawer} className="rounded-lg">
                      마이페이지
                    </NavLink>
                  </li>
                )}
                <li>
                  <button
                    onClick={async () => {
                      closeDrawer()
                      await handleLogout()
                    }}
                    className="rounded-lg w-full text-left flex items-center gap-2"
                  >
                    <LogOut size={16} />
                    로그아웃
                  </button>
                </li>
                {!permissions.canAccessFeatures && (
                  <li>
                    <button
                      onClick={async () => {
                        closeDrawer()
                        handleWithdrawClick()
                      }}
                      className="rounded-lg w-full text-left flex items-center gap-2 text-red-600 hover:text-red-700"
                    >
                      <User size={16} />
                      회원 탈퇴
                    </button>
                  </li>
                )}
              </>
            )}
          </ul>
        </aside>
      </div>

      {/* 복사 완료 토스트 */}
      {showCopiedToast && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-blue-100 border border-blue-200 text-blue-800 shadow-lg rounded-lg px-4 py-3 max-w-sm flex items-center gap-2">
            <Check className="w-5 h-5 text-blue-600" />
            <span className="font-medium">초대 URL 복사 완료!</span>
          </div>
        </div>
      )}

      {/* 알림 사이드바 */}
      <NotificationSidebar isOpen={showNotificationSidebar} onClose={handleNotificationClose} />

      {/* 회원 탈퇴 확인 모달 */}
      <ConfirmModal
        open={showWithdrawModal}
        title="회원 탈퇴"
        message="정말로 회원 탈퇴를 하시겠습니까?"
        confirmText="탈퇴"
        cancelText="취소"
        onConfirm={handleWithdraw}
        onCancel={() => setShowWithdrawModal(false)}
      />

      {/* 회원 탈퇴 완료 모달 */}
      <ConfirmModal
        open={showWithdrawSuccessModal}
        title="회원 탈퇴 완료"
        message="회원 탈퇴가 완료되었습니다!"
        confirmText="확인"
        cancelText=""
        onConfirm={handleWithdrawSuccess}
        onCancel={handleWithdrawSuccess}
      />
    </div>
  )
}
