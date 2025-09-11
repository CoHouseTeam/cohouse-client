import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  deleteProfileImage,
  getProfile,
  Profile,
  resetPassword,
  updateAlertTime,
  updateProfile,
  UpdateProfileDto,
  UploadImageResp,
  uploadProfileImage,
} from '../../api/profile'

export const PROFILE_KEY = ['profile', 'me']

// 프로필 조회
export function useProfile() {
  return useQuery<Profile>({
    queryKey: PROFILE_KEY,
    queryFn: getProfile,
    staleTime: 5 * 60 * 1000,
  })
}

// 프로필 일반 정보 수정
export function useUpdateProfile() {
  const qr = useQueryClient()
  return useMutation({
    mutationFn: (dto: UpdateProfileDto) => updateProfile(dto),
    onSuccess: (p) => {
      qr.setQueryData(PROFILE_KEY, p)
    },
  })
}

// 프로필 이미지 업로드
export function useUploadProfileImage() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: uploadProfileImage,
    onSuccess: (resp: UploadImageResp) => {
      qc.setQueryData<Profile | undefined>(PROFILE_KEY, (prev) =>
        prev
          ? { ...prev, profileImageUrl: resp.imageUrl, updatedAt: new Date().toISOString() }
          : prev
      )
    },
  })
}

// 프로필 이미지 삭제
export function useDeleteProfileImage() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: deleteProfileImage,
    onSuccess: (resp: Profile | undefined) => {
      if (resp && resp.profileImageUrl) {
        // 서버가 기본 이미지 URL을 내려줌 → 그대로 반영
        qc.setQueryData<Profile | undefined>(PROFILE_KEY, resp)
      } else {
        // 응답이 비었거나 스키마가 다르면 최신 상태를 다시 조회
        qc.invalidateQueries({ queryKey: PROFILE_KEY })
      }
    },
  })
}

// 알림 시간 변경
export function useUpdateAlertTime() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ hour, minute }: { hour: number; minute: number }) =>
      updateAlertTime(hour, minute),
    onSuccess: (p: Profile) => {
      qc.setQueryData(PROFILE_KEY, p)
    },
  })
}

// 비밀번호 변경
export function useResetPassword() {
  return useMutation({
    mutationFn: ({ newPassword, token }: { newPassword: string; token: string }) =>
      resetPassword(newPassword, token),
  })
}
