import api from './axios'
import { GROUP_ENDPOINTS } from './endpoints'

// 내가 속한 그룹 정보
export async function fetchMyGroups() {
  // fetchMyGroups 호출

  try {
    const response = await api.get(GROUP_ENDPOINTS.MY_GROUPS)
    // 그룹 정보 조회 성공
    
    // 응답 데이터 검증
    if (!response.data) {
      return []
    }
    
    return response.data
  } catch (error: unknown) {
    const err = error as { response?: { status?: number } }
    // 404 에러는 그룹이 없는 정상적인 상황이므로 빈 배열 반환
    if (err.response?.status === 404) {
      return []
    }
    
    // 401 에러는 인증 문제
    if (err.response?.status === 401) {
      console.error('❌ 인증이 필요합니다. 로그인해주세요.')
      throw new Error('인증이 필요합니다. 로그인해주세요.')
    }
    
    // 기타 에러는 그대로 throw
    throw error
  }
}

//그룹장 확인
export async function fetchIsLeader(groupId: number): Promise<boolean> {
  try {
    const response = await api.get<{ leader: boolean }>(GROUP_ENDPOINTS.MY_ROLE(groupId))
    return !!response.data.leader
  } catch {
    return false
  }
}

// 현재 사용자가 속한 그룹의 ID를 가져오는 함수
export async function getCurrentGroupId(): Promise<number | null> {
  try {
    // getCurrentGroupId 호출
    const groupData = await fetchMyGroups()
    
    // 응답 데이터 구조 확인
    // 그룹 데이터 구조 확인
    
    // 응답에서 그룹 ID를 반환
    if (groupData && groupData.id) {
      // 현재 그룹 ID 확인
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
    
    // 그룹이 없는 경우 null 반환 (에러가 아님)
    console.log('ℹ️ 그룹에 속하지 않음')
    return null
  } catch (error: unknown) {
    const err = error as { response?: { status?: number } }
    // 404 에러는 그룹이 없는 정상적인 상황이므로 null 반환
    if (err.response?.status === 404) {
      console.log('ℹ️ 그룹이 없음 (404)')
      return null
    }
    
    // 기타 에러는 그대로 throw
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
  // fetchGroupMembers 호출
  
  const response = await api.get(GROUP_ENDPOINTS.MEMBERS(groupId))
  // 그룹 멤버 정보 조회 성공
  return response.data
}


// 그룹 멤버 정보 수정 (닉네임 등)
export async function updateMyGroupMemberInfo(groupId: number, memberData: {
  id: number
  groupId: number
  memberId: number
  isLeader: boolean
  nickname: string
  status: string
  joinedAt: string
  leavedAt: string | null
  profileImageUrl: string
}) {
  try {
    const response = await api.put(GROUP_ENDPOINTS.UPDATE_MY_INFO(groupId), memberData)
    return response.data
  } catch (error) {
    console.error('❌ 그룹 멤버 정보 수정 실패:', error)
    throw error
  }
}

// 내 그룹 멤버 정보 조회
export async function getMyGroupMemberInfo(groupId: number) {
  try {
    const response = await api.get(GROUP_ENDPOINTS.UPDATE_MY_INFO(groupId))
    return response.data
  } catch (error) {
    console.error('❌ 내 그룹 멤버 정보 조회 실패:', error)
    throw error
  }
}
