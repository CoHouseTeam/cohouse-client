import { useRef, useState, useEffect } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Menu, Bell, Share2, Copy, Check } from 'lucide-react'

type NavBarProps = {
  isAuthenticated: boolean
  onLogout?: () => void
  unreadCount?: number // optional for the bell dot
  children?: React.ReactNode
  onToggleAuth?: () => void // 개발용 토글 기능
}

export default function NavBar({ isAuthenticated, onLogout, unreadCount = 0, children, onToggleAuth }: NavBarProps) {
  const drawerToggleRef = useRef<HTMLInputElement>(null)
  const [showShareDropdown, setShowShareDropdown] = useState(false)
  const [showCopiedToast, setShowCopiedToast] = useState(false)

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
              className="btn btn-ghost btn-square lg:hidden"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </label>
            <Link to="/" className="btn btn-ghost text-xl">CoHouse</Link>
          </div>

          {/* center: desktop horizontal menu */}
          <div className="navbar-center hidden lg:flex">
            <ul className="menu menu-horizontal px-1">
              {commonLinks.map(({ to, label }) => (
                <li key={to}>
                  <NavLink to={to} className={({ isActive }) => (isActive ? 'font-semibold' : '')}>
                    {label}
                  </NavLink>
                </li>
              ))}

              <li className="mx-2 opacity-60">|</li>

              {!isAuthenticated ? (
                <li>
                  <NavLink to="/login" className={({ isActive }) => (isActive ? 'font-semibold' : '')}>
                    로그인
                  </NavLink>
                </li>
              ) : (
                <li>
                  <NavLink to="/mypage" className={({ isActive }) => (isActive ? 'font-semibold' : '')}>
                    마이페이지
                  </NavLink>
                </li>
              )}
            </ul>
          </div>

          {/* right: icons / login button */}
          <div className="navbar-end gap-1">
            {/* 개발용 토글 버튼 */}
            {onToggleAuth && (
              <button
                className="btn btn-sm btn-outline"
                onClick={onToggleAuth}
                title="개발용: 로그인/로그아웃 토글"
              >
                {isAuthenticated ? '로그아웃' : '로그인'}
              </button>
            )}
            
            {isAuthenticated ? (
              <>
                <button className="btn btn-ghost btn-square" aria-label="Notifications">
                  <div className="indicator">
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="indicator-item badge badge-primary badge-xs" aria-label={`${unreadCount} unread`} />
                    )}
                  </div>
                </button>

                <div className="dropdown dropdown-end">
                  <button
                    className="btn btn-ghost btn-square"
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
              </>
            ) : (
              <Link to="/login" className="btn btn-primary">로그인</Link>
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
                <NavLink to={to} onClick={closeDrawer}>{label}</NavLink>
              </li>
            ))}

            <li><div className="divider my-3"></div></li>

            {!isAuthenticated ? (
              <li>
                <NavLink to="/login" onClick={closeDrawer}>로그인/회원가입</NavLink>
              </li>
            ) : (
              <li>
                <NavLink to="/mypage" onClick={closeDrawer}>마이페이지</NavLink>
              </li>
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
