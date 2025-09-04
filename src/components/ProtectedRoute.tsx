import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../libs/hooks/useAuth'

interface ProtectedRouteProps {
  children: React.ReactNode
  requireAuth?: boolean
  requireGroup?: boolean
  requireLeader?: boolean
}

export default function ProtectedRoute({ 
  children, 
  requireAuth = true, 
  requireGroup = false, 
  requireLeader = false 
}: ProtectedRouteProps) {
  const { permissions, loading } = useAuth()
  const location = useLocation()

  // 로딩 중일 때
  if (loading) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    )
  }

  // 인증이 필요한 경우
  if (requireAuth && !permissions.isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // 그룹 참여가 필요한 경우
  if (requireGroup && !permissions.canAccessFeatures) {
    return <Navigate to="/" state={{ from: location }} replace />
  }

  // 그룹장 권한이 필요한 경우
  if (requireLeader && !permissions.isGroupLeader) {
    return <Navigate to="/mypage" state={{ from: location }} replace />
  }

  // 모든 조건을 만족하면 자식 컴포넌트 렌더링
  return <>{children}</>
}
