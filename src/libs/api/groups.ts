import api from './axios'
import { GROUP_ENDPOINTS } from './endpoints'
import { MyRoleResponse } from '../../types/tasks'

//내가 속한 그룹 정보
export async function fetchMyGroups() {
  console.log('🔍 fetchMyGroups 호출됨')
  console.log('📡 요청 URL:', GROUP_ENDPOINTS.MY_GROUPS)

  try {
    const response = await api.get(GROUP_ENDPOINTS.MY_GROUPS)
    console.log('✅ 그룹 정보 조회 성공:', response.data)
    return response.data
  } catch (error) {
    console.error('❌ 그룹 정보 조회 실패:', error)
    throw error
  }
}

//그룹장 확인
export async function fetchMyRole(): Promise<MyRoleResponse> {
  const response = await api.get<MyRoleResponse>(GROUP_ENDPOINTS.MY_ROLE)
  return response.data
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
  const response = await api.get(`/groups/${groupId}/members`)
  return response.data
}
