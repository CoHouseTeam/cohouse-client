import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { isAuthenticated as checkAuth } from '../libs/utils/auth'

interface AuthContextType {
  isAuthenticated: boolean
  setIsAuthenticated: (value: boolean) => void
  refreshAuthState: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}


export function AuthProvider({ children }: AuthProviderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)

  // 인증 상태 새로고침
  const refreshAuthState = async () => {
    const authState = checkAuth()
    const isAuthFromStorage = localStorage.getItem('isAuthenticated') === 'true'
    const hasToken = localStorage.getItem('accessToken')
    
    const finalAuthState = authState || (isAuthFromStorage && !!hasToken)
    // 인증 상태 업데이트
    setIsAuthenticated(finalAuthState)
    
  }

  // 컴포넌트 마운트 시 초기 인증 상태 확인
  useEffect(() => {
    refreshAuthState()
  }, [])

  // localStorage 변화 감지 (다른 탭에서 로그인/로그아웃 시)
  useEffect(() => {
    const handleStorageChange = () => {
      refreshAuthState()
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])


  const value = {
    isAuthenticated,
    setIsAuthenticated,
    refreshAuthState
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
