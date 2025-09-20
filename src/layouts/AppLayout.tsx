import { PropsWithChildren, useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useAuth } from '../libs/hooks/useAuth'
import NavBar from '../components/NavBar'

export default function AppLayout({ children }: PropsWithChildren) {
  const { permissions, loading } = useAuth()
  const location = useLocation()
  const [isAuthFromStorage, setIsAuthFromStorage] = useState(false)

  // localStorage에서 인증 상태 확인 (네이버 로그인 후)
  useEffect(() => {
    const checkAuthFromStorage = () => {
      const isAuth = localStorage.getItem('isAuthenticated') === 'true'
      const hasToken = localStorage.getItem('accessToken')
      setIsAuthFromStorage(isAuth && !!hasToken)
    }

    checkAuthFromStorage()

    // 주기적으로 인증 상태 확인
    const interval = setInterval(checkAuthFromStorage, 100)

    return () => clearInterval(interval)
  }, [])

  const isAuthenticated = permissions.isAuthenticated || isAuthFromStorage

  // 공개 페이지 목록 (인증 불필요)
  const publicPaths = [
    '/login',
    '/register',
    '/forgot-password',
    '/',
    '/oauth/callback/naver',
    '/oauth/callback/google',
    '/create-complete',
  ]
  const isPublicPage = publicPaths.includes(location.pathname)

  // 공개 페이지는 보호하지 않음
  if (isPublicPage) {
    return (
      <div className="min-h-dvh">
        <NavBar>
          <main className="p-4 flex-1">{children}</main>
        </NavBar>
      </div>
    )
  }

  // 로딩 중일 때
  if (loading) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    )
  }

  // 로그인하지 않은 경우
  if (!isAuthenticated) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">로그인이 필요합니다</h1>
          <p className="text-gray-600 mb-6">이 페이지에 접근하려면 로그인해주세요.</p>
          <div className="space-x-4">
            <a href="/login" className="btn btn-primary rounded-lg">
              로그인
            </a>
            <a href="/register" className="btn btn-outline rounded-lg">
              회원가입
            </a>
          </div>
        </div>
      </div>
    )
  }

  // 그룹에 속하지 않은 경우
  if (!permissions.canAccessFeatures) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">그룹 참여가 필요합니다</h1>
          <p className="text-gray-600 mb-6">CoHouse의 기능을 사용하려면 그룹에 참여해주세요.</p>
        </div>
      </div>
    )
  }

  // 정상적인 경우
  return (
    <div className="min-h-dvh">
      <NavBar>
        <main className="p-4 flex-1">{children}</main>
      </NavBar>
    </div>
  )
}
