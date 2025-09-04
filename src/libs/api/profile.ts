import api from './axios'
import { PROFILE_ENDPOINTS, AUTH_ENDPOINTS } from './endpoints'

export type Profile = {
  id: number
  email: string
  name: string
  gender: string
  birthDate: string // "YYYY-MM-DD"
  profileImageUrl: string | null
  alertTime: {
    hour: number
    minute: number
    second: number
    nano: number
  }
  createdAt: string
  updatedAt: string
}

export type UploadImageResp = { imageUrl: string }

// 내 프로필 조회
export async function getProfile(): Promise<Profile> {
  const { data } = await api.get<Profile>(PROFILE_ENDPOINTS.GET)
  return data
}

// 프로필 정보 수정
export async function updateProfile(
  body: Partial<Pick<Profile, 'name' | 'email' | 'birthDate'>>
): Promise<Profile> {
  const { data } = await api.put<Profile>(PROFILE_ENDPOINTS.UPDATE, body)
  return data
}

// 프로필 이미지 업로드
export async function uploadProfileImage(file: File) {
  const form = new FormData()
  form.append('file', file)

  const { data } = await api.put<UploadImageResp>(PROFILE_ENDPOINTS.UPLOAD_IMAGE, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}

// 프로필 이미지 삭제
export async function deleteProfileImage(): Promise<Profile> {
  const { data } = await api.delete<Profile>(PROFILE_ENDPOINTS.DELETE_IMAGE)
  return data
}

// 알림 시간 변경
export async function updateAlertTime(hour: number, minute: number): Promise<Profile> {
  const { data } = await api.put<Profile>(PROFILE_ENDPOINTS.UPDATE_ALERT_TIME, { hour, minute })
  return data
}

// 회원 탈퇴
export async function withdrawUser(): Promise<void> {
  await api.delete(AUTH_ENDPOINTS.WITHDRAW)
}

// 내 멤버 ID 조회
export async function getMyMemberId(): Promise<number> {
  const response = await api.get(PROFILE_ENDPOINTS.GET_MY_ID)
  return response.data.memberId
}
