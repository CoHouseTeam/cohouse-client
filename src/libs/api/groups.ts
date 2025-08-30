import api from './axios'
import { GROUP_ENDPOINTS } from './endpoints'

//내가 속한 그룹 정보
export async function fetchMyGroups() {
  const response = await api.get(GROUP_ENDPOINTS.MY_GROUPS)
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
