import api from './axios'
import { GROUP_ENDPOINTS } from './endpoints'
import { MyRoleResponse } from '../../types/tasks'

// 내가 속한 그룹 정보
export async function fetchMyGroups() {
  console.log('🔍 fetchMyGroups 호출됨')
  console.log('📡 요청 URL:', GROUP_ENDPOINTS.MY_GROUPS)

  try {
    const response = await api.get(GROUP_ENDPOINTS.MY_GROUPS)
    console.log('✅ 그룹 정보 조회 성공:', response.data)
    
    // 응답 데이터 검증
    if (!response.data) {
      throw new Error('그룹 정보가 없습니다.')
    }
    
    return response.data
  } catch (error: any) {
    console.error('❌ 그룹 정보 조회 실패:', error)
    if (error.response?.status === 401) {
      throw new Error('인증이 필요합니다. 로그인해주세요.')
    }
    throw error
  }
}

//그룹장 확인
export async function fetchMyRole(): Promise<MyRoleResponse> {
  const response = await api.get<MyRoleResponse>(GROUP_ENDPOINTS.MY_ROLE)
  return response.data
}

// 현재 사용자가 속한 그룹의 ID를 가져오는 함수
export async function getCurrentGroupId(): Promise<number> {
  try {
    console.log('🔍 getCurrentGroupId 호출됨')
    const groupData = await fetchMyGroups()
    
    // 응답 데이터 구조 확인
    console.log('📊 그룹 데이터 구조:', groupData)
    
    // 응답에서 그룹 ID를 반환
    if (groupData && groupData.id) {
      console.log('✅ 현재 그룹 ID:', groupData.id)
      return groupData.id
    }
    
    // 다른 가능한 응답 구조 확인
    if (groupData && Array.isArray(groupData) && groupData.length > 0) {
      const firstGroup = groupData[0]
      if (firstGroup && firstGroup.id) {
        console.log('✅ 첫 번째 그룹 ID:', firstGroup.id)
        return firstGroup.id
      }
    }
    
    throw new Error('그룹 정보를 찾을 수 없습니다.')
  } catch (error: any) {
    console.error('❌ 현재 그룹 ID 가져오기 실패:', error)
    throw error
  }
}

//그룹 생성
export async function createGroup(groupName: string) {
  const response = await api.post(GROUP_ENDPOINTS.CREATE, { groupName })
  return response.data
}

// 그룹 초대 코드로 가입
export async function joinGroupByInvite(inviteCode: string, nickname: string) {
  const response = await api.post(GROUP_ENDPOINTS.JOIN, { inviteCode, nickname })
  return response.data
}

// 그룹 초대 코드 생성
export async function createGroupInvitation(groupId: number) {
  console.log('🔍 createGroupInvitation 호출됨')
  console.log('📡 요청 URL:', GROUP_ENDPOINTS.INVITATIONS(groupId))

  try {
    const response = await api.post(GROUP_ENDPOINTS.INVITATIONS(groupId))
    console.log('✅ 초대 코드 생성 성공:', response.data)
    return response.data
  } catch (error) {
    console.error('❌ 초대 코드 생성 실패:', error)
    throw error
  }
}

// 해당 그룹 멤버 목록
export async function fetchGroupMembers(groupId: number) {
  console.log('🔍 fetchGroupMembers 호출됨')
  console.log('📡 요청 URL:', GROUP_ENDPOINTS.MEMBERS(groupId))
  
  try {
    const response = await api.get(GROUP_ENDPOINTS.MEMBERS(groupId))
    console.log('✅ 그룹 멤버 정보 조회 성공:', response.data)
    return response.data
  } catch (error) {
    console.error('❌ 그룹 멤버 정보 조회 실패:', error)
    throw error
  }
}
