import { useState, useEffect } from 'react'
import { getCurrentUser, getAccessToken } from '../utils/auth'
import { getCurrentGroupId, fetchGroupMembers } from '../api/groups'
import { syncGroupStoreWithAuth } from '../../app/store'

export interface UserPermissions {
  isAuthenticated: boolean
  isGroupMember: boolean
  isGroupLeader: boolean
  hasGroup: boolean
  canCreateAnnouncement: boolean
  canShareGroup: boolean
  canAccessFeatures: boolean
}

export const useAuth = () => {
  const [permissions, setPermissions] = useState<UserPermissions>({
    isAuthenticated: false,
    isGroupMember: false,
    isGroupLeader: false,
    hasGroup: false,
    canCreateAnnouncement: false,
    canShareGroup: false,
    canAccessFeatures: false
  })
  const [loading, setLoading] = useState(true)
  const [groupId, setGroupId] = useState<number | null>(null)
  const [groupMembers, setGroupMembers] = useState<any[]>([])

  const checkAuthAndPermissions = async () => {
    try {
      setLoading(true)
      
      // 1. 인증 상태 확인
      const token = getAccessToken()
      const isAuthenticated = !!token
      
      if (!isAuthenticated) {
        setPermissions({
          isAuthenticated: false,
          isGroupMember: false,
          isGroupLeader: false,
          hasGroup: false,
          canCreateAnnouncement: false,
          canShareGroup: false,
          canAccessFeatures: false
        })
        setLoading(false)
        return
      }

      // 2. 그룹 정보 확인
      let currentGroupId: number | null = null
      let currentGroupMembers: any[] = []
      let isGroupMember = false
      let isGroupLeader = false

      try {
        currentGroupId = await getCurrentGroupId()
        if (currentGroupId) {
          try {
            currentGroupMembers = await fetchGroupMembers(currentGroupId)
            isGroupMember = currentGroupMembers.length > 0
            
            // 그룹장 확인 (isLeader가 true인지 확인)
            const currentUser = getCurrentUser()
            if (currentUser?.name && currentGroupMembers.length > 0) {
              const userMember = currentGroupMembers.find(m => 
                m.nickname === currentUser.name || 
                m.name === currentUser.name ||
                m.email === currentUser.email
              )
              isGroupLeader = userMember?.isLeader === true
              console.log('🔍 그룹 멤버 정보:', {
                currentUser: currentUser.name,
                userMember,
                isGroupLeader
              })
            }
          } catch (groupError) {
            console.log('그룹 멤버 정보 가져오기 실패:', groupError)
            // 그룹 멤버 정보를 가져올 수 없어도 그룹 ID는 있으므로 계속 진행
            // 그룹 ID가 있다면 기본적으로 그룹 멤버로 간주
            isGroupMember = true
            isGroupLeader = false
          }
        }
      } catch (groupError: any) {
        // 404 에러는 그룹이 없는 것이므로 정상적인 상태로 처리
        if (groupError.response?.status === 404) {
          console.log('사용자가 아직 그룹에 속하지 않음 (404)')
        } else {
          console.log('그룹 정보 가져오기 실패:', groupError)
        }
        // 그룹이 없는 것은 에러가 아니라 정상적인 상태
        currentGroupId = null
        currentGroupMembers = []
        isGroupMember = false
        isGroupLeader = false
      }

      // 3. 권한 설정
      const hasGroup = !!currentGroupId
      const canCreateAnnouncement = hasGroup // 그룹에 속한 모든 멤버가 공지사항 탭을 볼 수 있음
      const canShareGroup = isGroupLeader // 그룹장만 공유 가능
      const canAccessFeatures = hasGroup // 그룹 ID가 있으면 기능 접근 가능

      console.log('🔍 최종 권한 설정:', {
        hasGroup,
        isGroupMember,
        isGroupLeader,
        canAccessFeatures,
        canShareGroup,
        canCreateAnnouncement
      })

      setPermissions({
        isAuthenticated,
        isGroupMember,
        isGroupLeader,
        hasGroup,
        canCreateAnnouncement,
        canShareGroup,
        canAccessFeatures
      })

      setGroupId(currentGroupId)
      setGroupMembers(currentGroupMembers)

      // useGroupStore와 동기화
      syncGroupStoreWithAuth(hasGroup)

    } catch (error) {
      console.error('권한 확인 중 예상치 못한 오류:', error)
      // 예상치 못한 오류가 발생해도 기본 권한으로 설정
      setPermissions({
        isAuthenticated: true, // 토큰은 있으므로 인증은 된 상태
        isGroupMember: false,
        isGroupLeader: false,
        hasGroup: false,
        canCreateAnnouncement: false,
        canShareGroup: false,
        canAccessFeatures: false
      })
      setGroupId(null)
      setGroupMembers([])
      
      // useGroupStore와 동기화
      syncGroupStoreWithAuth(false)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkAuthAndPermissions()
  }, [])

  // 토큰 변경 감지하여 권한 새로고침
  useEffect(() => {
    const checkTokenChange = () => {
      const token = getAccessToken()
      if (token && !permissions.isAuthenticated) {
        // 토큰이 새로 추가되었을 때 권한 새로고침
        checkAuthAndPermissions()
      }
    }

    // 초기 체크만 수행
    checkTokenChange()

    // 주기적 체크는 제거 (무한 루프 방지)
    // 필요시 수동으로 refreshPermissions 호출
  }, []) // permissions.isAuthenticated 의존성 제거

  return {
    permissions,
    loading,
    groupId,
    groupMembers,
    refreshPermissions: checkAuthAndPermissions
  }
}
