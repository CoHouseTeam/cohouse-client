import api from './axios'
import { AUTH_ENDPOINTS, PROFILE_ENDPOINTS } from './endpoints'

export type Profile = {
  id: number
  email: string
  name: string
  gender: string
  birthDate: string | null // "YYYY-MM-DD"
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

export type UpdateProfileDto = Partial<{
  birthDate: string // "YYYY-MM-DD"
  gender: string // 스웨거에 'string'로 표기 (백엔드가 허용하는 값 사용)
}>

// 내 프로필 조회
export async function getProfile(): Promise<Profile> {
  const { data } = await api.get<Profile>(PROFILE_ENDPOINTS.GET)
  return data
}

// 프로필 정보 수정
export async function updateProfile(body: UpdateProfileDto): Promise<Profile> {
  const { data } = await api.put<Profile>(PROFILE_ENDPOINTS.UPDATE, body)
  return data
}

// 프로필 이미지 업로드
export async function uploadProfileImage(file: File) {
  const form = new FormData()
  form.append('image', file)

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

// 비밀번호 변경
type ResetPasswordPayload = { newPassword: string; token: string }

export async function resetPassword(newPassword: string, token: string) {
  const payload: ResetPasswordPayload = { newPassword, token }

  const { data } = await api.post(AUTH_ENDPOINTS.RESET_PASSWORD, payload)
  return data
}
