import { PropsWithChildren } from 'react'
import { useAppStore } from '../app/store'
import NavBar from '../components/NavBar'

export default function AppLayout({ children }: PropsWithChildren) {
  const { user, setUser } = useAppStore()
  const isAuthenticated = !!user

  const handleLogout = () => {
    // Clear user data and token
    setUser(null)
    localStorage.removeItem('token')
    // TODO: Add redirect to login page if needed
  }

  // 임시 로그인/로그아웃 토글 기능 (개발용)
  const toggleAuth = () => {
    if (isAuthenticated) {
      handleLogout()
    } else {
      // 임시 사용자 데이터로 로그인
      setUser({
        id: '1',
        name: '테스트 사용자',
        email: 'test@example.com',
        role: 'user'
      })
      localStorage.setItem('token', 'temp-token')
    }
  }

  return (
    <div className="min-h-dvh">
      <NavBar
        isAuthenticated={isAuthenticated}
        onLogout={handleLogout}
        unreadCount={2} // optional
        onToggleAuth={toggleAuth}
      >
        <main className="p-4 flex-1">{children}</main>
      </NavBar>
    </div>
  )
}
