import React from 'react'
import { useRef, useState, useEffect } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Menu, Bell, Share2, Copy, Check, LogOut } from 'lucide-react'
import { logout } from '../libs/utils/auth'
import { useAuth } from '../contexts/AuthContext'

type NavBarProps = {
  unreadCount?: number // optional for the bell dot
  children?: React.ReactNode
}

export default function NavBar({ unreadCount = 0, children }: NavBarProps) {
  const drawerToggleRef = useRef<HTMLInputElement>(null)
  const [showShareDropdown, setShowShareDropdown] = useState(false)
  const [showCopiedToast, setShowCopiedToast] = useState(false)
  
  // Context에서 인증 상태 가져오기
  const { isAuthenticated: isLoggedIn, refreshAuthState } = useAuth()
  
  const handleLogout = async () => {
    await logout() // 백엔드 API 호출 후 토큰 제거 및 리다이렉트
    refreshAuthState() // 인증 상태 새로고침
  }

  const closeDrawer = () => {
    if (drawerToggleRef.current) drawerToggleRef.current.checked = false
  }

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setShowCopiedToast(true)
      setShowShareDropdown(false)
      
      // 3초 후 토스트 숨기기
      setTimeout(() => {
        setShowCopiedToast(false)
      }, 3000)
    } catch (error) {
      console.error('Failed to copy URL:', error)
      // 폴백: 구식 브라우저 지원
      const textArea = document.createElement('textarea')
      textArea.value = window.location.href
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      
      setShowCopiedToast(true)
      setShowShareDropdown(false)
      
      setTimeout(() => {
        setShowCopiedToast(false)
      }, 3000)
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

  const commonLinks = [
    { to: '/tasks', label: '할 일' },
    { to: '/settlements', label: '정산하기' },
    { to: '/board', label: '보드 게시판' },
  ]

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
            <Link to="/" className="btn btn-ghost text-xl rounded-lg">CoHouse</Link>
          </div>

          {/* center: desktop horizontal menu */}
          <div className="navbar-center hidden lg:flex">
            <ul className="menu menu-horizontal px-1">
              {commonLinks.map(({ to, label }) => (
                <li key={to}>
                  <NavLink to={to} className={({ isActive }) => `hover:rounded-lg ${isActive ? 'font-semibold' : ''}`}>
                    {label}
                  </NavLink>
                </li>
              ))}

              <li className="mx-2 opacity-60 pt-2">|</li>

              {!isLoggedIn ? (
                <li>
                  <NavLink to="/login" className={({ isActive }) => `hover:rounded-lg ${isActive ? 'font-semibold' : ''}`}>
                    로그인
                  </NavLink>
                </li>
              ) : (
                <li>
                  <NavLink to="/mypage" className={({ isActive }) => `hover:rounded-lg ${isActive ? 'font-semibold' : ''}`}>
                    마이페이지
                  </NavLink>
                </li>
              )}
            </ul>
          </div>

          {/* right: icons / login button */}
          <div className="navbar-end gap-1">
            
            {isLoggedIn ? (
              <>
                <button className="btn btn-ghost btn-square rounded-lg" aria-label="Notifications">
                  <div className="indicator">
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="indicator-item badge bg-red-500 text-white badge-xs rounded-lg text-xs" aria-label={`${unreadCount} unread`}>
                        {unreadCount}
                      </span>
                    )}
                  </div>
                </button>

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
                        <button
                          onClick={handleShare}
                          className="flex items-center gap-2"
                        >
                          <Copy className="w-4 h-4" />
                          링크 복사하기
                        </button>
                      </li>
                    </ul>
                  )}
                </div>

                  <button
                    className="btn btn-ghost btn-sm rounded-lg"
                  onClick={handleLogout}
                    aria-label="Logout"
                  >
                  <LogOut size={16} />
                    로그아웃
                  </button>
              </>
            ) : (
              <Link to="/login" className="btn btn-custom btn-sm rounded-lg">로그인</Link>
            )}
          </div>
        </div>
        {children}
      </div>

      {/* Drawer side panel */}
      <div className="drawer-side">
        {/* Clicking the overlay closes the drawer */}
        <label htmlFor="app-drawer" className="drawer-overlay" aria-label="Close menu"></label>

        <aside className="w-72 bg-base-100 min-h-full border-r">
          <div className="px-6 pt-6 pb-3 text-lg font-semibold">CoHouse</div>
          <ul className="menu p-2">
            {commonLinks.map(({ to, label }) => (
              <li key={to}>
                <NavLink to={to} onClick={closeDrawer} className="rounded-lg">{label}</NavLink>
              </li>
            ))}

            <li><div className="divider my-3"></div></li>

            {!isLoggedIn ? (
              <li>
                <NavLink to="/login" onClick={closeDrawer} className="rounded-lg">로그인/회원가입</NavLink>
              </li>
            ) : (
              <>
                <li>
                  <NavLink to="/mypage" onClick={closeDrawer} className="rounded-lg">마이페이지</NavLink>
                </li>
                <li>
                                  <button 
                  onClick={async () => { closeDrawer(); await handleLogout(); }} 
                  className="rounded-lg w-full text-left flex items-center gap-2"
                >
                    <LogOut size={16} />
                    로그아웃
                  </button>
              </li>
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
            <span className="font-medium">링크 복사 완료!</span>
          </div>
        </div>
      )}
    </div>
  )
}
